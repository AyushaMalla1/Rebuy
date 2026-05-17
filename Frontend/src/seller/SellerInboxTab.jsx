import { FaEnvelope, FaSearch, FaPaperPlane, FaPaperclip, FaSmile, FaImage } from 'react-icons/fa';
import { useSellerDashboard } from './DashboardContext';
import './SellerInboxTab.css';

function SellerInboxTab() {
  const {
    messages,
    loadingMessages,
    selectedMessage,
    handleSelectMessage,
    conversationMessages,
    isMessageFromCurrentSeller,
    getSelectedConversationProduct,
    messageSearchQuery,
    setMessageSearchQuery,
    replyText,
    setReplyText,
    handleDirectReply,
    handleFileAttachment,
    attachedFile,
    setAttachedFile,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiClick,
  } = useSellerDashboard();

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👏'];

  const filteredMessages = messages.filter(msg => {
    const query = messageSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      msg.senderInfo?.fullName,
      msg.senderInfo?.email,
      msg.productId?.name,
      msg.message
    ].some(v => String(v || '').toLowerCase().includes(query));
  });

  const conversationProduct = getSelectedConversationProduct();

  return (
    <div className="inbox-section">
      {/* Left: Conversation List */}
      <div className="inbox-sidebar">
        <div className="inbox-search-wrapper">
          <FaSearch className="inbox-search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={messageSearchQuery}
            onChange={e => setMessageSearchQuery(e.target.value)}
            className="inbox-search-input"
          />
        </div>

        <div className="inbox-list">
          {loadingMessages ? (
            <div className="inbox-loading"><p>Loading messages...</p></div>
          ) : filteredMessages.length === 0 ? (
            <div className="inbox-empty-list">
              <FaEnvelope size={32} />
              <p>No messages found</p>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div
                key={msg._id}
                onClick={() => handleSelectMessage(msg)}
                className={`inbox-item ${selectedMessage?.conversationId === msg.conversationId ? 'active' : ''} ${msg.unreadCount > 0 ? 'unread' : ''}`}
              >
                <div className="inbox-item-avatar">
                  {msg.senderInfo?.profileImage
                    ? <img src={msg.senderInfo.profileImage} alt="" />
                    : <span>{(msg.senderInfo?.fullName || 'C')[0].toUpperCase()}</span>
                  }
                </div>
                <div className="inbox-item-content">
                  <div className="inbox-item-header">
                    <span className="inbox-item-name">{msg.senderInfo?.fullName || 'Customer'}</span>
                    <span className="inbox-item-time">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="inbox-item-preview">{msg.message}</p>
                  {msg.productId?.name && (
                    <span className="inbox-item-product">{msg.productId.name}</span>
                  )}
                </div>
                {msg.unreadCount > 0 && (
                  <span className="inbox-unread-badge">{msg.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Conversation View */}
      <div className="inbox-conversation">
        {!selectedMessage ? (
          <div className="inbox-no-selection">
            <FaEnvelope size={48} />
            <h3>Select a conversation</h3>
            <p>Choose a message from the left to start chatting</p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="inbox-conv-header">
              <div className="inbox-conv-avatar">
                {selectedMessage.senderInfo?.profileImage
                  ? <img src={selectedMessage.senderInfo.profileImage} alt="" />
                  : <span>{(selectedMessage.senderInfo?.fullName || 'C')[0].toUpperCase()}</span>
                }
              </div>
              <div>
                <h4 className="inbox-conv-name">{selectedMessage.senderInfo?.fullName || 'Customer'}</h4>
                <p className="inbox-conv-email">{selectedMessage.senderInfo?.email || ''}</p>
              </div>
              {conversationProduct && (
                <div className="inbox-conv-product">
                  <span>Re: </span>
                  <strong>{conversationProduct.name}</strong>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="inbox-messages">
              {conversationMessages.length === 0 ? (
                <div className="inbox-messages-empty"><p>No messages in this conversation yet.</p></div>
              ) : (
                conversationMessages.map(msg => (
                  <div
                    key={msg._id}
                    className={`inbox-message ${isMessageFromCurrentSeller(msg) ? 'sent' : 'received'}`}
                  >
                    <div className="inbox-message-bubble">
                      <p>{msg.message}</p>
                      <span className="inbox-message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Box */}
            <div className="inbox-reply-box">
              {attachedFile && (
                <div className="inbox-attached-file">
                  <span>{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)}>×</button>
                </div>
              )}
              {showEmojiPicker && (
                <div className="inbox-emoji-picker">
                  {commonEmojis.map(emoji => (
                    <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="inbox-emoji-btn">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <div className="inbox-reply-input-row">
                <button className="inbox-reply-action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Emoji">
                  <FaSmile />
                </button>
                <button className="inbox-reply-action-btn" onClick={handleFileAttachment} title="Attach file">
                  <FaPaperclip />
                </button>
                <input
                  type="text"
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleDirectReply()}
                  className="inbox-reply-input"
                />
                <button
                  onClick={handleDirectReply}
                  disabled={!replyText.trim()}
                  className="inbox-send-btn"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerInboxTab;
