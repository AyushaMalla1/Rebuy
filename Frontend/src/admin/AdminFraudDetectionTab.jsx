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

import './AdminFraudDetectionTab.css';
function AdminFraudDetectionTab() {
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
            <div className="fraud-detection-header">
              <button 
                className="export-btn" 
                onClick={runFraudScan}
                disabled={loadingFraud}
              >
                <FiShield /> {loadingFraud ? 'Scanning...' : 'Run Fraud Scan'}
              </button>
              
              <div className="fraud-stats-summary">
                <div className="fraud-stat-card high">
                  <FiAlertCircle />
                  <div>
                    <h3>{fraudStats.high}</h3>
                    <p>High Risk</p>
                  </div>
                </div>
                <div className="fraud-stat-card medium">
                  <FiAlertCircle />
                  <div>
                    <h3>{fraudStats.medium}</h3>
                    <p>Medium Risk</p>
                  </div>
                </div>
                <div className="fraud-stat-card low">
                  <FiAlertCircle />
                  <div>
                    <h3>{fraudStats.low}</h3>
                    <p>Low Risk</p>
                  </div>
                </div>
                <div className="fraud-stat-card total">
                  <FiShield />
                  <div>
                    <h3>{fraudStats.pending || fraudStats.total}</h3>
                    <p>Pending Review</p>
                  </div>
                </div>
              </div>
            </div>

            {loadingFraud ? (
              <div className="loading-message">
                <FiShield className="loading-icon" />
                <p>Loading fraud alerts...</p>
              </div>
            ) : fraudAlerts.length === 0 ? (
              <div className="empty-state">
                <FiShield size={48} />
                <h3>No Fraud Alerts</h3>
                <p>Click "Run Fraud Scan" to analyze the system for suspicious activities</p>
              </div>
            ) : (
              <div className="fraud-alerts-list">
                {fraudAlerts
                  .filter(alert => fraudFilter === 'all' || alert.severity === fraudFilter)
                  .map((alert) => (
                    <div key={alert._id} className={`fraud-alert-card severity-${alert.severity}`}>
                      <div className="fraud-alert-header">
                        <div className="fraud-alert-icon">
                          <FiAlertCircle />
                        </div>
                        <div className="fraud-alert-info">
                          <h3>{alert.title}</h3>
                          <p className="fraud-alert-description">{alert.description}</p>
                        </div>
                        <div className={`fraud-severity-badge ${alert.severity}`}>
                          {alert.severity.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="fraud-alert-details">
                        <div className="fraud-detail-row">
                          <span className="fraud-detail-label">Type:</span>
                          <span className="fraud-detail-value">{alert.type.replace(/_/g, ' ').toUpperCase()}</span>
                        </div>
                        
                        {alert.userName && (
                          <div className="fraud-detail-row">
                            <span className="fraud-detail-label">User:</span>
                            <span className="fraud-detail-value">{alert.userName} ({alert.userEmail})</span>
                          </div>
                        )}
                        
                        {alert.sellerName && (
                          <div className="fraud-detail-row">
                            <span className="fraud-detail-label">Seller:</span>
                            <span className="fraud-detail-value">{alert.sellerName} - {alert.storeName}</span>
                          </div>
                        )}
                        
                        {alert.productName && (
                          <div className="fraud-detail-row">
                            <span className="fraud-detail-label">Product:</span>
                            <span className="fraud-detail-value">{alert.productName}</span>
                          </div>
                        )}
                        
                        <div className="fraud-detail-row">
                          <span className="fraud-detail-label">Details:</span>
                          <span className="fraud-detail-value">{alert.details}</span>
                        </div>
                        
                        <div className="fraud-detail-row">
                          <span className="fraud-detail-label">Status:</span>
                          <span className="fraud-detail-value">{alert.status.toUpperCase()}</span>
                        </div>
                        
                        <div className="fraud-detail-row">
                          <span className="fraud-detail-label">Detected:</span>
                          <span className="fraud-detail-value">{new Date(alert.detectedAt).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="fraud-alert-actions">
                        {alert.userId && (
                          <>
                            <button 
                              className="action-btn view"
                              onClick={() => handleViewUser(alert.userId)}
                            >
                              <FiEye /> View User
                            </button>
                            <button 
                              className="action-btn block"
                              onClick={() => {
                                handleBlockUser(alert.userId);
                                resolveFraudAlert(alert._id, 'User blocked');
                              }}
                            >
                              <FiXCircle /> Block User
                            </button>
                          </>
                        )}
                        {alert.sellerId && (
                          <>
                            <button 
                              className="action-btn view"
                              onClick={() => handleViewSeller(alert.sellerId)}
                            >
                              <FiEye /> View Seller
                            </button>
                            <button 
                              className="action-btn suspend"
                              onClick={() => {
                                handleSuspendSeller(alert.sellerId);
                                resolveFraudAlert(alert._id, 'Seller suspended');
                              }}
                            >
                              <FiXCircle /> Suspend Seller
                            </button>
                          </>
                        )}
                        <button 
                          className="action-btn dismiss"
                          onClick={() => dismissFraudAlert(alert._id)}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
  );
}

export default AdminFraudDetectionTab;
