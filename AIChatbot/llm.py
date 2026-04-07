"""
LLM (Large Language Model) Module
Handles AI response generation using Google Gemini API
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    print("✅ LLM: Gemini API configured successfully!")
else:
    print("❌ LLM: WARNING - GOOGLE_API_KEY not found!")


# ============================================================================
# INTENT DETECTION
# ============================================================================

def detect_intent(message, role):
    """Detect user intent from message"""
    message_lower = message.lower()
    
    # Order tracking
    if any(word in message_lower for word in ['order', 'track', 'delivery', 'status', 'shipped']):
        # Extract order ID if present (format: ORD-XXXXX)
        words = message.split()
        for word in words:
            if word.upper().startswith('ORD-'):
                return 'order_tracking', word.upper()
        return 'order_tracking', None
    
    # Product search
    if any(word in message_lower for word in ['product', 'item', 'buy', 'shop', 'find', 'looking for', 'show me']):
        return 'product_search', None
    
    # Seller insights
    if role == 'Seller' and any(word in message_lower for word in ['stock', 'sales', 'trending', 'performance', 'analytics']):
        return 'seller_insights', None
    
    # Admin analytics
    if role == 'Admin' and any(word in message_lower for word in ['analytics', 'report', 'stats', 'users', 'revenue']):
        return 'admin_analytics', None
    
    # General chat
    return 'general_chat', None


# ============================================================================
# LLM RESPONSE GENERATION
# ============================================================================

def generate_response(message, role, context):
    """Generate AI response using Gemini LLM"""
    
    # Role-based instructions
    role_instructions = {
        'Customer': "You help customers with shopping, orders, payments, and product recommendations.",
        'Seller': "You help sellers manage their store, track sales, and optimize inventory.",
        'Admin': "You provide platform analytics, reports, and system insights.",
        'Guest': "You answer general FAQs about the platform."
    }
    
    # Build prompt for LLM
    prompt = f"""You are Rebuy AI Assistant - a helpful chatbot for Rebuy, a thrift fashion marketplace in Nepal.

User Role: {role}
Your Purpose: {role_instructions.get(role, 'General assistance')}

Context from Database (use this to answer):
{context}

User Question: {message}

Instructions:
- Be friendly, helpful, and concise
- Use the context above to provide accurate answers
- If you don't have information, say so politely
- Format your response clearly
- Keep responses under 150 words

Your response:"""
    
    try:
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        reply = response.text
        
        print(f"✅ LLM: Generated response ({len(reply)} chars)")
        return reply
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ LLM: Error generating response: {error_msg}")
        return "I'm having trouble generating a response right now. Please try again in a moment! 😊"


def generate_response_with_history(message, role, context, conversation_history):
    """Generate AI response with conversation history for better context"""
    
    # Role-based instructions
    role_instructions = {
        'Customer': "You help customers with shopping, orders, payments, and product recommendations.",
        'Seller': "You help sellers manage their store, track sales, and optimize inventory.",
        'Admin': "You provide platform analytics, reports, and system insights.",
        'Guest': "You answer general FAQs about the platform."
    }
    
    # Build conversation history context
    history_context = ""
    if conversation_history:
        history_context = "\n\nPrevious Conversation:\n"
        for conv in conversation_history[-3:]:  # Last 3 conversations
            history_context += f"User: {conv.get('message', '')}\n"
            history_context += f"Assistant: {conv.get('reply', '')}\n"
    
    # Build prompt for LLM
    prompt = f"""You are Rebuy AI Assistant - a helpful chatbot for Rebuy, a thrift fashion marketplace in Nepal.

User Role: {role}
Your Purpose: {role_instructions.get(role, 'General assistance')}

{history_context}

Context from Database (use this to answer):
{context}

User Question: {message}

Instructions:
- Be friendly, helpful, and concise
- Use the context above to provide accurate answers
- Consider the conversation history for better context
- If you don't have information, say so politely
- Format your response clearly
- Keep responses under 150 words

Your response:"""
    
    try:
        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        reply = response.text
        
        print(f"✅ LLM: Generated response with history ({len(reply)} chars)")
        return reply
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ LLM: Error generating response: {error_msg}")
        return "I'm having trouble generating a response right now. Please try again in a moment! 😊"
