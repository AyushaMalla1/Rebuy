import {
  FiUsers, FiShoppingBag, FiPackage, FiSettings, FiShield, FiEdit2, FiTrash2,
  FiEye, FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiDownload, FiActivity,
  FiClock, FiAlertCircle, FiUserCheck, FiAward, FiMessageSquare, FiGrid,
  FiDollarSign, FiChevronRight, FiBell, FiUser
} from 'react-icons/fi';
import { MdPeople, MdStorefront, MdInventory, MdAttachMoney, MdShowChart } from 'react-icons/md';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSupport from './AdminSupport';
import AdminSalesReportsTab from './AdminSalesReportsTab';
import AdminPayoutsTab from './AdminPayoutsTab';
import AdminProfileTab from './AdminProfileTab';
import { RevenueTrendChart, CategoryPerformanceChart } from '../components/Charts';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminAnnouncementsTab.css';
function AdminAnnouncementsTab() {
  const {
    activeTab,
    adminStats,
    announcementForm,
    announcements,
    approvedSellers,
    auditFilter,
    auditLogs,
    chartData,
    deleteNotification,
    dismissFraudAlert,
    downloadAllSellersCSV,
    ensureSalesChartData,
    error,
    fetchAdminData,
    fetchAnalyticsData,
    fetchFraudDetection,
    fetchNotifications,
    fetchPayouts,
    fetchVerifications,
    filterStatus,
    formatNotificationTime,
    formatTimeAgo,
    fraudAlerts,
    fraudFilter,
    fraudStats,
    getAuditIcon,
    getFilteredAuditLogs,
    getFilteredOrders,
    getFilteredProducts,
    getFilteredUsers,
    getNotificationIcon,
    getUserData,
    handleAdminProfileImageUpload,
    handleAnnouncementFormChange,
    handleApproveProduct,
    handleApproveSeller,
    handleApproveVerification,
    handleBlockUser,
    handleCancelPayout,
    handleCompletePayout,
    handleCreateAnnouncementForm,
    handleDeleteAnnouncement,
    handleDeleteProduct,
    handleDeleteUser,
    handleLogout,
    handleNotificationClick,
    handleProfileUpdate,
    handleReactivateSeller,
    handleRejectProduct,
    handleRejectSeller,
    handleRejectVerification,
    handleSaveSettings,
    handleSearch,
    handleSuspendSeller,
    handleToggleAnnouncement,
    handleUpdateLoyaltyPoints,
    handleViewOrder,
    handleViewProduct,
    handleViewSeller,
    handleViewUser,
    loading,
    loadingFraud,
    loadingNotifications,
    loyaltyRecords,
    markAllAsRead,
    markAsRead,
    notifications,
    orders,
    payoutStats,
    payouts,
    pendingSellers,
    products,
    profileData,
    profileImage,
    rejectedSellers,
    resolveFraudAlert,
    runFraudScan,
    salesStats,
    searchQuery,
    searchResults,
    selectedMetric,
    selectedOrder,
    selectedPayout,
    selectedProduct,
    selectedSeller,
    selectedSupportTicket,
    selectedUser,
    selectedVerification,
    setActiveTab,
    setAdminStats,
    setAnnouncementForm,
    setAnnouncements,
    setApprovedSellers,
    setAuditFilter,
    setAuditLogs,
    setChartData,
    setError,
    setFilterStatus,
    setFraudAlerts,
    setFraudFilter,
    setFraudStats,
    setLoading,
    setLoadingFraud,
    setLoadingNotifications,
    setLoyaltyRecords,
    setNotifications,
    setOrders,
    setPayoutStats,
    setPayouts,
    setPendingSellers,
    setProducts,
    setProfileData,
    setProfileImage,
    setRejectedSellers,
    setSalesStats,
    setSearchQuery,
    setSearchResults,
    setSelectedMetric,
    setSelectedOrder,
    setSelectedPayout,
    setSelectedProduct,
    setSelectedSeller,
    setSelectedSupportTicket,
    setSelectedUser,
    setSelectedVerification,
    setSettings,
    setShowAnnouncementForm,
    setShowNotifications,
    setShowOrderModal,
    setShowPayoutModal,
    setShowProductModal,
    setShowSearchResults,
    setShowSellerModal,
    setShowUserModal,
    setShowVerificationModal,
    setSupportFilterCategory,
    setSupportFilterPriority,
    setSupportFilterStatus,
    setSupportMessages,
    setSupportSearchQuery,
    setSupportStats,
    setSupportTickets,
    setSuspendedSellers,
    setTimeRange,
    setUnreadCount,
    setUsers,
    setVerificationStats,
    setVerifications,
    settings,
    showAnnouncementForm,
    showNotifications,
    showOrderModal,
    showPayoutModal,
    showProductModal,
    showSearchResults,
    showSellerModal,
    showUserModal,
    showVerificationModal,
    supportFilterCategory,
    supportFilterPriority,
    supportFilterStatus,
    supportMessages,
    supportSearchQuery,
    supportStats,
    supportTickets,
    suspendedSellers,
    timeRange,
    unreadCount,
    users,
    verificationStats,
    verifications
  } = useAdminDashboard();

  return (
    <div className="content-section">
      <div className="announcements-grid-layout">
        {/* Left Sidebar: Controls & Creation Form */}
        <div className="announcements-sidebar">
          <button 
            className="create-toggle-btn" 
            onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
          >
            <FiBell /> {showAnnouncementForm ? 'Cancel Creation' : 'Create Announcement'}
          </button>

          {showAnnouncementForm ? (
            <div className="form-card">
              <h3>New Announcement</h3>
              <form onSubmit={handleCreateAnnouncementForm}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={announcementForm.title}
                    onChange={handleAnnouncementFormChange}
                    required
                    placeholder="Enter title"
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={announcementForm.message}
                    onChange={handleAnnouncementFormChange}
                    required
                    rows="3"
                    placeholder="Enter announcement message"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={announcementForm.type} onChange={handleAnnouncementFormChange}>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Audience</label>
                    <select name="targetAudience" value={announcementForm.targetAudience} onChange={handleAnnouncementFormChange}>
                      <option value="all">All Users</option>
                      <option value="sellers">Sellers</option>
                      <option value="customers">Customers</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={announcementForm.priority} onChange={handleAnnouncementFormChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Expires At</label>
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      value={announcementForm.expiresAt}
                      onChange={handleAnnouncementFormChange}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn">Publish & Notify</button>
              </form>
            </div>
          ) : (
            <div className="announcements-helper-card">
              <h4>Platform Broadcasts</h4>
              <p>Send urgent push notifications and banner announcements to buyers, sellers, or all users on the platform.</p>
              <div className="helper-stat">
                <span>Active Broadcasts</span>
                <strong>{announcements.filter(a => a.isActive).length}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Feed: List of Broadcasts */}
        <div className="announcements-feed">
          <div className="announcements-list">
            {announcements.map(announcement => (
              <div key={announcement._id} className={`announcement-card ${announcement.type}`}>
                <div className="announcement-header">
                  <div className="announcement-title-section">
                    <h3>{announcement.title}</h3>
                    <div className="announcement-badges">
                      <span className={`type-badge ${announcement.type}`}>{announcement.type}</span>
                      <span className={`priority-badge ${announcement.priority}`}>{announcement.priority}</span>
                      <span className="audience-badge">{announcement.targetAudience}</span>
                    </div>
                  </div>
                  <div className="announcement-actions">
                    <button 
                      className={`toggle-btn ${announcement.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleAnnouncement(announcement._id)}
                    >
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <p className="announcement-message">{announcement.message}</p>
                <div className="announcement-footer">
                  <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                  {announcement.expiresAt && (
                    <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="empty-state-card">
                <FiBell size={36} />
                <h3>No Announcements</h3>
                <p>Broadcast alerts will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnnouncementsTab;
