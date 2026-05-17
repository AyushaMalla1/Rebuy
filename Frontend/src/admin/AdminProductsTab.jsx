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

import './AdminProductsTab.css';
function AdminProductsTab() {
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
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                <FiPackage /> All Products
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
                onClick={() => setFilterStatus('approved')}
              >
                <FiCheckCircle /> Approved
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                <FiClock /> Pending
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilterStatus('rejected')}
              >
                <FiXCircle /> Rejected
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredProducts().length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                        <FiPackage size={48} style={{ color: '#d0d2d6', marginBottom: '10px' }} />
                        <p style={{ color: '#8e8e8e' }}>No products found</p>
                      </td>
                    </tr>
                  ) : (
                    getFilteredProducts().map(product => (
                      <tr key={product.id}>
                        <td>#{product.id}</td>
                        <td className="product-name">{product.name}</td>
                        <td>{product.seller}</td>
                        <td className="product-price">Rs. {product.price.toLocaleString()}</td>
                        <td>{product.stock} units</td>
                        <td>
                          <span className={`status-badge ${product.status.toLowerCase()}`}>
                            {product.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {product.status === 'Pending' && (
                              <>
                                <button className="approve-btn" onClick={() => handleApproveProduct(product.id)} title="Approve">
                                  <FiCheckCircle />
                                </button>
                                <button className="reject-btn" onClick={() => handleRejectProduct(product.id)} title="Reject">
                                  <FiXCircle />
                                </button>
                              </>
                            )}
                            <button className="view-btn" onClick={() => handleViewProduct(product.id)} title="View Details">
                              <FiEye />
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)} title="Delete">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
  );
}

export default AdminProductsTab;
