import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiStar, FiShield, FiTruck, FiRefreshCw, FiMessageSquare, FiAward, FiZap, FiPackage, FiCheck } from 'react-icons/fi';
import './ProductDetail.css';
import Chatbot from './components/Chatbot';
import ProductReviews from './components/ProductReviews';
import { productAPI, cartAPI } from './services/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('online');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [addedToCartProduct, setAddedToCartProduct] = useState(null);
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

  // Seller Information (use product seller data from API)
  const sellerInfo = product.sellerInfo || {
    id: product.seller,
    name: product.sellerName || 'Seller',
    storeName: product.storeName || 'Thrift Store',
    avatar: 'https://i.pravatar.cc/100',
    rating: 5.0,
    totalReviews: 0,
    totalTransactions: 0,
    itemsForSale: 0,
    badges: ['New Seller'],
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    responseTime: '1 hour',
    shippingTime: '1-2 days'
  };

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

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      const productId = product._id || product.id;
      
      await cartAPI.add(user._id, productId, selectedQuantity);
      
      // Set product data for modal
      setAddedToCartProduct({
        name: product.name,
        price: product.discountedPrice || product.price,
        originalPrice: product.price,
        image: product.images?.[0] || '',
        quantity: selectedQuantity,
        discount: typeof product.discount === 'object' ? product.discount.percentage : product.discount
      });
      
      setShowAddToCartModal(true);
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast(error.message || 'Failed to add item to cart', 'error');
    }
  };

  // Add to cart silently (for Buy It Now - no modal)
  const addToCartSilently = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setShowAuthModal(true);
      return false;
    }
    
    try {
      const user = JSON.parse(userData);
      const productId = product._id || product.id;
      
      // Add to backend cart
      await cartAPI.add(user._id, productId, selectedQuantity);
      
      // Fetch updated cart from backend
      const cartResponse = await cartAPI.get(user._id);
      
      // Format cart items for localStorage
      const formattedCart = cartResponse.items.map(item => ({
        id: item.product._id || item.product,
        name: item.product.name || item.productName,
        price: item.product.price || item.price,
        image: (item.product.images && item.product.images[0]) || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
        quantity: item.quantity,
        seller: item.product.seller || item.seller,
        sellerName: item.product.sellerName || item.sellerName,
        storeName: item.product.storeName || item.storeName
      }));
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(formattedCart));
      
      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast(error.message || 'Failed to add item to cart', 'error');
      return false;
    }
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
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: userData._id,
          senderModel: 'User',
          receiverId: product.seller,
          receiverModel: 'Seller',
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

  const handlePurchase = async () => {
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
    
    // Add to cart silently (without showing modal)
    const success = await addToCartSilently();
    
    if (success) {
      // Navigate directly to checkout
      navigate('/checkout');
    }
  };

  // Similar products (empty for now - can be populated from API)
  const similarProducts = [];

  return (
    <div className="product-detail-page">
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
          {/* Product Title with Bundle Deal and Rating */}
          <div className="title-row">
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={i < Math.floor(product.rating || 4.5) ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              <span className="rating-text">{product.rating || '4.5'} ({product.reviews || 128} reviews)</span>
            </div>
            
            {product.bundleDeal && product.bundleDeal.enabled && (
              <div className="bundle-deal-badge">
                <FiPackage className="bundle-icon" />
                <span>Buy {product.bundleDeal.buyQuantity}+ Get {product.bundleDeal.discountPercentage}% OFF</span>
              </div>
            )}
          </div>

          {/* Condition Badge */}
          <div className="product-badges">
            <span className={`condition-badge ${product.condition.toLowerCase().replace(' ', '-')}`}>
              {product.condition.toUpperCase()}
            </span>
          </div>

          {/* Price */}
          <div className="product-price-section">
            {product.discount && isDiscountActive(product.discount) ? (
              <>
                <span className="discount-badge">{product.discount.percentage}% OFF</span>
                <div className="price-row">
                  <span className="current-price">Rs. {product.discountedPrice?.toLocaleString()}</span>
                  <span className="original-price">Rs. {product.price.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <span className="current-price">Rs. {product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Size Selection */}
          <div className="size-selection">
            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
              <button
                key={size}
                className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Size Guide Link */}
          <a href="#" className="size-guide-link" onClick={(e) => e.preventDefault()}>Size Guide</a>

          {/* Quantity Selection */}
          <div className="quantity-selection">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button 
                className="qty-btn" 
                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                disabled={selectedQuantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                value={selectedQuantity} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setSelectedQuantity(Math.max(1, Math.min(val, product.stock)));
                }}
                min="1"
                max={product.stock}
                className="qty-input"
              />
              <button 
                className="qty-btn" 
                onClick={() => setSelectedQuantity(Math.min(product.stock, selectedQuantity + 1))}
                disabled={selectedQuantity >= product.stock}
              >
                +
              </button>
            </div>
            <span className="stock-info">{product.stock} available</span>
          </div>

          {/* Payment Methods - Information Only */}
          <div className="payment-methods-info">
            <h4 style={{fontSize: '13px', marginBottom: '8px', color: '#64748b', fontWeight: '600'}}>Available Payment Methods:</h4>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <div className="payment-method-badge">
                <span className="payment-icon-small">💳</span>
                <span>Online Payment</span>
              </div>
              <div className="payment-method-badge">
                <span className="payment-icon-small">🚚</span>
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            {product.stock > 0 ? (
              <>
                <button className="btn-add-cart" onClick={handleAddToCart}>
                  <FiShoppingCart /> Add to Cart
                </button>
                <button className="btn-buy-now" onClick={handlePurchase}>
                  Buy It Now
                </button>
              </>
            ) : (
              <>
                <button className="btn-out-stock" disabled>
                  OUT OF STOCK
                </button>
                <button className="btn-wishlist" onClick={handleAddToWishlist}>
                  <FiHeart /> ADD TO WISHLIST
                </button>
              </>
            )}
          </div>

          {/* Secure Transaction Note */}
          <p className="secure-note">Secure transaction. Hassle-free 14-day returns.</p>

          {/* Description */}
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || `${product.condition} condition. Carefully inspected and cleaned. Perfect for sustainable fashion lovers.`}</p>
          </div>

          {/* Features */}
          <div className="product-features-compact">
            <div className="feature-compact">
              <FiTruck className="feature-icon-compact" />
              <div>
                <strong>Free Shipping</strong>
                <p>On all orders over $100</p>
              </div>
            </div>
            <div className="feature-compact">
              <FiAward className="feature-icon-compact" />
              <div>
                <strong>Genuine Quality</strong>
                <p>Certified Rebuy Vendor</p>
              </div>
            </div>
          </div>

          {/* Seller Profile Section */}
          <div className="seller-profile-card">
            <h3>About the Seller</h3>
            
            <div 
              className="seller-info-header clickable-seller-info"
              onClick={() => {
                const sellerId = product.seller?._id || product.seller;
                console.log('Product seller data:', product.seller);
                console.log('Extracted seller ID:', sellerId);
                if (sellerId) {
                  navigate(`/seller/${sellerId}`);
                } else {
                  console.error('No seller ID found in product');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <img src={sellerInfo.avatar} alt={sellerInfo.name} className="seller-avatar" />
              <div className="seller-basic-info">
                <h4>{sellerInfo.name}</h4>
                <p className="seller-store-name">{sellerInfo.storeName}</p>
                <div className="seller-rating">
                  <FiStar className="star-filled" />
                  <span>{sellerInfo.rating} ({sellerInfo.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="seller-stats">
              <div className="seller-stat">
                <FiPackage className="stat-icon" />
                <div>
                  <strong>{sellerInfo.itemsForSale}</strong>
                  <p>Items for Sale</p>
                </div>
              </div>
              <div className="seller-stat">
                <FiRefreshCw className="stat-icon" />
                <div>
                  <strong>{sellerInfo.totalTransactions}</strong>
                  <p>Total Sales</p>
                </div>
              </div>
            </div>

            <div className="seller-badges">
              {sellerInfo.badges.map((badge, index) => (
                <span key={index} className="seller-badge">
                  <FiAward /> {badge}
                </span>
              ))}
            </div>

            <div className="seller-details">
              <div className="seller-detail-item">
                <FiZap className="detail-icon" />
                <div>
                  <strong>Response Time</strong>
                  <p>{sellerInfo.responseTime}</p>
                </div>
              </div>
              <div className="seller-detail-item">
                <FiTruck className="detail-icon" />
                <div>
                  <strong>Shipping Time</strong>
                  <p>{sellerInfo.shippingTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Seller */}
          <button className="btn-contact-seller" onClick={() => setShowContactModal(true)}>
            <FiMessageSquare /> Contact Seller
          </button>
        </div>
      </div>

      {/* Product Story - Simple Purple Box */}
      {product.story && (
        <div className="product-story-section-standalone">
          <div className="item-story-box-simple">
            <h3 className="story-title-simple">Item Story</h3>
            <p className="story-content-simple">{product.story}</p>
          </div>
        </div>
      )}

      {/* Product Reviews - Condition Verifications */}
      <ProductReviews productId={id} />

      {/* Similar Products */}
      <section className="similar-products">
        <h2>Similar Listings</h2>
        <div className="similar-grid">
          {similarProducts.length === 0 && (
            <p style={{gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '40px'}}>
              No similar products available
            </p>
          )}
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

      {/* Add to Cart Success Modal */}
      {showAddToCartModal && addedToCartProduct && (
        <div className="cart-modal-overlay" onClick={() => setShowAddToCartModal(false)}>
          <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="cart-modal-close" onClick={() => setShowAddToCartModal(false)}>×</button>
            
            <div className="cart-modal-header">
              <FiCheck className="success-check" />
              <span>Product successfully added to your cart.</span>
            </div>

            <div className="cart-modal-body">
              <img src={addedToCartProduct.image} alt={addedToCartProduct.name} />
              <div className="cart-modal-info">
                <h3>{addedToCartProduct.name}</h3>
                <div className="cart-modal-pricing">
                  <span className="price">Rs. {addedToCartProduct.price.toLocaleString()}</span>
                  {addedToCartProduct.discount > 0 && (
                    <>
                      <span className="original">Rs. {addedToCartProduct.originalPrice.toLocaleString()}</span>
                      <span className="discount">({addedToCartProduct.discount}% OFF)</span>
                    </>
                  )}
                </div>
              </div>
              <button className="view-cart-button" onClick={() => navigate('/cart')}>
                View Cart
              </button>
            </div>

            <div className="cart-modal-footer">
              <span>Total :</span>
              <span className="total">Rs. {(addedToCartProduct.price * addedToCartProduct.quantity).toLocaleString()}</span>
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
