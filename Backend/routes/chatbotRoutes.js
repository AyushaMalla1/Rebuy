const express = require('express');
const router = express.Router();
const http = require('http');

const CHATBOT_SERVER_URL = process.env.CHATBOT_SERVER_URL || 'http://localhost:5001';

router.post('/', async (req, res) => {
    try {
        const { message, user_id, role } = req.body;

        const payload = JSON.stringify({
            message: message || '',
            role: role || 'Customer',
            user_id: user_id || 'guest'
        });

        const options = {
            hostname: 'localhost',
            port: 5001,
            path: '/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const pythonReq = http.request(options, (pythonRes) => {
            let data = '';
            pythonRes.on('data', (chunk) => { data += chunk; });
            pythonRes.on('end', () => {
                if (res.headersSent) return;
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        return res.status(500).json({ error: parsed.error });
                    }
                    res.json({ reply: parsed.reply });
                } catch (err) {
                    console.error('Failed to parse chatbot server response:', err);
                    if (!res.headersSent) res.status(500).json({ error: 'Failed to parse AI response', details: data });
                }
            });
        });

        pythonReq.on('error', (err) => {
            console.error('Could not reach chatbot server:', err.message);
            if (!res.headersSent) {
                res.status(503).json({ 
                    error: 'AI service is unavailable. Please wait a moment and try again. The chatbot server may still be loading.' 
                });
            }
        });

        pythonReq.setTimeout(60000, () => {
            pythonReq.destroy();
            if (!res.headersSent) {
                res.status(504).json({ error: 'AI response timed out. Please try again.' });
            }
        });

        pythonReq.write(payload);
        pythonReq.end();

    } catch (error) {
        console.error('Chatbot route error:', error);
        res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
});

module.exports = router;
