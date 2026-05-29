import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiClock, FiCheckCircle, FiAlertCircle, 
  FiMessageSquare, FiX, FiPaperclip, FiSend, FiUser, FiMail,
  FiCalendar, FiTag, FiAlertTriangle, FiEdit, FiCheck, FiArrowLeft
} from 'react-icons/fi';
import axios from 'axios';
import { buildApiUrl } from '../services/api';

import './AdminSupport.css';
function AdminSupport({ embedded = false }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [internalNote, setInternalNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  const categories = [
    { value: 'refund', label: 'Refund Request', icon: '💰', color: '#4caf50' },
    { value: 'fake_product', label: 'Fake Product Report', icon: '⚠️', color: '#ff9800' },
    { value: 'dispute', label: 'Order Dispute', icon: '⚖️', color: '#9c27b0' },
    { value: 'scam', label: 'Scam Report', icon: '🚨', color: '#f44336' },
    { value: 'delivery', label: 'Delivery Issue', icon: '📦', color: '#2196f3' },
    { value: 'account', label: 'Account Problem', icon: '👤', color: '#00bcd4' },
    { value: 'payment', label: 'Payment Issue', icon: '💳', color: '#ff5722' },
    { value: 'other', label: 'Other', icon: '❓', color: '#607d8b' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#ff5722' },
    { value: 'urgent', label: 'Urgent', color: '#f44336' }
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: '#ff9800' },
    { value: 'pending', label: 'Pending', color: '#2196f3' },
    { value: 'resolved', label: 'Resolved', color: '#4caf50' },
    { value: 'closed', label: 'Closed', color: '#9e9e9e' }
  ];

  useEffect(() => {
    const adminData = sessionStorage.getItem('user');
    
    if (adminData) {
      const parsedAdmin = JSON.parse(adminData);
      if (parsedAdmin.userType === 'admin') {
        setAdmin(parsedAdmin);
        fetchTickets();
        fetchStats();
      } else {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(buildApiUrl(`/support/admin/tickets?${params}`));
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(buildApiUrl('/support/admin/stats'));
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await axios.get(buildApiUrl(`/support/tickets/${ticketId}`));
      setSelectedTicket(response.data.ticket);
      setMessages(response.data.messages);
      setInternalNote(response.data.ticket.internalNotes || '');
      
      // Mark as read by admin
      await axios.patch(buildApiUrl(`/support/tickets/${ticketId}/read`), {
        userType: 'admin'
      });
      
      fetchTickets();
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) return;

    try {
      const formData = new FormData();
      formData.append('message', replyMessage);
      formData.append('userId', admin._id);
      formData.append('userType', 'admin');

      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(buildApiUrl(`/support/tickets/${selectedTicket._id}/reply`), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setReplyMessage('');
      setAttachments([]);
      fetchTicketDetails(selectedTicket._id);
      fetchStats();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await axios.patch(buildApiUrl(`/support/admin/tickets/${selectedTicket._id}/status`), {
        status,
        adminId: admin._id
      });
      
      alert(`Ticket status updated to ${status}`);
      fetchTicketDetails(selectedTicket._id);
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleUpdatePriority = async (priority) => {
    try {
      await axios.patch(buildApiUrl(`/support/admin/tickets/${selectedTicket._id}/priority`), {
        priority
      });
      
      alert(`Ticket priority updated to ${priority}`);
      fetchTicketDetails(selectedTicket._id);
      fetchTickets();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority. Please try again.');
    }
  };

  const handleSaveNote = async () => {
    try {
      await axios.patch(buildApiUrl(`/support/admin/tickets/${selectedTicket._id}/note`), {
        note: internalNote
      });
      
      alert('Internal note saved successfully');
      setShowNoteModal(false);
      fetchTicketDetails(selectedTicket._id);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterCategory, filterPriority, searchQuery]);

  const getStatusColor = (status) => {
    return statuses.find(s => s.value === status)?.color || '#757575';
  };

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.value === priority)?.color || '#757575';
  };

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1];
  };

  if (loading && !tickets.length) {
    return <div className="admin-support-loading">Loading support tickets...</div>;
  }

  return (
    <div className={`admin-support${embedded ? ' embedded' : ''}`}>
      {/* Header */}
      {!embedded && (
        <div className="admin-support-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
              <FiArrowLeft /> Back to Dashboard
            </button>
            <div>
              <h1>Support Ticket Management</h1>
              <p>Manage customer and seller support requests</p>
            </div>
          </div>
        </div>
      )}

      <div className="admin-support-content">
        {/* Sidebar - Ticket List */}
        <div className="admin-tickets-sidebar">
          <div className="tickets-filters">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search tickets, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Priority</label>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option value="all">All Priority</option>
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-tickets-list">
            {tickets.length === 0 ? (
              <div className="no-tickets">
                <FiMessageSquare size={48} />
                <p>No tickets found</p>
              </div>
            ) : (
              tickets.map(ticket => {
                const categoryInfo = getCategoryInfo(ticket.category);
                return (
                  <div
                    key={ticket._id}
                    className={`admin-ticket-item ${selectedTicket?._id === ticket._id ? 'active' : ''} ${ticket.unreadByAdmin ? 'unread' : ''}`}
                    onClick={() => fetchTicketDetails(ticket._id)}
                  >
                    <div className="ticket-item-header">
                      <span className="ticket-number">#{ticket.ticketNumber}</span>
                      <div className="ticket-badges">
                        <span className="priority-badge" style={{ backgroundColor: getPriorityColor(ticket.priority) }}>
                          {ticket.priority}
                        </span>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    
                    <h4>{ticket.subject}</h4>
                    
                    <div className="ticket-user-info">
                      <FiUser size={14} />
                      <span>{ticket.createdBy.name}</span>
                      <span className="user-type-badge">{ticket.createdBy.userType}</span>
                    </div>
                    
                    <div className="ticket-item-meta">
                      <span className="ticket-category" style={{ color: categoryInfo.color }}>
                        {categoryInfo.icon} {categoryInfo.label}
                      </span>
                      <span className="ticket-date">
                        {new Date(ticket.lastReplyAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {ticket.unreadByAdmin && <div className="unread-indicator"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Content - Ticket Details */}
        <div className="admin-ticket-details">
          {selectedTicket ? (
            <>
              <div className="ticket-details-header">
                <div className="ticket-header-main">
                  <h2>{selectedTicket.subject}</h2>
                  <div className="ticket-meta-row">
                    <span className="meta-chip id">#{selectedTicket.ticketNumber}</span>
                    <span
                      className="meta-chip category"
                      style={{ '--chip-color': getCategoryInfo(selectedTicket.category).color }}
                    >
                      {getCategoryInfo(selectedTicket.category).icon} {getCategoryInfo(selectedTicket.category).label}
                    </span>
                    <span className="meta-chip"><FiUser size={12} /> {selectedTicket.createdBy.name}</span>
                    <span className="meta-chip"><FiMail size={12} /> {selectedTicket.createdBy.email}</span>
                    <span className="meta-chip user-type">{selectedTicket.createdBy.userType}</span>
                    <span className="meta-chip"><FiCalendar size={12} /> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="ticket-header-controls">
                  <div className="control-item">
                    <label>Status</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="control-item">
                    <label>Priority</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handleUpdatePriority(e.target.value)}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>

                  <button type="button" className="note-btn" onClick={() => setShowNoteModal(true)}>
                    <FiEdit size={14} /> Note
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="ticket-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender.userType === 'Admin' ? 'admin-message' : 'user-message'}`}>
                    <div className="message-header">
                      <span className="message-sender">
                        {msg.sender.name}
                        {msg.sender.userType === 'Admin' && <span className="admin-badge">Admin</span>}
                      </span>
                      <span className="message-time">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="message-content">
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

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <div className="ticket-reply-form admin-reply-form">
                  <form onSubmit={handleSendReply}>
                    <textarea
                      placeholder="Type your admin reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows="2"
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
              <FiMessageSquare size={40} />
              <h3>Select a ticket to view details</h3>
              <p>Choose a ticket from the list to manage it</p>
            </div>
          )}
        </div>
      </div>

      {/* Internal Note Modal */}
      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Internal Note</h2>
              <button onClick={() => setShowNoteModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p className="note-description">
                Internal notes are only visible to admins and won't be shown to users.
              </p>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add internal notes about this ticket..."
                rows="8"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowNoteModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSaveNote} className="submit-btn">
                <FiCheck /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSupport;
