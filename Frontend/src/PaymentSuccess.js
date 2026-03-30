import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const transactionCode = searchParams.get('transaction_code');

  useEffect(() => {
    // Redirect to orders page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/profile?tab=orders');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="success-icon">
          <FiCheckCircle />
        </div>
        <h1>Payment Successful!</h1>
        <p>Your payment has been processed successfully.</p>
        
        {orderId && (
          <div className="payment-details">
            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value">{orderId}</span>
            </div>
            {transactionCode && (
              <div className="detail-row">
                <span className="label">Transaction Code:</span>
                <span className="value">{transactionCode}</span>
              </div>
            )}
          </div>
        )}

        <p className="redirect-message">Redirecting to your orders in 5 seconds...</p>
        
        <button onClick={() => navigate('/profile?tab=orders')} className="view-orders-btn">
          View My Orders
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
