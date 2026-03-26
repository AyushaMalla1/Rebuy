import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from bson.objectid import ObjectId

# Load env from the parent Backend folder
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)

# -------------------------------------------------------
# Persistent state: loaded ONCE at startup
# -------------------------------------------------------
print("[chatbot_server] Loading HuggingFace embeddings model...", flush=True)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
print("[chatbot_server] Embeddings loaded. Server ready!", flush=True)

# Persistent MongoDB connection (reused across requests)
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017/rebuy")
mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = mongo_client['rebuy']


def get_product_documents(role, user_id):
    docs = []
    try:
        if role == 'Seller':
            # Get seller's products including stock and sold metrics for insights
            products = list(db.products.find({"seller": ObjectId(user_id)}, {"name":1,"price":1,"description":1,"stock":1,"sold":1}).sort("sold", -1).limit(50))
            
            low_stock_count = 0
            total_sales = 0
            for p in products:
                name = p.get('name', 'Unknown Product')
                price = p.get('price', 0)
                desc = p.get('description', '')
                stock = p.get('stock', 0)
                sold = p.get('sold', 0)
                
                if stock < 5:
                    low_stock_count += 1
                total_sales += sold

                docs.append(Document(
                    page_content=f"Product: {name}\nPrice: NPR {price}\nStock: {stock} units\nSold: {sold} units\nDescription: {desc}",
                    metadata={"id": str(p.get('_id')), "type": "seller_product"}
                ))
            
            # Global store summary document for the seller
            docs.append(Document(
                page_content=f"Seller Dashboard Summary:\nTotal distinct products: {len(products)}\nProducts with low stock (under 5 units): {low_stock_count}\nTotal units sold across your store: {total_sales}.",
                metadata={"type": "seller_summary"}
            ))

        elif role == 'Customer':
            products = list(db.products.find({"status": {"$ne": "deleted"}}, {"name":1,"price":1,"description":1}).sort("createdAt", -1).limit(30))
            for p in products:
                name = p.get('name', 'Unknown Product')
                price = p.get('price', 0)
                desc = p.get('description', '')

                docs.append(Document(
                    page_content=f"Product: {name}\nPrice: NPR {price}\nDescription: {desc}",
                    metadata={"id": str(p.get('_id'))}
                ))

        if role == 'Admin':
            total_products = db.products.count_documents({})
            total_orders = db.orders.count_documents({})
            docs.append(Document(
                page_content=f"Platform Stats: {total_products} total products, {total_orders} total orders.",
                metadata={"type": "stats"}
            ))
    except Exception:
        pass

    docs.append(Document(
        page_content="Shipping takes 3-5 days across all locations in Nepal. Our return policy allows returns within 7 days of delivery.",
        metadata={"type": "policy"}
    ))
    return docs


PROMPT_TEMPLATE = """You are a concise, highly professional AI assistant for Rebuy, a sustainable thrift fashion marketplace in Nepal.
The user you are interacting with is a: {role}

RULES:
- Be brief but complete. Respond in 3-6 sentences max unless listing specific items.
- Use Markdown bold and lists to structure data nicely.
- NEVER output raw URLs or image links. You are a text-only assistant.
- If the question is entirely unrelated to Rebuy, shopping, fashion, or business management, politely decline it.
- **CRITICAL ROLE-ISOLATION RULE**: You must STRICTLY ONLY answer questions that are relevant to the user's role. If the user asks a question meant for a different role, politely refuse and state what your current role scope is!

ROLE-SPECIFIC INSTRUCTIONS & SCOPE:
- If the user is a **Guest**: You are a general assistant. You may answer BOTH customer FAQs and seller FAQs. You guide users generally.
- If the user is a **Customer**: You MUST ONLY assist with Customer-related queries (FAQs, order tracking, product recommendations, delivery). DO NOT answer Seller or Admin questions.
- If the user is a **Seller**: You MUST ONLY provide Seller-related insights (trending products, low-stock alerts, promotional ideas, performance suggestions). DO NOT answer Customer or Admin questions.
- If the user is an **Admin**: You MUST ONLY provide instant analytics, summarized reports, and system performance updates based on stats. DO NOT answer Customer or Seller questions.

Context retrieved dynamically from the database:
{context}

User Question: {question}
AI Answer:"""


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    message = data.get('message', '')
    role = data.get('role', 'Customer')
    user_id = data.get('user_id', 'guest')

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not set"}), 500

    try:
        # Fetch docs from persistent DB connection
        docs = get_product_documents(role, user_id)

        # Build FAISS + retrieve (embeddings already in memory)
        if docs:
            vector_store = FAISS.from_documents(docs, embeddings)
            retrieved = vector_store.as_retriever(search_kwargs={"k": 3}).invoke(message)
            context_string = "\n\n".join([d.page_content for d in retrieved])
        else:
            context_string = "No specific product data available."

        prompt = PromptTemplate(
            template=PROMPT_TEMPLATE,
            input_variables=["question", "context", "role"]
        )
        # gemini-1.5-flash is stable and significantly faster
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            max_output_tokens=400
        )
        chain = prompt | llm
        response = chain.invoke({"question": message, "context": context_string, "role": role})
        return jsonify({"reply": response.content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    port = int(os.environ.get("CHATBOT_PORT", 5001))
    print(f"[chatbot_server] Starting on http://0.0.0.0:{port}", flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)
