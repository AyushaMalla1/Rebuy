import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiClock, FiFacebook, FiTwitter, FiInstagram, FiPaperclip } from 'react-icons/fi';
import axios from 'axios';
import './Contact.css';

function Contact() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    category: 'other',
    priority: 'medium',
    message: '',
    attachments: []
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if customer is logged in to allow creating a trackable support ticket
    const userData = localStorage.getItem('user');
    
    if (userData) {
      setUser(JSON.parse(userData));
      setUserType('customer');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      attachments: Array.from(e.target.files)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to send a message so we can track and reply to your inquiry.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('subject', formData.subject);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('message', formData.message);
      data.append('userId', user._id);
      data.append('userType', userType);

      // Append attachments
      formData.attachments.forEach(file => {
        data.append('attachments', file);
      });

      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/support/tickets`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ subject: '', category: 'other', priority: 'medium', message: '', attachments: [] });
      }, 5000);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <header className="contact-header">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>
        <div className="header-title">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </header>

      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>Have questions? We're here to help!</p>

            <div className="info-cards">
              <div className="info-card">
                <FiMail className="info-icon" />
                <h3>Email</h3>
                <p>support@rebuy.com</p>
                <p>sales@rebuy.com</p>
              </div>

              <div className="info-card">
                <FiPhone className="info-icon" />
                <h3>Phone</h3>
                <p>+977 9812345678</p>
                <p>Mon-Fri: 9AM - 6PM</p>
              </div>

              <div className="info-card">
                <FiMapPin className="info-icon" />
                <h3>Address</h3>
                <p>Thamel, Kathmandu</p>
                <p>Nepal 44600</p>
              </div>

              <div className="info-card">
                <FiClock className="info-icon" />
                <h3>Business Hours</h3>
                <p>Monday - Friday: 9AM - 6PM</p>
                <p>Saturday: 10AM - 4PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FiFacebook />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FiTwitter />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FiInstagram />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send Us a Message</h2>
            {!user && (
              <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '8px', marginBottom: '20px' }}>
                Please <Link to="/login" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>log in</Link> to send us a message. This ensures we can track your request and reply to you directly through the platform.
              </div>
            )}
            
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
            
            {submitted ? (
              <div className="success-message">
                <h3>Thank you for contacting us!</h3>
                <p>Your support ticket has been created successfully. You can view its status and our replies in your profile under the "Help Center" or "Support Tickets" section.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                {user && (
                  <div className="form-group">
                    <label>From: <strong>{user.fullName}</strong> ({user.email})</label>
                  </div>
                )}
                
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={!user || loading}
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    disabled={!user || loading}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="refund">Refund Request</option>
                    <option value="fake_product">Fake Product Report</option>
                    <option value="dispute">Order Dispute</option>
                    <option value="scam">Scam Report</option>
                    <option value="delivery">Delivery Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="payment">Payment Issue</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    disabled={!user || loading}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <div className="form-group">
                  <label>Attachments (Optional)</label>
                  <div className="file-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      disabled={!user || loading}
                      id="file-upload"
                      style={{ display: 'block', width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '8px' }}
                    />
                  </div>
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Max 5 files, 5MB each. Supported: JPG, PNG, PDF, DOC</small>
                </div>

                <button type="submit" className="submit-btn" disabled={!user || loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I track my order?</h3>
              <p>You can track your order from your profile page under the Orders tab.</p>
            </div>
            <div className="faq-item">
              <h3>What is your return policy?</h3>
              <p>We offer a 7-day return policy for items that don't match the description.</p>
            </div>
            <div className="faq-item">
              <h3>How do I become a seller?</h3>
              <p>Click on "Become a Seller" in the header and fill out the registration form.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept eSewa, Credit/Debit Cards, and Cash on Delivery.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;
