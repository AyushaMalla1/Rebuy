import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiPackage, FiShoppingBag, FiMapPin, FiClock, FiTruck, FiAward, FiChevronLeft, FiMessageCircle, FiShield } from 'react-icons/fi';
import './SellerProfile.css';

function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerProfile();
  }, [id]);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/sellers/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSeller(data.seller);
        setProducts(data.products);
      } else {
        alert('Seller not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching seller:', error);
      alert('Error loading seller profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="seller-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="seller-profile-page">
      {/* Top Navigation */}
      <div className="seller-nav">
        <div className="seller-nav-content">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiChevronLeft /> Back
          </button>
        </div>
      </div>

      {/* Seller Header Section */}
      <div className="seller-hero">
        <div className="seller-hero-content">
          <div className="seller-main-info">
            <div className="seller-avatar-wrapper">
              <img src={seller.avatar} alt={seller.name} className="seller-avatar-large" />
              <div className="verified-badge">
                <FiShield /> Verified
              </div>
            </div>
            
            <div className="seller-identity">
              <h1 className="seller-name">{seller.name}</h1>
              <h2 className="seller-store">{seller.storeName}</h2>
              
              <div className="seller-rating-large">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={i < Math.floor(seller.rating) ? 'star-filled' : 'star-empty'} 
                    />
                  ))}
                </div>
                <span className="rating-value">{seller.rating.toFixed(1)}</span>
                <span className="rating-count">({seller.totalReviews} reviews)</span>
              </div>

              {seller.storeDescription && (
                <p className="seller-bio">{seller.storeDescription}</p>
              )}

              <div className="seller-location-info">
                <FiMapPin />
                <span>{seller.city}, Nepal</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="seller-stats-cards">
            <div className="stat-card-modern">
              <div className="stat-icon-wrapper blue">
                <FiPackage />
              </div>
              <div className="stat-content">
                <div className="stat-number">{seller.totalProducts}</div>
                <div className="stat-label">Products Listed</div>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrapper green">
                <FiShoppingBag />
              </div>
              <div className="stat-content">
                <div className="stat-number">{seller.totalSales}</div>
                <div className="stat-label">Total Sales</div>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrapper orange">
                <FiClock />
              </div>
              <div className="stat-content">
                <div className="stat-number">{seller.responseTime}</div>
                <div className="stat-label">Response Time</div>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrapper purple">
                <FiTruck />
              </div>
              <div className="stat-content">
                <div className="stat-number">{seller.shippingTime}</div>
                <div className="stat-label">Shipping Time</div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          {seller.badges && seller.badges.length > 0 && (
            <div className="achievements-section">
              <h3 className="achievements-title">
                <FiAward /> Achievements
              </h3>
              <div className="badges-container">
                {seller.badges.map((badge, index) => (
                  <div key={index} className="badge-item">
                    <FiAward className="badge-icon" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Button */}
          <button className="contact-seller-btn">
            <FiMessageCircle /> Contact Seller
          </button>
        </div>
      </div>

      {/* Products Section */}
      <div className="seller-products-wrapper">
        <div className="products-section-header">
          <h2>Products from {seller.storeName}</h2>
          <p className="products-count">{products.length} items available</p>
        </div>
        
        {products.length === 0 ? (
          <div className="no-products-message">
            <FiPackage className="empty-icon" />
            <h3>No Products Yet</h3>
            <p>This seller hasn't listed any products at the moment.</p>
          </div>
        ) : (
          <div className="products-grid-modern">
            {products.map(product => (
              <div 
                key={product._id} 
                className="product-card-modern"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="product-image-wrapper">
                  <img src={product.images[0]} alt={product.name} />
                  {product.condition && (
                    <span className={`condition-tag ${product.condition.toLowerCase().replace(' ', '-')}`}>
                      {product.condition}
                    </span>
                  )}
                </div>
                
                <div className="product-info-modern">
                  <h3 className="product-name-modern">{product.name}</h3>
                  <p className="product-category-modern">{product.category}</p>
                  
                  <div className="product-footer-modern">
                    <div className="product-price-modern">
                      Rs. {product.price.toLocaleString()}
                    </div>
                    <div className="product-rating-modern">
                      <FiStar className="star-icon" />
                      <span>{product.rating || 4.5}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProfile;
