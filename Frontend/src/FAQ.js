import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './FAQ.css';
import Chatbot from './components/Chatbot';

function FAQ() {
  const [activeTab, setActiveTab] = useState('all');
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqData = {
    all: [
      {
        id: 1,
        question: 'Can I cancel my order?',
        answer: 'Yes, you can cancel your order before it is shipped. Go to the Orders section in your profile, find the order you want to cancel, and click the "Cancel Order" button. Once the order is shipped, cancellation is not possible, but you can request a return after receiving the item. Please note that if you paid online, the refund will be processed within 5-7 business days.'
      },
      {
        id: 2,
        question: 'Can I change the shipping address on my order?',
        answer: 'You can change the shipping address only if the order has not been shipped yet. Please contact the seller immediately through the Messages section in your profile or contact our support team at support@rebuy.com. Once the order is shipped, the address cannot be changed. Make sure to verify your shipping address before completing your purchase.'
      },
      {
        id: 3,
        question: 'Can I add or remove an item from my order?',
        answer: 'Unfortunately, once an order is placed, you cannot add or remove items from it. Our system processes orders immediately to ensure fast delivery. If you need to make changes, you will need to cancel the current order (if not yet shipped) and place a new order with the correct items. We recommend reviewing your cart carefully before checkout.'
      },
      {
        id: 4,
        question: 'How do I track my order?',
        answer: 'You can track your order by logging into your account and going to the Orders section in your profile. Each order displays a tracking number and real-time status updates (Processing, Shipped, Out for Delivery, Delivered). You will also receive email and SMS notifications when your order status changes. Click "View Details" on any order to see the complete tracking timeline.'
      },
      {
        id: 5,
        question: 'What payment methods do you accept?',
        answer: 'We accept multiple payment methods for your convenience: Credit/Debit Cards (Visa, Mastercard, American Express), Digital Wallets (eSewa, Khalti, IME Pay), Bank Transfers, and Cash on Delivery (COD) for eligible orders. You can select your preferred payment method during checkout. All online payments are secured with SSL encryption.'
      },
      {
        id: 6,
        question: 'How do I become a seller on Rebuy?',
        answer: 'To become a seller, click on "Become a Seller" in the navigation menu. Fill out the registration form with your personal information, store details, and upload required documents (ID proof, address proof). Our admin team will review your application within 2-3 business days. Once approved, you can start listing your products immediately.'
      },
      {
        id: 7,
        question: 'Is my personal information secure?',
        answer: 'Yes, we take your privacy and security very seriously. All personal information is encrypted using industry-standard SSL technology. We never share your data with third parties without your consent. Payment information is processed through secure payment gateways and is never stored on our servers. Read our Privacy Policy for more details.'
      },
      {
        id: 8,
        question: 'How do I contact customer support?',
        answer: 'You can contact our customer support team in multiple ways: 1) Use the AI Chatbot on any page for instant answers, 2) Send a message through the Contact Us page, 3) Email us at support@rebuy.com, 4) Call our helpline at +977-1-XXXXXXX (9 AM - 6 PM, Mon-Sat). We typically respond within 24 hours.'
      }
    ],
    shipping: [
      {
        id: 9,
        question: 'How long does shipping take?',
        answer: 'Shipping times vary based on your location and the shipping method selected: Standard Shipping (3-7 business days) - Free for orders above Rs. 2,000, Express Shipping (1-3 business days) - Rs. 150 flat rate, Same Day Delivery (available in Kathmandu Valley only) - Rs. 250. Delivery times may vary during peak seasons or due to weather conditions. Sellers typically process orders within 1-2 business days.'
      },
      {
        id: 10,
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within Nepal to ensure the best service quality and faster delivery times. We deliver to all major cities including Kathmandu, Pokhara, Biratnagar, Lalitpur, Bhaktapur, and other districts. International shipping is not available at this time, but we are working on expanding our services to neighboring countries in the future.'
      },
      {
        id: 11,
        question: 'What are the shipping charges?',
        answer: 'Shipping charges are calculated based on several factors: Item weight and dimensions, Delivery location (inside or outside Kathmandu Valley), Shipping method selected (Standard, Express, or Same Day). Standard shipping is FREE for orders above Rs. 2,000. For orders below Rs. 2,000, shipping starts at Rs. 100. The exact shipping cost will be calculated and displayed at checkout before you complete your purchase.'
      },
      {
        id: 12,
        question: 'Can I change my delivery address after placing an order?',
        answer: 'Yes, but only if the order hasn\'t been shipped yet. To change your delivery address: 1) Go to Orders in your profile, 2) Click on the order you want to modify, 3) Contact the seller through Messages, or 4) Call our support team immediately. Once the order is marked as "Shipped", the address cannot be changed. We recommend double-checking your address before placing an order.'
      },
      {
        id: 13,
        question: 'What if my order is delayed?',
        answer: 'If your order is delayed beyond the estimated delivery date: 1) Check the tracking status in your Orders section, 2) Contact the seller directly through Messages, 3) If the delay exceeds 3 days, contact our support team. We will investigate and provide updates. In case of significant delays, you may be eligible for a refund or compensation. Weather conditions and public holidays may cause delays.'
      },
      {
        id: 14,
        question: 'Do you offer gift wrapping?',
        answer: 'Yes, gift wrapping is available for an additional Rs. 50 per item. You can select the gift wrapping option during checkout. We offer beautiful eco-friendly wrapping paper and include a personalized message card. Gift receipts (without price) are also available upon request. This service is perfect for birthdays, anniversaries, and special occasions.'
      }
    ],
    returns: [
      {
        id: 15,
        question: 'What is your return policy?',
        answer: 'We offer a 7-day return policy from the date of delivery. Items must be in their original condition with all tags attached, unworn, unwashed, and in the original packaging. To initiate a return: 1) Go to Orders in your profile, 2) Select the order, 3) Click "Return Request", 4) Choose the reason for return, 5) Upload photos if the item is damaged/defective. The seller will review and approve your request within 24-48 hours.'
      },
      {
        id: 16,
        question: 'How do I return an item?',
        answer: 'Follow these steps to return an item: 1) Log into your account and go to Orders, 2) Find the order and click "Return Request", 3) Select the item(s) you want to return and provide a reason, 4) Upload photos if applicable, 5) Wait for seller approval (24-48 hours), 6) Once approved, pack the item securely in its original packaging, 7) Use the prepaid return label provided or arrange pickup, 8) Ship the item back to the seller. You will receive a refund once the seller receives and verifies the returned item.'
      },
      {
        id: 17,
        question: 'When will I receive my refund?',
        answer: 'Refund processing times: 1) Seller receives and inspects the returned item (2-3 days), 2) Seller approves the return, 3) Refund is initiated (1-2 days), 4) Money is credited to your account (3-7 business days for online payments, immediate for Rebuy Wallet). The total process typically takes 7-10 business days. You can choose to receive your refund via the original payment method or as Rebuy Wallet credit for faster processing.'
      },
      {
        id: 18,
        question: 'Can I exchange an item instead of returning it?',
        answer: 'Currently, we do not offer direct exchanges. If you want a different size, color, or style, you will need to: 1) Return the original item for a refund, 2) Place a new order for the item you want. This ensures you get the item you want without waiting for the exchange process. We recommend checking size charts and product descriptions carefully before purchasing to avoid returns.'
      },
      {
        id: 19,
        question: 'What items cannot be returned?',
        answer: 'The following items are not eligible for return: 1) Items marked as "Final Sale" or "Non-Returnable", 2) Intimate apparel and undergarments (for hygiene reasons), 3) Items without original tags or packaging, 4) Worn, washed, or altered items, 5) Items damaged due to misuse, 6) Customized or personalized items. Please check the product page for specific return eligibility before purchasing.'
      },
      {
        id: 20,
        question: 'What if I receive a damaged or defective item?',
        answer: 'If you receive a damaged or defective item: 1) Take clear photos of the damage/defect and packaging, 2) Contact us within 48 hours of delivery, 3) Go to Orders and click "Return Request", 4) Select "Damaged/Defective" as the reason, 5) Upload the photos. We will arrange a free pickup and provide a full refund or replacement immediately. You will not be charged for return shipping in case of damaged/defective items.'
      },
      {
        id: 21,
        question: 'Can I return an item after 7 days?',
        answer: 'Our standard return policy is 7 days from delivery. Returns requested after 7 days are generally not accepted unless there are exceptional circumstances (e.g., you were traveling, medical emergency). Contact our support team with your order details and reason for the late return. We will review your case and may make an exception at our discretion. Extended return periods may be offered during special promotions.'
      }
    ]
  };

  const toggleQuestion = (id) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  const getCurrentFAQs = () => {
    return activeTab === 'all' ? faqData.all : faqData[activeTab];
  };

  return (
    <div className="faq-page">
      {/* Header */}
      <header className="faq-header">
        <div className="faq-header-content">
          <Link to="/" className="faq-logo">
            <img src="/logo.png" alt="Rebuy" />
          </Link>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Rebuy</p>
        </div>
      </header>

      {/* FAQ Content */}
      <div className="faq-container">
        {/* Tabs */}
        <div className="faq-tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            All FAQs
          </button>
          <button 
            className={activeTab === 'shipping' ? 'active' : ''} 
            onClick={() => setActiveTab('shipping')}
          >
            Shipping
          </button>
          <button 
            className={activeTab === 'returns' ? 'active' : ''} 
            onClick={() => setActiveTab('returns')}
          >
            Returns
          </button>
        </div>

        {/* Questions */}
        <div className="faq-questions">
          {getCurrentFAQs().length > 0 ? (
            getCurrentFAQs().map(faq => (
              <div key={faq.id} className="faq-item">
                <button 
                  className={`faq-question ${openQuestion === faq.id ? 'active' : ''}`}
                  onClick={() => toggleQuestion(faq.id)}
                  type="button"
                >
                  <span>{faq.question}</span>
                  {openQuestion === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openQuestion === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-faqs">
              <p>No questions available in this category.</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="faq-contact">
          <h3>Still have questions?</h3>
          <p>Our support team is here to help you</p>
          <Link to="/contact" className="contact-btn">Contact Us</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="faq-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SHOP BY</h4>
            <ul>
              <li><Link to="/category/men">Men</Link></li>
              <li><Link to="/category/women">Women</Link></li>
              <li><Link to="/category/kids">Kids</Link></li>
              <li><Link to="/category/brands">Brands</Link></li>
              <li><Link to="/sale">On Sale</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>COMPANY INFO</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/sustainability">Sustainability</Link></li>
              <li><Link to="/affiliates">Affiliates Program</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>SUPPORT</h4>
            <ul>
              <li><Link to="/faq">F.A.Q</Link></li>
              <li><Link to="/shipping">Shipping</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/order-status">Order Status</Link></li>
              <li><Link to="/payment">Payment Options</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section footer-brand">
            <img src="/logo.png" alt="Rebuy" className="footer-logo" />
            <p className="footer-tagline">THRIFT SHOP</p>
            <p className="footer-description">
              Your trusted marketplace for quality thrift fashion. 
              Buy and sell pre-loved clothing sustainably.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Rebuy. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default FAQ;
