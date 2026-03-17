import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCpu } from 'react-icons/fi';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './Chatbot.css';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Rebuy AI Assistant powered by Gemini. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = async (userMessage) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // System context about Rebuy
      const context = `You are a helpful AI assistant for Rebuy, a sustainable thrift fashion marketplace in Pakistan. 

Key Information about Rebuy:
- We sell second-hand thrift fashion items including vintage jackets, hoodies, t-shirts, jeans, and more
- Price range: Rs. 3,000 to Rs. 8,000
- Categories: Men's, Women's, Kid's, Sportswear, and Vintage
- Shipping: Available across Pakistan, 3-5 business days
- Payment methods: Cash on Delivery (COD), Credit/Debit Cards, Mobile Banking
- Return policy: 7-day return for unused items in original condition
- Contact: support@rebuy.com, +92 300 1234567 (Mon-Sat, 9 AM - 6 PM)
- Sellers can register through "Become a Seller" page, approval takes 1-2 business days

Be friendly, helpful, and concise. If asked about products not related to fashion, politely redirect to fashion items.`;

      // Build chat history
      const chat = model.startChat({
        history: chatHistoryRef.current,
        generationConfig: {
          maxOutputTokens: 200,
        },
      });

      const result = await chat.sendMessage(context + "\n\nUser: " + userMessage);
      const response = await result.response;
      const text = response.text();

      // Update chat history
      chatHistoryRef.current.push(
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: text }] }
      );

      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment, or contact our support team at support@rebuy.com";
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Get AI response
    try {
      const botResponseText = await getBotResponse(inputMessage);
      const botResponse = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse = {
        id: messages.length + 2,
        text: "I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What products do you have?",
    "How much does shipping cost?",
    "How do I become a seller?",
    "What's your return policy?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button className="chatbot-button" onClick={() => setIsOpen(true)}>
          <FiMessageCircle />
          <span className="chatbot-badge">AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <FiCpu />
              </div>
              <div>
                <h3>Rebuy AI Assistant</h3>
                <p className="chatbot-status">
                  <span className="status-dot"></span>
                  Online
                </p>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? <FiUser /> : <FiCpu />}
                </div>
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message message-bot">
                <div className="message-avatar">
                  <FiCpu />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="quick-questions">
              <p className="quick-questions-label">Quick questions:</p>
              <div className="quick-questions-grid">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === ''}
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
