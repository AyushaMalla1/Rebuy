import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiPackage, FiCheck, FiX } from 'react-icons/fi';
import './Checkout.css';

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
    setCartItems(cart);

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
        su: `${window.location.origin}/payment-success`,
        fu: `${window.location.origin}/payment-failure`
      };

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = path;
      form.target = '_blank';

      Object.keys(params).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } else {
      // Development mode - simulate payment
      alert('eSewa Test Environment is unavailable.\n\nFor development: Payment will be simulated.\n\nFor production: Get eSewa merchant account from esewa.com.np and set isProduction = true');
      
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

  const completeOrder = () => {
    const order = {
      id: Date.now(),
      items: cartItems,
      shippingAddress,
      paymentMethod,
      total: finalTotal,
      date: new Date().toISOString(),
      status: 'Processing',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid'
    };

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    localStorage.setItem('cart', JSON.stringify([]));

    setOrderPlaced(true);

    setTimeout(() => {
      navigate('/profile?tab=orders');
    }, 3000);
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
                      {paymentMethod === 'khalti' && 'Khalti'}
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
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <span className="item-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
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
