import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiPackage, FiCheck, FiX } from 'react-icons/fi';
import './Checkout.css';
import { orderAPI } from './services/api';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showEsewaModal, setShowEsewaModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false); // Track if user confirmed address

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '+977',
    addressLabel: 'Home',
    state: '',
    district: '',
    municipality: '',
    landmark: '',
    isDefault: false
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [applyingPoints, setApplyingPoints] = useState(false);

  useEffect(() => {
    // Check if this is a "Buy Now" checkout
    const urlParams = new URLSearchParams(window.location.search);
    const isBuyNow = urlParams.get('buyNow') === 'true';
    
    let items = [];
    
    if (isBuyNow) {
      // Load single "Buy Now" item
      const buyNowItem = JSON.parse(localStorage.getItem('buyNowItem') || 'null');
      if (buyNowItem) {
        items = [buyNowItem];
      } else {
        // If no buyNow item found, redirect to cart
        navigate('/cart');
        return;
      }
    } else {
      // Load regular cart items
      items = JSON.parse(localStorage.getItem('cart') || '[]');
    }

    // Normalize cart items to ensure consistent structure
    const normalizedCart = items.map(item => {
      // Handle both frontend and backend cart item structures
      if (item.product && typeof item.product === 'object') {
        // Backend structure with nested product
        const product = item.product;
        const hasDiscount = product.discount && product.discount.percentage > 0;
        const discountedPrice = hasDiscount ? product.price * (1 - product.discount.percentage / 100) : null;

        return {
          id: product._id || product,
          name: product.name || item.productName || 'Product',
          price: product.price || item.price || 0,
          originalPrice: product.price || item.price || 0,
          discountedPrice: discountedPrice,
          discount: hasDiscount ? product.discount.percentage : null,
          bundleDiscount: item.bundleDiscount || 0,
          image: (product.images && product.images[0]) || item.productImage || item.image || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          quantity: item.quantity || 1,
          seller: product.seller || item.seller,
          sellerName: product.sellerName || item.sellerName || 'Unknown Seller',
          storeName: product.storeName || item.storeName || 'Thrift Store'
        };
      } else {
        // Frontend structure (already normalized)
        return {
          id: item.id || item._id,
          name: item.name || item.productName || 'Product',
          price: item.price || 0,
          originalPrice: item.originalPrice || item.price || 0,
          discountedPrice: item.discountedPrice || null,
          discount: item.discount || null,
          bundleDiscount: item.bundleDiscount || 0,
          image: item.image || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          quantity: item.quantity || 1,
          seller: item.seller,
          sellerName: item.sellerName || 'Unknown Seller',
          storeName: item.storeName || 'Thrift Store'
        };
      }
    });

    setCartItems(normalizedCart);

    // Load addresses from backend
    loadAddressesFromBackend();

    // Load loyalty points
    loadLoyaltyPoints();
  }, []);

  const loadAddressesFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.customer && data.customer.addresses) {
          setSavedAddresses(data.customer.addresses);

          // Check if there's a previously confirmed address in localStorage
          const confirmedAddress = localStorage.getItem('confirmedCheckoutAddress');

          if (confirmedAddress) {
            // Use the previously confirmed address
            const addr = JSON.parse(confirmedAddress);
            setShippingAddress(addr);
            setAddressConfirmed(true); // IMPORTANT: Set this to true!

            // Find the index of this address in saved addresses
            const index = data.customer.addresses.findIndex(a =>
              a.fullName === addr.fullName &&
              a.phone === addr.phone &&
              a.landmark === addr.landmark
            );
            if (index !== -1) {
              setSelectedAddressIndex(index);
            }
          } else {
            // No confirmed address yet - load default but don't confirm it
            const defaultAddr = data.customer.addresses.find(addr => addr.isDefault);
            if (defaultAddr) {
              setSelectedAddressIndex(data.customer.addresses.indexOf(defaultAddr));
              setShippingAddress({
                fullName: defaultAddr.fullName,
                phone: defaultAddr.phone,
                addressLabel: defaultAddr.label || 'Home',
                state: defaultAddr.state,
                district: defaultAddr.district,
                municipality: defaultAddr.municipality,
                landmark: defaultAddr.landmark,
                isDefault: defaultAddr.isDefault
              });
              // Don't set addressConfirmed to true - let user confirm it
              setAddressConfirmed(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const loadLoyaltyPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/${user._id}/loyalty-points`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyPoints(data.totalPoints || 0);
      }
    } catch (error) {
      console.error('Error loading loyalty points:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const itemTotal = (item.price * item.quantity) - (item.bundleDiscount || 0);
      return sum + itemTotal;
    }, 0);
  };

  const getBundleDiscount = () => {
    return cartItems.reduce((sum, item) => sum + (item.bundleDiscount || 0), 0);
  };

  const shippingCost = calculateTotal() >= 2000 ? 0 : 100;
  const pointsDiscount = pointsToRedeem; // 1 point = Rs. 1
  const finalTotal = Math.max(0, calculateTotal() + shippingCost - pointsDiscount);

  const handleApplyPoints = () => {
    const maxPoints = Math.min(loyaltyPoints, calculateTotal() + shippingCost);
    setPointsToRedeem(maxPoints);
    setApplyingPoints(true);
  };

  const handleRemovePoints = () => {
    setPointsToRedeem(0);
    setApplyingPoints(false);
  };

  const handleAddressSubmit = async (e) => {
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

    if (!shippingAddress.state.trim()) {
      alert('Please select a state');
      return;
    }

    if (!shippingAddress.district.trim()) {
      alert('Please select a district');
      return;
    }

    if (!shippingAddress.municipality.trim()) {
      alert('Please select a municipality');
      return;
    }

    if (!shippingAddress.landmark.trim()) {
      alert('Please enter a landmark');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        alert('Please login to save address');
        return;
      }

      // Save address to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/customers/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': user._id
        },
        body: JSON.stringify({
          label: shippingAddress.addressLabel,
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          state: shippingAddress.state,
          district: shippingAddress.district,
          municipality: shippingAddress.municipality,
          landmark: shippingAddress.landmark,
          isDefault: shippingAddress.isDefault
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses);
        setSelectedAddressIndex(data.addresses.length - 1);
        setAddressConfirmed(true); // Mark as confirmed when new address is saved

        // Save confirmed address to localStorage
        localStorage.setItem('confirmedCheckoutAddress', JSON.stringify(shippingAddress));

        setShowAddressForm(false);
        setShowAddressModal(false); // Close modal after saving
        alert('Address saved successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleSelectAddress = (index) => {
    setSelectedAddressIndex(index);
    const addr = savedAddresses[index];
    setShippingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLabel: addr.label || 'Home',
      state: addr.state,
      district: addr.district,
      municipality: addr.municipality,
      landmark: addr.landmark,
      isDefault: addr.isDefault
    });
  };

  const handleEditAddress = (index) => {
    const addr = savedAddresses[index];
    setShippingAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLabel: addr.label || 'Home',
      state: addr.state,
      district: addr.district,
      municipality: addr.municipality,
      landmark: addr.landmark,
      isDefault: addr.isDefault
    });
    setShowAddressForm(true);
  };

  const handleConfirmAddress = () => {
    // If an address is already selected, confirm it
    if (selectedAddressIndex !== null) {
      setAddressConfirmed(true);
      setShowAddressModal(false);

      // Save confirmed address to localStorage
      localStorage.setItem('confirmedCheckoutAddress', JSON.stringify(shippingAddress));
    }
    // If no address is selected but there's a default address loaded, use it
    else if (shippingAddress.fullName && shippingAddress.state) {
      setAddressConfirmed(true);
      setShowAddressModal(false);

      // Save confirmed address to localStorage
      localStorage.setItem('confirmedCheckoutAddress', JSON.stringify(shippingAddress));
    }
    // Otherwise, show error
    else {
      alert('Please select an address first');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    // Check if address is filled
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      alert('Please add a delivery address first');
      setShowAddressModal(true);
      return;
    }
  };

  const handleEsewaPayment = async (orderId) => {
    try {
      setPaymentProcessing(true);

      // Call backend to initiate payment
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (data.success && data.paymentUrl && data.paymentData) {
        // Create form and submit to eSewa
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;

        Object.keys(data.paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.paymentData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        alert('eSewa payment gateway is currently unavailable. Please use Cash on Delivery (COD) instead.');
        setPaymentProcessing(false);
        // Auto-switch to COD
        setPaymentMethod('cod');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('eSewa service is currently unavailable. Please use Cash on Delivery (COD) instead.');
      setPaymentProcessing(false);
      // Auto-switch to COD
      setPaymentMethod('cod');
    }
  };

  const handleKhaltiPayment = async (orderId) => {
    // Khalti removed - only COD and eSewa supported
    alert('Khalti payment is not available. Please use eSewa or Cash on Delivery.');
  };

  const handlePlaceOrder = async () => {
    // Check if address is filled
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.state || !shippingAddress.district || !shippingAddress.municipality || !shippingAddress.landmark) {
      alert('Please add a delivery address first by clicking the "+ Add New Delivery Address" button');
      setShowAddressModal(true);
      setShowAddressForm(true);
      // Reset form to blank
      setShippingAddress({
        fullName: '',
        phone: '+977',
        addressLabel: 'Home',
        state: '',
        district: '',
        municipality: '',
        landmark: '',
        isDefault: false
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user || !user._id) {
        alert('Please login to place an order');
        navigate('/login');
        return;
      }

      // Prepare order data for backend with new address format
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
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          state: shippingAddress.state,
          district: shippingAddress.district,
          municipality: shippingAddress.municipality,
          landmark: shippingAddress.landmark,
          label: shippingAddress.addressLabel
        },
        paymentMethod,
        subtotal: calculateTotal(),
        shippingCost,
        pointsRedeemed: pointsToRedeem,
        pointsDiscount: pointsDiscount,
        total: finalTotal,
        customerNotes: ''
      };

      console.log('Creating order with data:', orderData);

      // Create order in backend first
      const response = await orderAPI.create(orderData);

      if (!response || !response.order) {
        throw new Error('Invalid response from server');
      }

      const orderId = response.order._id;

      console.log('Order created successfully! Order ID:', orderId);
      console.log('Full order details:', response.order);

      // Store order ID in localStorage for manual verification
      localStorage.setItem('lastOrderId', orderId);

      // Handle payment based on method
      if (paymentMethod === 'esewa') {
        await handleEsewaPayment(orderId);
        return;
      } else if (paymentMethod === 'khalti') {
        await handleKhaltiPayment(orderId);
        return;
      }

      // For COD, complete order directly
      completeOrderSuccess(response.order);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message || 'Please try again'}`);
    }
  };

  const completeOrderSuccess = async (order) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      // Save order to localStorage for immediate display
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        id: order._id,
        items: cartItems,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          state: shippingAddress.state,
          district: shippingAddress.district,
          municipality: shippingAddress.municipality,
          landmark: shippingAddress.landmark,
          label: shippingAddress.addressLabel
        },
        paymentMethod,
        total: finalTotal,
        date: new Date().toISOString(),
        status: order.status || 'Processing',
        paymentStatus: order.paymentStatus || 'Pending',
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      });
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart from localStorage
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Clear buyNowItem from localStorage (if it exists)
      localStorage.removeItem('buyNowItem');

      // Clear cart from backend database
      if (user && user._id) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/cart/${user._id}/clear`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('Backend cart cleared:', response.ok);
        } catch (error) {
          console.error('Error clearing backend cart:', error);
        }
      }

      // Reload loyalty points to reflect the deduction
      if (pointsToRedeem > 0) {
        await loadLoyaltyPoints();
      }

      setOrderPlaced(true);

      setTimeout(() => {
        navigate('/profile?tab=orders');
      }, 3000);
    } catch (error) {
      console.error('Error in completeOrderSuccess:', error);
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

        <div className="checkout-content">
          <div className="checkout-main">
            {/* Address Section - Always show something */}
            {addressConfirmed && shippingAddress.fullName && shippingAddress.state ? (
              /* Show confirmed address with Change button */
              <div className="selected-address-compact">
                <div className="address-info">
                  <div className="address-header-compact">
                    <FiMapPin className="address-icon" />
                    <div className="address-details">
                      <p className="deliver-to">Deliver To: <strong>{shippingAddress.fullName}</strong> ({shippingAddress.phone})</p>
                      <p className="address-text">{shippingAddress.landmark}, {shippingAddress.municipality}, {shippingAddress.district} - {shippingAddress.state}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  setShowAddressModal(true);
                  setShowAddressForm(false);
                }} className="change-btn-compact">
                  Change
                </button>
              </div>
            ) : (
              /* Show Add Address button */
              <button className="add-address-btn" onClick={() => {
                // Reset form to blank when adding new address
                setShippingAddress({
                  fullName: '',
                  phone: '+977',
                  addressLabel: 'Home',
                  state: '',
                  district: '',
                  municipality: '',
                  landmark: '',
                  isDefault: false
                });
                setShowAddressModal(true);
                setShowAddressForm(false);
              }}>
                <FiMapPin />
                <span>+ Add New Delivery Address</span>
              </button>
            )}

            {/* Product List */}
            <div className="checkout-section">
              <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '20px', fontWeight: '600' }}>Order Items</h2>
              {Array.isArray(cartItems) && cartItems.map((item, index) => (
                <div key={item.id || index} className="product-card-checkout">
                  <img
                    src={item.image || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg'}
                    alt={item.name || item.productName || 'Product'}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
                    }}
                  />
                  <div className="product-card-details">
                    <h4>{item.name || item.productName || 'Product'}</h4>
                    <p className="qty">Qty: {item.quantity || 1}</p>
                  </div>
                  <div className="product-card-price">
                    <span className="current-price">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="original-price">Rs. {(item.originalPrice * (item.quantity || 1)).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="checkout-sidebar">
            {/* Loyalty Points Section */}
            {loyaltyPoints > 0 && (
              <div className="loyalty-points-section">
                <div className="loyalty-header">
                  <h3>🎁 Loyalty Points</h3>
                  <span className="points-badge">{loyaltyPoints} points</span>
                </div>
                <p className="points-info">You have {loyaltyPoints} loyalty points available (Rs. {loyaltyPoints})</p>

                {!applyingPoints ? (
                  <button
                    className="apply-points-btn"
                    onClick={handleApplyPoints}
                    disabled={loyaltyPoints === 0}
                  >
                    Apply Points
                  </button>
                ) : (
                  <div className="points-applied">
                    <div className="applied-info">
                      <FiCheck className="check-icon" />
                      <span>{pointsToRedeem} points applied (Rs. {pointsToRedeem} discount)</span>
                    </div>
                    <button
                      className="remove-points-btn"
                      onClick={handleRemovePoints}
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method */}
            <div className="order-summary">
              <h2>Select A Payment Method</h2>

              {/* eSewa Status Notice */}
              <div style={{
                padding: '12px',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '13px',
                color: '#856404'
              }}>
                ℹ️ Note: If eSewa environment is temporarily unavailable, we recommend using Cash on Delivery (COD) for a smooth checkout experience.
              </div>

              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="option-content">
                    <div className="option-icon">
                      <FiPackage style={{ fontSize: '24px', color: '#00bcd4' }} />
                    </div>
                    <div>
                      <h3>Cash on Delivery (COD)</h3>
                    </div>
                  </div>
                </label>

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
                      <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" style={{ width: '50px' }} />
                    </div>
                    <div>
                      <h3>eSewa</h3>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary" style={{ marginTop: '20px' }}>
              <h2>Order Summary</h2>
              <div className="summary-totals">
                <div className="total-row">
                  <span>Items Total</span>
                  <span>Rs. {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                {getBundleDiscount() > 0 && (
                  <div className="total-row" style={{ color: '#10b981' }}>
                    <span>Bundle Discount</span>
                    <span>- Rs. {getBundleDiscount().toLocaleString()}</span>
                  </div>
                )}
                <div className="total-row">
                  <span>Delivery Charge</span>
                  <span>{shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost}`}</span>
                </div>
                {shippingCost === 0 && (
                  <p className="free-shipping-note">🎉 You got free shipping!</p>
                )}
                {pointsToRedeem > 0 && (
                  <div className="total-row discount-row">
                    <span>Loyalty Points Discount</span>
                    <span className="discount-amount">- Rs. {pointsDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>Total Payment</span>
                  <span>Rs. {finalTotal.toLocaleString()}</span>
                </div>
                {pointsToRedeem > 0 && (
                  <p className="savings-note">💰 You saved Rs. {pointsDiscount} with loyalty points!</p>
                )}
                {getBundleDiscount() > 0 && (
                  <p className="savings-note" style={{ color: '#10b981' }}>🎁 You saved Rs. {getBundleDiscount().toLocaleString()} with bundle deals!</p>
                )}
              </div>

              <button onClick={handlePlaceOrder} className="place-order-btn">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address List Modal - Shows when no form is open */}
      {showAddressModal && !showAddressForm && (
        <div className="address-modal-overlay" onClick={(e) => {
          if (e.target.className === 'address-modal-overlay') {
            setShowAddressModal(false);
          }
        }}>
          <div className="address-modal">
            <div className="address-modal-header">
              <h2>Select Your Shipping Address</h2>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="address-modal-body">
              {/* Always show Add New Address button */}
              <button className="add-new-address-btn" onClick={() => {
                // Reset form to blank when adding new address
                setShippingAddress({
                  fullName: '',
                  phone: '+977',
                  addressLabel: 'Home',
                  state: '',
                  district: '',
                  municipality: '',
                  landmark: '',
                  isDefault: false
                });
                setShowAddressForm(true);
              }}>
                <FiMapPin />
                <span>Add New Address</span>
              </button>

              {/* Show saved addresses if any exist */}
              {savedAddresses.length > 0 && (
                <>
                  <div className="saved-addresses-list">
                    {savedAddresses.map((addr, index) => (
                      <div
                        key={index}
                        className={`saved-address-card ${selectedAddressIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSelectAddress(index)}
                      >
                        <div className="address-content">
                          <h4>{addr.fullName}</h4>
                          <p>{addr.phone}</p>
                          <p>{addr.state}, {addr.district}, {addr.municipality}</p>
                          <p>{addr.landmark}</p>
                          {addr.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(index);
                          }}
                          className="edit-address-btn"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Show confirm button if address is selected OR if there's a default address */}
                  {(selectedAddressIndex !== null || (shippingAddress.fullName && shippingAddress.state)) && (
                    <button className="confirm-address-btn" onClick={handleConfirmAddress}>
                      Confirm Address
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="address-modal-overlay" onClick={(e) => {
          if (e.target.className === 'address-modal-overlay') {
            setShowAddressForm(false);
          }
        }}>
          <div className="address-modal">
            <div className="address-modal-header">
              <button className="back-to-list-btn" onClick={() => setShowAddressForm(false)}>
                <FiArrowLeft />
              </button>
              <h2>Add New Delivery Address</h2>
              <button className="modal-close" onClick={() => {
                setShowAddressForm(false);
                setShowAddressModal(false);
              }}>
                <FiX />
              </button>
            </div>

            <div className="address-modal-body">
              <form onSubmit={handleAddressSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Primary Number *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="+977"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Select a label for effective delivery</label>
                  <div className="label-options">
                    <button
                      type="button"
                      className={`label-btn ${shippingAddress.addressLabel === 'Home' ? 'active' : ''}`}
                      onClick={() => setShippingAddress({ ...shippingAddress, addressLabel: 'Home' })}
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      className={`label-btn ${shippingAddress.addressLabel === 'Office' ? 'active' : ''}`}
                      onClick={() => setShippingAddress({ ...shippingAddress, addressLabel: 'Office' })}
                    >
                      Office
                    </button>
                    <button
                      type="button"
                      className={`label-btn ${shippingAddress.addressLabel === 'Other' ? 'active' : ''}`}
                      onClick={() => setShippingAddress({ ...shippingAddress, addressLabel: 'Other' })}
                    >
                      Other
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <div className="address-selects-compact">
                    <select
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      required
                    >
                      <option value="">Select State</option>
                      <option value="Province 1">Province 1</option>
                      <option value="Madhesh">Madhesh</option>
                      <option value="Bagmati">Bagmati</option>
                      <option value="Gandaki">Gandaki</option>
                      <option value="Lumbini">Lumbini</option>
                      <option value="Karnali">Karnali</option>
                      <option value="Sudurpashchim">Sudurpashchim</option>
                    </select>
                    <select
                      value={shippingAddress.district}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                      required
                    >
                      <option value="">Select District</option>
                      <option value="Kathmandu">Kathmandu</option>
                      <option value="Lalitpur">Lalitpur</option>
                      <option value="Bhaktapur">Bhaktapur</option>
                    </select>
                    <select
                      value={shippingAddress.municipality}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, municipality: e.target.value })}
                      required
                    >
                      <option value="">Select Municipality</option>
                      <option value="Kathmandu Metropolitan">Kathmandu Metropolitan</option>
                      <option value="Lalitpur Metropolitan">Lalitpur Metropolitan</option>
                      <option value="Bhaktapur Municipality">Bhaktapur Municipality</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Landmark *</label>
                  <input
                    type="text"
                    value={shippingAddress.landmark}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                    placeholder="Near landmark or building"
                    required
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={shippingAddress.isDefault}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, isDefault: e.target.checked })}
                    />
                    <span>Set as Default Shipping Address</span>
                  </label>
                </div>

                <button type="submit" className="continue-btn">
                  SAVE ADDRESS
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => {
                  setShowEsewaModal(false);
                  setPaymentProcessing(false);
                }}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? 'Processing...' : 'Close'}
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
