import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiShoppingBag, FiX, FiTruck, FiAlertCircle, FiCheck, FiHeart } from 'react-icons/fi';
import './Cart.css';
import { cartAPI } from './services/api';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [savedForLater, setSavedForLater] = useState([]);
  const [user, setUser] = useState(null);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadCart();
    loadSavedForLater();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setCart([]);
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const response = await cartAPI.get(user._id);
      
      if (!response.items || response.items.length === 0) {
        setCart([]);
        setLoading(false);
        return;
      }
      
      const formattedCart = response.items
        .filter(item => item.product) // Filter out items with missing products
        .map(item => {
          const product = item.product;
          return {
            id: product._id,
            name: product.name,
            price: product.discountedPrice || product.price,
            originalPrice: product.price,
            image: (product.images && product.images[0]) || '',
            quantity: item.quantity,
            seller: product.seller,
            sellerName: product.sellerName,
            storeName: product.storeName,
            discount: typeof product.discount === 'object' ? product.discount.percentage : product.discount,
            stock: product.stock
          };
        });
      
      setCart(formattedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedForLater = () => {
    const saved = localStorage.getItem('savedForLater');
    if (saved) {
      setSavedForLater(JSON.parse(saved));
    }
  };

  const updateQuantity = async (productId, change) => {
    if (!user) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const item = cart.find(i => i.id === productId);
      if (!item) return;
      
      const newQuantity = item.quantity + change;
      
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        setUpdating(prev => ({ ...prev, [productId]: false }));
        return;
      }

      if (item.stock && newQuantity > item.stock) {
        setUpdating(prev => ({ ...prev, [productId]: false }));
        return;
      }
      
      await cartAPI.update(user._id, productId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    
    try {
      await cartAPI.remove(user._id, productId);
      await loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const saveForLater = (productId) => {
    const item = cart.find(i => i.id === productId);
    if (item) {
      const newSaved = [...savedForLater, { ...item, savedAt: Date.now() }];
      setSavedForLater(newSaved);
      localStorage.setItem('savedForLater', JSON.stringify(newSaved));
      
      removeFromCart(productId);
    }
  };

  const moveToCart = async (productId) => {
    if (!user) return;
    
    const item = savedForLater.find(i => i.id === productId);
    if (item) {
      try {
        await cartAPI.add(user._id, productId, item.quantity);
        
        const newSaved = savedForLater.filter(i => i.id !== productId);
        setSavedForLater(newSaved);
        localStorage.setItem('savedForLater', JSON.stringify(newSaved));
        
        await loadCart();
      } catch (error) {
        console.error('Error moving to cart:', error);
      }
    }
  };

  const removeFromSaved = (productId) => {
    const newSaved = savedForLater.filter(i => i.id !== productId);
    setSavedForLater(newSaved);
    localStorage.setItem('savedForLater', JSON.stringify(newSaved));
  };

  const clearCart = async () => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await cartAPI.clear(user._id);
        setCart([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const getTotalSavings = () => {
    return cart.reduce((total, item) => {
      if (item.discount && item.originalPrice > item.price) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3);
    return deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const groupItemsBySeller = () => {
    const grouped = {};
    cart.forEach(item => {
      const sellerKey = item.seller || 'unknown';
      if (!grouped[sellerKey]) {
        grouped[sellerKey] = {
          sellerName: item.sellerName || 'Unknown Seller',
          storeName: item.storeName || 'Thrift Store',
          items: []
        };
      }
      grouped[sellerKey].items.push(item);
    });
    return grouped;
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    return subtotal > 2000 ? 0 : 150;
  };

  const getTotal = () => {
    return getSubtotal() + getShipping();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  const getProductImage = (item) => {
    // Priority: item.image > item.images[0] > default
    if (item.image && item.image !== '') return item.image;
    if (item.images && Array.isArray(item.images) && item.images.length > 0 && item.images[0]) return item.images[0];
    
    // Default placeholder
    return 'https://via.placeholder.com/150/00bcd4/ffffff?text=Product';
  };

  return (
    <div className="cart-page">
      <header className="cart-header">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Continue Shopping
        </Link>
        <h1>Shopping Cart</h1>
      </header>

      <div className="cart-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your cart...</p>
          </div>
        ) : cart.length === 0 && savedForLater.length === 0 ? (
          <div className="empty-cart">
            <FiShoppingBag className="empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some items to get started!</p>
            <Link to="/" className="shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              {cart.length > 0 && (
                <>
                  <div className="cart-header-row">
                    <h2>Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h2>
                    <button className="clear-cart-btn" onClick={clearCart}>
                      <FiTrash2 /> Clear Cart
                    </button>
                  </div>

                  <div className="cart-items-list">
                    {Object.entries(groupItemsBySeller()).map(([sellerId, sellerData]) => (
                      <div key={sellerId} className="seller-group">
                        <div className="seller-header">
                          <span className="seller-name">{sellerData.storeName}</span>
                          <span className="seller-items">
                            {sellerData.items.length} {sellerData.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        {sellerData.items.map(item => (
                          <div key={item.id} className="cart-item-card">
                            <img 
                              src={getProductImage(item)} 
                              alt={item.name}
                              onClick={() => navigate(`/product/${item.id}`)}
                              style={{cursor: 'pointer'}}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                            <div className="item-details">
                              <h3 onClick={() => navigate(`/product/${item.id}`)} style={{cursor: 'pointer'}}>
                                {item.name}
                              </h3>
                              
                              <div className="price-section">
                                {item.discount && item.originalPrice > item.price ? (
                                  <>
                                    <span className="item-price">Rs. {(item.price || 0).toLocaleString()}</span>
                                    <span className="original-price">Rs. {(item.originalPrice || 0).toLocaleString()}</span>
                                    <span className="discount-badge">{item.discount}% OFF</span>
                                  </>
                                ) : (
                                  <span className="item-price">Rs. {(item.price || 0).toLocaleString()}</span>
                                )}
                              </div>

                              {item.stock !== undefined && (
                                <div className="stock-info">
                                  {item.stock === 0 ? (
                                    <span className="out-of-stock">
                                      <FiAlertCircle /> Out of Stock
                                    </span>
                                  ) : item.stock < 5 ? (
                                    <span className="low-stock">
                                      <FiAlertCircle /> Only {item.stock} left in stock
                                    </span>
                                  ) : (
                                    <span className="in-stock">
                                      <FiCheck /> In Stock
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="item-meta">
                                <span className="delivery-info">
                                  <FiTruck /> Delivery by {getEstimatedDelivery()}
                                </span>
                              </div>

                              <div className="item-secondary-actions">
                                <button 
                                  className="save-later-btn" 
                                  onClick={() => saveForLater(item.id)}
                                >
                                  <FiHeart /> Save for later
                                </button>
                              </div>
                            </div>

                            <div className="item-actions">
                              <div className="quantity-controls">
                                <button 
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={updating[item.id] || item.stock === 0}
                                >
                                  -
                                </button>
                                <span>{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={updating[item.id] || item.stock === 0 || (item.stock && item.quantity >= item.stock)}
                                >
                                  +
                                </button>
                              </div>
                              <p className="item-total">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                              <button 
                                className="remove-item-btn" 
                                onClick={() => removeFromCart(item.id)}
                                title="Remove item"
                              >
                                <FiX />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {savedForLater.length > 0 && (
                <div className="saved-for-later-section">
                  <h2>Saved for Later ({savedForLater.length})</h2>
                  <div className="saved-items-list">
                    {savedForLater.map(item => (
                      <div key={item.id} className="saved-item-card">
                        <img 
                          src={getProductImage(item)} 
                          alt={item.name}
                          onClick={() => navigate(`/product/${item.id}`)}
                          style={{cursor: 'pointer'}}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                        <div className="saved-item-details">
                          <h3 onClick={() => navigate(`/product/${item.id}`)} style={{cursor: 'pointer'}}>
                            {item.name}
                          </h3>
                          <p className="item-price">Rs. {(item.price || 0).toLocaleString()}</p>
                          <div className="saved-item-actions">
                            <button onClick={() => moveToCart(item.id)} className="move-to-cart-btn">
                              Move to Cart
                            </button>
                            <button onClick={() => removeFromSaved(item.id)} className="remove-saved-btn">
                              <FiX /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <h2>Order Summary</h2>
                
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                    <span>Rs. {getSubtotal().toLocaleString()}</span>
                  </div>
                  
                  {getTotalSavings() > 0 && (
                    <div className="summary-row savings">
                      <span>Total Savings</span>
                      <span className="savings-amount">- Rs. {getTotalSavings().toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{getShipping() === 0 ? 'FREE' : `Rs. ${getShipping()}`}</span>
                  </div>
                  
                  {getSubtotal() > 2000 ? (
                    <div className="free-shipping-note success">
                      <FiCheck /> You got free shipping!
                    </div>
                  ) : (
                    <div className="free-shipping-note info">
                      <FiTruck /> Add Rs. {(2000 - getSubtotal()).toLocaleString()} more for free shipping
                    </div>
                  )}
                </div>

                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>Rs. {getTotal().toLocaleString()}</span>
                </div>

                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={cart.some(item => item.stock === 0)}
                >
                  Proceed to Checkout
                </button>

                {cart.some(item => item.stock === 0) && (
                  <p className="checkout-warning">
                    <FiAlertCircle /> Remove out of stock items to proceed
                  </p>
                )}

                <Link to="/" className="continue-shopping">
                  Continue Shopping
                </Link>

                <div className="security-badges">
                  <div className="badge">
                    <FiCheck /> Secure Checkout
                  </div>
                  <div className="badge">
                    <FiTruck /> Fast Delivery
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
