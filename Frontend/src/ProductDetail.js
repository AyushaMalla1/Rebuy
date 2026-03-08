import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiStar, FiShield, FiTruck, FiRefreshCw, FiMessageSquare, FiAward, FiZap, FiPackage } from 'react-icons/fi';
import './ProductDetail.css';
import Chatbot from './components/Chatbot';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('online');

  // All products data
  const allProducts = [
    { id: 1, name: 'Hoodie', price: 5100, category: 'NEW', image: 'https://i.pinimg.com/1200x/85/50/eb/8550eb7065f3ae9b2617558814ff21f7.jpg', rating: 4.5, reviews: 128 },
    { id: 2, name: 'T-Shirt', price: 3000, category: 'BEST', image: 'https://i.pinimg.com/736x/28/68/77/2868771ebc5e4708ba23a67646d12663.jpg', rating: 4.8, reviews: 245 },
    { id: 3, name: 'Vintage Jacket', price: 8000, category: 'TOP', image: 'https://i.pinimg.com/1200x/06/56/44/065644e9485e9b7010771873bc5b61c8.jpg', rating: 4.9, reviews: 189 },
    { id: 4, name: 'Jersey', price: 4200, category: 'NEW', image: 'https://i.pinimg.com/1200x/9f/66/52/9f665241f2a2f3347c91a5f0104b2733.jpg', rating: 4.3, reviews: 92 },
    { id: 5, name: 'Blazer', price: 3100, category: 'BEST', image: 'https://i.pinimg.com/736x/f5/6e/01/f56e016ac0abff71aff30bf64cab7b83.jpg', rating: 4.6, reviews: 156 },
    { id: 6, name: 'Jeans', price: 4100, category: 'TOP', image: 'https://i.pinimg.com/1200x/d3/71/05/d371058d1ac4ee47396aaa35a37f0684.jpg', rating: 4.7, reviews: 203 },
    { id: 7, name: 'Jacket', price: 5200, category: 'NEW', image: 'https://i.pinimg.com/1200x/1a/96/f6/1a96f6aed31f53371dd7d9642d4b01c0.jpg', rating: 4.4, reviews: 134 },
    { id: 8, name: 'Jorts', price: 3100, category: 'BEST', image: 'https://i.pinimg.com/736x/78/52/04/7852042ddd26913b9576eb80db5515a2.jpg', rating: 4.2, reviews: 87 },
  ];

  const product = allProducts.find(p => p.id === parseInt(id));

  // Product condition and story
  const productCondition = 'Like New';
  const productStory = "This vintage jacket was part of a 90s collection and has been carefully preserved. It was worn only twice to special events and has been stored in excellent condition. The unique design and quality fabric make it a timeless piece perfect for any wardrobe.";

  // Seller Information
  const sellerInfo = {
    name: 'vitalesteven',
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

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }
    
    // Check if product is in favorites
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product, navigate]);

  if (!product) return null;

  // Multiple images for gallery (using same image for demo)
  const productImages = [product.image, product.image, product.image, product.image];

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
    const savedCart = localStorage.getItem('cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      cart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  const handlePurchase = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  // Similar products (random selection)
  const similarProducts = allProducts.filter(p => p.id !== product.id).slice(0, 3);

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
              <span className={`condition-badge ${productCondition.toLowerCase().replace(' ', '-')}`}>
                {productCondition}
              </span>
              <span className="category-badge">{product.category}</span>
            </div>
          </div>

          <div className="price-section">
            <div className="current-price">Rs. {product.price.toLocaleString()}</div>
            <div className="original-price">Rs. {(product.price * 1.3).toLocaleString()}</div>
            <div className="discount-badge">23% OFF</div>
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
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-option ${selectedPayment === 'online' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={selectedPayment === 'online'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <div className="payment-content">
                  <span className="payment-icon">💳</span>
                  <div>
                    <strong>Online Payment</strong>
                    <p>Pay securely with card or digital wallet</p>
                  </div>
                </div>
              </label>
              <label className={`payment-option ${selectedPayment === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={selectedPayment === 'cod'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                />
                <div className="payment-content">
                  <span className="payment-icon">💵</span>
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when you receive the item</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="purchase-btn" onClick={handlePurchase}>
              PURCHASE
            </button>
            <button className="add-cart-btn" onClick={handleAddToCart}>
              <FiShoppingCart /> ADD TO CART
            </button>
          </div>

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
              Beautiful second-hand {product.name.toLowerCase()} in excellent condition. 
              This high-quality piece has been carefully inspected and cleaned. 
              Perfect for sustainable fashion lovers looking for unique style at an affordable price.
            </p>
            <ul>
              <li>Condition: {productCondition}</li>
              <li>Material: Premium quality fabric</li>
              <li>Care: Machine washable</li>
              <li>Authenticity: Verified by Rebuy</li>
            </ul>
          </div>

          {/* Product Story */}
          <div className="story-section">
            <h3>📖 Item Story</h3>
            <div className="story-content">
              <p>{productStory}</p>
            </div>
          </div>

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
                  <img src={sellerInfo.avatar} alt={sellerInfo.name} />
                </div>
                <div className="seller-info">
                  <h4>{sellerInfo.name}</h4>
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
    </div>
  );
}

export default ProductDetail;
