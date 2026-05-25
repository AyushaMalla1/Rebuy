import { useState, useEffect } from 'react';
import './ProductReviews.css';
import { buildApiUrl } from '../services/api';


function ProductReviews({ productId }) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, [productId]);

  const fetchVerifications = async () => {
    try {
      // Fetch orders with condition verifications for this product
      const response = await fetch(buildApiUrl(`/orders/product/${productId}/verifications`));
      const data = await response.json();
      console.log('Verification data received:', data); // Debug log
      console.log('Verifications:', data.verifications); // Debug log
      if (data.verifications && data.verifications.length > 0) {
        console.log('First verification images:', data.verifications[0].verificationImages); // Debug log
      }
      setVerifications(data.verifications || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="reviews-loading">Loading verifications...</div>;
  }

  return (
    <div className="product-reviews">
      <div className="reviews-section-divider">
        <h3>Condition Verifications</h3>
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

              {/* Display the Star Rating */}
              {verification.rating && (
                <div className="review-rating" style={{marginBottom: '10px'}}>
                  <span style={{color: '#ffc107', fontSize: '18px'}}>
                    {'★'.repeat(verification.rating)}{'☆'.repeat(5 - verification.rating)}
                  </span>
                  <span style={{marginLeft: '8px', fontSize: '14px', color: '#555', fontWeight: '500'}}>
                    {verification.rating}/5
                  </span>
                </div>
              )}

              {/* Condition Verification Details */}
              <div className="verification-details">
                <div className="verification-header">
                  <strong>Condition Status:</strong>
                  <span className={`verification-status ${verification.matchesDescription === 'yes' ? 'matches' : 'no-match'}`}>
                    {verification.matchesDescription === 'yes' ? '✓ Matches Description' : '✕ Does Not Match Description'}
                  </span>
                </div>
                {verification.customerNotes && (
                  <p className="verification-notes">
                    "{verification.customerNotes}"
                  </p>
                )}
                {verification.verificationImages && verification.verificationImages.length > 0 ? (
                  <div className="verification-images">
                    {verification.verificationImages.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Verification ${idx + 1}`}
                        className="verification-image"
                        onError={(e) => {
                          console.error('Image failed to load:', img);
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="no-images-message">No verification images uploaded</p>
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
