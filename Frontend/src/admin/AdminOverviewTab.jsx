import {
  FiUsers, FiShoppingBag, FiPackage, FiSettings, FiShield, FiEdit2, FiTrash2,
  FiEye, FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiDownload, FiActivity, FiBarChart2,
  FiClock, FiAlertCircle, FiUserCheck, FiAward, FiMessageSquare, FiGrid,
  FiDollarSign, FiChevronRight, FiBell, FiUser
} from 'react-icons/fi';
import { MdPeople, MdStorefront, MdInventory, MdAttachMoney, MdShowChart } from 'react-icons/md';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSupport from './AdminSupport';
import AdminSalesReportsTab from './AdminSalesReportsTab';
import AdminPayoutsTab from './AdminPayoutsTab';
import AdminProfileTab from './AdminProfileTab';
import {
  CategoryPerformanceChart,
  OrdersTrendChart,
  RevenueTrendChart,
  SellerStatsChart,
  UserGrowthChart
} from '../components/Charts';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminOverviewTab.css';
function AdminOverviewTab() {
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

  const totalUsers = adminStats.totalUsers || users.length;
  const totalSellers = adminStats.totalSellers || pendingSellers.length + approvedSellers.length + suspendedSellers.length;
  const totalProducts = adminStats.totalProducts || products.length;
  const totalOrders = adminStats.totalOrders || orders.length;
  const totalRevenue = adminStats.totalRevenue || 0;
  const dashboardCharts = ensureSalesChartData();

  return (
    <>
      {loading ? (
        <div className="loading-state">
          <FiActivity size={48} className="loading-icon" />
          <p>Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <FiAlertCircle size={48} />
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchAdminData} className="retry-btn">
            <FiActivity /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div
              className="stat-card blue clickable-stat"
              onClick={() => setActiveTab('users')}
              title="Click to view user management"
            >
              <div className="stat-card-content">
                <div className="stat-icon-wrapper blue">
                  <MdPeople className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Users</p>
                  <h3 className="stat-value">{totalUsers}</h3>
                </div>
              </div>
              <div className="click-indicator">
                <FiChevronRight />
              </div>
            </div>

            <div
              className="stat-card green clickable-stat"
              onClick={() => setActiveTab('seller-approval')}
              title="Click to view seller approval"
            >
              <div className="stat-card-content">
                <div className="stat-icon-wrapper green">
                  <MdStorefront className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Sellers</p>
                  <h3 className="stat-value">{totalSellers}</h3>
                </div>
              </div>
              <div className="click-indicator">
                <FiChevronRight />
              </div>
            </div>

            <div
              className="stat-card orange clickable-stat"
              onClick={() => setActiveTab('products')}
              title="Click to view product monitoring"
            >
              <div className="stat-card-content">
                <div className="stat-icon-wrapper orange">
                  <MdInventory className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Products</p>
                  <h3 className="stat-value">{totalProducts}</h3>
                </div>
              </div>
              <div className="click-indicator">
                <FiChevronRight />
              </div>
            </div>

            <div
              className="stat-card purple clickable-stat"
              onClick={() => setActiveTab('orders')}
              title="Click to view orders management"
            >
              <div className="stat-card-content">
                <div className="stat-icon-wrapper purple">
                  <FiShoppingBag className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Orders</p>
                  <h3 className="stat-value">{totalOrders}</h3>
                </div>
              </div>
              <div className="click-indicator">
                <FiChevronRight />
              </div>
            </div>

            <div
              className="stat-card cyan clickable-stat"
              onClick={() => setActiveTab('sales')}
              title="Click to view detailed revenue analytics"
            >
              <div className="stat-card-content">
                <div className="stat-icon-wrapper cyan">
                  <MdAttachMoney className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Revenue</p>
                  <h3 className="stat-value">Rs. {totalRevenue.toLocaleString()}</h3>
                </div>
              </div>
              <div className="click-indicator">
                <FiChevronRight />
              </div>
            </div>
          </div>

          <div className="dashboard-charts-section">
            <div className="section-title-row">
              <h2>
                <FiBarChart2 className="section-icon" />
                Platform Analytics
              </h2>
              <button className="view-all-btn" onClick={() => setActiveTab('sales')}>
                View Reports <FiChevronRight />
              </button>
            </div>
            <div className="dashboard-chart-grid">
                <CategoryPerformanceChart data={dashboardCharts.categories} title="Revenue by Category" />
                <SellerStatsChart data={dashboardCharts.sellerStats} />
              </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="section-title-row">
              <h2>
                <FiClock className="section-icon" />
                Recent Activity
              </h2>
              <button
                className="view-all-btn"
                onClick={() => setActiveTab('audit')}
              >
                View All <FiEye />
              </button>
            </div>
            <div className="activity-grid">
              <div className="activity-card">
                <div className="activity-card-header">
                  <h3>
                    <FiShoppingBag className="card-icon" />
                    Recent Orders
                  </h3>
                  <span className="badge">{orders.length}</span>
                </div>
                <div className="activity-list">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="activity-item">
                      <div className="activity-icon">
                        <FiShoppingBag />
                      </div>
                      <div className="activity-info">
                        <p className="activity-title">
                          <strong>{order.customer}</strong> ordered {order.product}
                        </p>
                        <span className="activity-time">{order.date}</span>
                      </div>
                      <span className={`activity-status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Seller Approvals Section */}
          <div className="activity-section">
            <div className="section-title-row">
              <h2>
                <FiUserCheck className="section-icon" />
                Pending Seller Approvals ({pendingSellers.length})
              </h2>
              <button
                className="view-all-btn"
                onClick={() => setActiveTab('seller-approval')}
              >
                View All <FiChevronRight />
              </button>
            </div>

            <div className="sellers-approval-grid">
              {pendingSellers.length > 0 ? (
                pendingSellers.slice(0, 3).map(seller => (
                  <div key={seller.id} className="seller-approval-card">
                    <div className="seller-card-header">
                      <div className="seller-avatar">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="seller-info">
                        <h3>{seller.name}</h3>
                        <p className="store-name">{seller.storeName}</p>
                      </div>
                      <span className="doc-badge pending">Pending</span>
                    </div>
                    <div className="seller-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{seller.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{seller.phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Applied Date</span>
                        <span className="detail-value">{seller.appliedDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Documents</span>
                        <span className="detail-value">{seller.documents}</span>
                      </div>
                    </div>
                    <div className="seller-actions">
                      <button className="approve-btn" onClick={() => handleApproveSeller(seller.id)}>
                        <FiCheckCircle /> Approve
                      </button>
                      <button className="reject-btn" onClick={() => handleRejectSeller(seller.id)}>
                        <FiXCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px 0', color: '#666', fontStyle: 'italic' }}>
                  No pending seller approvals at the moment.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default AdminOverviewTab;
