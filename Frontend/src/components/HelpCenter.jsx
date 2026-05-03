import { useState } from 'react';
import { 
  FaQuestionCircle, 
  FaSearch, 
  FaBook, 
  FaHeadset, 
  FaTicketAlt,
  FaChevronRight,
  FaChevronDown,
  FaLightbulb,
  FaVideo,
  FaFileAlt,
  FaTimes,
  FaPaperPlane
} from 'react-icons/fa';
import './HelpCenter.css';

const API_URL = 'http://localhost:5000/api';

function HelpCenter({ sellerId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });

  // Help articles data
  const helpArticles = [
    {
      id: 1,
      category: 'getting-started',
      title: 'How to add your first product',
      content: 'To add a product, go to the Products tab and click "Add Product". Fill in all required fields including name, description, price, category, and upload images. Once submitted, your product will be reviewed by our team.',
      icon: <FaLightbulb />,
      views: 1250
    },
    {
      id: 2,
      category: 'getting-started',
      title: 'Setting up your seller profile',
      content: 'Navigate to Settings > Profile to update your store information. Add your store name, description, contact details, and profile image. A complete profile helps build trust with buyers.',
      icon: <FaLightbulb />,
      views: 980
    },
    {
      id: 3,
      category: 'orders',
      title: 'Managing orders and shipments',
      content: 'View all orders in the Orders tab. Update order status as you process them: Pending → Processing → Shipped → Delivered. Buyers receive notifications at each stage.',
      icon: <FaBook />,
      views: 2100
    },
    {
      id: 4,
      category: 'orders',
      title: 'Handling order cancellations',
      content: 'If a buyer requests cancellation, you can cancel orders that are in Pending or Processing status. Go to Orders, find the order, and click Cancel. Refunds are processed automatically.',
      icon: <FaBook />,
      views: 756
    },
    {
      id: 5,
      category: 'products',
      title: 'Product approval process',
      content: 'All products go through admin review before being listed. This typically takes 24-48 hours. You\'ll receive a notification once approved or if changes are needed.',
      icon: <FaFileAlt />,
      views: 1450
    },
    {
      id: 6,
      category: 'products',
      title: 'Managing product inventory',
      content: 'Keep your stock levels updated to avoid overselling. Low stock alerts appear when inventory drops below 20 units. Out of stock products are automatically hidden from buyers.',
      icon: <FaFileAlt />,
      views: 890
    },
    {
      id: 7,
      category: 'payments',
      title: 'Understanding payment options',
      content: 'Rebuy supports COD (Cash on Delivery) and online payments. You can enable/disable payment methods for each product. Payments are processed securely through our payment gateway.',
      icon: <FaBook />,
      views: 1680
    },
    {
      id: 8,
      category: 'payments',
      title: 'Receiving your payouts',
      content: 'Payouts are processed weekly to your registered bank account. Ensure your bank details are updated in Settings > Payment Information. Track your earnings in the Revenue tab.',
      icon: <FaBook />,
      views: 2340
    },
    {
      id: 9,
      category: 'account',
      title: 'Enabling two-factor authentication',
      content: 'Secure your account by enabling 2FA in Settings > Security. You\'ll need to enter your password to confirm. Once enabled, you\'ll need a verification code to log in.',
      icon: <FaFileAlt />,
      views: 445
    },
    {
      id: 10,
      category: 'account',
      title: 'Changing your password',
      content: 'Go to Settings > Security and click "Change Password". Enter your current password and new password. You\'ll receive an email confirmation once changed.',
      icon: <FaFileAlt />,
      views: 623
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: <FaBook /> },
    { id: 'getting-started', name: 'Getting Started', icon: <FaLightbulb /> },
    { id: 'products', name: 'Products', icon: <FaFileAlt /> },
    { id: 'orders', name: 'Orders', icon: <FaTicketAlt /> },
    { id: 'payments', name: 'Payments', icon: <FaBook /> },
    { id: 'account', name: 'Account', icon: <FaHeadset /> }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    alert('Support ticket submitted successfully! Our team will respond within 24 hours.');
    setShowTicketForm(false);
    setTicketData({
      subject: '',
      category: 'general',
      priority: 'medium',
      description: ''
    });
  };

  return (
    <div className="help-center-container">
      {/* Header */}
      <div className="help-center-header">
        <div className="help-header-content">
          <FaQuestionCircle className="help-header-icon" />
          <div>
            <h1 className="help-header-title">Help Center</h1>
            <p className="help-header-subtitle">Find answers and get support</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="help-search-section">
        <div className="help-search-wrapper">
          <FaSearch className="help-search-icon" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="help-search-input"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="help-quick-actions">
        <div 
          className="help-action-card"
          onClick={() => setShowTicketForm(true)}
        >
          <div className="help-action-icon support">
            <FaHeadset />
          </div>
          <h3>Contact Support</h3>
          <p>Get help from our team</p>
        </div>
        <div className="help-action-card">
          <div className="help-action-icon video">
            <FaVideo />
          </div>
          <h3>Video Tutorials</h3>
          <p>Watch step-by-step guides</p>
        </div>
        <div className="help-action-card">
          <div className="help-action-icon docs">
            <FaFileAlt />
          </div>
          <h3>Documentation</h3>
          <p>Read detailed guides</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="help-main-content">
        {/* Categories Sidebar */}
        <div className="help-categories">
          <h3 className="help-categories-title">Categories</h3>
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`help-category-item ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="help-category-icon">{cat.icon}</span>
              <span className="help-category-name">{cat.name}</span>
              <FaChevronRight className="help-category-arrow" />
            </div>
          ))}
        </div>

        {/* Articles List */}
        <div className="help-articles">
          <div className="help-articles-header">
            <h2>
              {selectedCategory === 'all' 
                ? 'All Articles' 
                : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <span className="help-articles-count">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="help-no-results">
              <FaSearch size={48} />
              <h3>No articles found</h3>
              <p>Try adjusting your search or browse by category</p>
            </div>
          ) : (
            <div className="help-articles-list">
              {filteredArticles.map(article => (
                <div key={article.id} className="help-article-card">
                  <div 
                    className="help-article-header"
                    onClick={() => setExpandedArticle(
                      expandedArticle === article.id ? null : article.id
                    )}
                  >
                    <div className="help-article-title-row">
                      <span className="help-article-icon">{article.icon}</span>
                      <h3 className="help-article-title">{article.title}</h3>
                    </div>
                    <div className="help-article-meta">
                      <span className="help-article-views">{article.views} views</span>
                      {expandedArticle === article.id ? (
                        <FaChevronDown className="help-article-toggle" />
                      ) : (
                        <FaChevronRight className="help-article-toggle" />
                      )}
                    </div>
                  </div>
                  {expandedArticle === article.id && (
                    <div className="help-article-content">
                      <p>{article.content}</p>
                      <div className="help-article-actions">
                        <button className="help-article-btn helpful">
                          Was this helpful? 👍
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Support Ticket Modal */}
      {showTicketForm && (
        <div className="help-modal-overlay" onClick={() => setShowTicketForm(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h2>Contact Support</h2>
              <button 
                className="help-modal-close"
                onClick={() => setShowTicketForm(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitTicket} className="help-ticket-form">
              <div className="help-form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={ticketData.subject}
                  onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                  placeholder="Brief description of your issue"
                  required
                  className="help-form-input"
                />
              </div>
              <div className="help-form-row">
                <div className="help-form-group">
                  <label>Category</label>
                  <select
                    value={ticketData.category}
                    onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                    className="help-form-select"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="products">Products</option>
                    <option value="orders">Orders</option>
                  </select>
                </div>
                <div className="help-form-group">
                  <label>Priority</label>
                  <select
                    value={ticketData.priority}
                    onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                    className="help-form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="help-form-group">
                <label>Description</label>
                <textarea
                  value={ticketData.description}
                  onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                  placeholder="Please provide detailed information about your issue..."
                  rows="6"
                  required
                  className="help-form-textarea"
                />
              </div>
              <div className="help-form-actions">
                <button 
                  type="button" 
                  className="help-btn-cancel"
                  onClick={() => setShowTicketForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="help-btn-submit">
                  <FaPaperPlane />
                  Submit Ticket
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
