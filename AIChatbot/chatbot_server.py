import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import google.generativeai as genai
from bson.objectid import ObjectId

# Load env from the AIChatbot folder
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)

# Configure Google Generative AI with API key
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    print("[chatbot_server] Google AI configured successfully!", flush=True)
else:
    print("[chatbot_server] WARNING: GOOGLE_API_KEY not found!", flush=True)

# Google OAuth Client ID for authentication
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

# Persistent MongoDB connection (reused across requests)
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017/rebuy")
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db = mongo_client['rebuy']
    print("[chatbot_server] MongoDB connected successfully!", flush=True)
except Exception as e:
    print(f"[chatbot_server] MongoDB connection failed: {e}", flush=True)
    db = None

print("[chatbot_server] Server ready!", flush=True)


def get_product_context(role, user_id):
    """Get relevant product information from database"""
    context_parts = []
    
    try:
        if not db:
            return "Database not available."
            
        if role == 'Seller':
            # Get seller's products
            try:
                products = list(db.products.find(
                    {"seller": ObjectId(user_id)}, 
                    {"name":1, "price":1, "description":1, "stock":1, "sold":1}
                ).sort("sold", -1).limit(20))
                
                if products:
                    low_stock = sum(1 for p in products if p.get('stock', 0) < 5)
                    total_sold = sum(p.get('sold', 0) for p in products)
                    
                    context_parts.append(f"Your store has {len(products)} products.")
                    context_parts.append(f"Total units sold: {total_sold}")
                    context_parts.append(f"Products with low stock: {low_stock}")
                    
                    # Add top products
                    top_products = products[:5]
                    context_parts.append("\nTop selling products:")
                    for p in top_products:
                        context_parts.append(f"- {p.get('name')}: NPR {p.get('price')}, Sold: {p.get('sold', 0)}")
            except:
                pass
                
        elif role in ['Customer', 'Guest']:
            # Get recent products
            try:
                products = list(db.products.find(
                    {"status": {"$ne": "deleted"}}, 
                    {"name":1, "price":1, "description":1, "category":1}
                ).limit(15))
                
                if products:
                    context_parts.append(f"We have {len(products)} products available.")
                    context_parts.append("\nSome of our products:")
                    for p in products[:10]:
                        context_parts.append(f"- {p.get('name')}: NPR {p.get('price')}")
            except:
                pass
                
        elif role == 'Admin':
            # Get platform stats
            try:
                total_products = db.products.count_documents({})
                total_orders = db.orders.count_documents({})
                total_users = db.users.count_documents({})
                
                context_parts.append(f"Platform Statistics:")
                context_parts.append(f"- Total products: {total_products}")
                context_parts.append(f"- Total orders: {total_orders}")
                context_parts.append(f"- Total users: {total_users}")
            except:
                pass
    except Exception as e:
        print(f"[chatbot_server] Error getting context: {e}")
    
    # Add general policies
    context_parts.append("\nGeneral Information:")
    context_parts.append("- Shipping: 3-5 days across Nepal")
    context_parts.append("- Returns: Within 7 days of delivery")
    context_parts.append("- Payment: Cash on Delivery, eSewa, Khalti")
    
    return "\n".join(context_parts)


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    message = data.get('message', '')
    role = data.get('role', 'Guest')
    user_id = data.get('user_id', 'guest')
    
    print(f"[chatbot_server] Received message: '{message}' from role: {role}", flush=True)

    if not GOOGLE_API_KEY:
        return jsonify({"error": "GOOGLE_API_KEY not set"}), 500

    try:
        # Get context from database
        context = get_product_context(role, user_id)
        
        role_instructions = ""
        if role == 'Guest':
            role_instructions = "- You must only reply to Customer and Seller related FAQs (e.g., how to buy, what is Rebuy, how to sell, return policies).\n- If the user asks questions outside of basic FAQs, politely state that you can only answer general FAQs for guests."
        elif role == 'Customer':
            role_instructions = "- You must ONLY reply to customer-related questions.\n- Assist with FAQs, order tracking, payments, product recommendations, and delivery-related queries.\n- Do NOT answer any seller-related or admin-related questions. If asked, politely refuse and remind them you are here for customer support."
        elif role == 'Seller':
            role_instructions = "- You must ONLY reply to seller-related questions.\n- Offer insights on trending products, low-stock alerts, promotional ideas, and performance suggestions.\n- Do NOT answer customer-related or admin-related questions. If asked, politely refuse and state your focus is on helping them manage their store."
        elif role == 'Admin':
            role_instructions = "- You must ONLY reply to admin-related questions.\n- Provide instant analytics, quick summaries of sales and user activity, and system performance updates.\n- Do NOT answer customer-related or seller-related questions. If asked, politely refuse and state your focus is on platform administration."
        else:
            role_instructions = "- Answer questions about products, orders, shipping, returns, and platform features.\n- If the question is unrelated to shopping/fashion/Rebuy, politely redirect to relevant topics."

        # Build prompt
        prompt = f"""You are Rebuy AI Assistant, a helpful assistant for Rebuy - a sustainable thrift fashion marketplace in Nepal.

User Role: {role}

Context from our database:
{context}

User Question: {message}

Instructions:
- Be friendly, helpful, and concise (2-4 sentences).
- If the user sends a simple pleasantry or acknowledgment (e.g., "thank you", "okay", "hi"), keep your response extremely brief (1 sentence), simply acknowledging them and asking if they need further help. Do NOT repeat product or store information.
{role_instructions}

Your response:"""

        # Use Google Generative AI
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        reply = response.text
        print(f"[chatbot_server] Generated response: {reply[:100]}...", flush=True)
        
        return jsonify({"reply": reply})

    except Exception as e:
        error_msg = str(e)
        print(f"[chatbot_server] Error: {error_msg}", flush=True)
        return jsonify({"error": error_msg}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    port = int(os.environ.get("CHATBOT_PORT", 5001))
    print(f"[chatbot_server] Starting on http://0.0.0.0:{port}", flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)
