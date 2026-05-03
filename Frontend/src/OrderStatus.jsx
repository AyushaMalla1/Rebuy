import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiAlertCircle, FiShoppingBag, FiCreditCard } from 'react-icons/fi';
import './OrderStatus.css';

function OrderStatus() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Check for payment callback
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success' || status === 'failed') {
      setPaymentStatus(status);
      
      // Auto redirect after 5 seconds
      setTimeout(() => {
        navigate('/profile?tab=orders');
      }, 5000);
    }
  }, [navigate]);

  const orderStatuses = [
    {
      icon: <FiShoppingBag size={40} />,
      status: 'TO PAY',
      count: 2,
      color: '#2196f3',
      bgColor: '#e3f2fd',
      description: 'Pending Payment',
      detail: 'Your order has been placed and is awaiting payment confirmation.',
      timeline: 'Complete payment within 24 hours',
      actions: ['Complete payment', 'Cancel order', 'View payment methods']
    },
    {
      icon: <FiPackage size={40} />,
      status: 'TO SHIP',
      count: 1,
      color: '#00bcd4',
      bgColor: '#e0f7fa',
      description: 'Processing',
      detail: 'Payment confirmed. Seller is preparing your order for shipment.',
      timeline: '1-2 business days',
      actions: ['Seller is packing items', 'Track preparation status', 'Contact seller']
    },
    {
      icon: <FiTruck size={40} />,
      status: 'TO RECEIVE',
      count: 3,
      color: '#4caf50',
      bgColor: '#e8f5e9',
      description: 'In Transit',
      detail: 'Your order is on its way! Track your package in real-time.',
      timeline: '3-7 business days',
      actions: ['Track package', 'View delivery route', 'Update delivery address']
    },
    {
      icon: <FiCheckCircle size={40} />,
      status: 'TO REVIEW',
      count: 5,
      color: '#ff9800',
      bgColor: '#fff3e0',
      description: 'Completed',
      detail: 'Order delivered successfully. Share your experience!',
      timeline: 'Delivered',
      actions: ['Write a review', 'Rate products', 'Request return if needed']
    }
  ];

  const trackingTimeline = [
    { status: 'Order Placed', date: '2024-03-20 10:30 AM', completed: true, icon: <FiShoppingBag /> },
    { status: 'Payment Confirmed', date: '2024-03-20 10:35 AM', completed: true, icon: <FiCreditCard /> },
    { status: 'Processing', date: '2024-03-20 02:00 PM', completed: true, icon: <FiPackage /> },
    { status: 'Shipped', date: '2024-03-21 09:00 AM', completed: true, icon: <FiTruck /> },
    { status: 'Out for Delivery', date: 'Expected Today', completed: false, icon: <FiTruck /> },
    { status: 'Delivered', date: 'Pending', completed: false, icon: <FiCheckCircle /> }
  ];

  return (
    <div className="order-status-page">
      {paymentStatus && (
        <div className={`payment-callback-banner ${paymentStatus}`}>
          {paymentStatus === 'success' ? (
            <>
              <FiCheckCircle size={48} />
              <h2>Payment Successful!</h2>
              <p>Your payment has been processed successfully. Redirecting to your orders...</p>
            </>
          ) : (
            <>
              <FiAlertCircle size={48} />
              <h2>Payment Failed</h2>
              <p>Your payment could not be processed. Please try again or contact support.</p>
              <button onClick={() => navigate('/cart')} className="retry-btn">
                Return to Cart
              </button>
            </>
          )}
        </div>
      )}

      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="order-status-hero">
        <h1>Order Management</h1>
        <p>Track, manage, and review all your orders in one place</p>
      </div>

      <div className="order-status-content">
        {/* Order Status Cards */}
        <section className="status-cards-section">
          <div className="status-cards-grid">
            {orderStatuses.map((item, index) => (
              <div 
                key={index} 
                className="status-summary-card"
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (token) {
                    navigate('/profile?tab=orders');
                  } else {
                    navigate('/login');
                  }
                }}
              >
                <div className="status-card-icon" style={{backgroundColor: item.bgColor, color: item.color}}>
                  {item.icon}
                </div>
                <div className="status-card-content">
                  <h3>{item.status}</h3>
                  <div className="status-card-count">{item.count}</div>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <section className="tabs-section">
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracking')}
            >
              Live Tracking
            </button>
            <button 
              className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('guide')}
            >
              Status Guide
            </button>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <section className="overview-section">
            <div className="quick-actions-grid">
              <div className="quick-action-card">
                <h3>Track Your Order</h3>
                <p>View real-time updates on your order status</p>
                <button 
                  className="action-btn primary"
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
              <div className="quick-action-card">
                <h3>Need Help?</h3>
                <p>Contact our support team for assistance</p>
                <button className="action-btn secondary" onClick={() => navigate('/contact')}>
                  Contact Support
                </button>
              </div>
              <div className="quick-action-card">
                <h3>Returns & Refunds</h3>
                <p>Learn about our return policy</p>
                <button className="action-btn secondary" onClick={() => navigate('/faq')}>
                  View Policy
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'tracking' && (
          <section className="tracking-timeline-section">
            <h2>Sample Order Tracking Timeline</h2>
            <div className="timeline-container">
              {trackingTimeline.map((item, index) => (
                <div key={index} className={`timeline-item ${item.completed ? 'completed' : 'pending'}`}>
                  <div className="timeline-icon">
                    {item.icon}
                  </div>
                  <div className="timeline-content">
                    <h4>{item.status}</h4>
                    <p>{item.date}</p>
                  </div>
                  {index < trackingTimeline.length - 1 && <div className="timeline-line"></div>}
                </div>
              ))}
            </div>
            <div className="tracking-note">
              <p>This is a sample tracking timeline. Login to view your actual order tracking.</p>
              <button 
                className="action-btn primary"
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (token) {
                    navigate('/profile?tab=orders');
                  } else {
                    navigate('/login');
                  }
                }}
              >
                View My Orders
              </button>
            </div>
          </section>
        )}

        {activeTab === 'guide' && (
          <section className="statuses-section">
            <h2>Order Status Guide</h2>
            <div className="statuses-grid">
              {orderStatuses.map((item, index) => (
                <div key={index} className="status-detail-card">
                  <div className="status-detail-header" style={{backgroundColor: item.bgColor}}>
                    <div className="status-detail-icon" style={{color: item.color}}>
                      {item.icon}
                    </div>
                    <h3 style={{color: item.color}}>{item.status}</h3>
                  </div>
                  <div className="status-detail-body">
                    <p className="status-description">{item.detail}</p>
                    <div className="status-timeline">
                      <strong>Timeline:</strong> {item.timeline}
                    </div>
                    <div className="status-actions">
                      <strong>Available Actions:</strong>
                      <ul>
                        {item.actions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="how-it-works-section">
          <h2>How Order Tracking Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Place Order</h3>
              <p>Complete your purchase and receive order confirmation</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Track Status</h3>
              <p>Monitor your order through each stage in real-time</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Receive Package</h3>
              <p>Get your items delivered to your doorstep</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Leave Review</h3>
              <p>Share your experience and help others</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrderStatus;
