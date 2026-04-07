"""
Test script to verify MongoDB connection and chatbot history saving
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://127.0.0.1:27017/rebuy")

print("=" * 60)
print("Testing MongoDB Connection and Chatbot History")
print("=" * 60)

# Test 1: MongoDB Connection
print("\n1. Testing MongoDB Connection...")
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db = mongo_client['rebuy']
    
    # Test connection
    mongo_client.server_info()
    print("   ✅ MongoDB connected successfully!")
    print(f"   📍 URI: {MONGO_URI}")
    print(f"   📊 Database: rebuy")
except Exception as e:
    print(f"   ❌ MongoDB connection failed: {e}")
    print("\n   💡 Make sure MongoDB is running:")
    print("      - Check if MongoDB service is started")
    print("      - Try: mongod --dbpath /path/to/data")
    exit(1)

# Test 2: List existing collections
print("\n2. Checking existing collections...")
collections = db.list_collection_names()
print(f"   Found {len(collections)} collections:")
for col in collections:
    count = db[col].count_documents({})
    print(f"   - {col}: {count} documents")

# Test 3: Test saving a conversation
print("\n3. Testing conversation history save...")
try:
    test_conversation = {
        "user_id": "test_user_123",
        "role": "Customer",
        "message": "Test message - checking database",
        "reply": "Test reply - database is working!",
        "intent": "general_chat",
        "timestamp": datetime.utcnow()
    }
    
    result = db.chatbothistories.insert_one(test_conversation)
    print(f"   ✅ Test conversation saved!")
    print(f"   📝 Document ID: {result.inserted_id}")
except Exception as e:
    print(f"   ❌ Failed to save conversation: {e}")

# Test 4: Retrieve the test conversation
print("\n4. Testing conversation history retrieval...")
try:
    conversations = list(
        db.chatbothistories
        .find({"user_id": "test_user_123"})
        .sort("timestamp", -1)
        .limit(5)
    )
    
    print(f"   ✅ Retrieved {len(conversations)} conversation(s)")
    if conversations:
        latest = conversations[0]
        print(f"   📩 Latest message: {latest.get('message')}")
        print(f"   🤖 Latest reply: {latest.get('reply')}")
except Exception as e:
    print(f"   ❌ Failed to retrieve conversations: {e}")

# Test 5: Check chatbothistories collection
print("\n5. Checking chatbothistories collection...")
try:
    total_conversations = db.chatbothistories.count_documents({})
    print(f"   📊 Total conversations: {total_conversations}")
    
    # Count by role
    pipeline = [
        {
            "$group": {
                "_id": "$role",
                "count": {"$sum": 1}
            }
        }
    ]
    role_stats = list(db.chatbothistories.aggregate(pipeline))
    
    if role_stats:
        print(f"   📈 Conversations by role:")
        for stat in role_stats:
            print(f"      - {stat['_id']}: {stat['count']}")
except Exception as e:
    print(f"   ❌ Failed to get statistics: {e}")

# Test 6: Clean up test data
print("\n6. Cleaning up test data...")
try:
    result = db.chatbothistories.delete_many({"user_id": "test_user_123"})
    print(f"   ✅ Deleted {result.deleted_count} test conversation(s)")
except Exception as e:
    print(f"   ❌ Failed to clean up: {e}")

print("\n" + "=" * 60)
print("✅ Database Test Complete!")
print("=" * 60)
print("\n💡 Next Steps:")
print("   1. Start the chatbot: python chatbot.py")
print("   2. Use the chatbot in your frontend")
print("   3. Check MongoDB: mongo rebuy")
print("   4. View conversations: db.chatbothistories.find().pretty()")
print()
