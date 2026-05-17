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

import './AdminAuditTab.css';
function AdminAuditTab() {
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
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${auditFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAuditFilter('all')}
              >
                <FiActivity /> All Activities
              </button>
              <button 
                className={`filter-btn ${auditFilter === 'user' ? 'active' : ''}`}
                onClick={() => setAuditFilter('user')}
              >
                <FiUsers /> User Actions
              </button>
              <button 
                className={`filter-btn ${auditFilter === 'seller' ? 'active' : ''}`}
                onClick={() => setAuditFilter('seller')}
              >
                <FiUserCheck /> Seller Actions
              </button>
              <button 
                className={`filter-btn ${auditFilter === 'product' ? 'active' : ''}`}
                onClick={() => setAuditFilter('product')}
              >
                <FiPackage /> Product Changes
              </button>
              <button 
                className={`filter-btn ${auditFilter === 'system' ? 'active' : ''}`}
                onClick={() => setAuditFilter('system')}
              >
                <FiSettings /> System Events
              </button>
            </div>

            {getFilteredAuditLogs().length === 0 ? (
              <div className="empty-state-card">
                <FiActivity size={64} />
                <h3>No Audit Logs</h3>
                <p>No activities have been logged yet</p>
              </div>
            ) : (
              <div className="audit-timeline">
                {getFilteredAuditLogs().map(log => (
                  <div key={log._id} className="audit-entry">
                    <div className={`audit-icon ${log.actionType}`}>
                      {getAuditIcon(log.actionType)}
                    </div>
                    <div className="audit-content">
                      <div className="audit-header">
                        <h4>{log.action}</h4>
                        <span className="audit-time">{formatTimeAgo(log.createdAt)}</span>
                      </div>
                      <p className="audit-description">
                        {log.description}
                      </p>
                      <div className="audit-meta">
                        <span className="audit-user">
                          <FiUser /> {log.performedBy?.fullName || log.performedBy?.email || 'System'}
                        </span>
                        {log.ipAddress && (
                          <span className="audit-ip">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
  );
}

export default AdminAuditTab;
