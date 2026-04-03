import React, { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import './ProductReviews.css';
import { reviewAPI } from '../services/api';

function ProductReviews({ productId }) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, [productId]);

  const fetchVerifications = async () => {
    try {
      // Fetch orders with condition verifications for this product
      const response = await fetch(`http://localhost:5000/api/orders/product/${productId}/verifications`);
      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={i < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  if (loading) {
    return <div className="reviews-loading">Loading verifications...</div>;
  }

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>Condition Verifications</h2>
        <span className="verification-count">{verifications.length} Verified Purchase{verifications.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="reviews-list">
        {verifications.length === 0 ? (
          <p className="no-reviews">No condition verifications yet.</p>
        ) : (
          verifications.map(verification => (
            <div key={verification._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <strong>{verification.customerName || 'Anonymous'}</strong>
                  <span className="verified-badge">✓ Verified Purchase</span>
                  <span className="condition-verified-badge">
                    ✓ Condition Verified
                  </span>
                </div>
                <div className="verification-date">
                  {new Date(verification.verifiedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Condition Verification Details */}
              <div className="verification-details">
                <div className="verification-header">
                  <strong>Condition Status:</strong>
                  <span className={`verification-status ${verification.matchesDescription === 'yes' ? 'matches' : 'no-match'}`}>
                    {verification.matchesDescription === 'yes' ? '✓ Matches Description' : '✕ Does Not Match Description'}
                  </span>
                </div>
                {verification.customerFeedback && (
                  <p className="verification-notes">
                    "{verification.customerFeedback}"
                  </p>
                )}
                {verification.verificationImages && verification.verificationImages.length > 0 && (
                  <div className="verification-images">
                    {verification.verificationImages.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Verification ${idx + 1}`}
                        className="verification-image"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="review-footer">
                <span className="order-id">Order: {verification.orderId}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductReviews;
