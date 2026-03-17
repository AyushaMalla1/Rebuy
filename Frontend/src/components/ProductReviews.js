import React, { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import './ProductReviews.css';
import { reviewAPI } from '../services/api';

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const data = await reviewAPI.getByProduct(productId);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    try {
      await reviewAPI.submit({
        productId,
        customerId: user._id,
        ...newReview
      });

      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (error) {
      alert(error.message || 'Failed to submit review');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewAPI.markHelpful(reviewId);
      fetchReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
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
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <button 
          className="write-review-btn"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          Write a Review
        </button>
      </div>

      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <h3>Write Your Review</h3>
          
          <div className="form-group">
            <label>Rating</label>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  className={star <= newReview.rating ? 'star-filled' : 'star-empty'}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Sum up your experience"
              required
            />
          </div>

          <div className="form-group">
            <label>Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your thoughts about this product"
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowReviewForm(false)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Submit Review
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <strong>{review.customer?.fullName || 'Anonymous'}</strong>
                  {review.verifiedPurchase && (
                    <span className="verified-badge">✓ Verified Purchase</span>
                  )}
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>

              <h4 className="review-title">{review.title}</h4>
              <p className="review-comment">{review.comment}</p>

              <div className="review-footer">
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <button 
                  className="helpful-btn"
                  onClick={() => handleMarkHelpful(review._id)}
                >
                  <FiThumbsUp /> Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductReviews;
