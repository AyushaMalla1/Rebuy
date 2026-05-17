import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiClock, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to backend
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
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
            {submitted ? (
              <div className="success-message">
                <h3>Thank you for contacting us!</h3>
                <p>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
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
              <p>We accept eSewa, Khalti, Credit/Debit Cards, and Cash on Delivery.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Contact;
