import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiStar, FiShield, FiTruck, FiRefreshCw, FiMessageSquare, FiAward, FiZap, FiPackage } from 'react-icons/fi';
import './ProductDetail.css';
import Chatbot from './components/Chatbot';
import ProductReviews from './components/ProductReviews';
import { productAPI } from './services/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('online');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getById(id);
      setProduct(data);
      setSelectedSize(data.size);
      
      // Set default payment option to first available
      if (data.paymentOptions && data.paymentOptions.length > 0) {
        setSelectedPayment(data.paymentOptions[0]);
      }
      
      // Check if product is in favorites
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorite(favorites.includes(data._id));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const isDiscountActive = (discount) => {
    if (!discount || !discount.active) return false;
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-message" style={{textAlign: 'center', padding: '50px'}}>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Seller Information (use product seller data or default)
  const sellerInfo = {
    name: product.sellerName || 'vitalesteven',
    storeName: product.storeName || 'Thrift Store',
    avatar: 'https://i.pinimg.com/736x/bc/83/08/bc8308ad115003adae43e7743ef2254f.jpg',
    rating: 5.0,
    totalReviews: 112,
    totalTransactions: 207,
    itemsForSale: 90,
    badges: ['Trusted Seller', 'Quick Responder', 'Speedy Shipper'],
    joinedDate: 'January 2024',
    responseTime: '1 hour',
    shippingTime: '1-2 days'
  };

  if (!product) return null;

  // Multiple images for gallery
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || 'https://via.placeholder.com/800'];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const toggleFavorite = () => {
    const savedFavorites = localStorage.getItem('favorites');
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    if (isFavorite) {
      favorites = favorites.filter(fav => fav !== product.id);
    } else {
      favorites.push(product.id);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    
    const savedCart = localStorage.getItem('cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const effectivePrice = product.discountedPrice || product.price;
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      cart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      cart.push({ 
        ...product, 
        quantity: 1,
        price: effectivePrice,
        originalPrice: product.price
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleAddToWishlist = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const userData = JSON.parse(user);
      const response = await fetch(`http://localhost:5000/api/wishlist/${userData._id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast(`${product.name} added to wishlist!`, 'success');
      } else {
        showToast(data.message || 'Failed to add to wishlist', 'error');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Error adding to wishlist', 'error');
    }
  };

  const handleContactSeller = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const userData = JSON.parse(user);
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: userData._id,
          senderModel: 'User',
          receiverId: product.sellerId,
          productId: product._id,
          subject: contactForm.subject,
          message: contactForm.message
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Message sent to seller successfully!', 'success');
        setShowContactModal(false);
        setContactForm({ subject: '', message: '' });
      } else {
        showToast(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Error sending message', 'error');
    }
  };

  const handlePurchase = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  // Similar products (empty for now - can be populated from API)
  const similarProducts = [];

  return (
    <div className="product-detail-page">
      {/* Header */}
      <header className="detail-header">
        <div className="header-content">
          <Link to="/" className="back-link">
            <FiChevronLeft /> Back to Shop
          </Link>
          <div className="header-actions">
            <button className={`favorite-btn ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite}>
              <FiHeart />
            </button>
          </div>
        </div>
      </header>

      <div className="detail-container">
        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            <img src={productImages[currentImageIndex]} alt={product.name} />
            <button className="nav-btn prev" onClick={handlePrevImage}>
              <FiChevronLeft />
            </button>
            <button className="nav-btn next" onClick={handleNextImage}>
              <FiChevronRight />
            </button>
          </div>
          <div className="thumbnail-list">
            {productImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} ${index + 1}`}
                className={currentImageIndex === index ? 'active' : ''}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header">
            <h1>{product.name}</h1>
            <div className="product-meta">
              <div className="rating">
                <FiStar className="star-icon" />
                <span>{product.rating}</span>
                <span className="reviews">({product.reviews} reviews)</span>
              </div>
              <span className={`condition-badge ${product.condition.toLowerCase().replace(' ', '-')}`}>
                {product.condition}
              </span>
              <span className="category-badge">{product.category}</span>
            </div>
          </div>

          <div className="price-section">
            {product.discount && isDiscountActive(product.discount) ? (
              <>
                <div className="discount-info">
                  <div className="discount-percentage-badge">{product.discount.percentage}% OFF</div>
                  <div className="discount-validity-period">
                    Valid until {new Date(product.discount.endDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="price-display">
                  <div className="current-price discounted">Rs. {product.discountedPrice.toLocaleString()}</div>
                  <div className="original-price strikethrough">Rs. {product.price.toLocaleString()}</div>
                  <div className="savings-amount">You save Rs. {(product.price - product.discountedPrice).toLocaleString()}</div>
                </div>
              </>
            ) : (
              <div className="current-price">Rs. {product.price.toLocaleString()}</div>
            )}
          </div>

          {/* Size Selection */}
          <div className="size-section">
            <h3>Select Size</h3>
            <div className="size-options">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="payment-section">
            <h3>Available Payment Methods</h3>
            <div className="payment-options">
              {product.paymentOptions && product.paymentOptions.length > 0 ? (
                product.paymentOptions.map((option) => {
                  const paymentInfo = {
                    cod: { icon: '💵', label: 'Cash on Delivery', desc: 'Pay when you receive the item' },
                    online: { icon: '💳', label: 'Online Payment', desc: 'Pay securely with card or digital wallet' },
                    esewa: { icon: '🟢', label: 'eSewa', desc: 'Pay with eSewa digital wallet' },
                    khalti: { icon: '🟣', label: 'Khalti', desc: 'Pay with Khalti digital wallet' },
                    card: { icon: '💳', label: 'Card Payment', desc: 'Pay with credit or debit card' }
                  };
                  const info = paymentInfo[option] || { icon: '💳', label: option, desc: 'Payment method' };
                  
                  return (
                    <label key={option} className={`payment-option ${selectedPayment === option ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={option}
                        checked={selectedPayment === option}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                      />
                      <div className="payment-content">
                        <span className="payment-icon">{info.icon}</span>
                        <div>
                          <strong>{info.label}</strong>
                          <p>{info.desc}</p>
                        </div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <p>No payment options available</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {product.stock > 0 ? (
              <>
                <button className="purchase-btn" onClick={handlePurchase}>
                  PURCHASE
                </button>
                <button className="add-cart-btn" onClick={handleAddToCart}>
                  <FiShoppingCart /> ADD TO CART
                </button>
              </>
            ) : (
              <>
                <button 
                  className="purchase-btn" 
                  style={{
                    background: '#e5e7eb',
                    color: '#9ca3af',
                    cursor: 'not-allowed'
                  }}
                  disabled
                >
                  OUT OF STOCK
                </button>
                <button className="add-cart-btn" onClick={handleAddToWishlist}>
                  <FiHeart /> ADD TO WISHLIST
                </button>
              </>
            )}
          </div>

          {/* Contact Seller Button */}
          <button 
            onClick={() => setShowContactModal(true)}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#00bcd4';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#00bcd4';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <FiMessageSquare /> Contact Seller
          </button>

          {/* Product Features */}
          <div className="product-features">
            <div className="feature-item">
              <FiShield className="feature-icon" />
              <div>
                <h4>Buyer Protection</h4>
                <p>Full refund if item not as described</p>
              </div>
            </div>
            <div className="feature-item">
              <FiTruck className="feature-icon" />
              <div>
                <h4>Fast Shipping</h4>
                <p>Express delivery available</p>
              </div>
            </div>
            <div className="feature-item">
              <FiRefreshCw className="feature-icon" />
              <div>
                <h4>Easy Returns</h4>
                <p>7-day return policy</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p>
              {product.condition} condition. Carefully inspected and cleaned. 
              Perfect for sustainable fashion lovers.
            </p>
            <ul>
              <li>Condition: {product.condition}</li>
              <li>Material: Premium quality fabric</li>
              <li>Care: Machine washable</li>
              <li>Authenticity: Verified by Rebuy</li>
            </ul>
          </div>

          {/* Product Story */}
          {product.story && (
            <div className="story-section">
              <h3>📖 Item Story</h3>
              <div className="story-content">
                <p>{product.story}</p>
              </div>
            </div>
          )}

          {/* Measurements */}
          <div className="measurements-section">
            <h3>Measurements</h3>
            <table>
              <tbody>
                <tr>
                  <td>Length</td>
                  <td>26 inches</td>
                </tr>
                <tr>
                  <td>Shoulder</td>
                  <td>18 inches</td>
                </tr>
                <tr>
                  <td>Chest</td>
                  <td>40 inches</td>
                </tr>
                <tr>
                  <td>Waist</td>
                  <td>38 inches</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seller Profile */}
          <div className="seller-profile-section">
            <h3>Seller Information</h3>
            <div className="seller-profile-card">
              <div className="seller-header">
                <div className="seller-avatar">
                  <img src={sellerInfo.avatar} alt={sellerInfo.storeName} />
                </div>
                <div className="seller-info">
                  <h4>{sellerInfo.storeName}</h4>
                  <div className="seller-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="star-filled" />
                      ))}
                    </div>
                    <span>{sellerInfo.rating} ({sellerInfo.totalReviews} Reviews)</span>
                  </div>
                  <div className="seller-stats">
                    <span>{sellerInfo.totalTransactions} Transactions</span>
                    <span>•</span>
                    <span>{sellerInfo.itemsForSale} items for sale</span>
                  </div>
                </div>
              </div>

              <div className="seller-badges">
                <div className="badge trusted">
                  <FiShield />
                  <span>Trusted Seller</span>
                </div>
                <div className="badge quick">
                  <FiZap />
                  <span>Quick Responder</span>
                </div>
                <div className="badge speedy">
                  <FiPackage />
                  <span>Speedy Shipper</span>
                </div>
              </div>

              <div className="seller-details">
                <div className="detail-item">
                  <span className="detail-label">Joined:</span>
                  <span className="detail-value">{sellerInfo.joinedDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Response Time:</span>
                  <span className="detail-value">{sellerInfo.responseTime}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Shipping Time:</span>
                  <span className="detail-value">{sellerInfo.shippingTime}</span>
                </div>
              </div>

              <div className="seller-actions">
                <button className="follow-btn">
                  <FiAward /> Follow Seller
                </button>
                <button className="message-btn">
                  <FiMessageSquare /> Message Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <ProductReviews productId={id} />

      {/* Similar Products */}
      <section className="similar-products">
        <h2>Similar Listings</h2>
        <div className="similar-grid">
          {similarProducts.map(item => (
            <div key={item.id} className="similar-card" onClick={() => navigate(`/product/${item.id}`)}>
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Rs. {item.price.toLocaleString()}</p>
              <div className="rating">
                <FiStar className="star-icon" />
                <span>{item.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2>Sign in Required</h2>
              <button className="close-modal" onClick={() => setShowAuthModal(false)}>×</button>
            </div>
            <div className="auth-modal-body">
              <div className="auth-icon">
                <FiShoppingCart size={48} />
              </div>
              <p className="auth-message">Please sign in to add items to your cart and make purchases</p>
              <div className="auth-modal-actions">
                <button 
                  className="signup-btn"
                  onClick={() => navigate('/signup')}
                >
                  Create Account
                </button>
                <button 
                  className="login-btn"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>
              <p className="auth-note">
                Already have an account? <span onClick={() => navigate('/login')} style={{color: '#00bcd4', cursor: 'pointer', fontWeight: '500'}}>Sign in here</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
      {showContactModal && (
        <div className="auth-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className="auth-modal-header">
              <h2>Contact Seller</h2>
              <button className="close-modal" onClick={() => setShowContactModal(false)}>×</button>
            </div>
            <div className="auth-modal-body">
              <form onSubmit={handleContactSeller} style={{textAlign: 'left'}}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b'}}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                    placeholder="e.g., Question about product condition"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b'}}>
                    Message *
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                    rows="6"
                    placeholder="Write your message to the seller..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{display: 'flex', gap: '12px'}}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: '#00bcd4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    style={{
                      padding: '14px 24px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
