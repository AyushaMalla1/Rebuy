import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCpu } from 'react-icons/fi';
import './Chatbot.css';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Rebuy AI Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Product related queries
    if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
      return "We have a wide range of thrift fashion items including vintage jackets, hoodies, t-shirts, jeans, and more. You can browse our collections by category: Men's, Women's, Kid's, Sportswear, and Vintage. What are you looking for?";
    }

    // Pricing queries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return "Our prices range from Rs. 3,000 to Rs. 8,000 depending on the item. All our products are second-hand thrift fashion at affordable prices. Would you like to see specific categories?";
    }

    // Shipping queries
    if (lowerMessage.includes('ship') || lowerMessage.includes('deliver')) {
      return "We offer shipping across Pakistan. Delivery usually takes 3-5 business days. Shipping costs vary based on your location. You can check exact shipping costs at checkout.";
    }

    // Return/refund queries
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
      return "We have a 7-day return policy for unused items in original condition. Please contact our support team to initiate a return. Refunds are processed within 5-7 business days.";
    }

    // Seller queries
    if (lowerMessage.includes('sell') || lowerMessage.includes('seller') || lowerMessage.includes('become')) {
      return "Interested in becoming a seller? Great! Click on 'Become a Seller' in the header menu to register. You'll need to provide your business details and wait for approval. It usually takes 1-2 business days.";
    }

    // Account queries
    if (lowerMessage.includes('account') || lowerMessage.includes('login') || lowerMessage.includes('signup')) {
      return "You can create an account by clicking 'Signup' in the header. If you already have an account, click 'Login'. Having an account lets you track orders, save favorites, and get personalized recommendations.";
    }

    // Payment queries
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return "We accept multiple payment methods including Cash on Delivery (COD), Credit/Debit Cards, and Mobile Banking. All transactions are secure and encrypted.";
    }

    // Quality queries
    if (lowerMessage.includes('quality') || lowerMessage.includes('condition')) {
      return "All our products are carefully inspected for quality. We only accept items in good condition. Each product listing includes detailed photos and condition descriptions.";
    }

    // Contact queries
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return "You can reach our support team via:\n📧 Email: support@rebuy.com\n📱 Phone: +92 300 1234567\n⏰ Available: Mon-Sat, 9 AM - 6 PM";
    }

    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to Rebuy - your thrift fashion destination. How can I assist you today?";
    }

    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    // Default response
    return "I'm here to help! You can ask me about:\n• Products and pricing\n• Shipping and delivery\n• Returns and refunds\n• Becoming a seller\n• Account and payments\n• Or anything else about Rebuy!";
  };

  const handleSendMessage = () => {
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

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
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
