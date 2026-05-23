import {
  FaBox, FaShoppingCart, FaDollarSign, FaChartBar, FaUser, FaCog, FaSignOutAlt,
  FaPlus, FaChartLine, FaEdit, FaTrash, FaBell, FaShoppingBag, FaQuestionCircle,
  FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCopy, FaStar, FaChartPie,
  FaArchive, FaSearch, FaBullseye, FaLightbulb, FaEnvelope, FaBoxOpen, FaInfoCircle,
  FaClock, FaEye, FaTruck, FaClipboardCheck
} from 'react-icons/fa';
import { HiTrendingUp } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';
import { RevenueTrendChart, TopProductsChart, CategoryPerformanceChart, StockLevelsChart, OrdersBarChart, AvgOrderValueChart, PlatformFeesChart, NetRevenueChart } from '../components/Charts';
import SellerFinance from './SellerFinance';
import HelpCenter from './SellerHelpCenter';
import { useSellerDashboard } from './DashboardContext';

import './SellerOrdersTab.css';
function SellerOrdersTab() {
  const {
    activeTab,
    attachedFile,
    changePasswordData,
    chartData,
    conversationMessages,
    currentPage,
    deleteNotification,
    editingProduct,
    fetchConversationMessages,
    fetchMessages,
    fetchNotifications,
    fetchOrders,
    fetchProducts,
    fetchReturnStats,
    fetchReturns,
    fetchSellerData,
    fetchStats,
    fetchVerifications,
    filteredOrders,
    filteredProducts,
    formatNotificationTime,
    formatShippingAddress,
    getCurrentSellerId,
    getNotificationIcon,
    getOrderProductImage,
    getOrderProductName,
    getReturnImage,
    getReturnOrderLabel,
    getRevenueRangeLabel,
    getSelectedConversationProduct,
    getSellerOrderAmount,
    getSellerOrderItems,
    getShortOrderId,
    getStockStatusBadge,
    getVerificationImage,
    getVerificationProductName,
    globalSearch,
    handleAddProduct,
    handleChangePassword,
    handleCompleteReturn,
    handleConfirm2FA,
    handleDeactivateAccount,
    handleDeleteAccount,
    handleDeleteProduct,
    handleDirectReply,
    handleDisable2FA,
    handleEditProduct,
    handleEmojiClick,
    handleEnable2FA,
    handleExportOrders,
    handleExportPerformance,
    handleExportRevenue,
    handleFileAttachment,
    handleFileUpload,
    handleLogout,
    handleNotificationClick,
    handleOrderStatusUpdate,
    handleProfileImageUpload,
    handleProfileUpdate,
    handleRestockClick,
    handleRestockSubmit,
    handleReturnResponse,
    handleSelectMessage,
    handleThreeDotAction,
    handleUpdateProduct,
    handleViewLoginHistory,
    imageFiles,
    isEditingProfile,
    isMessageFromCurrentSeller,
    loading,
    loadingMessages,
    loadingNotifications,
    loadingOrders,
    loadingReturns,
    loadingVerifications,
    loginHistory,
    markAllAsRead,
    markAsRead,
    messageSearchQuery,
    messages,
    newProduct,
    notifications,
    orderSearchQuery,
    orderStatusFilter,
    orders,
    paginate,
    prepareChartData,
    productStatusFilter,
    productStockFilter,
    products,
    profileData,
    profileImage,
    removeImage,
    replyText,
    restockProduct,
    restockQuantity,
    returnStats,
    returnStatusFilter,
    returns,
    revenueDateRange,
    revenueStats,
    selectedMessage,
    selectedOrder,
    selectedReturn,
    selectedRevenueMetric,
    selectedVerification,
    sellerData,
    setActiveTab,
    setAttachedFile,
    setChangePasswordData,
    setChartData,
    setConversationMessages,
    setCurrentPage,
    setEditingProduct,
    setFilteredOrders,
    setFilteredProducts,
    setGlobalSearch,
    setImageFiles,
    setIsEditingProfile,
    setLoading,
    setLoadingMessages,
    setLoadingNotifications,
    setLoadingOrders,
    setLoadingReturns,
    setLoadingVerifications,
    setLoginHistory,
    setMessageSearchQuery,
    setMessages,
    setNewProduct,
    setNotifications,
    setOrderSearchQuery,
    setOrderStatusFilter,
    setOrders,
    setProductStatusFilter,
    setProductStockFilter,
    setProducts,
    setProfileData,
    setProfileImage,
    setReplyText,
    setRestockProduct,
    setRestockQuantity,
    setReturnStats,
    setReturnStatusFilter,
    setReturns,
    setRevenueDateRange,
    setRevenueStats,
    setSelectedMessage,
    setSelectedOrder,
    setSelectedReturn,
    setSelectedRevenueMetric,
    setSelectedVerification,
    setSellerData,
    setShow2FAModal,
    setShow2FASuccess,
    setShowAddProduct,
    setShowChangePasswordModal,
    setShowEditModal,
    setShowEmojiPicker,
    setShowLoginHistoryModal,
    setShowNotifications,
    setShowPasswordSuccessModal,
    setShowRestockModal,
    setShowThreeDotMenu,
    setStats,
    setTwoFAAction,
    setTwoFAEnabled,
    setTwoFAEnabledDate,
    setTwoFAPassword,
    setUnreadCount,
    setVerificationStats,
    setVerifications,
    show2FAModal,
    show2FASuccess,
    showAddProduct,
    showChangePasswordModal,
    showEditModal,
    showEmojiPicker,
    showLoginHistoryModal,
    showNotifications,
    showPasswordSuccessModal,
    showRestockModal,
    showThreeDotMenu,
    stats,
    twoFAAction,
    twoFAEnabled,
    twoFAEnabledDate,
    twoFAPassword,
    unreadCount,
    verificationStats,
    verifications
  } = useSellerDashboard();

  const orderStatusTabs = [
    { key: 'All', label: 'All', icon: FaShoppingCart, count: orders.length },
    { key: 'Pending', label: 'Pending', icon: FaClock, count: orders.filter((o) => o.status === 'Pending').length },
    { key: 'Processing', label: 'Confirmed', icon: FaCheckCircle, count: orders.filter((o) => o.status === 'Processing').length },
    { key: 'Shipped', label: 'Shipped', icon: FaTruck, count: orders.filter((o) => o.status === 'Shipped').length },
    { key: 'Delivered', label: 'Completed', icon: FaClipboardCheck, count: orders.filter((o) => o.status === 'Delivered').length },
    { key: 'Cancelled', label: 'Cancelled', icon: FaTimesCircle, count: orders.filter((o) => o.status === 'Cancelled').length },
  ];

  return (
          <div className="products-section orders-section">
            <div
              className="orders-filter-tabs"
              role="tablist"
              aria-label="Filter orders by status"
            >
              {orderStatusTabs.map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={orderStatusFilter === key}
                  onClick={() => setOrderStatusFilter(key)}
                  className={`orders-filter-tab ${orderStatusFilter === key ? 'active' : ''}`}
                >
                  <Icon className="orders-filter-tab-icon" aria-hidden />
                  <span className="orders-filter-tab-label">{label}</span>
                  <span className="orders-tab-count">{count}</span>
                </button>
              ))}
            </div>
            
            {loadingOrders ? (
              <div className="orders-loading">
                <h3>Loading orders...</h3>
              </div>
            ) : filteredOrders.length === 0 && orders.length === 0 ? (
              <div className="orders-empty">
                <FaShoppingCart size={64} className="orders-empty-icon" />
                <h3 className="orders-empty-title">No Orders Yet</h3>
                <p className="orders-empty-text">Orders from customers will appear here</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="orders-empty">
                <FaShoppingCart size={64} className="orders-empty-icon" />
                <h3 className="orders-empty-title">No Orders Found</h3>
                <p className="orders-empty-text">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <div className="order-id">
                              {getShortOrderId(order)}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="order-customer-name">{order.customerName}</div>
                              <div className="order-customer-email">{order.customerEmail}</div>
                            </div>
                          </td>
                          <td className="order-items">
                            {getSellerOrderItems(order).length} item{getSellerOrderItems(order).length > 1 ? 's' : ''}
                          </td>
                          <td className="order-total">
                            Rs. {getSellerOrderAmount(order).toLocaleString()}
                          </td>
                          <td>
                            <div className="order-payment-method">
                              {order.paymentMethod}
                            </div>
                            <span className={`order-payment-badge ${order.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                              disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                              className={`order-status-select ${order.status.toLowerCase()}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="order-date">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="order-actions">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="order-action-btn view"
                              >
                                <FaEye /> View
                              </button>
                              {order.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order._id, 'Processing')}
                                    className="order-action-btn approve"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order._id, 'Cancelled')}
                                    className="order-action-btn cancel"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {order.status === 'Processing' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Shipped')}
                                  className="order-action-btn ship"
                                >
                                  Mark as Shipped
                                </button>
                              )}
                              {order.status === 'Shipped' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Delivered')}
                                  className="order-action-btn deliver"
                                >
                                  Mark as Delivered
                                </button>
                              )}
                              {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                                <span className="order-no-actions">
                                  Status locked
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
  );
}

export default SellerOrdersTab;
