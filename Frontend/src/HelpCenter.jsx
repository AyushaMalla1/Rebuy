import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpCenter.css';
import { FiPlus, FiSearch, FiFilter, FiClock, FiCheckCircle, FiAlertCircle, FiMessageSquare, FiX, FiPaperclip, FiSend } from 'react-icons/fi';
import axios from 'axios';

function HelpCenter() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'other',
    priority: 'medium',
    message: '',
    attachments: []
  });

  const categories = [
    { value: 'refund', label: 'Refund Request', icon: '💰' },
    { value: 'fake_product', label: 'Fake Product Report', icon: '⚠️' },
    { value: 'dispute', label: 'Order Dispute', icon: '⚖️' },
    { value: 'scam', label: 'Scam Report', icon: '🚨' },
    { value: 'delivery', label: 'Delivery Issue', icon: '📦' },
    { value: 'account', label: 'Account Problem', icon: '👤' },
    { value: 'payment', label: 'Payment Issue', icon: '💳' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    const sellerData = localStorage.getItem('seller');
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUserType('customer');
      fetchTickets(parsedUser._id, 'customer');
    } else if (sellerData) {
      const parsedSeller = JSON.parse(sellerData);
      setUser(parsedSeller);
      setUserType('seller');
      fetchTickets(parsedSeller._id, 'seller');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchTickets = async (userId, type) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/support/tickets/my/${userId}/${type}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/support/tickets/${ticketId}`);
      setSelectedTicket(response.data.ticket);
      setMessages(response.data.messages);
      
      // Mark as read
      await axios.patch(`${process.env.REACT_APP_API_URL}/support/tickets/${ticketId}/read`, {
        userType: userType
      });
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('subject', newTicket.subject);
      formData.append('category', newTicket.category);
      formData.append('priority', newTicket.priority);
      formData.append('message', newTicket.message);
      formData.append('userId', user._id);
      formData.append('userType', userType);

      // Append attachments
      newTicket.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/support/tickets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(`Ticket created successfully! Ticket #${response.data.ticketNumber}`);
      setShowCreateModal(false);
      setNewTicket({ subject: '', category: 'other', priority: 'medium', message: '', attachments: [] });
      fetchTickets(user._id, userType);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) return;

    try {
      const formData = new FormData();
      formData.append('message', replyMessage);
      formData.append('userId', user._id);
      formData.append('userType', userType);

      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(`${process.env.REACT_APP_API_URL}/support/tickets/${selectedTicket._id}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setReplyMessage('');
      setAttachments([]);
      fetchTicketDetails(selectedTicket._id);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ff9800';
      case 'pending': return '#2196f3';
      case 'resolved': return '#4caf50';
      case 'closed': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <FiClock />;
      case 'pending': return <FiMessageSquare />;
      case 'resolved': return <FiCheckCircle />;
      case 'closed': return <FiCheckCircle />;
      default: return <FiAlertCircle />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return <div className="help-center-loading">Loading...</div>;
  }

  return (
    <div className="help-center">
      <div className="help-center-header">
        <div className="help-center-title">
          <h1>Help Center</h1>
          <p>Get support from our admin team</p>
        </div>
        <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
          <FiPlus /> Create Ticket
        </button>
      </div>

      <div className="help-center-content">
        {/* Sidebar - Ticket List */}
        <div className="tickets-sidebar">
          <div className="tickets-filters">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <FiFilter />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="filter-group">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tickets-list">
            {filteredTickets.length === 0 ? (
              <div className="no-tickets">
                <FiMessageSquare size={48} />
                <p>No tickets found</p>
                <button onClick={() => setShowCreateModal(true)}>Create your first ticket</button>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket._id}
                  className={`ticket-item ${selectedTicket?._id === ticket._id ? 'active' : ''} ${ticket.unreadByUser ? 'unread' : ''}`}
                  onClick={() => fetchTicketDetails(ticket._id)}
                >
                  <div className="ticket-item-header">
                    <span className="ticket-number">#{ticket.ticketNumber}</span>
                    <span className="ticket-status" style={{ color: getStatusColor(ticket.status) }}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </span>
                  </div>
                  <h4>{ticket.subject}</h4>
                  <div className="ticket-item-meta">
                    <span className="ticket-category">
                      {categories.find(c => c.value === ticket.category)?.icon} {categories.find(c => c.value === ticket.category)?.label}
                    </span>
                    <span className="ticket-date">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {ticket.unreadByUser && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Ticket Details */}
        <div className="ticket-details">
          {selectedTicket ? (
            <>
              <div className="ticket-details-header">
                <div>
                  <h2>{selectedTicket.subject}</h2>
                  <div className="ticket-meta-info">
                    <span className="ticket-number">Ticket #{selectedTicket.ticketNumber}</span>
                    <span className="ticket-category">
                      {categories.find(c => c.value === selectedTicket.category)?.icon} {categories.find(c => c.value === selectedTicket.category)?.label}
                    </span>
                    <span className="ticket-status" style={{ backgroundColor: getStatusColor(selectedTicket.status) }}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ticket-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender.userType === 'Admin' ? 'admin-message' : 'user-message'}`}>
                    <div className="message-avatar">
                      {msg.sender.userType === 'Admin' ? '👨‍💼' : '👤'}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">{msg.sender.name}</span>
                        <span className="message-time">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="message-text">{msg.message}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="message-attachments">
                          {msg.attachments.map((att, i) => (
                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                              <FiPaperclip /> {att.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="ticket-reply-form">
                  <form onSubmit={handleSendReply}>
                    <textarea
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows="4"
                    />
                    <div className="reply-actions">
                      <label className="attach-btn">
                        <FiPaperclip />
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setAttachments(Array.from(e.target.files))}
                          style={{ display: 'none' }}
                        />
                        {attachments.length > 0 && <span>({attachments.length} files)</span>}
                      </label>
                      <button type="submit" className="send-btn">
                        <FiSend /> Send Reply
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="no-ticket-selected">
              <FiMessageSquare size={64} />
              <h3>Select a ticket to view details</h3>
              <p>Choose a ticket from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Support Ticket</h2>
              <button onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  required
                  rows="6"
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <div className="form-group">
                <label>Attachments (Optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setNewTicket({ ...newTicket, attachments: Array.from(e.target.files) })}
                />
                <small>Max 5 files, 5MB each. Supported: JPG, PNG, PDF, DOC</small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpCenter;
