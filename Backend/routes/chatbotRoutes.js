const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);

async function getProductContext(role, userId) {
    const contextParts = [];
    
    try {
        if (role === 'Seller' && userId && userId !== 'guest') {
            // Get seller's products
            const products = await Product.find({ seller: userId })
                .select('name price stock sold')
                .sort({ sold: -1 })
                .limit(20);
            
            if (products.length > 0) {
                const lowStock = products.filter(p => p.stock < 5).length;
                const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);
                
                contextParts.push(`Your store has ${products.length} products.`);
                contextParts.push(`Total units sold: ${totalSold}`);
                contextParts.push(`Products with low stock: ${lowStock}`);
                
                contextParts.push('\nTop selling products:');
                products.slice(0, 5).forEach(p => {
                    contextParts.push(`- ${p.name}: NPR ${p.price}, Sold: ${p.sold || 0}`);
                });
            }
        } else if (role === 'Customer' || role === 'Guest') {
            // Get recent products
            const products = await Product.find({ status: { $ne: 'deleted' } })
                .select('name price category')
                .limit(15);
            
            if (products.length > 0) {
                contextParts.push(`We have ${products.length}+ products available.`);
                contextParts.push('\nSome of our products:');
                products.slice(0, 10).forEach(p => {
                    contextParts.push(`- ${p.name}: NPR ${p.price}`);
                });
            }
        } else if (role === 'Admin') {
            // Get platform stats
            const totalProducts = await Product.countDocuments({});
            const totalOrders = await Order.countDocuments({});
            const totalUsers = await User.countDocuments({});
            
            contextParts.push('Platform Statistics:');
            contextParts.push(`- Total products: ${totalProducts}`);
            contextParts.push(`- Total orders: ${totalOrders}`);
            contextParts.push(`- Total users: ${totalUsers}`);
        }
    } catch (error) {
        console.error('Error getting context:', error);
    }
    
    // Add general policies
    contextParts.push('\nGeneral Information:');
    contextParts.push('- Shipping: 3-5 days across Nepal');
    contextParts.push('- Returns: Within 7 days of delivery');
    contextParts.push('- Payment: Cash on Delivery, eSewa, Khalti');
    contextParts.push('- To become a seller: Visit the "Become a Seller" page');
    contextParts.push('- To order: Browse products, add to cart, and checkout');
    
    return contextParts.join('\n');
}

router.post('/', async (req, res) => {
    try {
        const { message, user_id, role } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`[Chatbot] Received: "${message}" from ${role || 'Guest'}`);

        // Get context from database
        const context = await getProductContext(role || 'Guest', user_id);
        
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

        // Build prompt
        const prompt = `You are Rebuy AI Assistant, a helpful assistant for Rebuy - a sustainable thrift fashion marketplace in Nepal.

User Role: ${role || 'Guest'}

Context from our database:
${context}

User Question: ${message}

Instructions:
- Be friendly, helpful, and concise (2-4 sentences).
- If the user sends a simple pleasantry or acknowledgment (e.g., "thank you", "okay", "hi"), keep your response extremely brief (1 sentence), simply acknowledging them and asking if they need further help. Do NOT repeat product or store information.
${roleInstructions}

Your response:`;

        // Generate response using Google AI
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const reply = response.text();
        
        console.log(`[Chatbot] Response: ${reply.substring(0, 100)}...`);
        
        res.json({ reply });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            details: error.message 
        });
    }
});

module.exports = router;
