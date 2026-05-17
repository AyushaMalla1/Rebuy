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

import './SellerSettingsTab.css';
function SellerSettingsTab() {
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
            <h3 className="inbox-title"></h3>

            {/* Security Settings */}
            <div className="settings-card">
              <h4 className="settings-section-title">
                <FaCog /> Security Settings
              </h4>

              {/* Change Password */}
              <div className="settings-item">
                <div>
                  <h5 className="settings-item-title">
                    Change Password
                  </h5>
                  <p className="settings-item-description">
                    Update your password to keep your account secure
                  </p>
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="settings-change-btn"
                >
                  Change
                </button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="settings-item">
                <div className="settings-item-content">
                  <h5 className="settings-item-title">
                    Two-Factor Authentication
                  </h5>
                  <p className="settings-item-description">
                    Add an extra layer of security to your account
                  </p>
                  {twoFAEnabled && (
                    <div className="settings-2fa-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span className="settings-2fa-badge-text">
                        On since {twoFAEnabledDate ? twoFAEnabledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                      </span>
                    </div>
                  )}
                </div>
                {twoFAEnabled ? (
                  <button
                    onClick={handleDisable2FA}
                    className="settings-disable-btn"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={handleEnable2FA}
                    className="settings-enable-btn"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* Login History */}
              <div className="settings-item">
                <div>
                  <h5 className="settings-item-title">
                    Login History
                  </h5>
                  <p className="settings-item-description">
                    View your recent login activity
                  </p>
                </div>
                <button
                  onClick={handleViewLoginHistory}
                  className="settings-view-btn"
                >
                  View
                </button>
              </div>
            </div>

            {/* Account Management */}
            <div className="settings-card">
              <h4 className="settings-section-title">
                <FaUser /> Account Management
              </h4>

              {/* Deactivate Account */}
              <div className="settings-deactivate-item">
                <div>
                  <h5 className="settings-deactivate-title">
                    Deactivate Account
                  </h5>
                  <p className="settings-deactivate-description">
                    Temporarily disable your account. You can reactivate it anytime.
                  </p>
                </div>
                <button
                  onClick={handleDeactivateAccount}
                  className="settings-deactivate-btn"
                >
                  Deactivate
                </button>
              </div>

              {/* Delete Account */}
              <div className="settings-delete-item">
                <div>
                  <h5 className="settings-delete-title">
                    Delete Account
                  </h5>
                  <p className="settings-delete-description">
                    Permanently delete your account and all data. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="settings-delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
  );
}

export default SellerSettingsTab;
