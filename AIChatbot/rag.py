"""
RAG (Retrieval-Augmented Generation) Module
Handles data retrieval from MongoDB database
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId

# Load environment variables
load_dotenv()

# MongoDB Connection
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017/rebuy")
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db = mongo_client['rebuy']
    print("✅ RAG: MongoDB connected successfully!")
except Exception as e:
    print(f"❌ RAG: MongoDB connection failed: {e}")
    db = None


# ============================================================================
# RAG FUNCTIONS - Retrieve data from MongoDB
# ============================================================================

def retrieve_products(query, limit=5):
    """Retrieve products from database based on search query"""
    if not db:
        return []
    
    try:
        # Simple text search in product name, description, category, brand
        search_filter = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}},
                {"subcategory": {"$regex": query, "$options": "i"}},
                {"brand": {"$regex": query, "$options": "i"}},
            ]
        }
        
        products = list(db.products.find(search_filter).limit(limit))
        return products
    except Exception as e:
        print(f"Error retrieving products: {e}")
        return []


def retrieve_order(order_id):
    """Retrieve specific order details"""
    if not db:
        return None
    
    try:
        order = db.orders.find_one({"orderId": order_id.upper()})
        return order
    except Exception as e:
        print(f"Error retrieving order: {e}")
        return None


def retrieve_seller_stats(seller_id):
    """Retrieve seller statistics and insights"""
    if not db:
        return {}
    
    try:
        # Get seller's products
        products = list(db.products.find({"seller": ObjectId(seller_id)}))
        
        # Calculate stats
        total_products = len(products)
        total_sold = sum(p.get('sold', 0) for p in products)
        low_stock = [p for p in products if p.get('stock', 0) <= p.get('lowStockThreshold', 5)]
        
        # Get trending products (most sold)
        trending = sorted(products, key=lambda x: x.get('sold', 0), reverse=True)[:5]
        
        return {
            "total_products": total_products,
            "total_sold": total_sold,
            "low_stock_items": low_stock,
            "trending_products": trending
        }
    except Exception as e:
        print(f"Error retrieving seller stats: {e}")
        return {}


def retrieve_admin_analytics():
    """Retrieve platform-wide analytics for admin"""
    if not db:
        return {}
    
    try:
        total_users = db.users.count_documents({})
        total_products = db.products.count_documents({})
        total_orders = db.orders.count_documents({})
        
        # Calculate revenue
        orders = list(db.orders.find({"status": {"$ne": "Cancelled"}}))
        total_revenue = sum(o.get('total', 0) for o in orders)
        
        # Recent orders
        recent_orders = list(db.orders.find().sort("createdAt", -1).limit(5))
        
        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "recent_orders": recent_orders
        }
    except Exception as e:
        print(f"Error retrieving admin analytics: {e}")
        return {}


def get_faqs():
    """Return common FAQs"""
    return """
    Common FAQs:
    - Shipping: 3-5 business days across Nepal
    - Returns: Within 7 days of delivery with valid reason
    - Payment: Cash on Delivery, eSewa, Khalti, Credit/Debit Card
    - Condition Tags: New, Like New, Slightly Used, Vintage
    - Loyalty Points: Earn 1 point per NPR 100 spent
    """


def save_conversation(user_id, role, message, reply, intent):
    """Save conversation to database"""
    if not db:
        return
    
    try:
        from datetime import datetime
        conversation = {
            "user_id": user_id,
            "role": role,
            "message": message,
            "reply": reply,
            "intent": intent,
            "timestamp": datetime.utcnow()
        }
        db.chatbothistories.insert_one(conversation)
        print(f"💾 Conversation saved to database")
    except Exception as e:
        print(f"Error saving conversation: {e}")


def get_conversation_history(user_id, limit=5):
    """Retrieve recent conversation history for a user"""
    if not db:
        return []
    
    try:
        conversations = list(
            db.chatbothistories
            .find({"user_id": user_id})
            .sort("timestamp", -1)
            .limit(limit)
        )
        # Reverse to get chronological order
        conversations.reverse()
        return conversations
    except Exception as e:
        print(f"Error retrieving conversation history: {e}")
        return []


# ============================================================================
# CONTEXT BUILDER
# ============================================================================

def build_context(intent, extracted_data, role, user_id, message):
    """Build context from retrieved data based on intent"""
    context_parts = []
    
    if intent == 'product_search':
        products = retrieve_products(message, limit=5)
        if products:
            context_parts.append("🛍️ Found these products in our store:")
            for p in products:
                name = p.get('name', 'Unknown')
                price = p.get('price', 0)
                brand = p.get('brand', '')
                condition = p.get('condition', '')
                stock = p.get('stock', 0)
                context_parts.append(
                    f"- {name} by {brand} | Condition: {condition} | Price: NPR {price} | Stock: {stock}"
                )
        else:
            context_parts.append("❌ No products found matching your search.")
    
    elif intent == 'order_tracking' and extracted_data:
        order = retrieve_order(extracted_data)
        if order:
            context_parts.append(f"📦 Order Details for {extracted_data}:")
            context_parts.append(f"- Status: {order.get('status', 'Unknown')}")
            context_parts.append(f"- Payment: {order.get('paymentStatus', 'Unknown')}")
            context_parts.append(f"- Total: NPR {order.get('total', 0)}")
            context_parts.append(f"- Delivery Address: {order.get('shippingAddress', {}).get('address', 'N/A')}")
        else:
            context_parts.append(f"❌ Order {extracted_data} not found.")
    
    elif intent == 'seller_insights' and role == 'Seller':
        stats = retrieve_seller_stats(user_id)
        context_parts.append("📊 Your Store Analytics:")
        context_parts.append(f"- Total Products: {stats.get('total_products', 0)}")
        context_parts.append(f"- Total Units Sold: {stats.get('total_sold', 0)}")
        
        low_stock = stats.get('low_stock_items', [])
        if low_stock:
            context_parts.append(f"\n⚠️ Low Stock Alert ({len(low_stock)} items):")
            for item in low_stock[:3]:
                context_parts.append(f"  - {item.get('name')}: Only {item.get('stock')} left!")
        
        trending = stats.get('trending_products', [])
        if trending:
            context_parts.append(f"\n🔥 Your Top Selling Products:")
            for item in trending[:3]:
                context_parts.append(f"  - {item.get('name')}: {item.get('sold', 0)} sold")
    
    elif intent == 'admin_analytics' and role == 'Admin':
        analytics = retrieve_admin_analytics()
        context_parts.append("📈 Platform Analytics:")
        context_parts.append(f"- Total Users: {analytics.get('total_users', 0)}")
        context_parts.append(f"- Total Products: {analytics.get('total_products', 0)}")
        context_parts.append(f"- Total Orders: {analytics.get('total_orders', 0)}")
        context_parts.append(f"- Total Revenue: NPR {analytics.get('total_revenue', 0)}")
    
    # Add conversation history for context
    history = get_conversation_history(user_id, limit=3)
    if history:
        context_parts.append("\n\nRecent Conversation History:")
        for conv in history:
            context_parts.append(f"User: {conv.get('message', '')}")
            context_parts.append(f"Bot: {conv.get('reply', '')}")
    
    # Add FAQs to context
    context_parts.append(get_faqs())
    
    return "\n".join(context_parts)
