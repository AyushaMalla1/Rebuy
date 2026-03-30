import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

function PaymentVerify() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill order ID from localStorage
  React.useEffect(() => {
    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastOrderId) {
      setOrderId(lastOrderId);
    }
  }, []);

  const handleVerify = async () => {
    if (!orderId || !transactionCode) {
      alert('Please enter both Order ID and Transaction Code');
      return;
    }

    setLoading(true);

    try {
      // For testing: manually mark order as paid
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Confirmed'
        })
      });

      if (response.ok) {
        // Update payment status
        await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentStatus: 'Paid',
            transactionId: transactionCode
          })
        });

        alert('Payment verified successfully!');
        navigate(`/payment-success?order_id=${orderId}&transaction_code=${transactionCode}`);
      } else {
        alert('Failed to verify payment');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <h1>Manual Payment Verification</h1>
        <p>For testing purposes, manually verify your eSewa payment</p>
        
        <div className="payment-details" style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Order ID:
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Transaction Code:
            </label>
            <input
              type="text"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value)}
              placeholder="Enter eSewa transaction code"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleVerify} 
            className="view-orders-btn"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Payment'}
          </button>
          <button onClick={() => navigate('/')} className="home-btn">
            Back to Home
          </button>
        </div>

        <p style={{ marginTop: '20px', fontSize: '13px', color: '#999' }}>
          Note: This is for testing only. In production, eSewa will automatically verify payments.
        </p>
      </div>
    </div>
  );
}

export default PaymentVerify;
