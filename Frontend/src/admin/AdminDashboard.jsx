import {
  FiUsers, FiShoppingBag, FiPackage, FiSettings, FiLogOut, FiShield, FiTrash2,
  FiCheckCircle, FiXCircle, FiSearch, FiBarChart2, FiActivity, FiClock,
  FiUserCheck, FiMonitor, FiAward, FiBell, FiMessageSquare, FiGrid, FiDollarSign
} from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import Chatbot from '../components/Chatbot';
import AdminOverviewTab from './AdminOverviewTab';
import AdminUsersTab from './AdminUsersTab';
import AdminProductsTab from './AdminProductsTab';
import AdminOrdersTab from './AdminOrdersTab';
import AdminSellerApprovalTab from './AdminSellerApprovalTab';
import AdminSalesTab from './AdminSalesTab';
import AdminAuditTab from './AdminAuditTab';
import AdminFraudDetectionTab from './AdminFraudDetectionTab';
import AdminVerificationsTab from './AdminVerificationsTab';
import AdminAnnouncementsTab from './AdminAnnouncementsTab';
import AdminLoyaltyTab from './AdminLoyaltyTab';
import AdminSupportTab from './AdminSupportTab';
import AdminPayoutsTab from './AdminPayoutsTab';
import AdminProfileTab from './AdminProfileTab';
import AdminSettingsTab from './AdminSettingsTab';
import { AdminDashboardProvider, useAdminDashboard } from './AdminDashboardContext';
import useAdminDashboardController from '../services/AdminDashboardController';
import './AdminDashboard.css';


