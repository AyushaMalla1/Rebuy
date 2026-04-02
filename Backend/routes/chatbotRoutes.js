const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getEnhancedContext, forceRefreshCache } = require('../utils/chatbotContext');

// Force refresh cache on module load
forceRefreshCache().then(() => {
  console.log('[Chatbot] Context cache initialized');
}).catch(err => {
  console.error('[Chatbot] Failed to initialize cache:', err);
});

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

// Conversation history storage (in production, use Redis or database)
const conversationHistory = new Map();

// ─── Off-topic guard ────────────────────────────────────────────────────────
// Keywords that are clearly unrelated to Rebuy / e-commerce / fashion
const OFF_TOPIC_PATTERNS = [
    // Programming / coding
    /\b(code|coding|program|programming|javascript|python|java|c\+\+|html|css|sql|algorithm|function|variable|debug|compiler|react|node\.?js|api|github|git|stackoverflow)\b/i,
    // Math / science homework
    /\b(solve|equation|theorem|calculus|derivative|integral|algebra|geometry|chemistry|physics|biology|formula|calculate)\b/i,
    // Geography / history / general knowledge
    /\b(capital of|president of|history of|population of|when was|who invented|world war|continent|country|currency of|language of)\b/i,
    // Entertainment unrelated to Rebuy
    /\b(movie|films?|series|anime|netflix|song|music|artist|band|cricket|football|soccer|sport|game|gaming|chess|poker)\b/i,
    // Medical / health advice
    /\b(symptom|disease|medicine|doctor|hospital|health|diet|exercise|calories|weight loss|therapy)\b/i,
    // Weather / news
    /\b(weather|forecast|temperature|news|politics|election|government|nepal government)\b/i,
    // Cooking / recipes
    /\b(recipe|ingredient|cook|bake|dal|rice|food|restaurant|hotel)\b/i,
    // Finance / crypto (not Rebuy related)
    /\b(bitcoin|crypto|nft|stock market|invest|forex|trading|mutual fund)\b/i,
];

// Keywords that ARE related to Rebuy — these override the off-topic check
const REBUY_PATTERNS = [
    /\b(rebuy|product|item|fashion|thrift|cloth|dress|shirt|pant|shoe|bag|order|cart|payment|shipping|delivery|return|refund|seller|buyer|customer|account|profile|esewa|khalti|cod|cash on delivery|store|listing|stock|price|discount|offer|category|brand|size|color|Nepal|kathmandu)\b/i,
    // Simple greetings / pleasantries are also allowed
    /^(hi|hello|hey|namaste|good morning|good afternoon|good evening|thanks|thank you|okay|ok|sure|great|yes|no|bye|goodbye|how are you)[!?.]*$/i,
];

