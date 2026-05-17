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

import './SellerProfileTab.css';
function SellerProfileTab() {
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
            <div className="profile-header-row">
              <h3 className="profile-main-title"></h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="profile-edit-btn"
              >
                <FaEdit /> {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-avatar-wrapper">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <div className="profile-status-indicator"></div>
                  
                  {/* Camera Icon Overlay */}
                  {isEditingProfile && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="profile-image-input"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="profile-camera-label"
                        title="Change profile picture"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      </label>
                    </>
                  )}
                </div>
                <div>
                  <h2 className="profile-store-name">
                    {profileData.storeName || 'Store Name'}
                  </h2>
                  <span className="profile-verified-badge">
                    Verified Seller
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="profile-section-title">
                    <FaUser /> Personal Information
                  </h3>
                  <div className="profile-form-grid">
                    <div>
                      <label className="profile-form-label">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        CITY
                      </label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div className="profile-full-width">
                      <label className="profile-form-label">
                        ADDRESS
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        COUNTRY
                      </label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Store Information */}
                <div className="profile-section">
                  <h3 className="profile-section-title">
                    <FaBox /> Store Information
                  </h3>
                  <div className="messages-grid">
                    <div>
                      <label className="profile-form-label">
                        STORE NAME
                      </label>
                      <input
                        type="text"
                        value={profileData.storeName}
                        onChange={(e) => setProfileData({...profileData, storeName: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        STORE DESCRIPTION
                      </label>
                      <textarea
                        value={profileData.storeDescription}
                        onChange={(e) => setProfileData({...profileData, storeDescription: e.target.value})}
                        disabled={!isEditingProfile}
                        rows="4"
                        className="profile-form-textarea"
                      />
                    </div>
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="profile-actions">
                    <button
                      type="submit"
                      className="profile-save-btn"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="profile-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
  );
}

export default SellerProfileTab;
