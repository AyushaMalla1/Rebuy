import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiHeart, FiSettings, FiLogOut, FiEdit2, FiSave, FiX, FiHome, FiPackage, FiRefreshCw, FiTruck, FiStar, FiAward, FiGift, FiMessageSquare, FiSend } from 'react-icons/fi';
import './BuyerProfile.css';

function BuyerProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [editData, setEditData] = useState({ ...userData });

  // Sample orders data with detailed tracking
  const [orders] = useState([
    { 
      id: '#ORD-001', 
      date: '2026-03-01', 
      total: 8500, 
      status: 'Delivered', 
      items: 2,
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2026-03-05',
      paymentMethod: 'Online Payment',
      shippingAddress: 'Kathmandu, Nepal',
      products: [
        { name: 'Vintage Jacket', quantity: 1, price: 8000 },
        { name: 'T-Shirt', quantity: 1, price: 500 }
      ]
    },
    { 
      id: '#ORD-002', 
      date: '2026-02-28', 
      total: 5200, 
      status: 'Shipped', 
      items: 1,
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2026-03-06',
      paymentMethod: 'Cash on Delivery',
      shippingAddress: 'Lalitpur, Nepal',
      products: [
        { name: 'Hoodie', quantity: 1, price: 5200 }
      ]
    },
    { 
      id: '#ORD-003', 
      date: '2026-02-25', 
      total: 12000, 
      status: 'Processing', 
      items: 3,
      trackingNumber: 'Pending',
      estimatedDelivery: '2026-03-08',
      paymentMethod: 'Online Payment',
      shippingAddress: 'Pokhara, Nepal',
      products: [
        { name: 'Blazer', quantity: 2, price: 6200 },
        { name: 'Jeans', quantity: 1, price: 5800 }
      ]
    },
  ]);

  // Sample wishlist data
  const [wishlist] = useState([
    { id: 1, name: 'Vintage Jacket', price: 8000, image: 'https://i.pinimg.com/1200x/06/56/44/065644e9485e9b7010771873bc5b61c8.jpg' },
    { id: 2, name: 'Hoodie', price: 5100, image: 'https://i.pinimg.com/1200x/85/50/eb/8550eb7065f3ae9b2617558814ff21f7.jpg' },
    { id: 3, name: 'Blazer', price: 3100, image: 'https://i.pinimg.com/736x/f5/6e/01/f56e016ac0abff71aff30bf64cab7b83.jpg' },
  ]);

  // Address Book
  const [addresses, setAddresses] = useState([
    { id: 1, name: 'Home', fullName: 'John Doe', phone: '+977 9812345678', address: 'Kathmandu, Thamel', city: 'Kathmandu', isDefault: true },
    { id: 2, name: 'Office', fullName: 'John Doe', phone: '+977 9812345678', address: 'Lalitpur, Patan', city: 'Lalitpur', isDefault: false },
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    isDefault: false
  });

  // Chat/Messages
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [chats] = useState([
    { 
      id: 1, 
      sellerName: 'Fashion Store', 
      sellerAvatar: 'FS',
      lastMessage: 'Is this item still available?',
      time: '2 hours ago',
      unread: 2,
      messages: [
        { id: 1, sender: 'buyer', text: 'Hi, is this jacket still available?', time: '10:30 AM' },
        { id: 2, sender: 'seller', text: 'Yes, it is! Would you like to know more details?', time: '10:32 AM' },
        { id: 3, sender: 'buyer', text: 'What size is it?', time: '10:35 AM' },
        { id: 4, sender: 'seller', text: 'It\'s size M. We also have L available.', time: '10:36 AM' },
      ]
    },
    { 
      id: 2, 
      sellerName: 'Vintage Closet', 
      sellerAvatar: 'VC',
      lastMessage: 'Thank you for your purchase!',
      time: '1 day ago',
      unread: 0,
      messages: [
        { id: 1, sender: 'buyer', text: 'When will my order ship?', time: 'Yesterday 3:20 PM' },
        { id: 2, sender: 'seller', text: 'Your order will ship today! Tracking number will be sent soon.', time: 'Yesterday 3:25 PM' },
        { id: 3, sender: 'seller', text: 'Thank you for your purchase!', time: 'Yesterday 3:26 PM' },
      ]
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const data = {
        fullName: user.fullName || 'John Doe',
        email: user.email || 'john.doe@example.com',
        phone: user.phone || '+977 9812345678',
        address: user.address || 'Kathmandu, Nepal',
        city: user.city || 'Kathmandu'
      };
      setUserData(data);
      setEditData(data);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
  };

  const handleSave = () => {
    setUserData({ ...editData });
    const user = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...user, ...editData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
    setEditingAddress(null);
    setNewAddress({
      name: '',
      fullName: '',
      phone: '',
      address: '',
      city: '',
      isDefault: false
    });
  };

  const handleEditAddress = (address) => {
    setShowAddressForm(true);
    setEditingAddress(address.id);
    setNewAddress(address);
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress ? { ...newAddress, id: editingAddress } : addr
      ));
    } else {
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      setAddresses([...addresses, { ...newAddress, id: newId }]);
    }
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      default: return '';
    }
  };

  return (
    <div className="buyer-profile-page">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <h2>My Account</h2>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-items">
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              <FiUser /> Profile
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => setActiveTab('orders')}
            >
              <FiShoppingBag /> Orders
            </button>
            <button 
              className={activeTab === 'wishlist' ? 'active' : ''} 
              onClick={() => setActiveTab('wishlist')}
            >
              <FiHeart /> Wishlist
            </button>
            <button 
              className={activeTab === 'messages' ? 'active' : ''} 
              onClick={() => setActiveTab('messages')}
            >
              <FiMessageSquare /> Messages
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings /> Settings
            </button>
          </div>
          <div className="menu-footer">
            <button onClick={() => navigate('/')} className="home-menu-btn">
              <FiHome /> Back to Home
            </button>
            <button onClick={handleLogout} className="logout-menu-btn">
              <FiLogOut /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="profile-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h1>My Profile</h1>
            </div>

            {/* User Info Card */}
            <div className="profile-card user-info-card">
              <div className="user-avatar">
                <FiUser size={60} />
              </div>
              <div className="user-details">
                <h2>{userData.fullName}</h2>
                <p>{userData.email}</p>
                <p>{userData.phone}</p>
              </div>
            </div>

            {/* Order Status Cards */}
            <div className="order-status-grid">
              <div className="status-card">
                <div className="status-icon-wrapper payment">
                  <FiShoppingBag className="status-icon" />
                </div>
                <h3>To Pay</h3>
                <p className="status-count">2</p>
                <span className="status-desc">Pending Payment</span>
              </div>
              <div className="status-card">
                <div className="status-icon-wrapper shipping">
                  <FiPackage className="status-icon" />
                </div>
                <h3>To Ship</h3>
                <p className="status-count">1</p>
                <span className="status-desc">Processing</span>
              </div>
              <div className="status-card">
                <div className="status-icon-wrapper delivery">
                  <FiTruck className="status-icon" />
                </div>
                <h3>To Receive</h3>
                <p className="status-count">3</p>
                <span className="status-desc">In Transit</span>
              </div>
              <div className="status-card">
                <div className="status-icon-wrapper review">
                  <FiStar className="status-icon" />
                </div>
                <h3>To Review</h3>
                <p className="status-count">5</p>
                <span className="status-desc">Completed</span>
              </div>
            </div>

            {/* Wishlist Preview */}
            <div className="profile-card">
              <div className="card-header">
                <h3><FiHeart /> My Wishlist</h3>
                <button className="view-all-btn" onClick={() => setActiveTab('wishlist')}>View All</button>
              </div>
              <div className="wishlist-preview">
                {wishlist.slice(0, 3).map(item => (
                  <div key={item.id} className="wishlist-preview-item">
                    <img src={item.image} alt={item.name} />
                    <p>{item.name}</p>
                    <span>Rs. {item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Return & Cancellation */}
            <div className="profile-card">
              <h3>Return & Cancellation</h3>
              <div className="action-list">
                <div className="action-item">
                  <FiRefreshCw />
                  <div>
                    <h4>Return Request</h4>
                    <p>Request a return for your order</p>
                  </div>
                  <button className="action-btn">Request</button>
                </div>
                <div className="action-item">
                  <FiX />
                  <div>
                    <h4>Cancel Order</h4>
                    <p>Cancel your pending orders</p>
                  </div>
                  <button className="action-btn">Cancel</button>
                </div>
              </div>
            </div>

            {/* Loyalty Points & Rewards */}
            <div className="profile-card loyalty-card">
              <h3><FiAward /> Loyalty Points & Rewards</h3>
              <div className="loyalty-content">
                <div className="points-display">
                  <div className="points-circle">
                    <FiGift className="points-icon" />
                    <span className="points-number">1,250</span>
                    <span className="points-label">Points</span>
                  </div>
                </div>
                <div className="rewards-list">
                  <div className="reward-item">
                    <div className="reward-icon-wrapper welcome">
                      <FiGift className="reward-icon-svg" />
                    </div>
                    <div>
                      <h4>Welcome Bonus</h4>
                      <p>500 points earned</p>
                    </div>
                  </div>
                  <div className="reward-item">
                    <div className="reward-icon-wrapper purchase">
                      <FiStar className="reward-icon-svg" />
                    </div>
                    <div>
                      <h4>Purchase Rewards</h4>
                      <p>750 points earned</p>
                    </div>
                  </div>
                  <button className="redeem-btn">
                    <FiAward /> Redeem Points
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h1>My Orders</h1>
            </div>

            <div className="orders-grid">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>{order.id}</h3>
                      <span className="order-date">{order.date}</span>
                    </div>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-body">
                    <div className="order-info-row">
                      <span className="info-label">Items:</span>
                      <span className="info-value">{order.items} items</span>
                    </div>
                    <div className="order-info-row">
                      <span className="info-label">Total:</span>
                      <span className="info-value total">Rs. {order.total.toLocaleString()}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="info-label">Payment:</span>
                      <span className="info-value">{order.paymentMethod}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="info-label">Tracking:</span>
                      <span className="info-value tracking">{order.trackingNumber}</span>
                    </div>
                    {order.status !== 'Delivered' && (
                      <div className="order-info-row">
                        <span className="info-label">Est. Delivery:</span>
                        <span className="info-value">{order.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      View Details
                    </button>
                    {order.status === 'Delivered' && (
                      <button className="verify-btn">Verify Condition</button>
                    )}
                    {order.status === 'Processing' && (
                      <button className="cancel-order-btn">Cancel Order</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
              <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Order Details - {selectedOrder.id}</h2>
                    <button className="close-modal" onClick={() => setShowOrderDetails(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="detail-section">
                      <h4>Order Status</h4>
                      <div className="tracking-timeline">
                        <div className={`timeline-step ${['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                          <div className="step-icon">📦</div>
                          <div className="step-info">
                            <strong>Order Placed</strong>
                            <span>{selectedOrder.date}</span>
                          </div>
                        </div>
                        <div className={`timeline-step ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                          <div className="step-icon">🚚</div>
                          <div className="step-info">
                            <strong>Shipped</strong>
                            <span>{selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? 'In Transit' : 'Pending'}</span>
                          </div>
                        </div>
                        <div className={`timeline-step ${selectedOrder.status === 'Delivered' ? 'completed' : ''}`}>
                          <div className="step-icon">✅</div>
                          <div className="step-info">
                            <strong>Delivered</strong>
                            <span>{selectedOrder.status === 'Delivered' ? 'Completed' : selectedOrder.estimatedDelivery}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Products</h4>
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="product-row">
                          <span>{product.name} x {product.quantity}</span>
                          <span>Rs. {product.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="detail-section">
                      <h4>Shipping Address</h4>
                      <p>{selectedOrder.shippingAddress}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Payment Method</h4>
                      <p>{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-section">
            <div className="section-header">
              <h1>My Wishlist</h1>
            </div>

            <div className="wishlist-grid">
              {wishlist.map(item => (
                <div key={item.id} className="wishlist-card">
                  <img src={item.image} alt={item.name} />
                  <div className="wishlist-info">
                    <h3>{item.name}</h3>
                    <p className="price">Rs. {item.price.toLocaleString()}</p>
                    <div className="wishlist-actions">
                      <button className="add-cart-btn">Add to Cart</button>
                      <button className="remove-btn">
                        <FiX /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-section">
            <div className="section-header">
              <h1>Messages</h1>
            </div>

            <div className="messages-container">
              {/* Chat List */}
              <div className="chat-list">
                <div className="chat-list-header">
                  <h3>Conversations</h3>
                </div>
                {chats.map(chat => (
                  <div 
                    key={chat.id} 
                    className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar">{chat.sellerAvatar}</div>
                    <div className="chat-info">
                      <div className="chat-header-row">
                        <h4>{chat.sellerName}</h4>
                        <span className="chat-time">{chat.time}</span>
                      </div>
                      <p className="chat-last-message">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="unread-badge">{chat.unread}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Window */}
              <div className="chat-window">
                {selectedChat ? (
                  <>
                    <div className="chat-window-header">
                      <div className="seller-info">
                        <div className="chat-avatar">{selectedChat.sellerAvatar}</div>
                        <div>
                          <h3>{selectedChat.sellerName}</h3>
                          <span className="online-status">Online</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat-messages">
                      {selectedChat.messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                          <div className="message-bubble">
                            <p>{msg.text}</p>
                            <span className="message-time">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="chat-input-container">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && messageText.trim()) {
                            // Handle send message
                            setMessageText('');
                          }
                        }}
                      />
                      <button className="send-btn">
                        <FiSend />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <FiMessageSquare size={64} />
                    <h3>Select a conversation</h3>
                    <p>Choose a seller from the list to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="section-header">
              <h1>Account Settings</h1>
            </div>

            {/* Personal Information */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                  <button className="edit-btn-small" onClick={handleEdit}>
                    <FiEdit2 /> Edit
                  </button>
                ) : (
                  <div className="edit-actions-inline">
                    <button className="save-btn-small" onClick={handleSave}>
                      <FiSave /> Save
                    </button>
                    <button className="cancel-btn-small" onClick={handleCancel}>
                      <FiX /> Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="info-grid">
                <div className="info-field">
                  <label><FiUser /> Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.fullName}</p>
                  )}
                </div>

                <div className="info-field">
                  <label><FiMail /> Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.email}</p>
                  )}
                </div>

                <div className="info-field">
                  <label><FiPhone /> Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.phone}</p>
                  )}
                </div>

                <div className="info-field">
                  <label><FiMapPin /> City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={editData.city}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.city}</p>
                  )}
                </div>

                <div className="info-field full-width">
                  <label><FiMapPin /> Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={editData.address}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Book */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Address Book</h3>
                <button className="edit-btn-small" onClick={handleAddAddress}>
                  <FiMapPin /> Add New Address
                </button>
              </div>

              {showAddressForm && (
                <div className="address-form">
                  <h4>{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Label (e.g., Home, Office)</label>
                      <input
                        type="text"
                        name="name"
                        value={newAddress.name}
                        onChange={handleAddressChange}
                        placeholder="Home"
                      />
                    </div>
                    <div className="form-field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={newAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="+977 9812345678"
                      />
                    </div>
                    <div className="form-field">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        placeholder="Kathmandu"
                      />
                    </div>
                    <div className="form-field full-width">
                      <label>Full Address</label>
                      <input
                        type="text"
                        name="address"
                        value={newAddress.address}
                        onChange={handleAddressChange}
                        placeholder="Street, Area, Landmark"
                      />
                    </div>
                    <div className="form-field full-width">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={newAddress.isDefault}
                          onChange={handleAddressChange}
                        />
                        Set as default address
                      </label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="save-btn-small" onClick={handleSaveAddress}>
                      <FiSave /> Save Address
                    </button>
                    <button className="cancel-btn-small" onClick={() => setShowAddressForm(false)}>
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="address-list">
                {addresses.map(address => (
                  <div key={address.id} className="address-card">
                    <div className="address-header">
                      <div className="address-label">
                        <span className="label-name">{address.name}</span>
                        {address.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <div className="address-actions">
                        <button className="icon-btn" onClick={() => handleEditAddress(address)}>
                          <FiEdit2 />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDeleteAddress(address.id)}>
                          <FiX />
                        </button>
                      </div>
                    </div>
                    <div className="address-details">
                      <p className="address-name">{address.fullName}</p>
                      <p className="address-phone">{address.phone}</p>
                      <p className="address-text">{address.address}, {address.city}</p>
                    </div>
                    {!address.isDefault && (
                      <button 
                        className="set-default-btn" 
                        onClick={() => handleSetDefaultAddress(address.id)}
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-card">
              <h3>Password & Security</h3>
              <div className="setting-item">
                <div>
                  <h4>Change Password</h4>
                  <p>Update your password regularly to keep your account secure</p>
                </div>
                <button className="setting-btn">Change</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="setting-btn">Enable</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Login Activity</h4>
                  <p>View recent login history and active sessions</p>
                </div>
                <button className="setting-btn">View Activity</button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Notifications</h3>
              <div className="setting-item">
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive updates about your orders and promotions</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>SMS Notifications</h4>
                  <p>Get order updates via SMS</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications on your device</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Order Status Updates</h4>
                  <p>Get notified when your order status changes</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Promotional Emails</h4>
                  <p>Receive special offers and discount codes</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-card">
              <h3>Privacy & Data</h3>
              <div className="setting-item">
                <div>
                  <h4>Profile Visibility</h4>
                  <p>Control who can see your profile information</p>
                </div>
                <select className="setting-select">
                  <option>Public</option>
                  <option>Private</option>
                  <option>Friends Only</option>
                </select>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Purchase History Visibility</h4>
                  <p>Show or hide your purchase history from others</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Data Sharing</h4>
                  <p>Allow sharing data with partners for better experience</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Download My Data</h4>
                  <p>Get a copy of all your account data</p>
                </div>
                <button className="setting-btn">Download</button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Payment & Billing</h3>
              <div className="setting-item">
                <div>
                  <h4>Saved Payment Methods</h4>
                  <p>Manage your saved cards and payment options</p>
                </div>
                <button className="setting-btn">Manage</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Billing Address</h4>
                  <p>Update your default billing address</p>
                </div>
                <button className="setting-btn">Edit</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Transaction History</h4>
                  <p>View all your payment transactions</p>
                </div>
                <button className="setting-btn">View</button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Language & Region</h3>
              <div className="setting-item">
                <div>
                  <h4>Language</h4>
                  <p>Choose your preferred language</p>
                </div>
                <select className="setting-select">
                  <option>English</option>
                  <option>Nepali</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Currency</h4>
                  <p>Select your preferred currency</p>
                </div>
                <select className="setting-select">
                  <option>NPR (Rs.)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Time Zone</h4>
                  <p>Set your local time zone</p>
                </div>
                <select className="setting-select">
                  <option>Asia/Kathmandu (GMT+5:45)</option>
                  <option>Asia/Kolkata (GMT+5:30)</option>
                  <option>UTC</option>
                </select>
              </div>
            </div>

            <div className="settings-card">
              <h3>Account Management</h3>
              <div className="setting-item">
                <div>
                  <h4>Deactivate Account</h4>
                  <p>Temporarily disable your account</p>
                </div>
                <button className="setting-btn">Deactivate</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all data</p>
                </div>
                <button className="setting-btn danger">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BuyerProfile;
