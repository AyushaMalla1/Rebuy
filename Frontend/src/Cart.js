import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiShoppingBag, FiX } from 'react-icons/fi';
import './Cart.css';
import { cartAPI } from './services/api';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      
      // Normalize cart items to ensure consistent structure
      const normalizedCart = cart.map(item => {
        // Handle both frontend and backend cart item structures
        if (item.product && typeof item.product === 'object') {
          // Backend structure with nested product
          const product = item.product;
          const effectivePrice = product.discountedPrice || product.price || item.price || 0;
          
          return {
            id: product._id || product,
            name: product.name || item.productName || 'Product',
            price: effectivePrice,
            originalPrice: product.price || item.price || 0,
            image: (product.images && product.images[0]) || item.productImage || item.image || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
            quantity: item.quantity || 1,
            seller: product.seller || item.seller,
            sellerName: product.sellerName || item.sellerName || 'Unknown Seller',
            storeName: product.storeName || item.storeName || 'Thrift Store',
            discount: product.discount,
            discountedPrice: product.discountedPrice
          };
        } else {
          // Frontend structure (already normalized)
          const effectivePrice = item.discountedPrice || item.price || 0;
          
          return {
            id: item.id || item._id,
            name: item.name || item.productName || 'Product',
            price: effectivePrice,
            originalPrice: item.originalPrice || item.price || 0,
            image: item.image || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
            quantity: item.quantity || 1,
            seller: item.seller,
            sellerName: item.sellerName || 'Unknown Seller',
            storeName: item.storeName || 'Thrift Store',
            discount: item.discount,
            discountedPrice: item.discountedPrice
          };
        }
      });
      
      setCart(normalizedCart);
    }
  };

  const updateQuantity = async (productId, change) => {
    try {
      const item = cart.find(i => i.id === productId);
      if (!item) return;
      
      const newQuantity = item.quantity + change;
      
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      // Update backend first if user is logged in
      if (user && user._id) {
        try {
          await cartAPI.update(user._id, productId, newQuantity);
          
          // Fetch updated cart from backend
          const backendCart = await cartAPI.get(user._id);
          const formattedCart = backendCart.items.map(item => ({
            id: item.product._id || item.product,
            name: item.product.name || item.productName,
            price: item.product.price || item.price,
            image: (item.product.images && item.product.images[0]) || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
            quantity: item.quantity,
            seller: item.product.seller || item.seller,
            sellerName: item.product.sellerName || item.sellerName,
            storeName: item.product.storeName || item.storeName
          }));
          
          setCart(formattedCart);
          localStorage.setItem('cart', JSON.stringify(formattedCart));
          return;
        } catch (error) {
          console.error('Backend update error, using localStorage:', error);
        }
      }
      
      // Fallback to localStorage
      const newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );

      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Remove from backend first if user is logged in
      if (user && user._id) {
        try {
          await cartAPI.remove(user._id, productId);
          
          // Fetch updated cart from backend
          const backendCart = await cartAPI.get(user._id);
          const formattedCart = backendCart.items.map(item => ({
            id: item.product._id || item.product,
            name: item.product.name || item.productName,
            price: item.product.price || item.price,
            image: (item.product.images && item.product.images[0]) || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
            quantity: item.quantity,
            seller: item.product.seller || item.seller,
            sellerName: item.product.sellerName || item.sellerName,
            storeName: item.product.storeName || item.storeName
          }));
          
          setCart(formattedCart);
          localStorage.setItem('cart', JSON.stringify(formattedCart));
          return;
        } catch (error) {
          console.error('Backend remove error, using localStorage:', error);
        }
      }
      
      // Fallback to localStorage
      const newCart = cart.filter(item => item.id !== productId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        // Clear backend first if user is logged in
        if (user && user._id) {
          try {
            await cartAPI.clear(user._id);
          } catch (error) {
            console.error('Error clearing backend cart:', error);
          }
        }
        
        // Clear local state and storage
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShipping = () => {
    return getSubtotal() > 2000 ? 0 : 150;
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

  return (
    <div className="cart-page">
      <header className="cart-header">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Continue Shopping
        </Link>
        <h1>Shopping Cart</h1>
      </header>

      <div className="cart-container">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <FiShoppingBag className="empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some items to get started!</p>
            <Link to="/" className="shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              <div className="cart-header-row">
                <h2>Cart Items ({cart.length})</h2>
                <button className="clear-cart-btn" onClick={clearCart}>
                  <FiTrash2 /> Clear Cart
                </button>
              </div>

              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item-card">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onClick={() => navigate(`/product/${item.id}`)}
                      style={{cursor: 'pointer'}}
                    />
                    <div className="item-details">
                      <h3 onClick={() => navigate(`/product/${item.id}`)} style={{cursor: 'pointer'}}>
                        {item.name}
                      </h3>
                      <p className="item-price">Rs. {item.price.toLocaleString()}</p>
                      {item.sellerName && (
                        <p className="item-seller">Sold by: {item.sellerName}</p>
                      )}
                    </div>
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                      <p className="item-total">Rs. {(item.price * item.quantity).toLocaleString()}</p>
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
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({cart.length} items)</span>
                <span>Rs. {getSubtotal().toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{getShipping() === 0 ? 'FREE' : `Rs. ${getShipping()}`}</span>
              </div>
              {getSubtotal() > 2000 && (
                <p className="free-shipping-note">🎉 You got free shipping!</p>
              )}
              {getSubtotal() <= 2000 && (
                <p className="free-shipping-note">
                  Add Rs. {(2000 - getSubtotal()).toLocaleString()} more for free shipping
                </p>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs. {getTotal().toLocaleString()}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <Link to="/" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
