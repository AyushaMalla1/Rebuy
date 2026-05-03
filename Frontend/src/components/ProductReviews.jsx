import { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import './ProductReviews.css';

function ProductReviews({ productId }) {
  const [verifications, setVerifications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVerifications();
    fetchReviews(); 
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

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

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please login to submit a rating');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          customerId: user._id,
          rating,
          title: `${rating} Star Review`,
          comment: comment.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Rating submitted successfully!');
        setShowRatingForm(false);
        setRating(0);
        setComment('');
        fetchVerifications(); // Refresh to show new rating
        fetchReviews(); // Refresh reviews
      } else {
        alert(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    } finally {
      setSubmitting(false);
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

  const renderInteractiveStars = () => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`star-interactive ${i < (hoverRating || rating) ? 'star-filled' : 'star-empty'}`}
        onMouseEnter={() => setHoverRating(i + 1)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(i + 1)}
      />
    ));
  };

  if (loading) {
    return <div className="reviews-loading">Loading verifications...</div>;
  }

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>Customer Reviews & Ratings</h2>
      </div>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <>
          <div className="reviews-section-divider">
            <h3>Customer Reviews</h3>
            <span className="verification-count">{reviews.length} Review{reviews.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <strong>{review.customer?.fullName || 'Anonymous'}</strong>
                    {review.verifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <h4 className="review-title">{review.title}</h4>
                <p className="review-comment">{review.comment}</p>

                {review.images && review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Review ${idx + 1}`}
                        className="review-image"
                      />
                    ))}
                  </div>
                )}

                <div className="review-footer">
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <button className="helpful-btn">
                    <FiThumbsUp /> Helpful ({review.helpful || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
