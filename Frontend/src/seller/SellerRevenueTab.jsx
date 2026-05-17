import {
  FaBox, FaShoppingCart, FaDollarSign, FaChartBar, FaUser, FaCog, FaSignOutAlt,
  FaPlus, FaChartLine, FaEdit, FaTrash, FaBell, FaShoppingBag, FaQuestionCircle,
  FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCopy, FaStar, FaChartPie,
  FaArchive, FaSearch, FaBullseye, FaLightbulb, FaEnvelope, FaBoxOpen, FaInfoCircle,
  FaClock, FaEye
} from 'react-icons/fa';
import { HiTrendingUp } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';
import { RevenueTrendChart, TopProductsChart, CategoryPerformanceChart, StockLevelsChart, OrdersBarChart, AvgOrderValueChart, PlatformFeesChart, NetRevenueChart } from '../components/Charts';
import SellerFinance from './SellerFinance';
import HelpCenter from './SellerHelpCenter';
import { useSellerDashboard } from './DashboardContext';

import './SellerRevenueTab.css';
function SellerRevenueTab() {
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

  return (
          <div className="products-section">
            <div className="revenue-container">
              <div className="revenue-header">
                <h3 className="revenue-title"></h3>
                <div className="revenue-controls">
                  <div className="date-range-selector">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="calendar-icon">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                    </svg>
                    <select
                      value={revenueDateRange}
                      onChange={(e) => setRevenueDateRange(e.target.value)}
                      className="date-range-select"
                    >
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 90 Days</option>
                      <option value="365">Last Year</option>
                      <option value="all">All Time</option>
                    </select>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="chevron-icon">
                      <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="revenue-stats-grid">
                <div 
                  className={`revenue-stat-card clickable ${selectedRevenueMetric === 'revenue' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('revenue')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">TOTAL REVENUE</p>
                    <div className={`revenue-growth-badge ${revenueStats.growthRate >= 0 ? 'positive' : 'negative'}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {revenueStats.growthRate >= 0 ? (
                          <polyline points="18 15 12 9 6 15" strokeWidth="2.5"/>
                        ) : (
                          <polyline points="6 9 12 15 18 9" strokeWidth="2.5"/>
                        )}
                      </svg>
                      {Math.abs(revenueStats.growthRate).toFixed(1)}%
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {revenueStats.totalRevenue.toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">
                    {revenueStats.growthRate >= 0 ? '+' : ''}{revenueStats.growthRate.toFixed(1)}% from last period
                  </p>
                </div>

                <div 
                  className={`revenue-stat-card orders-card clickable ${selectedRevenueMetric === 'orders' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('orders')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">TOTAL ORDERS</p>
                    <div className="revenue-stat-icon orders">
                      <FaShoppingCart />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">{revenueStats.totalOrders}</h2>
                  <p className="revenue-stat-subtitle">Completed orders</p>
                </div>

                <div 
                  className={`revenue-stat-card avg-card clickable ${selectedRevenueMetric === 'avg' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('avg')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">AVG. ORDER VALUE</p>
                    <div className="revenue-stat-icon avg">
                      <FaDollarSign />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {Math.round(revenueStats.avgOrderValue).toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">Per transaction</p>
                </div>

                <div 
                  className={`revenue-stat-card fees-card clickable ${selectedRevenueMetric === 'fees' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('fees')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">PLATFORM FEES</p>
                    <div className="revenue-stat-icon fees">
                      <FaChartPie />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {Math.round(revenueStats.platformFees).toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">3% from revenue</p>
                </div>

                <div 
                  className={`revenue-stat-card net-card clickable ${selectedRevenueMetric === 'net' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('net')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">NET REVENUE</p>
                    <div className="revenue-stat-icon net">
                      <FaCheckCircle />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {Math.round(revenueStats.netRevenue).toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">After platform fees</p>
                </div>
              </div>

              <div className="revenue-chart-section">
                <div className="revenue-chart-header">
                  <h4 className="revenue-chart-title">
                    {selectedRevenueMetric === 'revenue' && 'Revenue Trend'}
                    {selectedRevenueMetric === 'orders' && 'Orders Trend'}
                    {selectedRevenueMetric === 'avg' && 'Average Order Value Trend'}
                    {selectedRevenueMetric === 'fees' && 'Platform Fees Trend'}
                    {selectedRevenueMetric === 'net' && 'Net Revenue Trend'}
                  </h4>
                  <p className="revenue-chart-subtitle">
                    Click on any card above to view its trend
                  </p>
                </div>
                
                {/* Different chart types based on selected metric */}
                {selectedRevenueMetric === 'revenue' && (
                  <RevenueTrendChart 
                    data={chartData.revenue} 
                    title={`Revenue Trend (${getRevenueRangeLabel()})`}
                  />
                )}
                
                {selectedRevenueMetric === 'orders' && (
                  <OrdersBarChart 
                    data={chartData.ordersTrend} 
                    dataKey="orders"
                    title={`Orders Trend (${getRevenueRangeLabel()})`}
                  />
                )}
                
                {selectedRevenueMetric === 'avg' && (
                  <AvgOrderValueChart 
                    data={chartData.avgOrderValue} 
                    dataKey="avgOrderValue"
                    title={`Average Order Value Trend (${getRevenueRangeLabel()})`}
                  />
                )}
                
                {selectedRevenueMetric === 'fees' && (
                  <PlatformFeesChart 
                    data={chartData.platformFees} 
                    dataKey="platformFees"
                    title={`Platform Fees Breakdown (${getRevenueRangeLabel()})`}
                  />
                )}
                
                {selectedRevenueMetric === 'net' && (
                  <NetRevenueChart 
                    data={chartData.netRevenue} 
                    dataKey="netRevenue"
                    title={`Net Revenue Trend (${getRevenueRangeLabel()})`}
                  />
                )}
              </div>
            </div>
          </div>
  );
}

export default SellerRevenueTab;
