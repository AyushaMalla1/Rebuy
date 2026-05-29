import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiPackage, FiSettings, FiUserCheck, FiBell, FiAlertCircle, FiCheckCircle, FiMessageSquare, FiGrid } from 'react-icons/fi';
import { apiFetch } from './api';

export default function AdminDashboardController() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState(null); // null, 'revenue', 'orders', 'sellers', 'customers', 'avgOrder', 'commission', 'topCategory'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    users: [],
    products: [],
    orders: [],
    sellers: []
  });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [auditFilter, setAuditFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7'); // '7', '30', '90', '365', 'all'

  // State
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [suspendedSellers, setSuspendedSellers] = useState([]);
  const [rejectedSellers, setRejectedSellers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loyaltyRecords, setLoyaltyRecords] = useState([]);
  const [settings, setSettings] = useState({
    siteName: 'Rebuy',
    siteEmail: '',
    sitePhone: '',
    currency: 'NPR',
    taxRate: 13,
    shippingFee: 100,
    freeShippingThreshold: 5000,
    maintenanceMode: false,
    allowSellerRegistration: true,
    requireProductApproval: true,
    minOrderAmount: 100,
    maxOrderAmount: 100000,
    loyaltyPointsEnabled: true,
    pointsPerRupee: 1,
    paymentGateway: {
      provider: 'none',
      apiKey: '',
      secretKey: '',
      merchantId: '',
      isEnabled: false,
      testMode: true
    }
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [payoutStats, setPayoutStats] = useState({
    pendingAmount: 0,
    completedAmount: 0,
    pendingCount: 0,
    completedCount: 0
  });
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Verification Approval State
  const [verifications, setVerifications] = useState([]);
  const [verificationStats, setVerificationStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Fraud Detection State
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [fraudStats, setFraudStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    byType: {}
  });
  const [loadingFraud, setLoadingFraud] = useState(false);
  const [fraudFilter, setFraudFilter] = useState('all');

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportStats, setSupportStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    unreadTickets: 0
  });
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportSearchQuery, setSupportSearchQuery] = useState('');
  const [supportFilterStatus, setSupportFilterStatus] = useState('all');
  const [supportFilterCategory, setSupportFilterCategory] = useState('all');
  const [supportFilterPriority, setSupportFilterPriority] = useState('all');

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          fullName: user.fullName || 'Administrator',
          email: user.email || 'admin@rebuy.com',
          phone: user.phone || '',
          city: user.city || '',
          address: user.address || '',
          country: 'Nepal',
          profileImage: user.profileImage || 'https://i.pravatar.cc/100'
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return {
      fullName: 'Administrator',
      email: 'admin@rebuy.com',
      phone: '',
      city: '',
      address: '',
      country: 'Nepal'
    };
  };

  const [profileData, setProfileData] = useState(getUserData());
  const [profileImage, setProfileImage] = useState(getUserData().profileImage || 'https://i.pravatar.cc/100');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'all',
    priority: 'medium',
    expiresAt: ''
  });

  // Chart data
  const [chartData, setChartData] = useState({
    revenue: [],
    topProducts: [],
    categories: [],
    userGrowth: [],
    sellerStats: [],
    productDistribution: [],
    ordersTrend: [],
    revenueBreakdown: []
  });
  const [salesStats, setSalesStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeSellers: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    commissionRate: 3,
    platformCommission: 0,
    topCategory: "Men's Collection",
    revenueGrowth: 0
  });

  useEffect(() => {
    fetchAdminData();
    fetchAnalyticsData();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchAdminData();
      fetchAnalyticsData();
      fetchNotifications();
    }, 120000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Load fraud alerts when fraud detection tab is active
  useEffect(() => {
    if (activeTab === 'fraud-detection') {
      fetchFraudDetection();
    }
  }, [activeTab]);

  const fetchAnalyticsData = async () => {
    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Silently fetch analytics data - don't show errors to user
      const response = await apiFetch(`/admin/analytics-data?days=${timeRange}`, { headers }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json().catch(() => null);

        if (data && data.success && data.chartData) {
          setChartData(data.chartData);
        }
      }

      // Silently fetch sales stats - don't show errors to user
      const salesResponse = await apiFetch(`/admin/sales-reports?days=${timeRange}`, { headers }).catch(() => null);

      if (salesResponse && salesResponse.ok) {
        const salesData = await salesResponse.json().catch(() => null);

        if (salesData && salesData.success && salesData.stats) {
          setSalesStats(salesData.stats);
          setChartData(prev => ({
            ...prev,
            revenue: salesData.revenueData?.length ? salesData.revenueData : prev.revenue,
            topProducts: salesData.topProducts?.length ? salesData.topProducts : prev.topProducts,
            categories: salesData.categoryPerformance?.length
              ? salesData.categoryPerformance.map(item => ({
                name: item.category || item.name || 'Category',
                value: item.count || item.value || 0
              }))
              : prev.categories
          }));
        }
      }
    } catch (error) {
      // Silently log error - analytics is not critical
      console.log('Analytics data unavailable');
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      const userStr = sessionStorage.getItem('user');

      if (!token || !userStr) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userStr);
      if (!(user.role === 'admin' || user.isAdmin || user.userType === 'admin')) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching admin data from backend...');

      // Add timeout to prevent infinite loading
      const fetchWithTimeout = (url, options, timeout = 10000) => {
        return Promise.race([
          apiFetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
      };

      const mockResponse = (status) => ({
        ok: false,
        status,
        json: async () => ({ success: false })
      });

      const [statsRes, usersRes, pendingSellersRes, approvedSellersRes, suspendedSellersRes, rejectedSellersRes, productsRes, ordersRes, auditRes, announcementsRes, loyaltyRes, settingsRes, profileRes] = await Promise.all([
        fetchWithTimeout('/admin/stats', { headers }).catch(err => {
          console.error('Stats fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/users', { headers }).catch(err => {
          console.error('Users fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/sellers/pending', { headers }).catch(err => {
          console.error('Pending sellers fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/sellers/approved', { headers }).catch(err => {
          console.error('Approved sellers fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/sellers/suspended', { headers }).catch(err => {
          console.error('Suspended sellers fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/sellers/rejected', { headers }).catch(err => {
          console.error('Rejected sellers fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/products', { headers }).catch(err => {
          console.error('Products fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/orders', { headers }).catch(err => {
          console.error('Orders fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/audit-logs', { headers }).catch(err => {
          console.error('Audit logs fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/announcements', { headers }).catch(err => {
          console.error('Announcements fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/loyalty-points', { headers }).catch(err => {
          console.error('Loyalty points fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout('/admin/settings', { headers }).catch(err => {
          // Settings endpoint should work without auth
          console.error('Settings fetch error:', err);
          return mockResponse(500);
        }),
        fetchWithTimeout(`/admin/profile?adminId=${JSON.parse(sessionStorage.getItem('user') || '{}')._id || ''}`, { headers }).catch(err => {
          // Profile endpoint requires auth - this is expected to fail sometimes
          return mockResponse(401);
        })
      ]);

      console.log('API Response statuses:', {
        stats: statsRes.status,
        users: usersRes.status,
        pendingSellers: pendingSellersRes.status,
        approvedSellers: approvedSellersRes.status,
        suspendedSellers: suspendedSellersRes.status,
        rejectedSellers: rejectedSellersRes.status,
        products: productsRes.status,
        orders: ordersRes.status,
        audit: auditRes.status,
        announcements: announcementsRes.status,
        loyalty: loyaltyRes.status,
        settings: settingsRes.status
        // profile status omitted - may require auth
      });

      // Check for authentication errors
      if (statsRes.status === 401 || usersRes.status === 401) {
        console.log('Authentication failed, redirecting to login');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const stats = await statsRes.json().catch(() => ({ success: false }));
      const usersData = await usersRes.json().catch(() => ({ success: false }));
      const pendingSellersData = await pendingSellersRes.json().catch(() => ({ success: false }));
      const approvedSellersData = await approvedSellersRes.json().catch(() => ({ success: false }));
      const suspendedSellersData = await suspendedSellersRes.json().catch(() => ({ success: false }));
      const rejectedSellersData = await rejectedSellersRes.json().catch(() => ({ success: false }));
      const productsData = await productsRes.json().catch(() => ({ success: false }));
      const ordersData = await ordersRes.json().catch(() => ({ success: false }));
      const auditData = await auditRes.json().catch(() => ({ success: false }));
      const announcementsData = await announcementsRes.json().catch(() => ({ success: false }));
      const loyaltyData = await loyaltyRes.json().catch(() => ({ success: false }));
      const settingsData = await settingsRes.json().catch(() => ({ success: false }));
      const profileDataRes = await profileRes.json().catch(() => ({ success: false }));

      console.log('Parsed data:', { stats, usersData, pendingSellersData, approvedSellersData, suspendedSellersData, rejectedSellersData, productsData, ordersData, auditData, announcementsData, loyaltyData, settingsData });

      if (stats.success) setAdminStats(stats.stats);
      if (usersData.success) {
        setUsers(usersData.users.map(u => ({
          id: u._id,
          name: u.fullName || u.name || 'Unknown',
          email: u.email,
          type: u.userType === 'seller' ? 'Seller' : 'Customer',
          status: u.isActive !== false ? 'Active' : 'Inactive',
          joined: new Date(u.createdAt).toLocaleDateString()
        })));
      }
      if (pendingSellersData.success) {
        setPendingSellers(pendingSellersData.sellers.map(s => ({
          id: s._id,
          name: s.fullName || s.name || 'Unknown',
          email: s.email,
          storeName: s.storeName || 'N/A',
          phone: s.phone || 'N/A',
          address: s.address || 'N/A',
          appliedDate: new Date(s.createdAt).toLocaleDateString(),
          documents: s.documentsVerified ? 'Verified' : 'Pending',
          experience: s.experience || 'Not specified'
        })));
      }
      if (approvedSellersData.success) {
        setApprovedSellers(approvedSellersData.sellers.map(s => ({
          id: s._id,
          name: s.fullName || s.name || 'Unknown',
          email: s.email,
          storeName: s.storeName || 'N/A',
          phone: s.phone || 'N/A',
          address: s.address || 'N/A',
          approvedDate: s.approvalData?.approvedAt ? new Date(s.approvalData.approvedAt).toLocaleDateString() : new Date(s.createdAt).toLocaleDateString(),
          totalSales: s.totalSales || 0,
          totalProducts: s.totalProducts || 0,
          rating: s.rating || 0,
          trustScore: s.trustScore?.score || 50
        })));
      }
      if (suspendedSellersData.success) {
        setSuspendedSellers(suspendedSellersData.sellers.map(s => ({
          id: s._id,
          name: s.fullName || s.name || 'Unknown',
          email: s.email,
          storeName: s.storeName || 'N/A',
          phone: s.phone || 'N/A',
          address: s.address || 'N/A',
          suspendedDate: s.deactivatedAt ? new Date(s.deactivatedAt).toLocaleDateString() : 'N/A',
          suspensionReason: s.approvalData?.suspensionReason || 'Not specified',
          totalSales: s.totalSales || 0,
          totalProducts: s.totalProducts || 0
        })));
      }
      if (rejectedSellersData.success) {
        setRejectedSellers(rejectedSellersData.sellers.map(s => ({
          id: s._id,
          name: s.fullName || s.name || 'Unknown',
          email: s.email,
          storeName: s.storeName || 'N/A',
          phone: s.phone || 'N/A',
          address: s.address || 'N/A',
          rejectedDate: new Date(s.createdAt).toLocaleDateString(),
          rejectionReason: s.approvalData?.rejectionReason || 'Not specified'
        })));
      }
      if (productsData.success) {
        setProducts(productsData.products.map(p => ({
          id: p._id,
          name: p.name,
          seller: p.seller?.fullName || p.seller?.name || p.sellerName || 'Unknown',
          price: p.price,
          stock: p.stock || 0,
          status: p.status || 'Pending'
        })));
      }
      if (ordersData.success) {
        setOrders(ordersData.orders.map(o => ({
          id: o._id,
          customer: o.customerName || o.customer?.fullName || 'Unknown',
          product: o.items?.[0]?.productName + (o.items?.length > 1 ? ` +${o.items.length - 1} more` : '') || 'Items',
          amount: o.total || 0,
          status: o.status || 'Processing',
          date: new Date(o.orderDate || o.createdAt).toLocaleDateString()
        })));
      }
      if (auditData.success) {
        setAuditLogs(auditData.logs || []);
      }
      if (announcementsData.success) {
        setAnnouncements(announcementsData.announcements || []);
      }
      if (loyaltyData.success) {
        setLoyaltyRecords(loyaltyData.loyaltyRecords || []);
      }
      if (settingsData.success) {
        setSettings(settingsData.settings || settings);
      }
      if (profileDataRes.success && profileDataRes.admin) {
        const admin = profileDataRes.admin;
        setProfileData({
          fullName: admin.fullName || admin.name || 'Administrator',
          email: admin.email || 'admin@rebuy.com',
          phone: admin.phone || '',
          city: admin.city || '',
          address: admin.address || '',
          country: admin.country || 'Nepal',
          profileImage: admin.profileImage || ''
        });
        if (admin.profileImage) {
          setProfileImage(admin.profileImage);
        }
      } else {
        console.log('Profile data not available, using defaults');
      }

      console.log('Admin data loaded successfully');
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/customers/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'deactivated' })
        });

        if (response.ok) {
          alert('User deactivated successfully');
          fetchAdminData();
        } else {
          alert('Failed to deactivate user');
        }
      } catch (err) {
        console.error(err);
        alert('Error deactivating user');
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/admin/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('Product deleted successfully');
          fetchAdminData();
        } else {
          alert('Failed to delete product');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting product');
      }
    }
  };

  const handleViewProduct = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const product = await response.json();
        setSelectedProduct(product);
        setShowProductModal(true);
      } else {
        alert('Failed to load product details');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading product');
    }
  };

  const handleViewUser = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setSelectedUser(userData);
        setShowUserModal(true);
      } else {
        alert('Failed to load user details');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading user');
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const order = await response.json();
        setSelectedOrder(order);
        setShowOrderModal(true);
      } else {
        alert('Failed to load order details');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Error loading order details');
    }
  };

  const handleApproveSeller = async (id) => {
    if (window.confirm('Approve this seller application?')) {
      try {
        const token = sessionStorage.getItem('token');
        const row = pendingSellers.find(s => s.id === id);
        const response = await apiFetch(`/admin/sellers/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'approved' })
        });

        if (response.ok) {
          alert(`${row?.name || 'Seller'} has been approved successfully!`);
          fetchAdminData();
        } else {
          alert('Failed to approve seller');
        }
      } catch (err) {
        console.error(err);
        alert('Error approving seller');
      }
    }
  };

  const handleRejectSeller = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && window.confirm('Reject this seller application?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/admin/sellers/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'rejected', reason })
        });

        if (response.ok) {
          alert('Seller application rejected');
          fetchAdminData();
        } else {
          alert('Failed to reject seller');
        }
      } catch (err) {
        console.error(err);
        alert('Error rejecting seller');
      }
    }
  };

  const handleBlockUser = async (userId) => {
    if (window.confirm('Block this user for suspicious activity?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/customers/${userId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'suspended' })
        });

        if (response.ok) {
          alert('User has been blocked successfully!');
          fetchAdminData();
        } else {
          alert('Failed to block user');
        }
      } catch (err) {
        console.error(err);
        alert('Error blocking user');
      }
    }
  };

  const handleViewSeller = async (sellerId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/admin/sellers/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedSeller(data.seller);
        setShowSellerModal(true);
      } else {
        alert('Failed to load seller details');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading seller details');
    }
  };

  const handleSuspendSeller = async (sellerId) => {
    const reason = prompt('Please provide a reason for suspension:');
    if (reason && window.confirm('Suspend this seller?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/admin/sellers/${sellerId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'suspended', reason })
        });

        if (response.ok) {
          alert('Seller suspended successfully');
          fetchAdminData();
        } else {
          alert('Failed to suspend seller');
        }
      } catch (err) {
        console.error(err);
        alert('Error suspending seller');
      }
    }
  };

  const handleReactivateSeller = async (sellerId) => {
    if (window.confirm('Reactivate this seller?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/admin/sellers/${sellerId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'approved' })
        });

        if (response.ok) {
          alert('Seller reactivated successfully');
          fetchAdminData();
        } else {
          alert('Failed to reactivate seller');
        }
      } catch (err) {
        console.error(err);
        alert('Error reactivating seller');
      }
    }
  };

  const handleAnnouncementFormChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAnnouncementForm = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('token');
      const userData = JSON.parse(sessionStorage.getItem('user'));

      console.log('Creating announcement with data:', {
        ...announcementForm,
        createdBy: userData._id
      });

      const response = await apiFetch('/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...announcementForm,
          createdBy: userData._id,
          expiresAt: announcementForm.expiresAt || null
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        alert('Announcement created and notifications sent!');
        setShowAnnouncementForm(false);
        setAnnouncementForm({
          title: '',
          message: '',
          type: 'info',
          targetAudience: 'all',
          priority: 'medium',
          expiresAt: ''
        });
        fetchAdminData();
      } else {
        alert('Failed to create announcement: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      alert('Error creating announcement: ' + err.message);
    }
  };

  const handleToggleAnnouncement = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/announcements/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchAdminData();
      } else {
        alert('Failed to update announcement');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/announcements/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          alert('Announcement deleted');
          fetchAdminData();
        } else {
          alert('Failed to delete announcement');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting announcement');
      }
    }
  };

  const handleUpdateLoyaltyPoints = async (userId, points) => {
    try {
      const token = sessionStorage.getItem('token');
      const action = points > 0 ? 'add' : 'subtract';
      const response = await apiFetch(`/admin/loyalty-points/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ points: Math.abs(points), action })
      });

      if (response.ok) {
        alert('Loyalty points updated');
        fetchAdminData();
      } else {
        alert('Failed to update loyalty points');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating loyalty points');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch('/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully');
        fetchAdminData();
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    }
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Search users
    const filteredUsers = users.filter(user =>
      user.name?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery) ||
      user.type?.toLowerCase().includes(lowerQuery)
    );

    // Search products
    const filteredProducts = products.filter(product =>
      product.name?.toLowerCase().includes(lowerQuery) ||
      product.seller?.toLowerCase().includes(lowerQuery) ||
      product.status?.toLowerCase().includes(lowerQuery)
    );

    // Search orders
    const filteredOrders = orders.filter(order =>
      order.id?.toLowerCase().includes(lowerQuery) ||
      order.customer?.toLowerCase().includes(lowerQuery) ||
      order.product?.toLowerCase().includes(lowerQuery) ||
      order.status?.toLowerCase().includes(lowerQuery)
    );

    // Search sellers (from all seller lists)
    const allSellers = [...pendingSellers, ...approvedSellers, ...suspendedSellers, ...rejectedSellers];
    const filteredSellers = allSellers.filter(seller =>
      seller.name?.toLowerCase().includes(lowerQuery) ||
      seller.email?.toLowerCase().includes(lowerQuery) ||
      seller.storeName?.toLowerCase().includes(lowerQuery)
    );

    setSearchResults({
      users: filteredUsers.slice(0, 5),
      products: filteredProducts.slice(0, 5),
      orders: filteredOrders.slice(0, 5),
      sellers: filteredSellers.slice(0, 5)
    });

    setShowSearchResults(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const response = await apiFetch('/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileData,
          profileImage: profileImage,
          adminId: user._id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          fullName: data.admin?.fullName || profileData.fullName,
          email: data.admin?.email || profileData.email,
          phone: data.admin?.phone || profileData.phone,
          profileImage: data.admin?.profileImage || profileImage
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated'));
        alert('Profile updated successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleAdminProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Profile image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setProfileData(prev => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // CSV Download Functions
  const downloadAllSellersCSV = () => {
    const totalSellers = pendingSellers.length + approvedSellers.length + suspendedSellers.length + rejectedSellers.length;

    if (totalSellers === 0) {
      alert('No sellers to export');
      return;
    }

    const headers = ['Status', 'Name', 'Store Name', 'Email', 'Phone', 'Address', 'Date', 'Total Sales', 'Products', 'Rating', 'Trust Score', 'Notes'];
    const rows = [];

    // Add pending sellers
    pendingSellers.forEach(seller => {
      rows.push([
        'Pending',
        seller.name,
        seller.storeName,
        seller.email,
        seller.phone,
        seller.address,
        seller.appliedDate,
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        seller.documents
      ]);
    });

    // Add approved sellers
    approvedSellers.forEach(seller => {
      rows.push([
        'Approved',
        seller.name,
        seller.storeName,
        seller.email,
        seller.phone,
        seller.address,
        seller.approvedDate,
        seller.totalSales,
        seller.totalProducts,
        seller.rating.toFixed(1),
        seller.trustScore,
        ''
      ]);
    });

    // Add suspended sellers
    suspendedSellers.forEach(seller => {
      rows.push([
        'Suspended',
        seller.name,
        seller.storeName,
        seller.email,
        seller.phone,
        seller.address,
        seller.suspendedDate,
        seller.totalSales,
        seller.totalProducts,
        'N/A',
        'N/A',
        seller.suspensionReason
      ]);
    });

    // Add rejected sellers
    rejectedSellers.forEach(seller => {
      rows.push([
        'Rejected',
        seller.name,
        seller.storeName,
        seller.email,
        seller.phone,
        seller.address,
        seller.rejectedDate,
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        seller.rejectionReason
      ]);
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `all_sellers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApproveProduct = async (id) => {
    if (window.confirm('Approve this product?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/products/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'approved' })
        });

        if (response.ok) {
          alert('Product approved successfully');
          fetchAdminData();
        } else {
          alert('Failed to approve product');
        }
      } catch (err) {
        console.error(err);
        alert('Error approving product');
      }
    }
  };

  const handleRejectProduct = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && window.confirm('Reject this product?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await apiFetch(`/products/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'rejected', reason })
        });

        if (response.ok) {
          alert('Product rejected');
          fetchAdminData();
        } else {
          alert('Failed to reject product');
        }
      } catch (err) {
        console.error(err);
        alert('Error rejecting product');
      }
    }
  };

  // Filter functions
  const getFilteredUsers = () => {
    let filtered = users;
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => u.type.toLowerCase() === filterStatus.toLowerCase());
    }
    return filtered;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get audit icon
  const getAuditIcon = (actionType) => {
    switch (actionType) {
      case 'seller': return <FiUserCheck />;
      case 'product': return <FiPackage />;
      case 'order': return <FiShoppingBag />;
      case 'user': return <FiUsers />;
      case 'system': return <FiSettings />;
      default: return <FiSettings />;
    }
  };

  const getFilteredProducts = () => {
    let filtered = products;
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seller.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === filterStatus);
    }
    return filtered;
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    if (searchQuery) {
      filtered = filtered.filter(o =>
        o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status.toLowerCase() === filterStatus);
    }
    return filtered;
  };

  const getFilteredAuditLogs = () => {
    if (auditFilter === 'all') return auditLogs;
    return auditLogs.filter(log => log.actionType === auditFilter);
  };

  // Stats
  const { totalUsers, totalSellers, totalProducts, totalOrders, totalRevenue, pendingProducts } = adminStats;

  // Sales Analytics Data
  const salesData = {
    totalRevenue: salesStats.totalRevenue || adminStats.totalRevenue,
    totalOrders: salesStats.totalOrders || adminStats.totalOrders,
    totalSellers: salesStats.activeSellers || adminStats.totalSellers,
    totalCustomers: salesStats.totalCustomers || adminStats.totalUsers,
    monthlyGrowth: salesStats.revenueGrowth || 0,
    topSellingCategory: salesStats.topCategory || "Men's Collection",
    averageOrderValue: salesStats.averageOrderValue || (adminStats.totalOrders > 0 ? (adminStats.totalRevenue / adminStats.totalOrders).toFixed(0) : 0),
    commissionRate: salesStats.commissionRate || 3,
    platformCommission: salesStats.platformCommission || 0
  };

  const ensureSalesChartData = () => {
    const fallbackRevenue = chartData.revenue?.length
      ? chartData.revenue
      : [{ day: 'No data', revenue: 0 }];

    return {
      revenue: fallbackRevenue,
      ordersTrend: chartData.ordersTrend?.length
        ? chartData.ordersTrend
        : fallbackRevenue.map(point => ({ ...point, orders: point.orders || 0 })),
      topProducts: chartData.topProducts?.length
        ? chartData.topProducts
        : [{ name: 'No sales yet', sales: 0 }],
      categories: chartData.categories?.length
        ? chartData.categories
        : [{ name: 'No category data', value: 0 }],
      userGrowth: chartData.userGrowth?.length
        ? chartData.userGrowth
        : [{ month: 'Now', users: salesData.totalCustomers || 0 }],
      sellerStats: chartData.sellerStats?.length
        ? chartData.sellerStats
        : [{ month: 'Now', sellers: salesData.totalSellers || 0 }],
      revenueBreakdown: chartData.revenueBreakdown?.length
        ? chartData.revenueBreakdown
        : [{ name: 'Revenue', value: salesData.totalRevenue || 0 }]
    };
  };

  const salesCharts = ensureSalesChartData();

  // Notification functions
  const fetchNotifications = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = user?._id || user?.id;
    if (!userId) return;

    setLoadingNotifications(true);
    try {
      const response = await apiFetch(`/notifications/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = user?._id || user?.id;
    if (!userId) return;

    try {
      const response = await apiFetch(`/notifications/${userId}/read-all`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await apiFetch(`/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(notifications.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fraud Detection functions
  const fetchFraudDetection = async () => {
    setLoadingFraud(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch('/admin/fraud-detection', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFraudAlerts(data.alerts || []);
        setFraudStats(data.stats || { total: 0, high: 0, medium: 0, low: 0, byType: {} });
      } else {
        console.error('Fraud detection failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching fraud detection:', error);
    } finally {
      setLoadingFraud(false);
    }
  };

  const runFraudScan = async () => {
    setLoadingFraud(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch('/admin/fraud-detection/scan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // Refresh alerts after scan
        fetchFraudDetection();
      } else {
        alert('Scan failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error running fraud scan:', error);
      alert('Error running fraud scan');
    } finally {
      setLoadingFraud(false);
    }
  };

  const dismissFraudAlert = async (alertId) => {
    if (!window.confirm('Dismiss this fraud alert?')) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/admin/fraud-detection/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'dismissed' })
      });

      const data = await response.json();

      if (data.success) {
        alert('Alert dismissed');
        fetchFraudDetection();
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const resolveFraudAlert = async (alertId, actionTaken) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/admin/fraud-detection/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'resolved',
          actionTaken
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Alert resolved');
        fetchFraudDetection();
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const response = await apiFetch(`/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const notification = notifications.find(n => n._id === notificationId);
        setNotifications(notifications.filter(n => n._id !== notificationId));
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Payout functions
  const fetchPayouts = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch('/payouts/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPayouts(data.payouts || []);
        setPayoutStats(data.summary || { pendingAmount: 0, completedAmount: 0 });
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  const handleCompletePayout = async (payoutId, transactionRef, adminNotes = '') => {
    if (!transactionRef) return;


    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/payouts/${payoutId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionReference: transactionRef, adminNotes })
      });

      const data = await response.json();

      if (data.success) {
        alert('Payout marked as completed!');
        fetchPayouts();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error completing payout:', error);
      alert('Failed to complete payout');
    }
  };

  const handleCancelPayout = async (payoutId, reason) => {
    if (!reason) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch(`/payouts/${payoutId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Payout cancelled');
        fetchPayouts();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error cancelling payout:', error);
      alert('Failed to cancel payout');
    }
  };

  // Load payouts when tab is active
  useEffect(() => {
    if (activeTab === 'payouts') {
      fetchPayouts();
    }
  }, [activeTab]);

  // Verification Approval Functions
  const fetchVerifications = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await apiFetch('/admin/verifications/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerifications(data.verifications || []);

        // Calculate stats
        const pending = data.verifications.filter(v => v.approvalStatus === 'pending').length;
        const approved = data.verifications.filter(v => v.approvalStatus === 'approved').length;
        const rejected = data.verifications.filter(v => v.approvalStatus === 'rejected').length;

        setVerificationStats({ pending, approved, rejected });
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const handleApproveVerification = async (verificationId) => {
    if (!window.confirm('Approve this condition verification? It will become public.')) return;

    try {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const response = await apiFetch(`/admin/verifications/${verificationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId: user._id || user.id })
      });

      const data = await response.json();

      if (data.success) {
        alert('Verification approved and made public!');
        fetchVerifications();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    }
  };

  const handleRejectVerification = async (verificationId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const response = await apiFetch(`/admin/verifications/${verificationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason, adminId: user._id || user.id })
      });

      const data = await response.json();

      if (data.success) {
        alert('Verification rejected');
        fetchVerifications();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    }
  };

  // Load verifications when tab is active
  useEffect(() => {
    if (activeTab === 'verifications') {
      fetchVerifications();
    }
  }, [activeTab]);

  const getNotificationIcon = (type, severity) => {
    if (type === 'order') return <FiShoppingBag />;
    if (type === 'product') return <FiPackage />;
    if (type === 'message') return <FiMessageSquare />;
    if (type === 'stock') return <FiAlertCircle />;
    if (type === 'system') return <FiSettings />;

    if (severity === 'error') return <FiAlertCircle />;
    if (severity === 'warning') return <FiAlertCircle />;
    if (severity === 'success') return <FiCheckCircle />;
    return <FiBell />;
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification._id);
    setShowNotifications(false);

    switch (notification.type) {
      case 'order':
        setActiveTab('orders');
        break;
      case 'product':
        setActiveTab('products');
        break;
      case 'message':
        setActiveTab('overview');
        break;
      case 'stock':
        setActiveTab('products');
        break;
      case 'system':
        setActiveTab('overview');
        break;
      default:
        setActiveTab('overview');
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        const notificationWrapper = document.querySelector('.notification-wrapper');
        if (notificationWrapper && !notificationWrapper.contains(event.target)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const adminDashboardContext = {
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
    salesData,
    salesCharts,
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
  };

  return adminDashboardContext;
}
