import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiStar, FiPackage, FiShoppingBag, FiMapPin, FiClock, FiTruck, FiAward, FiMessageCircle, FiShield } from 'react-icons/fi';
import './SellerProfile.css';
import { buildApiUrl } from './services/api';


function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchSellerProfile();
    // Get logged in user
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [sellerId]);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch seller info
      const sellerResponse = await fetch(buildApiUrl(`/sellers/${sellerId}`));
      const sellerData = await sellerResponse.json();
      
      if (!sellerData.success || !sellerData.seller) {
        console.error('Seller not found or invalid response');
        setLoading(false);
        // Don't show alert, just show error state
        return;
      }
      
      setSeller(sellerData.seller);
      
      // Fetch seller's products
      const productsResponse = await fetch(buildApiUrl(`/sellers/${sellerId}/products`));
      const productsData = await productsResponse.json();
      
      if (productsData.success && productsData.products) {
        setProducts(productsData.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching seller:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      alert('Please login to contact the seller');
      navigate('/login');
      return;
    }

    try {
      const senderId = user._id || user.id;
      const conversationId = [senderId, seller._id].sort().join('_');
      
      // Check if conversation already exists
      const existingConvResponse = await fetch(buildApiUrl(`/messages/conversations/${senderId}`));
      const existingConvData = await existingConvResponse.json();
      
      let conversationExists = false;
      if (existingConvData.success && existingConvData.conversations) {
        conversationExists = existingConvData.conversations.some(
          conv => conv.conversationId === conversationId
        );
      }
      
      // Only send initial message if conversation doesn't exist
      if (!conversationExists) {
        const token = sessionStorage.getItem('token');
        // Determine sender model - check userType field
        const senderModel = user.userType === 'seller' || user.role === 'seller' ? 'Seller' : 'User';
        
        console.log('Creating new conversation with:', {
          senderId,
          senderModel,
          receiverId: seller._id,
          receiverModel: 'Seller',
          userType: user.userType,
          role: user.role
        });
        
        const response = await fetch(buildApiUrl('/messages'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            senderId: senderId,
            senderModel: senderModel,
            receiverId: seller._id,
            receiverModel: 'Seller',
            message: `Hi, I'm interested in your products from ${seller.storeName}.`
          })
        });

        const data = await response.json();
        
        if (!data.success) {
          console.error('Failed to send message:', data);
          alert(data.message || 'Failed to send message. Please try again.');
          return;
        }
      }
      
      // Navigate to buyer profile messages tab with seller info
      navigate('/buyer-profile', { 
        state: { 
          activeTab: 'messages',
          openConversation: {
            conversationId: conversationId,
            sellerId: seller._id,
            sellerName: seller.storeName || seller.fullName,
            sellerAvatar: seller.profileImage
          }
        } 
      });
    } catch (error) {
      console.error('Error contacting seller:', error);
      alert('Failed to contact seller. Please try again.');
    }
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

  if (!seller && !loading) {
    return (
      <div className="seller-profile-page">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/shop">Shop</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Seller Not Found</span>
          </nav>
        </div>
        <div className="error-container">
          <FiPackage size={64} color="#ccc" />
          <h2>Seller Not Found</h2>
          <p>The seller you're looking for doesn't exist or has been removed.</p>
          <button className="back-button" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-profile-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{seller.storeName || seller.fullName}</span>
        </nav>
      </div>

      {/* Seller Header Section */}
      <div className="seller-hero">
        <div className="seller-hero-content">
          <div className="seller-main-info">
            <div className="seller-avatar-wrapper">
              {seller.profileImage ? (
                <img src={seller.profileImage} alt={seller.storeName} className="seller-avatar-large" />
              ) : (
                <div className="seller-avatar-large seller-avatar-placeholder">
                  {(seller.storeName || seller.fullName || 'S').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="verified-badge">
                <FiShield /> Verified
              </div>
            </div>
            
            <div className="seller-identity">
              <h1 className="seller-name">{seller.storeName || seller.fullName}</h1>
              <h2 className="seller-store">{seller.fullName}</h2>
              
              <div className="seller-rating-large">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={i < Math.floor(seller.rating || 0) ? 'star-filled' : 'star-empty'} 
                    />
                  ))}
                </div>
                <span className="rating-value">{(seller.rating || 0).toFixed(1)}</span>
                <span className="rating-count">({seller.totalReviews || 0} reviews)</span>
              </div>

              {seller.storeDescription && (
                <p className="seller-bio">{seller.storeDescription}</p>
              )}

              <div className="seller-location-info">
                <FiMapPin />
                <span>{seller.city || seller.address || 'Nepal'}</span>
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
          <button className="contact-seller-btn" onClick={handleContactSeller}>
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
                      <span>{product.averageRating ? product.averageRating.toFixed(1) : 'No rating'}</span>
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
