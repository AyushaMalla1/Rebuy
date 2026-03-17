import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiPackage, FiCheck, FiX } from 'react-icons/fi';
import './Checkout.css';
import { orderAPI } from './services/api';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showEsewaModal, setShowEsewaModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Normalize cart items to ensure consistent structure
    const normalizedCart = cart.map(item => {
      // Handle both frontend and backend cart item structures
      if (item.product && typeof item.product === 'object') {
        // Backend structure with nested product
        return {
          id: item.product._id || item.product,
          name: item.product.name || item.productName || 'Product',
          price: item.product.price || item.price || 0,
          image: (item.product.images && item.product.images[0]) || item.productImage || item.image || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          quantity: item.quantity || 1,
          seller: item.product.seller || item.seller,
          sellerName: item.product.sellerName || item.sellerName || 'Unknown Seller',
          storeName: item.product.storeName || item.storeName || 'Thrift Store'
        };
      } else {
        // Frontend structure (already normalized)
        return {
          id: item.id || item._id,
          name: item.name || item.productName || 'Product',
          price: item.price || 0,
          image: item.image || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          quantity: item.quantity || 1,
          seller: item.seller,
          sellerName: item.sellerName || 'Unknown Seller',
          storeName: item.storeName || 'Thrift Store'
        };
      }
    });
    
    setCartItems(normalizedCart);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName,
        phone: user.phone || ''
      }));
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const shippingCost = calculateTotal() >= 2000 ? 0 : 100;
  const finalTotal = calculateTotal() + shippingCost;

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!shippingAddress.fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    
    if (!shippingAddress.phone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    
    // Validate phone number format (Nepal format)
    const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
    const cleanPhone = shippingAddress.phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      alert('Please enter a valid phone number (e.g., 9812345678 or +9779812345678)');
      return;
    }
    
    if (!shippingAddress.address.trim()) {
      alert('Please enter your address');
      return;
    }
    
    if (!shippingAddress.city.trim()) {
      alert('Please enter your city');
      return;
    }
    
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleEsewaPayment = () => {
    console.log('Opening eSewa modal...');
    setShowEsewaModal(true);
  };

  const processEsewaPayment = () => {
    setPaymentProcessing(true);

    // Note: eSewa test environment (uat.esewa.com.np) is currently unavailable
    // For development, we'll simulate the payment
    // For production, use: https://esewa.com.np/epay/main with real merchant code
    
    const isProduction = false; // Set to true when you have real eSewa merchant account
    
    if (isProduction) {
      // Production eSewa Payment
      const path = 'https://esewa.com.np/epay/main';
      
      const params = {
        amt: finalTotal,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: finalTotal,
        pid: `REBUY-${Date.now()}`,
        scd: 'YOUR_MERCHANT_CODE', // Replace with your actual merchant code
        su: `${window.location.origin}/payment-success?orderId=${Date.now()}`,
        fu: `${window.location.origin}/payment-failure`
      };

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = path;

      Object.keys(params).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      
      // Store order data before redirect
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        cartItems,
        shippingAddress,
        paymentMethod,
        subtotal: calculateTotal(),
        shippingCost,
        total: finalTotal
      }));
      
      form.submit();
      document.body.removeChild(form);
    } else {
      // Development mode - simulate payment
      console.log('Development Mode: Simulating eSewa payment');
      
      // Simulate successful payment after 2 seconds
      setTimeout(() => {
        setShowEsewaModal(false);
        setPaymentProcessing(false);
        completeOrder();
      }, 2000);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'esewa') {
      handleEsewaPayment();
      return;
    }

    completeOrder();
  };

  const completeOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Prepare order data for backend
      const orderData = {
        customerId: user._id,
        customerName: shippingAddress.fullName,
        customerEmail: user.email,
        customerPhone: shippingAddress.phone,
        items: cartItems.map(item => ({
          product: item.id,
          productName: item.name,
          productImage: item.image,
          seller: item.seller,
          sellerName: item.sellerName || 'Unknown Seller',
          storeName: item.storeName || 'Thrift Store',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        shippingAddress,
        paymentMethod,
        subtotal: calculateTotal(),
        shippingCost,
        total: finalTotal,
        customerNotes: ''
      };

      // Create order in backend
      const response = await orderAPI.create(orderData);
      
      // Save order to localStorage for immediate display
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        id: response.order._id,
        items: cartItems,
        shippingAddress,
        paymentMethod,
        total: finalTotal,
        date: new Date().toISOString(),
        status: 'Processing',
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        trackingNumber: response.order.trackingNumber,
        estimatedDelivery: response.order.estimatedDelivery
      });
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]));

      setOrderPlaced(true);

      // Show points earned
      if (response.pointsEarned) {
        alert(`Order placed successfully! You earned ${response.pointsEarned} loyalty points!`);
      }

      setTimeout(() => {
        navigate('/profile?tab=orders');
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">
            <FiCheck />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order is being processed.</p>
          <p className="order-number">Order ID: #{Date.now()}</p>
          <p className="redirect-message">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={() => navigate('/')} className="back-btn">
            <FiArrowLeft /> Back to Shop
          </button>
          <h1>Checkout</h1>
        </div>

        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Shipping Address</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Payment Method</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Review Order</span>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {step === 1 && (
              <div className="checkout-section">
                <div className="section-header">
                  <FiMapPin />
                  <h2>Shipping Address</h2>
                </div>
                <form onSubmit={handleAddressSubmit}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      placeholder="9812345678 or +9779812345678"
                      pattern="(\+977)?[9][6-9]\d{8}"
                      title="Enter a valid Nepal phone number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      placeholder="Street address, apartment, suite, etc."
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="continue-btn">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-section">
                <div className="section-header">
                  <FiCreditCard />
                  <h2>Payment Method</h2>
                </div>
                <form onSubmit={handlePaymentSubmit}>
                  <div className="payment-options">
                    <label className={`payment-option ${paymentMethod === 'esewa' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="esewa"
                        checked={paymentMethod === 'esewa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">
                          <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" style={{width: '60px'}} />
                        </div>
                        <div>
                          <h3>eSewa</h3>
                          <p>Pay securely with eSewa wallet</p>
                        </div>
                      </div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'khalti' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="khalti"
                        checked={paymentMethod === 'khalti'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">
                          <img src="https://web.khalti.com/static/img/logo1.png" alt="Khalti" style={{width: '60px'}} />
                        </div>
                        <div>
                          <h3>Khalti</h3>
                          <p>Pay with Khalti digital wallet</p>
                        </div>
                      </div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">💳</div>
                        <div>
                          <h3>Credit/Debit Card</h3>
                          <p>Visa, Mastercard, American Express</p>
                        </div>
                      </div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-content">
                        <div className="option-icon">💵</div>
                        <div>
                          <h3>Cash on Delivery</h3>
                          <p>Pay when you receive your order</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setStep(1)} className="back-step-btn">
                      Back
                    </button>
                    <button type="submit" className="continue-btn">
                      Review Order
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-section">
                <div className="section-header">
                  <FiPackage />
                  <h2>Review Your Order</h2>
                </div>

                <div className="review-section">
                  <h3>Shipping Address</h3>
                  <div className="review-card">
                    <p><strong>{shippingAddress.fullName}</strong></p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city} {shippingAddress.postalCode}</p>
                    <button onClick={() => setStep(1)} className="edit-btn">Edit</button>
                  </div>
                </div>

                <div className="review-section">
                  <h3>Payment Method</h3>
                  <div className="review-card">
                    <p><strong>
                      {paymentMethod === 'esewa' && 'eSewa'}
                      {paymentMethod === 'card' && 'Credit/Debit Card'}
                      {paymentMethod === 'cod' && 'Cash on Delivery'}
                    </strong></p>
                    <p>
                      {paymentMethod === 'cod' ? 'Pay when you receive' : 'Pay now securely'}
                    </p>
                    <button onClick={() => setStep(2)} className="edit-btn">Edit</button>
                  </div>
                </div>

                <button onClick={handlePlaceOrder} className="place-order-btn">
                  {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
                </button>
              </div>
            )}
          </div>

          <div className="checkout-sidebar">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-items">
                {Array.isArray(cartItems) && cartItems.map((item, index) => (
                  <div key={item.id || index} className="summary-item">
                    <img 
                      src={item.image || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg'} 
                      alt={item.name || item.productName || 'Product'}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.name || item.productName || 'Product'}</h4>
                      <p>Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="item-price">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>Rs. {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost}`}</span>
                </div>
                {shippingCost === 0 && (
                  <p className="free-shipping-note">🎉 You got free shipping!</p>
                )}
                <div className="total-row final">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEsewaModal && (
        <div className="payment-modal-overlay" onClick={(e) => {
          if (e.target.className === 'payment-modal-overlay') {
            setShowEsewaModal(false);
          }
        }}>
          <div className="payment-modal">
            <button className="modal-close" onClick={() => setShowEsewaModal(false)}>
              <FiX />
            </button>
            
            <div className="modal-header">
              <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="esewa-logo" />
              <h2>Pay with eSewa</h2>
            </div>

            <div className="modal-body">
              <div className="payment-amount">
                <p>Amount to Pay</p>
                <h3>Rs. {finalTotal.toLocaleString()}</h3>
              </div>

              <div className="qr-section">
                <h4>Payment Information</h4>
                <div className="payment-info-box">
                  <div className="info-row">
                    <span className="info-label">Merchant:</span>
                    <span className="info-value">Rebuy Thrift Shop</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Amount:</span>
                    <span className="info-value">Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">REBUY-{Date.now()}</span>
                  </div>
                </div>
                <p className="payment-instruction">
                  Click the button below to complete payment via eSewa
                </p>
              </div>

              <div className="divider">
                <span>PAYMENT METHOD</span>
              </div>

              <button 
                className="esewa-pay-btn"
                onClick={processEsewaPayment}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? 'Processing...' : 'Pay with eSewa Web'}
              </button>

              <p className="payment-note">
                You will be redirected to eSewa payment gateway
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
