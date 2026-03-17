import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import './OrderStatus.css';

function OrderStatus() {
  const navigate = useNavigate();

  const orderStatuses = [
    {
      icon: <FiClock size={48} />,
      status: 'Pending',
      color: '#ff9800',
      description: 'Your order has been placed and is awaiting confirmation from the seller.',
      timeline: 'Usually confirmed within 24 hours',
      actions: ['You can cancel the order', 'Payment is on hold']
    },
    {
      icon: <FiPackage size={48} />,
      status: 'Processing',
      color: '#2196f3',
      description: 'The seller has confirmed your order and is preparing it for shipment.',
      timeline: '1-2 business days',
      actions: ['Seller is packing your items', 'You can still cancel']
    },
    {
      icon: <FiTruck size={48} />,
      status: 'Shipped',
      color: '#00bcd4',
      description: 'Your order is on its way! Track your package using the tracking number.',
      timeline: '3-7 business days',
      actions: ['Track your package', 'Cannot cancel - request return instead']
    },
    {
      icon: <FiCheckCircle size={48} />,
      status: 'Delivered',
      color: '#4caf50',
      description: 'Your order has been delivered successfully!',
      timeline: 'Completed',
      actions: ['Verify item condition', 'Leave a review', 'Request return within 7 days']
    },
    {
      icon: <FiAlertCircle size={48} />,
      status: 'Cancelled',
      color: '#f44336',
      description: 'This order has been cancelled. Refund will be processed.',
      timeline: 'Refund in 3-5 business days',
      actions: ['Refund initiated', 'Check refund status']
    }
  ];

  return (
    <div className="order-status-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="order-status-hero">
        <h1>Order Status Guide</h1>
        <p>Track and understand your order journey</p>
      </div>

      <div className="order-status-content">
        <section className="track-order-section">
          <h2>Track Your Order</h2>
          <div className="track-box">
            <p>Want to check your order status?</p>
            <button 
              className="track-btn"
              onClick={() => {
                const token = localStorage.getItem('token');
                if (token) {
                  navigate('/profile?tab=orders');
                } else {
                  navigate('/login');
                }
              }}
            >
              Go to My Orders
            </button>
          </div>
        </section>

        <section className="statuses-section">
          <h2>Order Status Meanings</h2>
          <div className="statuses-grid">
            {orderStatuses.map((item, index) => (
              <div key={index} className="status-card">
                <div className="status-icon" style={{color: item.color}}>
                  {item.icon}
                </div>
                <h3 style={{color: item.color}}>{item.status}</h3>
                <p className="status-description">{item.description}</p>
                <div className="status-timeline">
                  <strong>Timeline:</strong> {item.timeline}
                </div>
                <div className="status-actions">
                  <strong>What you can do:</strong>
                  <ul>
                    {item.actions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="tracking-section">
          <h2>How to Track Your Order</h2>
          <div className="tracking-steps">
            <div className="tracking-step">
              <div className="step-number">1</div>
              <h3>Login to Your Account</h3>
              <p>Sign in to access your order history</p>
            </div>
            <div className="tracking-step">
              <div className="step-number">2</div>
              <h3>Go to My Orders</h3>
              <p>Navigate to your profile and click "Orders"</p>
            </div>
            <div className="tracking-step">
              <div className="step-number">3</div>
              <h3>View Order Details</h3>
              <p>Click on any order to see tracking information</p>
            </div>
            <div className="tracking-step">
              <div className="step-number">4</div>
              <h3>Track Package</h3>
              <p>Use the tracking number to follow your delivery</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Need Help?</h2>
          <div className="help-grid">
            <div className="help-card">
              <h3>Order Issues</h3>
              <p>Having problems with your order?</p>
              <button onClick={() => navigate('/contact')}>Contact Support</button>
            </div>
            <div className="help-card">
              <h3>Returns & Refunds</h3>
              <p>Want to return an item?</p>
              <button onClick={() => navigate('/faq')}>View Return Policy</button>
            </div>
            <div className="help-card">
              <h3>FAQs</h3>
              <p>Common questions answered</p>
              <button onClick={() => navigate('/faq')}>Browse FAQs</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrderStatus;
