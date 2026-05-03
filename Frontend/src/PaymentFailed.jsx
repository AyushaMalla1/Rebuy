import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';
import './PaymentSuccess.css';

function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const message = searchParams.get('message');

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="failure-icon">
          <FiXCircle />
        </div>
        <h1>Payment Failed</h1>
        <p>{message || 'Your payment could not be processed. Please try again.'}</p>
        
        {orderId && (
          <div className="payment-details">
            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value">{orderId}</span>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button onClick={() => navigate('/checkout')} className="retry-btn">
            Try Again
          </button>
          <button onClick={() => navigate('/')} className="home-btn">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailed;