function AdminDashboardContent() {
  const adminOrSellerDashboardContext = useAdminDashboard();
  const {
    activeTab,
    setActiveTab,
    handleLogout,
    showNotifications,
    setShowNotifications,
    unreadCount,
    notifications,
    loadingNotifications,
    markAllAsRead,
    handleNotificationClick,
    getNotificationIcon,
    formatNotificationTime,
    deleteNotification,
    searchQuery,
    setSearchQuery,
    handleSearch,
    setShowSearchResults,
    showSearchResults,
    searchResults,
    profileImage,
    profileData,
    selectedOrder,
    setSelectedOrder,
    showOrderModal,
    setShowOrderModal,
    selectedProduct,
    showProductModal,
    setShowProductModal,
    selectedUser,
    showUserModal,
    setShowUserModal,
    selectedSeller,
    showSellerModal,
    setShowSellerModal,
    selectedVerification,
    showVerificationModal,
    setShowVerificationModal,
    handleApproveVerification,
    handleRejectVerification
  } = adminOrSellerDashboardContext;


  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img 
            src="/logo.png" 
            alt="Rebuy" 
            className="sidebar-logo"
            onError={(e) => {
              console.error('Logo failed to load');
              e.target.style.display = 'none';
            }}
          />
          <h2></h2>
        </div>

        <nav className="sidebar-nav">
          <div className="menu-title">MAIN</div>
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            <FiGrid /> Dashboard
          </button>
          
          <div className="menu-title">MANAGEMENT</div>
          <button 
            className={activeTab === 'seller-approval' ? 'active' : ''} 
            onClick={() => setActiveTab('seller-approval')}
          >
            <FiUserCheck /> Seller Approval
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <FiUsers /> User Management
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''} 
            onClick={() => setActiveTab('products')}
          >
            <FiMonitor /> Product Monitoring
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingBag /> Orders
          </button>

          <div className="menu-title">ANALYTICS</div>
          <button 
            className={activeTab === 'sales' ? 'active' : ''} 
            onClick={() => setActiveTab('sales')}
          >
            <FiBarChart2 /> Sales & Reports
          </button>
          <button 
            className={activeTab === 'audit' ? 'active' : ''} 
            onClick={() => setActiveTab('audit')}
          >
            <FiClock /> Audit Log
          </button>

          <div className="menu-title">SECURITY</div>
          <button 
            className={activeTab === 'fraud-detection' ? 'active' : ''} 
            onClick={() => setActiveTab('fraud-detection')}
          >
            <FiShield /> Fraud Detection
          </button>

          <button 
            className={activeTab === 'verifications' ? 'active' : ''} 
            onClick={() => setActiveTab('verifications')}
          >
            <FiCheckCircle /> Verifications
          </button>

          <div className="menu-title">COMMUNICATION</div>
          <button 
            className={activeTab === 'announcements' ? 'active' : ''} 
            onClick={() => setActiveTab('announcements')}
          >
            <FiBell /> Announcements
          </button>
          
          <button 
            className={activeTab === 'support' ? 'active' : ''}
            onClick={() => setActiveTab('support')}
          >
            <FiMessageSquare /> Support Tickets
          </button>
          
          <div className="menu-title">REWARDS & FINANCE</div>
          <button 
            className={activeTab === 'loyalty' ? 'active' : ''} 
            onClick={() => setActiveTab('loyalty')}
          >
            <FiAward /> Loyalty Points
          </button>

          <button 
            className={activeTab === 'payouts' ? 'active' : ''} 
            onClick={() => setActiveTab('payouts')}
          >
            <FiDollarSign /> Payouts
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings /> Settings
          </button>
          
          <button 
            className="logout-menu-btn"
            onClick={handleLogout}
          >
            <FiLogOut /> Logout
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>
              {activeTab === 'overview' && 'Admin Dashboard'}
              {activeTab === 'seller-approval' && 'Seller Approval'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'products' && 'Product Monitoring'}
              {activeTab === 'orders' && 'Orders Management'}
              {activeTab === 'sales' && 'Sales & Reports'}
              {activeTab === 'audit' && 'Audit Log'}
              {activeTab === 'fraud-detection' && 'Fraud Detection'}
              {activeTab === 'verifications' && 'Condition Verifications'}
              {activeTab === 'announcements' && 'Announcements'}
              {activeTab === 'support' && 'Support Ticket Management'}
              {activeTab === 'loyalty' && 'Loyalty Points'}
              {activeTab === 'payouts' && 'Seller Payouts'}
              {activeTab === 'profile' && 'Admin Profile'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="header-subtitle">
              <FiActivity className="subtitle-icon" />
              {activeTab === 'overview' && 'Manage your e-commerce platform efficiently'}
              {activeTab === 'seller-approval' && 'Review and approve seller applications'}
              {activeTab === 'users' && 'Manage users and their accounts'}
              {activeTab === 'products' && 'Monitor and approve product listings'}
              {activeTab === 'orders' && 'Track and manage customer orders'}
              {activeTab === 'sales' && 'View sales analytics and reports'}
              {activeTab === 'audit' && 'View system activity logs'}
              {activeTab === 'fraud-detection' && 'Detect and prevent fraudulent activities'}
              {activeTab === 'verifications' && 'Review and approve customer verifications'}
              {activeTab === 'announcements' && 'Manage platform announcements'}
              {activeTab === 'support' && 'Manage customer and seller support requests'}
              {activeTab === 'loyalty' && 'Manage loyalty points program'}
              {activeTab === 'payouts' && 'Process seller payout requests'}
              {activeTab === 'profile' && 'Manage your admin account'}
              {activeTab === 'settings' && 'Configure platform settings'}
            </p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-btn"
                title="Notifications"
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-count-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown">
                  {/* Header */}
                  <div className="notification-header">
                    <h3 className="notification-header-title">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="notification-mark-read"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="notification-list">
                    {loadingNotifications ? (
                      <div className="notification-loading">
                        <div className="notification-loading-spinner"></div>
                        <p className="notification-loading-text">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-empty">
                        <div className="notification-empty-icon-wrapper">
                          <FiBell size={36} />
                        </div>
                        <h4 className="notification-empty-title">All caught up!</h4>
                        <p>You don't have any notifications right now</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`notification-item ${notif.isRead ? '' : 'unread'}`}
                        >
                          <div className="notification-content">
                            <div className={`notification-icon-wrapper ${notif.severity}`}>
                              {getNotificationIcon(notif.type, notif.severity)}
                            </div>
                            <div className="notification-body">
                              <h4 className="notification-title">
                                {notif.title}
                                <span className={`notification-type-badge ${notif.type}`}>
                                  {notif.type}
                                </span>
                              </h4>
                              <p className="notification-message">
                                {notif.message}
                              </p>
                              {notif.metadata && notif.metadata.customerNotes && (
                                <p className="notification-customer-notes">
                                  <strong>Customer notes:</strong> {notif.metadata.customerNotes}
                                </p>
                              )}
                              <div className="notification-footer">
                                <span className="notification-time">
                                  <FiClock size={10} />
                                  {formatNotificationTime(notif.createdAt)}
                                </span>
                                <button
                                  onClick={(e) => deleteNotification(notif._id, e)}
                                  className="notification-delete-btn"
                                >
                                  <FiTrash2 size={10} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="search-results-dropdown">
                  <div className="search-results-header">
                    <h4>Search Results</h4>
                    <button onClick={() => setShowSearchResults(false)} className="close-search-btn">
                      <FiXCircle />
                    </button>
                  </div>
                  
                  {searchResults.users.length === 0 && 
                   searchResults.products.length === 0 && 
                   searchResults.orders.length === 0 && 
                   searchResults.sellers.length === 0 ? (
                    <div className="no-search-results">
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="search-results-content">
                      {searchResults.users.length > 0 && (
                        <div className="search-category">
                          <h5>Users ({searchResults.users.length})</h5>
                          {searchResults.users.map(user => (
                            <div 
                              key={user.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('users');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <FiUsers className="result-icon" />
                              <div>
                                <p className="result-title">{user.name}</p>
                                <p className="result-subtitle">{user.email} • {user.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.products.length > 0 && (
                        <div className="search-category">
                          <h5>Products ({searchResults.products.length})</h5>
                          {searchResults.products.map(product => (
                            <div 
                              key={product.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('products');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <FiPackage className="result-icon" />
                              <div>
                                <p className="result-title">{product.name}</p>
                                <p className="result-subtitle">Rs. {product.price} • {product.seller}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.orders.length > 0 && (
                        <div className="search-category">
                          <h5>Orders ({searchResults.orders.length})</h5>
                          {searchResults.orders.map(order => (
                            <div 
                              key={order.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('orders');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <FiShoppingBag className="result-icon" />
                              <div>
                                <p className="result-title">{order.customer}</p>
                                <p className="result-subtitle">Rs. {order.amount} • {order.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.sellers.length > 0 && (
                        <div className="search-category">
                          <h5>Sellers ({searchResults.sellers.length})</h5>
                          {searchResults.sellers.map(seller => (
                            <div 
                              key={seller.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('seller-approval');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <MdStorefront className="result-icon" />
                              <div>
                                <p className="result-title">{seller.storeName}</p>
                                <p className="result-subtitle">{seller.name} • {seller.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="admin-info" onClick={() => setActiveTab('profile')} style={{cursor: 'pointer'}}>
              <div className="admin-avatar">
                {profileImage ? (
                  <img src={profileImage} alt={profileData.fullName} />
                ) : (
                  <FiShield />
                )}
              </div>
              <div className="admin-details">
                <p className="admin-name">{profileData.fullName}</p>
                <p className="admin-role">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && <AdminOverviewTab />}{activeTab === 'users' && <AdminUsersTab />}{activeTab === 'products' && <AdminProductsTab />}{activeTab === 'orders' && <AdminOrdersTab />}{activeTab === 'seller-approval' && <AdminSellerApprovalTab />}{activeTab === 'sales' && <AdminSalesTab />}{activeTab === 'audit' && <AdminAuditTab />}{activeTab === 'fraud-detection' && <AdminFraudDetectionTab />}{activeTab === 'verifications' && <AdminVerificationsTab />}{activeTab === 'announcements' && <AdminAnnouncementsTab />}{activeTab === 'loyalty' && <AdminLoyaltyTab />}{activeTab === 'support' && <AdminSupportTab />}{activeTab === 'payouts' && <AdminPayoutsTab />}{activeTab === 'profile' && <AdminProfileTab />}{activeTab === 'settings' && <AdminSettingsTab />}
      </main>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={() => setShowOrderModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Order ID:</label>
                    <span>#{selectedOrder._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Date:</label>
                    <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Payment Method:</label>
                    <span>{selectedOrder.paymentMethod?.toUpperCase()}</span>
                  </div>
                  <div className="info-item">
                    <label>Payment Status:</label>
                    <span className={`status-badge ${selectedOrder.paymentStatus?.toLowerCase()}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="info-item">
                      <label>Transaction ID:</label>
                      <span>{selectedOrder.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-info-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress?.fullName}</p>
                <p>{selectedOrder.shippingAddress?.address}</p>
                <p>{selectedOrder.shippingAddress?.city} {selectedOrder.shippingAddress?.postalCode}</p>
                <p>{selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="order-info-section">
                <h3>Order Items</h3>
                <div className="order-items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.productImage} alt={item.productName} />
                      <div className="item-info">
                        <h4>{item.productName}</h4>
                        <p>Seller: {item.sellerName}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        Rs. {item.subtotal?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-info-section">
                <h3>Order Summary</h3>
                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>Rs. {selectedOrder.shippingCost?.toLocaleString()}</span>
                  </div>
                  <div className="total-row final">
                    <span>Total:</span>
                    <span>Rs. {selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Product Details</h2>
              <button className="close-btn" onClick={() => setShowProductModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>Product Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Product ID:</label>
                    <span>#{selectedProduct._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Category:</label>
                    <span>{selectedProduct.category}</span>
                  </div>
                  <div className="info-item">
                    <label>Subcategory:</label>
                    <span>{selectedProduct.subcategory || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Price:</label>
                    <span>Rs. {selectedProduct.price?.toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Stock:</label>
                    <span>{selectedProduct.stock} units</span>
                  </div>
                  <div className="info-item">
                    <label>Size:</label>
                    <span>{selectedProduct.size}</span>
                  </div>
                  <div className="info-item">
                    <label>Condition:</label>
                    <span>{selectedProduct.condition}</span>
                  </div>
                  <div className="info-item">
                    <label>Brand:</label>
                    <span>{selectedProduct.brand || 'Unbranded'}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedProduct.status?.toLowerCase()}`}>
                      {selectedProduct.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Seller Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Seller Name:</label>
                    <span>{selectedProduct.sellerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Store Name:</label>
                    <span>{selectedProduct.storeName}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Description</h3>
                <p>{selectedProduct.description}</p>
              </div>

              {selectedProduct.story && (
                <div className="order-info-section">
                  <h3>Product Story</h3>
                  <p>{selectedProduct.story}</p>
                </div>
              )}

              <div className="order-info-section">
                <h3>Product Images</h3>
                <div className="product-images-grid">
                  {selectedProduct.images?.map((img, index) => (
                    <img key={index} src={img} alt={`Product ${index + 1}`} style={{width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px'}} />
                  ))}
                </div>
              </div>

              <div className="order-info-section">
                <h3>Payment Options</h3>
                <p>{selectedProduct.paymentOptions?.join(', ').toUpperCase() || 'N/A'}</p>
              </div>

              {selectedProduct.discount?.active && (
                <div className="order-info-section">
                  <h3>Discount</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Percentage:</label>
                      <span>{selectedProduct.discount.percentage}%</span>
                    </div>
                    <div className="info-item">
                      <label>Start Date:</label>
                      <span>{new Date(selectedProduct.discount.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <label>End Date:</label>
                      <span>{new Date(selectedProduct.discount.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>User Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>User ID:</label>
                    <span>#{selectedUser._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedUser.fullName || selectedUser.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="info-item">
                    <label>User Type:</label>
                    <span className={`type-badge ${selectedUser.userType?.toLowerCase()}`}>
                      {selectedUser.userType}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Joined Date:</label>
                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="order-info-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedUser.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.storeName && (
                <div className="order-info-section">
                  <h3>Seller Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Store Name:</label>
                      <span>{selectedUser.storeName}</span>
                    </div>
                    {selectedUser.address && (
                      <div className="info-item">
                        <label>Address:</label>
                        <span>{selectedUser.address}</span>
                      </div>
                    )}
                    {selectedUser.city && (
                      <div className="info-item">
                        <label>City:</label>
                        <span>{selectedUser.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {showSellerModal && selectedSeller && (
        <div className="modal-overlay" onClick={() => setShowSellerModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seller Details</h2>
              <button className="close-btn" onClick={() => setShowSellerModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>Seller Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Seller ID:</label>
                    <span>#{selectedSeller._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedSeller.fullName || selectedSeller.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedSeller.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedSeller.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedSeller.status}`}>
                      {selectedSeller.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Joined Date:</label>
                    <span>{new Date(selectedSeller.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Store Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Store Name:</label>
                    <span>{selectedSeller.storeName}</span>
                  </div>
                  <div className="info-item">
                    <label>Store Description:</label>
                    <span>{selectedSeller.storeDescription || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Address:</label>
                    <span>{selectedSeller.address}</span>
                  </div>
                  <div className="info-item">
                    <label>City:</label>
                    <span>{selectedSeller.city}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Performance Metrics</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Total Sales:</label>
                    <span className="sales-cell">Rs. {selectedSeller.totalSales?.toLocaleString() || 0}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Products:</label>
                    <span>{selectedSeller.totalProducts || 0}</span>
                  </div>
                  <div className="info-item">
                    <label>Rating:</label>
                    <span>⭐ {selectedSeller.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="info-item">
                    <label>Trust Score:</label>
                    <span className={`trust-badge ${selectedSeller.trustScore?.score >= 70 ? 'high' : selectedSeller.trustScore?.score >= 40 ? 'medium' : 'low'}`}>
                      {selectedSeller.trustScore?.score || 50}/100
                    </span>
                  </div>
                </div>
              </div>

              {selectedSeller.status === 'suspended' && selectedSeller.approvalData?.suspensionReason && (
                <div className="order-info-section">
                  <h3>Suspension Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Reason:</label>
                      <span>{selectedSeller.approvalData.suspensionReason}</span>
                    </div>
                    {selectedSeller.deactivatedAt && (
                      <div className="info-item">
                        <label>Suspended Date:</label>
                        <span>{new Date(selectedSeller.deactivatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

function AdminDashboard() {
  const dashboardContext = useAdminDashboardController();

  return (
    <AdminDashboardProvider value={dashboardContext}>
      <AdminDashboardContent />
    </AdminDashboardProvider>
  );
}

export default AdminDashboard;