function isOffTopic(message) {
    const trimmed = message.trim();
    // If it matches any Rebuy keyword, it's on-topic
    if (REBUY_PATTERNS.some(re => re.test(trimmed))) return false;
    // If it matches any off-topic pattern, reject it
    if (OFF_TOPIC_PATTERNS.some(re => re.test(trimmed))) return true;
    // Short vague messages are allowed (the AI will handle them)
    if (trimmed.length < 40) return false;
    return false;
}
// ────────────────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
    try {
        const { message, user_id, role } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`[Chatbot] Received: "${message}" from ${role || 'Guest'}`);

        // ── Off-topic check ──────────────────────────────────────────────────
        if (isOffTopic(message)) {
            console.log(`[Chatbot] Off-topic message blocked: "${message}"`);
            return res.json({
                reply: "Sorry, I only give Rebuy related answers. You can ask me about products, orders, shipping, payments, returns, or anything related to the Rebuy platform! 😊"
            });
        }
        // ────────────────────────────────────────────────────────────────────

        // Get enhanced context with latest data from database
        const context = await getEnhancedContext(role || 'Guest', user_id);
        
        console.log(`[Chatbot] Context length: ${context.length} characters`);
        console.log(`[Chatbot] Context preview: ${context.substring(0, 200)}...`);
        
        let roleInstructions = '';
        if (role === 'Guest') {
            roleInstructions = `- You must only reply to Customer and Seller related FAQs (e.g., how to buy, what is Rebuy, how to sell, return policies).
- If the user asks questions outside of basic FAQs, politely state that you can only answer general FAQs for guests.`;
        } else if (role === 'Customer') {
            roleInstructions = `- You must ONLY reply to customer-related questions.
- Assist with FAQs, order tracking, payments, product recommendations, and delivery-related queries.
- Do NOT answer any seller-related or admin-related questions. If asked, politely refuse and remind them you are here for customer support.`;
        } else if (role === 'Seller') {
            roleInstructions = `- You must ONLY reply to seller-related questions.
- Offer insights on trending products, low-stock alerts, promotional ideas, and performance suggestions.
- Do NOT answer customer-related or admin-related questions. If asked, politely refuse and state your focus is on helping them manage their store.`;
        } else if (role === 'Admin') {
            roleInstructions = `- You must ONLY reply to admin-related questions.
- Provide instant analytics, quick summaries of sales and user activity, and system performance updates.
- Do NOT answer customer-related or seller-related questions. If asked, politely refuse and state your focus is on platform administration.`;
        } else {
            roleInstructions = `- Answer questions about products, orders, shipping, returns, and platform features.
- If the question is unrelated to shopping/fashion/Rebuy, politely redirect to relevant topics.`;
        }

        // System persona — clear and direct instructions
        const systemMessage = `You are Rebuy AI Assistant for Rebuy - a thrift fashion marketplace in Nepal.

YOUR IDENTITY:
- You are ONLY "Rebuy AI Assistant" - nothing else
- NEVER say you are powered by Google AI, OpenAI, ChatGPT, Claude, or any other AI company
- NEVER mention any AI provider in your responses
- You are simply the Rebuy AI Assistant

CRITICAL RULES - READ CAREFULLY:
1. ONLY use information from the "DATABASE CONTEXT" section below
2. The database context shows ALL available products and categories
3. If something is NOT in the database context, it does NOT exist on Rebuy
4. NEVER invent or assume products, categories, or details
5. If asked about unavailable items, say "We don't have that right now, but check back soon!"
6. Answer ONLY what was asked - be brief and direct
7. Keep responses 1-3 sentences unless more detail is specifically requested

User Role: ${role || 'Guest'}
${roleInstructions}

DATABASE CONTEXT (Complete list - nothing else exists):
${context}

RESPONSE STYLE:
- Direct and concise
- Friendly but professional
- Answer the specific question asked
- Don't list everything unless asked
- If it's not in the database context above, it doesn't exist`;

        // Generate response using OpenRouter AI
        // Using GPT-4 for ChatGPT-like quality and speed
        const MODELS = [
            'openai/gpt-4o-mini',  // Fastest GPT-4 model, excellent quality
            'openai/gpt-3.5-turbo',  // Fallback - reliable and fast
            'anthropic/claude-3-haiku',  // Fast Claude model
        ];

        let reply = null;
        let lastError = null;

        for (const model of MODELS) {
            try {
                console.log(`[Chatbot] Trying model: ${model}`);
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model,
                        messages: [
                            { role: 'system', content: systemMessage },
                            { role: 'user', content: message }
                        ],
                        max_tokens: 250,  // More tokens for complete, natural responses
                        temperature: 0.7,  // More natural, conversational tone
                        top_p: 0.9,  // Better response quality
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'http://localhost:3000',
                            'X-Title': 'Rebuy Chatbot'
                        },
                        timeout: 10000  // 10 second timeout for better quality
                    }
                );
                reply = response.data?.choices?.[0]?.message?.content;
                if (reply) {
                    console.log(`[Chatbot] Success with model ${model}: ${reply.substring(0, 100)}...`);
                    
                    // Check if reply is too short or incomplete
                    if (reply.trim().length < 10) {
                        console.log(`[Chatbot] Reply too short (${reply.trim().length} chars), trying next model...`);
                        continue;
                    }
                    
                    break;  // Got a good reply — stop trying other models
                }
            } catch (modelError) {
                const status = modelError.response?.status;
                const errorMsg = modelError.response?.data?.error?.message || modelError.message;
                console.log(`[Chatbot] Model ${model} failed (${status || errorMsg}), trying next...`);
                lastError = modelError;
                // Continue to next model on any error
                continue;
            }
        }

        if (reply && reply.trim().length >= 15) {
            res.json({ reply: reply.trim() });
        } else {
            // All models failed — return a clean, friendly message
            console.error('[Chatbot] All models failed. Last error:', lastError?.response?.data || lastError?.message);
            res.json({
                reply: "I'm experiencing high traffic right now. Please try again in a moment! 😊"
            });
        }

    } catch (error) {
        console.error('Chatbot route error:', error.message);
        res.json({ 
            reply: "I'm having a bit of trouble right now. Please try again in a moment! 😊"
        });
    }
});

// Endpoint to manually refresh chatbot context cache
router.post('/refresh-context', async (req, res) => {
    try {
        await forceRefreshCache();
        res.json({ success: true, message: 'Chatbot context refreshed with latest data' });
    } catch (error) {
        console.error('Refresh context error:', error);
        res.status(500).json({ success: false, message: 'Failed to refresh context' });
    }
});

module.exports = router;
