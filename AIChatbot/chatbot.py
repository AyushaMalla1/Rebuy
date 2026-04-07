"""
AI Chatbot with LLM + RAG Architecture
Main application that connects RAG and LLM modules
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import RAG module (handles database retrieval)
from rag import build_context, save_conversation, get_conversation_history

# Import LLM module (handles AI response generation)
from llm import detect_intent, generate_response

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

print("=" * 60)
print("🤖 AI Chatbot with LLM + RAG Architecture")
print("=" * 60)


# ============================================================================
# MAIN CHAT ENDPOINT
# ============================================================================

@app.route('/chat', methods=['POST'])
@app.route('/query', methods=['POST'])
def chat():
    """Main chatbot endpoint - connects RAG and LLM"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid request"}), 400
        
        message = data.get('message', '').strip()
        role = data.get('role', 'Guest')
        user_id = data.get('user_id', 'guest')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        print(f"\n📩 New Message: '{message}' | Role: {role} | User: {user_id}")
        
        # Step 1: Detect Intent (LLM module)
        intent, extracted_data = detect_intent(message, role)
        print(f"🎯 Intent: {intent}")
        
        # Step 2: Retrieve Context (RAG module)
        context = build_context(intent, extracted_data, role, user_id, message)
        print(f"📊 Context: {len(context)} characters")
        
        # Step 3: Generate Response (LLM module)
        reply = generate_response(message, role, context)
        print(f"✅ Response: {reply[:100]}...")
        
        # Step 4: Save Conversation (RAG module)
        save_conversation(user_id, role, message, reply, intent)
        
        return jsonify({
            "reply": reply,
            "intent": intent,
            "role": role
        })
    
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error: {error_msg}")
        return jsonify({"error": error_msg}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "modules": {
            "rag": "loaded",
            "llm": "loaded"
        }
    })


if __name__ == '__main__':
    port = int(os.environ.get("CHATBOT_PORT", 5001))
    print(f"\n🚀 Starting AI Chatbot on http://0.0.0.0:{port}")
    print("📦 RAG Module: Loaded (handles database retrieval)")
    print("🧠 LLM Module: Loaded (handles AI response generation)")
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=True)
