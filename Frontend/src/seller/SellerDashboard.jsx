import {
  FaBox, FaShoppingCart, FaDollarSign, FaChartBar, FaUser, FaCog, FaSignOutAlt,
  FaPlus, FaChartLine, FaTrash, FaBell, FaQuestionCircle, FaCheckCircle,
  FaTimesCircle, FaSearch, FaArchive, FaClock
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import Chatbot from '../components/Chatbot';
import SellerProductsTab from './SellerProductsTab';
import SellerOrdersTab from './SellerOrdersTab';
import SellerCustomerReturnsTab from './SellerCustomerReturnsTab';
import SellerVerificationsTab from './SellerVerificationsTab';
import SellerFinance from './SellerFinance';
import SellerInboxTab from './SellerInboxTab';
import SellerRevenueTab from './SellerRevenueTab';
import SellerPerformanceTab from './SellerPerformanceTab';
import SellerProfileTab from './SellerProfileTab';
import SellerHelpCenter from './SellerHelpCenter';
import SellerSettingsTab from './SellerSettingsTab';
import SellerOverviewTab from './SellerOverviewTab';
import { SellerDashboardProvider, useSellerDashboard } from './DashboardContext';
import './SellerDashboard.css';


function SellerDashboardContent() {
  const adminOrSellerDashboardContext = useSellerDashboard();
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
    globalSearch,
    setGlobalSearch,
    showSearchResults,
    searchResults,
    setShowSearchResults,
    loading,
    profileImage,
    sellerData,
    selectedOrder,
    setSelectedOrder,
    getShortOrderId,
    formatShippingAddress,
    getSellerOrderItems,
    getOrderProductImage,
    getOrderProductName,
    getSellerOrderAmount,
    selectedReturn,
    setSelectedReturn,
    getReturnOrderLabel,
    getReturnImage,
    handleReturnResponse,
    handleCompleteReturn,
    selectedVerification,
    setSelectedVerification,
    getVerificationProductName,
    getVerificationImage,
    showRestockModal,
    setShowRestockModal,
    restockProduct,
    restockQuantity,
    setRestockQuantity,
    handleRestockSubmit,
    show2FAModal,
    twoFAAction,
    setShow2FAModal,
    twoFAPassword,
    setTwoFAPassword,
    handleConfirm2FA,
    show2FASuccess,
    setShow2FASuccess,
    showLoginHistoryModal,
    setShowLoginHistoryModal,
    loginHistory,
    showChangePasswordModal,
    setShowChangePasswordModal,
    changePasswordData,
    setChangePasswordData,
    handleChangePassword,
    showPasswordSuccessModal,
    setShowPasswordSuccessModal
    , showEditModal
    , setShowEditModal
    , editingProduct
    , setEditingProduct
    , handleUpdateProduct
    , setRestockProduct
    , handleSelectMessage
  } = adminOrSellerDashboardContext;

  if (loading) {
    return (
      <div className="loading-state">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="seller-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <img src="/logo.png" alt="Rebuy" className="sidebar-logo-img" />

        <div className="menu-items-scrollable">
          <div
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <MdDashboard /> Dashboard
          </div>
          <div
            className={`menu-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBox /> Products
          </div>

          <div
            className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingCart /> Orders
          </div>

          <div
            className={`menu-item ${activeTab === 'customer-returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer-returns')}
          >
            <FaArchive /> Customer Returns
          </div>

          <div
            className={`menu-item ${activeTab === 'verifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('verifications')}
          >
            <FaCheckCircle /> Verifications
          </div>

          <div
            className={`menu-item ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            <FaDollarSign /> Finance
          </div>

          <div
            className={`menu-item ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <FaBell /> Inbox
          </div>

          <div
            className={`menu-item ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <FaChartLine /> Revenue
          </div>
          <div
            className={`menu-item ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <FaChartBar /> Performance
          </div>

          <div
            className="menu-item"
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </div>
        </div>

        <div className="bottom-menu">
          <div
            className={`menu-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <FaQuestionCircle /> Help Center
          </div>
          <div
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Settings
          </div>
          <div className="menu-item logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD */}
      <div className="dashboard">
        {/* HEADER */}
        <div className="header">
          <div>
            <h2>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Product Management'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'customer-returns' && 'Customer Returns'}
              {activeTab === 'verifications' && 'Product Verifications'}
              {activeTab === 'finance' && 'Finance & Payouts'}
              {activeTab === 'inbox' && 'Inbox'}
              {activeTab === 'revenue' && 'Revenue Analytics'}
              {activeTab === 'performance' && 'Performance Analytics'}
              {activeTab === 'profile' && 'Seller Profile'}
              {activeTab === 'settings' && 'Account Settings'}
              {activeTab === 'help' && 'Help Center'}
            </h2>
            <p>
              {activeTab === 'dashboard' && 'Manage your store efficiently with real-time insights.'}
              {activeTab === 'products' && 'Manage your product inventory and listings.'}
              {activeTab === 'orders' && 'Track and manage customer orders.'}
              {activeTab === 'customer-returns' && 'Handle customer return requests.'}
              {activeTab === 'verifications' && 'View customer product condition verifications.'}
              {activeTab === 'finance' && 'View your earnings and manage payout details.'}
              {activeTab === 'inbox' && 'View and respond to customer messages.'}
              {activeTab === 'revenue' && 'View your revenue trends and analytics.'}
              {activeTab === 'performance' && 'Analyze your store performance metrics.'}
              {activeTab === 'profile' && 'Manage your account information'}
              {activeTab === 'settings' && 'Manage security and account preferences'}
              {activeTab === 'help' && 'Get support and find answers to your questions'}
            </p>
          </div>
          <div className="header-actions">
            {/* Global Search Bar */}
            <div className="global-search-container">
              <FaSearch className="global-search-icon" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                value={globalSearch || ''}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => globalSearch && globalSearch.trim() && setShowSearchResults(true)}
                className="global-search-input"
              />

              {/* Search Results Dropdown overlay */}
              {showSearchResults && globalSearch && globalSearch.trim() && (
                <div className="global-search-dropdown">
                  <div className="global-search-dropdown-header">
                    <span>Search Results</span>
                    <button 
                      className="global-search-close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSearchResults(false);
                      }}
                      title="Close Results"
                    >
                      <FaTimesCircle />
                    </button>
                  </div>
                  <div className="global-search-dropdown-results">
                    {Object.values(searchResults).every(list => !list || list.length === 0) ? (
                      <div className="global-search-no-results">
                        No matches found for "{globalSearch}"
                      </div>
                    ) : (
                      <>
                        {/* 1. Products */}
                        {searchResults.products && searchResults.products.length > 0 && (
                          <div className="global-search-section">
                            <div className="global-search-section-title">Products</div>
                            {searchResults.products.map(product => (
                              <div
                                key={product._id}
                                className="global-search-result-item"
                                onClick={() => {
                                  setActiveTab('products');
                                  setGlobalSearch(product.name);
                                  setShowSearchResults(false);
                                }}
                              >
                                <span className="item-main-text">{product.name}</span>
                                <span className="item-sub-text">{product.brand || 'No Brand'} • NPR {product.price}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 2. Orders */}
                        {searchResults.orders && searchResults.orders.length > 0 && (
                          <div className="global-search-section">
                            <div className="global-search-section-title">Orders</div>
                            {searchResults.orders.map(order => (
                              <div
                                key={order._id}
                                className="global-search-result-item"
                                onClick={() => {
                                  setActiveTab('orders');
                                  setGlobalSearch(order._id);
                                  setSelectedOrder(order);
                                  setShowSearchResults(false);
                                }}
                              >
                                <span className="item-main-text">Order #{getShortOrderId(order._id)}</span>
                                <span className="item-sub-text">{order.customerName} • NPR {order.total} • {order.status}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 3. Returns */}
                        {searchResults.returns && searchResults.returns.length > 0 && (
                          <div className="global-search-section">
                            <div className="global-search-section-title">Customer Returns</div>
                            {searchResults.returns.map(ret => (
                              <div
                                key={ret._id}
                                className="global-search-result-item"
                                onClick={() => {
                                  setActiveTab('customer-returns');
                                  setGlobalSearch(ret.orderId || '');
                                  setSelectedReturn(ret);
                                  setShowSearchResults(false);
                                }}
                              >
                                <span className="item-main-text">Return for Order #{getShortOrderId(ret.orderId || '')}</span>
                                <span className="item-sub-text">{ret.customerName} • Reason: {ret.reason}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 4. Verifications */}
                        {searchResults.verifications && searchResults.verifications.length > 0 && (
                          <div className="global-search-section">
                            <div className="global-search-section-title">Verifications</div>
                            {searchResults.verifications.map(ver => (
                              <div
                                key={ver._id}
                                className="global-search-result-item"
                                onClick={() => {
                                  setActiveTab('verifications');
                                  setGlobalSearch(ver.orderId || '');
                                  setSelectedVerification(ver);
                                  setShowSearchResults(false);
                                }}
                              >
                                <span className="item-main-text">{getVerificationProductName(ver)}</span>
                                <span className="item-sub-text">Submitted by {ver.customerName || ver.customer?.fullName}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 5. Messages */}
                        {searchResults.messages && searchResults.messages.length > 0 && (
                          <div className="global-search-section">
                            <div className="global-search-section-title">Conversations</div>
                            {searchResults.messages.map(msg => (
                              <div
                                key={msg._id}
                                className="global-search-result-item"
                                onClick={() => {
                                  setActiveTab('inbox');
                                  handleSelectMessage(msg);
                                  setShowSearchResults(false);
                                }}
                              >
                                <span className="item-main-text">{msg.senderInfo?.fullName || 'Customer'}</span>
                                <span className="item-sub-text">"{msg.message?.substring(0, 40)}..."</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="notification-wrapper">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-btn"
                title="Notifications"
              >
                <FaBell />
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
                          <FaBell size={36} />
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
                                  <FaClock size={10} />
                                  {formatNotificationTime(notif.createdAt)}
                                </span>
                                <button
                                  onClick={(e) => deleteNotification(notif._id, e)}
                                  className="notification-delete-btn"
                                >
                                  <FaTrash size={10} />
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
            <div className="user">
              <img
                src={profileImage || 'https://i.pravatar.cc/40'}
                alt="user"
                className="user-avatar"
              />
              <div>
                <strong>{sellerData?.storeName || sellerData?.fullName || 'Seller'}</strong>
                <p>Seller ID: {sellerData?._id?.slice(-6) || '000000'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && <SellerOverviewTab />}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && <SellerProductsTab />}
        {/* ORDERS TAB */}
        {activeTab === 'orders' && <SellerOrdersTab />}

        {/* CUSTOMER RETURNS TAB */}
        {activeTab === 'customer-returns' && <SellerCustomerReturnsTab />}

        {/* VERIFICATIONS TAB */}
        {activeTab === 'verifications' && <SellerVerificationsTab />}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && <SellerFinance />}

        {/* INBOX TAB */}
        {activeTab === 'inbox' && <SellerInboxTab />}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && <SellerRevenueTab />}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && <SellerPerformanceTab />}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && <SellerProfileTab />}

        {/* HELP CENTER TAB */}
        {activeTab === 'help' && <SellerHelpCenter />}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && <SellerSettingsTab />}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-detail-header">
              <div>
                <p className="order-detail-kicker">Order Details</p>
                <h3>{getShortOrderId(selectedOrder)}</h3>
              </div>
              <button className="order-detail-close" onClick={() => setSelectedOrder(null)}>
                x
              </button>
            </div>

            <div className="order-detail-summary">
              <div className="order-detail-box">
                <span>Customer</span>
                <strong>{selectedOrder.customerName || 'Customer'}</strong>
                <p>{selectedOrder.customerEmail || 'No email'}</p>
                <p>{selectedOrder.customerPhone || 'No phone'}</p>
              </div>
              <div className="order-detail-box">
                <span>Shipping</span>
                <strong>{selectedOrder.shippingAddress?.label || 'Delivery address'}</strong>
                <p>{formatShippingAddress(selectedOrder.shippingAddress)}</p>
              </div>
              <div className="order-detail-box">
                <span>Payment</span>
                <strong>{selectedOrder.paymentMethod?.toUpperCase() || 'N/A'}</strong>
                <p>{selectedOrder.paymentStatus || 'N/A'} - {selectedOrder.status}</p>
                <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="order-detail-products">
              <h4>Products Ordered</h4>
              {getSellerOrderItems(selectedOrder).map((item, index) => (
                <div className="order-product-row" key={`${item.product?._id || item.product || index}`}>
                  <img
                    src={getOrderProductImage(item)}
                    alt={getOrderProductName(item)}
                    className="order-product-image"
                  />
                  <div className="order-product-main">
                    <strong>{getOrderProductName(item)}</strong>
                    <span>
                      Qty {item.quantity || 1} - Rs. {Number(item.price || 0).toLocaleString()} each
                    </span>
                    <small>
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.condition && ' - '}
                      {item.condition && `Condition: ${item.condition}`}
                    </small>
                  </div>
                  <div className="order-product-total">
                    Rs. {Number(item.subtotal || (item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-detail-footer">
              <div>
                <span>Seller subtotal</span>
                <strong>Rs. {getSellerOrderAmount(selectedOrder).toLocaleString()}</strong>
              </div>
              <button className="order-detail-done" onClick={() => setSelectedOrder(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN DETAILS MODAL */}
      {selectedReturn && (
        <div className="modal-overlay return-modal-overlay" onClick={() => setSelectedReturn(null)}>
          <div className="seller-detail-modal return-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="seller-detail-header return-detail-header">
              <div className="return-detail-header-text">
                <p className="seller-detail-kicker">Return request</p>
                <h3>Order #{getReturnOrderLabel(selectedReturn)}</h3>
                <span className={`return-status-badge ${selectedReturn.status?.toLowerCase()}`}>
                  {selectedReturn.status}
                </span>
              </div>
              <button
                type="button"
                className="seller-detail-close"
                aria-label="Close"
                onClick={() => setSelectedReturn(null)}
              >
                <FaTimesCircle />
              </button>
            </div>

            <div className="seller-detail-body return-detail-body">
              <div className="seller-detail-media">
                <img src={getReturnImage(selectedReturn)} alt="" />
              </div>
              <div className="seller-detail-content return-detail-content">
                <div className="detail-row">
                  <span>Product</span>
                  <strong>{selectedReturn.product?.name || 'Unknown product'}</strong>
                </div>
                <div className="detail-row">
                  <span>Customer</span>
                  <strong>
                    {selectedReturn.customer?.fullName ||
                      selectedReturn.orderId?.customerName ||
                      'Unknown customer'}
                  </strong>
                  {(selectedReturn.customer?.email || selectedReturn.orderId?.customerEmail) && (
                    <p>
                      {selectedReturn.customer?.email || selectedReturn.orderId?.customerEmail}
                    </p>
                  )}
                </div>
                <div className="detail-row">
                  <span>Reason</span>
                  <strong>{selectedReturn.reason}</strong>
                  {selectedReturn.description && <p>{selectedReturn.description}</p>}
                </div>
                <div className="detail-row detail-grid return-detail-metrics">
                  <div>
                    <span>Refund amount</span>
                    <strong className="return-detail-refund">
                      Rs. {Number(selectedReturn.refundAmount || 0).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span>Requested</span>
                    <strong>
                      {selectedReturn.createdAt
                        ? new Date(selectedReturn.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </strong>
                  </div>
                </div>
                {selectedReturn.sellerResponse && (
                  <div className="detail-row">
                    <span>Your response</span>
                    <p>{selectedReturn.sellerResponse}</p>
                  </div>
                )}
              </div>
            </div>

            {(selectedReturn.images?.length > 0 || selectedReturn.verificationImages?.length > 0) && (
              <div className="seller-detail-gallery return-detail-gallery">
                <p className="return-gallery-title">Customer evidence</p>
                <div className="return-gallery-grid">
                  {[...(selectedReturn.images || []), ...(selectedReturn.verificationImages || [])].map((image, index) => (
                    <a
                      key={`${image}-${index}`}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="return-gallery-thumb"
                    >
                      <img src={image} alt={`Evidence ${index + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="seller-detail-actions return-detail-actions">
              {selectedReturn.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    className="return-modal-btn return-modal-btn--approve"
                    onClick={() => {
                      handleReturnResponse(selectedReturn._id, 'Approved');
                      setSelectedReturn(null);
                    }}
                  >
                    <FaCheckCircle /> Approve return
                  </button>
                  <button
                    type="button"
                    className="return-modal-btn return-modal-btn--reject"
                    onClick={() => {
                      handleReturnResponse(selectedReturn._id, 'Rejected');
                      setSelectedReturn(null);
                    }}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </>
              )}
              {selectedReturn.status === 'Approved' && (
                <button
                  type="button"
                  className="return-modal-btn return-modal-btn--complete"
                  onClick={() => {
                    handleCompleteReturn(selectedReturn._id);
                    setSelectedReturn(null);
                  }}
                >
                  <FaCheckCircle /> Mark completed
                </button>
              )}
              <button
                type="button"
                className="return-modal-btn return-modal-btn--ghost"
                onClick={() => setSelectedReturn(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION DETAILS MODAL */}
      {selectedVerification && (
        <div className="modal-overlay" onClick={() => setSelectedVerification(null)}>
          <div className="seller-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="seller-detail-header">
              <div>
                <p className="seller-detail-kicker">Product Verification</p>
                <h3>{getVerificationProductName(selectedVerification)}</h3>
              </div>
              <button className="seller-detail-close" onClick={() => setSelectedVerification(null)}>x</button>
            </div>

            <div className="seller-detail-body">
              <div className="seller-detail-media">
                <img src={getVerificationImage(selectedVerification)} alt={getVerificationProductName(selectedVerification)} />
              </div>
              <div className="seller-detail-content">
                <div className="detail-row detail-grid">
                  <div>
                    <span>Order</span>
                    <strong>#{selectedVerification.orderId || 'N/A'}</strong>
                  </div>
                  <div>
                    <span>Rating</span>
                    <strong>{selectedVerification.rating || 0}/5</strong>
                  </div>
                </div>
                <div className="detail-row">
                  <span>Customer</span>
                  <strong>{selectedVerification.customerName || selectedVerification.customer?.fullName || 'Customer'}</strong>
                  <p>{selectedVerification.customerEmail || selectedVerification.customer?.email || ''}</p>
                </div>
                <div className="detail-row detail-grid">
                  <div>
                    <span>Condition Match</span>
                    <strong>{selectedVerification.matchesDescription === 'yes' ? 'Matches description' : 'Does not match'}</strong>
                  </div>
                  <div>
                    <span>Admin Status</span>
                    <strong>{selectedVerification.approvalStatus || 'pending'}</strong>
                  </div>
                </div>
                <div className="detail-row">
                  <span>Customer Notes</span>
                  <p>{selectedVerification.customerNotes || 'No notes provided'}</p>
                </div>
                {selectedVerification.rejectionReason && (
                  <div className="detail-row">
                    <span>Rejection Reason</span>
                    <p>{selectedVerification.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedVerification.verificationImages?.length > 0 && (
              <div className="seller-detail-gallery">
                {selectedVerification.verificationImages.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`Verification evidence ${index + 1}`} />
                ))}
              </div>
            )}

            <div className="seller-detail-actions">
              <button className="modal-cancel-btn" onClick={() => setSelectedVerification(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Edit Product</h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="modal-form-grid">
                <div className="modal-form-group">
                  <label className="modal-form-label">Product Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    className="modal-form-input"
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">
                    SKU
                    <span className="modal-form-hint">
                      (Read-only)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku || 'Auto-generated'}
                    disabled
                    className="modal-form-input"
                  />
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="modal-form-group">
                  <label className="modal-form-label">Price (Rs.) *</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    required
                    className="modal-form-input"
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">Stock *</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    required
                    className="modal-form-input"
                  />
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="modal-form-group">
                  <label className="modal-form-label">Condition *</label>
                  <select
                    value={editingProduct.condition}
                    onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value })}
                    required
                    className="modal-form-select"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Slightly Used">Slightly Used</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">Category *</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value, subcategory: '' })}
                    required
                    className="modal-form-select"
                  >
                    <option value="">Select Category</option>
                    <option value="Men's Collection">Men's Collection</option>
                    <option value="Women's Collection">Women's Collection</option>
                    <option value="Sportswear">Sportswear</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">Subcategory</label>
                  <select
                    value={editingProduct.subcategory || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                    className="modal-form-select"
                    disabled={!editingProduct.category}
                  >
                    <option value="">Select Subcategory</option>
                    {editingProduct.category === "Men's Collection" && (
                      <>
                        <option value="Men's Hoodie">Men's Hoodie</option>
                        <option value="Men's Pants">Men's Pants</option>
                        <option value="Men's Jacket">Men's Jacket</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                    {editingProduct.category === "Women's Collection" && (
                      <>
                        <option value="Women's Skirt">Women's Skirt</option>
                        <option value="Women's Blazer">Women's Blazer</option>
                        <option value="Women's Top">Women's Top</option>
                        <option value="Other">Other</option>
                      </>
                    )}

                    {editingProduct.category === "Sportswear" && (
                      <>
                        <option value="Other">Other</option>
                      </>
                    )}
                    {editingProduct.category === "Vintage" && (
                      <>
                        <option value="Other">Other</option>
                      </>
                    )}

                  </select>
                </div>
              </div>

              <div className="modal-form-full-width">
                <label className="modal-form-label">Description *</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  required
                  rows="4"
                  className="modal-form-textarea"
                />
              </div>

              {/* Bundle Deal Section */}
              <div className="modal-form-full-width" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    id="editBundleDealEnabled"
                    checked={editingProduct.bundleDeal?.enabled || false}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      bundleDeal: {
                        ...editingProduct.bundleDeal,
                        enabled: e.target.checked,
                        buyQuantity: editingProduct.bundleDeal?.buyQuantity || 2,
                        discountPercentage: editingProduct.bundleDeal?.discountPercentage || 10,
                        description: editingProduct.bundleDeal?.description || ''
                      }
                    })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="editBundleDealEnabled" className="modal-form-label" style={{ margin: 0, cursor: 'pointer' }}>
                    Enable Bundle Deal
                  </label>
                </div>

                {editingProduct.bundleDeal?.enabled && (
                  <div style={{ marginLeft: '28px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <div className="modal-form-grid">
                      <div className="modal-form-group">
                        <label className="modal-form-label">Buy Quantity *</label>
                        <input
                          type="number"
                          min="2"
                          value={editingProduct.bundleDeal?.buyQuantity || 2}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            bundleDeal: {
                              ...editingProduct.bundleDeal,
                              buyQuantity: parseInt(e.target.value) || 2
                            }
                          })}
                          className="modal-form-input"
                        />
                      </div>
                      <div className="modal-form-group">
                        <label className="modal-form-label">Discount % *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editingProduct.bundleDeal?.discountPercentage || 10}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            bundleDeal: {
                              ...editingProduct.bundleDeal,
                              discountPercentage: parseInt(e.target.value) || 10
                            }
                          })}
                          className="modal-form-input"
                        />
                      </div>
                    </div>
                    <div className="modal-form-group" style={{ marginTop: '12px' }}>
                      <label className="modal-form-label">Bundle Description (Optional)</label>
                      <input
                        type="text"
                        value={editingProduct.bundleDeal?.description || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          bundleDeal: {
                            ...editingProduct.bundleDeal,
                            description: e.target.value
                          }
                        })}
                        className="modal-form-input"
                        placeholder="e.g., Buy 2 or more and save!"
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
                      Preview: Buy {editingProduct.bundleDeal?.buyQuantity || 2}+ Get {editingProduct.bundleDeal?.discountPercentage || 10}% OFF
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-submit-btn"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {showRestockModal && restockProduct && (
        <div className="modal-overlay">
          <div className="restock-modal-content">
            <div className="restock-modal-header">
              <div className="restock-icon">
                <FaPlus />
              </div>
              <h3 className="restock-modal-title">Restock Product</h3>
            </div>

            <div className="restock-product-info">
              <img
                src={restockProduct.images?.[0] || 'https://via.placeholder.com/80'}
                alt={restockProduct.name}
                className="restock-product-image"
              />
              <div className="restock-product-details">
                <h4 className="restock-product-name">{restockProduct.name}</h4>
                <p className="restock-product-sku">SKU: {restockProduct.sku || 'N/A'}</p>
                <div className="restock-current-stock">
                  <span className="stock-badge out-of-stock">
                    <FaTimesCircle /> Out of Stock
                  </span>
                  <span className="current-stock-text">Current: {restockProduct.stock} units</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleRestockSubmit}>
              <div className="restock-form-group">
                <label className="restock-form-label">
                  Add Quantity *
                  <span className="restock-form-hint">
                    How many units do you want to add?
                  </span>
                </label>
                <input
                  type="number"
                  value={restockQuantity || ''}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  min="1"
                  required
                  placeholder="Enter quantity to add"
                  autoFocus
                  className="restock-form-input"
                />
                {restockQuantity && parseInt(restockQuantity) > 0 && (
                  <div className="restock-preview">
                    <span className="restock-preview-label">New stock will be:</span>
                    <span className="restock-preview-value">
                      {restockProduct.stock + parseInt(restockQuantity)} units
                    </span>
                  </div>
                )}
              </div>

              <div className="restock-actions">
                <button
                  type="submit"
                  className="restock-submit-btn"
                >
                  <FaCheckCircle /> Confirm Restock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false);
                    setRestockProduct(null);
                    setRestockQuantity('');
                  }}
                  className="restock-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA PASSWORD VERIFICATION MODAL */}
      {show2FAModal && (
        <div className="twofa-modal-overlay">
          <div className="twofa-modal-content">
            <h3 className="twofa-modal-title">
              {twoFAAction === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication
            </h3>
            <p className="twofa-modal-description">
              Please enter your password to confirm and {twoFAAction} two-factor authentication for your account.
            </p>

            <div className="twofa-form-group">
              <label className="twofa-form-label">
                Password
              </label>
              <input
                type="password"
                value={twoFAPassword || ''}
                onChange={(e) => setTwoFAPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirm2FA()}
                placeholder="Enter your password"
                autoFocus
                className="twofa-form-input"
              />
            </div>

            <div className="twofa-actions">
              <button
                onClick={handleConfirm2FA}
                className={`twofa-confirm-btn ${twoFAAction === 'enable' ? 'enable' : 'disable'}`}
              >
                {twoFAAction === 'enable' ? 'Enable' : 'Disable'} 2FA
              </button>
              <button
                onClick={() => {
                  setShow2FAModal(false);
                  setTwoFAPassword('');
                }}
                className="twofa-cancel-btn"
              >
                Cancel
              </button>
            </div>

            <div className="twofa-note">
              <p className="twofa-note-text">
                <strong>Note:</strong> Two-factor authentication adds an extra layer of security to your account by requiring additional verification when logging in.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2FA SUCCESS MODAL */}
      {show2FASuccess && (
        <div className="twofa-modal-overlay">
          <div className="success-modal-content">
            {/* Success Icon */}
            <div className={`success-icon ${twoFAAction === 'enable' ? 'enable' : 'disable'}`}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 className="success-modal-title">
              Two-Factor Authentication {twoFAAction === 'enable' ? 'Enabled' : 'Disabled'}!
            </h3>

            <p className="success-modal-description">
              {twoFAAction === 'enable'
                ? 'Your account is now protected with an additional layer of security.'
                : 'Two-factor authentication has been removed from your account.'}
            </p>

            <button
              onClick={() => setShow2FASuccess(false)}
              className="success-ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* LOGIN HISTORY MODAL */}
      {showLoginHistoryModal && (
        <div className="twofa-modal-overlay">
          <div className="login-history-modal-content">
            <div className="login-history-header">
              <h3 className="login-history-title">
                Login History
              </h3>
              <button
                onClick={() => setShowLoginHistoryModal(false)}
                className="login-history-close-btn"
              >
                ×
              </button>
            </div>

            {loginHistory.length === 0 ? (
              <div className="login-history-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="login-history-empty-icon">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="login-history-empty-title">No Login History</p>
                <p className="login-history-empty-text">Your login activity will appear here</p>
              </div>
            ) : (
              <div>
                {loginHistory.map((login, index) => (
                  <div key={index} className="login-history-item">
                    <div className="login-history-item-header">
                      <div className="login-history-item-content">
                        <div className="login-history-device">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00bcd4" strokeWidth="2">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                          </svg>
                          <span className="login-history-device-name">
                            {login.userAgent || 'Unknown Device'}
                          </span>
                        </div>
                        <div className="login-history-time">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span className="login-history-time-text">
                            {new Date(login.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {login.ipAddress && (
                          <div className="login-history-ip">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="2" y1="12" x2="22" y2="12"></line>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            <span className="login-history-ip-text">
                              IP: {login.ipAddress}
                            </span>
                          </div>
                        )}
                      </div>
                      {index === 0 && (
                        <span className="login-history-current-badge">
                          CURRENT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLoginHistoryModal(false)}
              className="login-history-close-bottom-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePasswordModal && (
        <div className="twofa-modal-overlay">
          <div className="change-password-modal-content">
            <h3 className="twofa-modal-title">
              Change Password
            </h3>
            <p className="twofa-modal-description">
              Enter your current password and choose a new one
            </p>

            <div className="change-password-form-group">
              <label className="change-password-label">
                Current Password
              </label>
              <input
                type="password"
                value={changePasswordData.currentPassword}
                onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="change-password-input"
              />
            </div>

            <div className="change-password-form-group">
              <label className="change-password-label">
                New Password
              </label>
              <input
                type="password"
                value={changePasswordData.newPassword}
                onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                placeholder="Enter new password"
                className="change-password-input"
              />
            </div>

            <div className="change-password-form-group">
              <label className="change-password-label">
                Confirm New Password
              </label>
              <input
                type="password"
                value={changePasswordData.confirmPassword}
                onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
                placeholder="Confirm new password"
                className="change-password-input"
              />
            </div>

            <div className="change-password-actions">
              <button
                onClick={handleChangePassword}
                className="change-password-submit-btn"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="change-password-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD CHANGE SUCCESS MODAL */}
      {showPasswordSuccessModal && (
        <div className="twofa-modal-overlay">
          <div className="success-modal-content">
            <div className="success-icon enable">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 className="success-modal-title">
              Password Changed Successfully!
            </h3>

            <p className="success-modal-description">
              Your password has been updated. Please use your new password for future logins.
            </p>

            <button
              onClick={() => setShowPasswordSuccessModal(false)}
              className="success-ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
}

function SellerDashboard() {
  return (
    <SellerDashboardProvider>
      <SellerDashboardContent />
    </SellerDashboardProvider>
  );
}

export default SellerDashboard;
