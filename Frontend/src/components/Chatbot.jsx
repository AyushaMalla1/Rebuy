import { useState, useRef, useEffect, Fragment } from 'react';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCpu } from 'react-icons/fi';
import './Chatbot.css';
import { buildApiUrl } from '../services/api';


// Removed direct Gemini API initialization as it's now handled by the Python backend.

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userRole, setUserRole] = useState('Guest');
  const [userId, setUserId] = useState('guest');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchHistoryAndInitialize = async () => {
      let userInfo = null;
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        const storedUser = localStorage.getItem('user');
        const rawData = (storedUserInfo && storedUserInfo !== "undefined") ? storedUserInfo : 
                        ((storedUser && storedUser !== "undefined") ? storedUser : null);
        if (rawData) {
          userInfo = JSON.parse(rawData);
        }
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
      
      let determinedRole = 'Guest';
      let currentUserId = 'guest';

      if (userInfo) {
        if (userInfo.role) {
          determinedRole = userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1).toLowerCase();
        } else if (userInfo.userType === 'admin' || userInfo.isAdmin) {
          determinedRole = 'Admin';
        } else if (userInfo.userType === 'seller' || userInfo.isSeller) {
          determinedRole = 'Seller';
        } else {
          determinedRole = 'Customer';
        }
        if (userInfo._id || userInfo.id) {
          currentUserId = userInfo._id || userInfo.id;
        }
      }
      
      setUserId(currentUserId);
      setUserRole(determinedRole);

      let welcomeText = "Hi! I'm Rebuy AI Assistant. How can I help you today?";
      if (determinedRole === 'Seller') {
        welcomeText = "Hi! I'm Rebuy AI Assistant. I can help you with trending products, low-stock alerts, promotional ideas, and performance insights. What would you like to know?";
      } else if (determinedRole === 'Customer') {
        welcomeText = "Hi! I'm Rebuy AI Assistant. I can help with product recommendations, orders, payments, and delivery. What can I help you with?";
      } else if (determinedRole === 'Admin') {
        welcomeText = "Hi! I'm Rebuy AI Assistant. I provide analytics, reports, and system performance updates. How can I assist you?";
      }

      const defaultWelcome = {
        id: 1,
        text: welcomeText,
        sender: 'bot',
        timestamp: new Date()
      };

      if (currentUserId !== 'guest') {
        try {
          const response = await fetch(buildApiUrl(`/chatbot-history/history/${currentUserId}`));
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.history && data.history.length > 0) {
              const historyMessages = [];
              data.history.forEach((item, index) => {
                historyMessages.push({
                  id: `hist-user-${item._id || index}`,
                  text: item.message,
                  sender: 'user',
                  timestamp: new Date(item.timestamp)
                });
                historyMessages.push({
                  id: `hist-bot-${item._id || index}`,
                  text: item.reply,
                  sender: 'bot',
                  timestamp: new Date(new Date(item.timestamp).getTime() + 100)
                });
              });
              setMessages(historyMessages);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }

      setMessages([defaultWelcome]);
    };

    fetchHistoryAndInitialize();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, isOpen]);

  const getBotResponse = async (userMessage) => {
    try {
      const response = await fetch(buildApiUrl('/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          user_id: userId,
          role: userRole
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.reply || "I'm here to help with Rebuy! You can ask me about products, orders, payments, or shipping.";
    } catch (error) {
      return "I'm having a bit of trouble connecting right now. Please try again in a moment! 😊";
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
        text: "I'm having a bit of trouble right now. Please try again in a moment! 😊",
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

  const quickQuestions = userRole === 'Seller' 
    ? [
        "What are my trending products?",
        "Do I have any low stock alerts?",
        "Any promotional ideas for slow items?",
        "How is my store performing?"
      ]
    : userRole === 'Admin'
    ? [
        "Show me platform stats",
        "Total users registered?",
        "Any products needing approval?"
      ]
    : userRole === 'Customer'
    ? [
        "Can you track my order?",
        "What are your payment options?",
        "Can you recommend some products?",
        "How long does delivery take?"
      ]
    : [
        "What products do you have?",
        "How much does shipping cost?",
        "How do I become a seller?",
        "What's your return policy?"
      ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const renderMessageWithFormatting = (text) => {
    // Basic markdown parsing for images and bold text
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const segments = [];
    let lastIndex = 0;
    
    let match;
    while ((match = imageRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      segments.push({ type: 'image', alt: match[1], src: match[2] });
      lastIndex = imageRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      segments.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    return segments.map((seg, idx) => {
      if (seg.type === 'image') {
        const defaultStyle = { maxWidth: '100%', borderRadius: '8px', margin: '8px 0', display: 'block' };
        return (
          <img 
            key={idx} 
            src={seg.src} 
            alt={seg.alt} 
            style={defaultStyle}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        );
      } else {
        // Parse bold **text** and newlines
        const lines = seg.content.split('\n');
        return (
          <span key={idx}>
            {lines.map((line, lineIdx) => {
              const boldParts = line.split(/\*\*(.*?)\*\*/g);
              return (
                <Fragment key={lineIdx}>
                  {boldParts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                  {lineIdx < lines.length - 1 && <br />}
                </Fragment>
              );
            })}
          </span>
        );
      }
    });
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
                  <p>
                    {renderMessageWithFormatting(message.text)}
                  </p>
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
                    <span>{question}</span>
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
