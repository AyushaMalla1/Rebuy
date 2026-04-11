import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiShoppingBag, FiPackage, FiTrendingUp, 
  FiSettings, FiLogOut, FiHome, FiShield, FiEdit2, FiTrash2, 
  FiEye, FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiDownload,
  FiBarChart2, FiPieChart, FiActivity, FiClock, FiAlertCircle,
  FiUserCheck, FiMonitor, FiAward, FiBell, FiMessageSquare, FiGrid, FiUser, FiChevronRight
} from 'react-icons/fi';
import { FaEdit, FaUser as FaUserIcon, FaChartBar, FaBox, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import { 
  MdPeople, MdStorefront, MdInventory, MdAttachMoney, MdShowChart, MdAccessTime
} from 'react-icons/md';
import './AdminDashboard.css';
import Chatbot from './components/Chatbot';
import { 
  RevenueTrendChart, 
  TopProductsChart, 
  CategoryPerformanceChart, 
  StockLevelsChart,
  UserGrowthChart,
  SellerStatsChart,
  ProductDistributionChart,
  OrdersTrendChart,
  RevenueBreakdownChart
} from './components/Charts';

function AdminDashboard() {
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

  // State
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [suspendedSellers, setSuspendedSellers] = useState([]);
  const [rejectedSellers, setRejectedSellers] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
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
  const [fraudFilter, setFraudFilter] = useState('all'); // all, high, medium, low
  
  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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

  React.useEffect(() => {
    fetchAdminData();
    fetchAnalyticsData();
    fetchNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAdminData();
      fetchAnalyticsData();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load fraud alerts when fraud detection tab is active
  React.useEffect(() => {
    if (activeTab === 'fraud-detection') {
      fetchFraudDetection();
    }
  }, [activeTab]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found for analytics data');
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('📊 Fetching analytics data from backend...');
      const response = await fetch('http://localhost:5000/api/admin/analytics-data', { headers });
      
      console.log('📡 Analytics response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Analytics data received:', data);
        
        if (data.success && data.chartData) {
          console.log('📈 Chart data structure:', {
            revenue: data.chartData.revenue?.length || 0,
            topProducts: data.chartData.topProducts?.length || 0,
            categories: data.chartData.categories?.length || 0,
            userGrowth: data.chartData.userGrowth?.length || 0,
            sellerStats: data.chartData.sellerStats?.length || 0,
            productDistribution: data.chartData.productDistribution?.length || 0,
            ordersTrend: data.chartData.ordersTrend?.length || 0,
            revenueBreakdown: data.chartData.revenueBreakdown?.length || 0
          });
          setChartData(data.chartData);
          console.log('✅ Chart data set successfully!');
        } else {
          console.log('❌ No chart data in response:', data);
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Analytics response not OK:', response.status, errorText);
      }

      // Fetch sales stats
      console.log('📊 Fetching sales stats...');
      const salesResponse = await fetch('http://localhost:5000/api/admin/sales-reports', { headers });
      
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        console.log('✅ Sales stats received:', salesData);
        
        if (salesData.success && salesData.stats) {
          setSalesStats(salesData.stats);
          console.log('✅ Sales stats set successfully!');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching admin data from backend...');

      const [statsRes, usersRes, pendingSellersRes, approvedSellersRes, suspendedSellersRes, rejectedSellersRes, productsRes, ordersRes, auditRes, announcementsRes, loyaltyRes, settingsRes, profileRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', { headers }).catch(err => {
          console.error('Stats fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/users', { headers }).catch(err => {
          console.error('Users fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/sellers/pending', { headers }).catch(err => {
          console.error('Pending sellers fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/sellers/approved', { headers }).catch(err => {
          console.error('Approved sellers fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/sellers/suspended', { headers }).catch(err => {
          console.error('Suspended sellers fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/sellers/rejected', { headers }).catch(err => {
          console.error('Rejected sellers fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/products', { headers }).catch(err => {
          console.error('Products fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/orders', { headers }).catch(err => {
          console.error('Orders fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/audit-logs', { headers }).catch(err => {
          console.error('Audit logs fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/announcements', { headers }).catch(err => {
          console.error('Announcements fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/loyalty-points', { headers }).catch(err => {
          console.error('Loyalty points fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/settings', { headers }).catch(err => {
          console.error('Settings fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/profile', { headers }).catch(err => {
          console.error('Profile fetch error:', err);
          return { ok: false, status: 500 };
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
        settings: settingsRes.status,
        profile: profileRes.status
      });

      // Check for authentication errors
      if (statsRes.status === 401 || usersRes.status === 401) {
        console.log('Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
          country: admin.country || 'Nepal'
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/customers/${id}/status`, {
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
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
        const token = localStorage.getItem('token');
        const row = pendingSellers.find(s => s.id === id);
        const response = await fetch(`http://localhost:5000/api/admin/sellers/${id}/status`, {
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/sellers/${id}/status`, {
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/customers/${userId}/status`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}`, {
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/status`, {
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/status`, {
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
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      console.log('Creating announcement with data:', {
        ...announcementForm,
        createdBy: userData._id
      });
      
      const response = await fetch('http://localhost:5000/api/announcements', {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/announcements/${id}/toggle`, {
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
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
      const token = localStorage.getItem('token');
      const action = points > 0 ? 'add' : 'subtract';
      const response = await fetch(`http://localhost:5000/api/admin/loyalty-points/${userId}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
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

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setProfileData({ ...profileData, profileImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileData,
          profileImage: profileImage
        }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  // CSV Download Functions
  const downloadPendingSellersCSV = () => {
    if (pendingSellers.length === 0) {
      alert('No pending sellers to export');
      return;
    }

    const headers = ['Name', 'Store Name', 'Email', 'Phone', 'Address', 'Applied Date', 'Documents'];
    const rows = pendingSellers.map(seller => [
      seller.name,
      seller.storeName,
      seller.email,
      seller.phone,
      seller.address,
      seller.appliedDate,
      seller.documents
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pending_sellers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadApprovedSellersCSV = () => {
    if (approvedSellers.length === 0) {
      alert('No approved sellers to export');
      return;
    }

    const headers = ['Name', 'Store Name', 'Email', 'Phone', 'Total Sales', 'Products', 'Rating', 'Trust Score'];
    const rows = approvedSellers.map(seller => [
      seller.name,
      seller.storeName,
      seller.email,
      seller.phone,
      seller.totalSales,
      seller.totalProducts,
      seller.rating.toFixed(1),
      seller.trustScore
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `approved_sellers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSuspendedSellersCSV = () => {
    if (suspendedSellers.length === 0) {
      alert('No suspended sellers to export');
      return;
    }

    const headers = ['Name', 'Store Name', 'Email', 'Phone', 'Suspended Date', 'Reason', 'Total Sales', 'Products'];
    const rows = suspendedSellers.map(seller => [
      seller.name,
      seller.storeName,
      seller.email,
      seller.phone,
      seller.suspendedDate,
      seller.suspensionReason,
      seller.totalSales,
      seller.totalProducts
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `suspended_sellers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadRejectedSellersCSV = () => {
    if (rejectedSellers.length === 0) {
      alert('No rejected sellers to export');
      return;
    }

    const headers = ['Name', 'Store Name', 'Email', 'Phone', 'Address', 'Rejected Date', 'Reason'];
    const rows = rejectedSellers.map(seller => [
      seller.name,
      seller.storeName,
      seller.email,
      seller.phone,
      seller.address,
      seller.rejectedDate,
      seller.rejectionReason
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rejected_sellers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/products/${id}/status`, {
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/products/${id}/status`, {
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

  // Helper function to format time ago
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
    switch(actionType) {
      case 'seller': return <FiUserCheck />;
      case 'product': return <FiPackage />;
      case 'order': return <FiShoppingBag />;
      case 'user': return <FiUsers />;
      case 'system': return <FiSettings />;
      default: return <FiActivity />;
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

  // Notification functions
  const fetchNotifications = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    setLoadingNotifications(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${user._id}`);
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
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/notifications/user/${user._id}/read-all`, {
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
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/fraud-detection', {
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/fraud-detection/scan', {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/fraud-detection/${alertId}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/fraud-detection/${alertId}`, {
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
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
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

  const getNotificationIcon = (type, severity) => {
    if (type === 'order') return <FiShoppingBag />;
    if (type === 'product') return <FiPackage />;
    if (type === 'message') return <FiMessageSquare />;
    if (type === 'stock') return <FiAlertCircle />;
    if (type === 'system') return <FiActivity />;
    
    if (severity === 'error') return <FiXCircle />;
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
  React.useEffect(() => {
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

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img 
            src="/logo.png" 
            alt="Rebuy" 
            className="sidebar-logo"
            onError={(e) => {
              console.error('Logo failed to load');
              e.target.style.display = 'none';
            }}
          />
          <h2></h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            <FiGrid /> Dashboard
          </button>
          <button 
            className={activeTab === 'seller-approval' ? 'active' : ''} 
            onClick={() => setActiveTab('seller-approval')}
          >
            <FiUserCheck /> Seller Approval
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <FiUsers /> User Management
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''} 
            onClick={() => setActiveTab('products')}
          >
            <FiMonitor /> Product Monitoring
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingBag /> Orders
          </button>

          <button 
            className={activeTab === 'sales' ? 'active' : ''} 
            onClick={() => setActiveTab('sales')}
          >
            <FiBarChart2 /> Sales & Reports
          </button>
          <button 
            className={activeTab === 'audit' ? 'active' : ''} 
            onClick={() => setActiveTab('audit')}
          >
            <FiClock /> Audit Log
          </button>

          <button 
            className={activeTab === 'fraud-detection' ? 'active' : ''} 
            onClick={() => setActiveTab('fraud-detection')}
          >
            <FiShield /> Fraud Detection
          </button>

          <button 
            className={activeTab === 'announcements' ? 'active' : ''} 
            onClick={() => setActiveTab('announcements')}
          >
            <FiBell /> Announcements
          </button>
          <button 
            className={activeTab === 'loyalty' ? 'active' : ''} 
            onClick={() => setActiveTab('loyalty')}
          >
            <FiAward /> Loyalty Points
          </button>

          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings /> Settings
          </button>
          
          <button 
            className="logout-menu-btn"
            onClick={handleLogout}
          >
            <FiLogOut /> Logout
          </button>
        </nav>

      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>
              {activeTab === 'overview' && 'Admin Dashboard'}
              {activeTab === 'seller-approval' && 'Seller Approval'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'products' && 'Product Monitoring'}
              {activeTab === 'orders' && 'Orders Management'}
              {activeTab === 'sales' && 'Sales & Reports'}
              {activeTab === 'audit' && 'Audit Log'}
              {activeTab === 'fraud-detection' && 'Fraud Detection'}
              {activeTab === 'announcements' && 'Announcements'}
              {activeTab === 'loyalty' && 'Loyalty Points'}
              {activeTab === 'profile' && 'Admin Profile'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="header-subtitle">
              <FiActivity className="subtitle-icon" />
              {activeTab === 'overview' && 'Manage your e-commerce platform efficiently'}
              {activeTab === 'seller-approval' && 'Review and approve seller applications'}
              {activeTab === 'users' && 'Manage users and their accounts'}
              {activeTab === 'products' && 'Monitor and approve product listings'}
              {activeTab === 'orders' && 'Track and manage customer orders'}
              {activeTab === 'sales' && 'View sales analytics and reports'}
              {activeTab === 'audit' && 'View system activity logs'}
              {activeTab === 'fraud-detection' && 'Detect and prevent fraudulent activities'}
              {activeTab === 'announcements' && 'Manage platform announcements'}
              {activeTab === 'loyalty' && 'Manage loyalty points program'}
              {activeTab === 'profile' && 'Manage your admin account'}
              {activeTab === 'settings' && 'Configure platform settings'}
            </p>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-btn"
                title="Notifications"
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="notification-count-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown">
                  {/* Header */}
                  <div className="notification-header">
                    <h3 className="notification-header-title">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="notification-mark-read"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="notification-list">
                    {loadingNotifications ? (
                      <div className="notification-loading">
                        <div className="notification-loading-spinner"></div>
                        <p className="notification-loading-text">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-empty">
                        <div className="notification-empty-icon-wrapper">
                          <FiBell size={36} />
                        </div>
                        <h4 className="notification-empty-title">All caught up!</h4>
                        <p>You don't have any notifications right now</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`notification-item ${notif.isRead ? '' : 'unread'}`}
                        >
                          <div className="notification-content">
                            <div className={`notification-icon-wrapper ${notif.severity}`}>
                              {getNotificationIcon(notif.type, notif.severity)}
                            </div>
                            <div className="notification-body">
                              <h4 className="notification-title">
                                {notif.title}
                                <span className={`notification-type-badge ${notif.type}`}>
                                  {notif.type}
                                </span>
                              </h4>
                              <p className="notification-message">
                                {notif.message}
                              </p>
                              {notif.metadata && notif.metadata.customerNotes && (
                                <p className="notification-customer-notes">
                                  <strong>Customer notes:</strong> {notif.metadata.customerNotes}
                                </p>
                              )}
                              <div className="notification-footer">
                                <span className="notification-time">
                                  <FiClock size={10} />
                                  {formatNotificationTime(notif.createdAt)}
                                </span>
                                <button
                                  onClick={(e) => deleteNotification(notif._id, e)}
                                  className="notification-delete-btn"
                                >
                                  <FiTrash2 size={10} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="search-results-dropdown">
                  <div className="search-results-header">
                    <h4>Search Results</h4>
                    <button onClick={() => setShowSearchResults(false)} className="close-search-btn">
                      <FiXCircle />
                    </button>
                  </div>
                  
                  {searchResults.users.length === 0 && 
                   searchResults.products.length === 0 && 
                   searchResults.orders.length === 0 && 
                   searchResults.sellers.length === 0 ? (
                    <div className="no-search-results">
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="search-results-content">
                      {searchResults.users.length > 0 && (
                        <div className="search-category">
                          <h5>Users ({searchResults.users.length})</h5>
                          {searchResults.users.map(user => (
                            <div 
                              key={user.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('users');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <FiUsers className="result-icon" />
                              <div>
                                <p className="result-title">{user.name}</p>
                                <p className="result-subtitle">{user.email} • {user.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.products.length > 0 && (
                        <div className="search-category">
                          <h5>Products ({searchResults.products.length})</h5>
                          {searchResults.products.map(product => (
                            <div 
                              key={product.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('products');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <FiPackage className="result-icon" />
                              <div>
                                <p className="result-title">{product.name}</p>
                                <p className="result-subtitle">Rs. {product.price} • {product.seller}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.orders.length > 0 && (
                        <div className="search-category">
                          <h5>Orders ({searchResults.orders.length})</h5>
                          {searchResults.orders.map(order => (
                            <div 
                              key={order.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('orders');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <FiShoppingBag className="result-icon" />
                              <div>
                                <p className="result-title">{order.customer}</p>
                                <p className="result-subtitle">Rs. {order.amount} • {order.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {searchResults.sellers.length > 0 && (
                        <div className="search-category">
                          <h5>Sellers ({searchResults.sellers.length})</h5>
                          {searchResults.sellers.map(seller => (
                            <div 
                              key={seller.id} 
                              className="search-result-item"
                              onClick={() => {
                                setActiveTab('seller-approval');
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <MdStorefront className="result-icon" />
                              <div>
                                <p className="result-title">{seller.storeName}</p>
                                <p className="result-subtitle">{seller.name} • {seller.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="admin-info" onClick={() => setActiveTab('profile')} style={{cursor: 'pointer'}}>
              <div className="admin-avatar">
                <FiShield />
              </div>
              <div className="admin-details">
                <p className="admin-name">{profileData.fullName}</p>
                <p className="admin-role">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
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

              <div className="stat-card red">
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper red">
                    <MdShowChart className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Growth Rate</p>
                    <h3 className="stat-value">12.5%</h3>
                  </div>
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

            {/* Recent Activity */}
            <div className="activity-section">
              <div className="section-title-row">
                <h2>
                  <FiClock className="section-icon" />
                  Recent Activity
                </h2>
                <button className="view-all-btn">
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

                <div className="activity-card">
                  <div className="activity-card-header">
                    <h3>
                      <FiAlertCircle className="card-icon" />
                      Pending Approvals
                    </h3>
                    <span className="badge warning">{pendingProducts + pendingSellers.length}</span>
                  </div>
                  <div className="activity-list">
                    {/* Pending Sellers */}
                    {pendingSellers.slice(0, 2).map(seller => (
                      <div key={seller.id} className="activity-item">
                        <div className="activity-icon warning">
                          <FiUserCheck />
                        </div>
                        <div className="activity-info">
                          <p className="activity-title">
                            <strong>{seller.name}</strong> - Seller Application
                          </p>
                          <span className="activity-time">{seller.storeName}</span>
                        </div>
                        <div className="quick-actions">
                          <button className="quick-approve" onClick={() => handleApproveSeller(seller.id)}>
                            <FiCheckCircle />
                          </button>
                          <button className="quick-reject" onClick={() => handleRejectSeller(seller.id)}>
                            <FiXCircle />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Pending Products */}
                    {products.filter(p => p.status === 'Pending').slice(0, 2).map(product => (
                      <div key={product.id} className="activity-item">
                        <div className="activity-icon warning">
                          <FiPackage />
                        </div>
                        <div className="activity-info">
                          <p className="activity-title">
                            <strong>{product.name}</strong> by {product.seller}
                          </p>
                          <span className="activity-time">Awaiting approval</span>
                        </div>
                        <div className="quick-actions">
                          <button className="quick-approve" onClick={() => handleApproveProduct(product.id)}>
                            <FiCheckCircle />
                          </button>
                          <button className="quick-reject" onClick={() => handleRejectProduct(product.id)}>
                            <FiXCircle />
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingSellers.length === 0 && products.filter(p => p.status === 'Pending').length === 0 && (
                      <div className="activity-item" style={{ justifyContent: 'center', padding: '20px' }}>
                        <p style={{ color: '#8e8e8e' }}>No pending approvals</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {/* Analytics Overview - Quick Insights */}
            <div className="activity-section">
              <div className="section-title-row">
                <h2>
                  <FiBarChart2 className="section-icon" />
                  Analytics Overview
                </h2>
              </div>
              
              {/* Revenue Trend (Line) and Category Performance (Pie) */}
              <div className="chart-container">
                <RevenueTrendChart data={chartData.revenue} />
                <CategoryPerformanceChart data={chartData.categories} />
              </div>
            </div>
          </>
            )}
          </>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="content-section">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                <FiUsers /> All Users
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'seller' ? 'active' : ''}`}
                onClick={() => setFilterStatus('seller')}
              >
                <FiShoppingBag /> Sellers
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'customer' ? 'active' : ''}`}
                onClick={() => setFilterStatus('customer')}
              >
                <FiUsers /> Customers
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUsers().length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                        <FiUsers size={48} style={{ color: '#d0d2d6', marginBottom: '10px' }} />
                        <p style={{ color: '#8e8e8e' }}>No users found</p>
                      </td>
                    </tr>
                  ) : (
                    getFilteredUsers().map(user => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td className="user-name">{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`type-badge ${user.type.toLowerCase()}`}>
                            {user.type}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.joined}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-btn" onClick={() => handleViewUser(user.id)} title="View Details">
                              <FiEye />
                            </button>
                            <button className="edit-btn" title="Edit User">
                              <FiEdit2 />
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteUser(user.id)} title="Delete User">
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
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
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
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="content-section">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                <FiFilter /> All Orders
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
                onClick={() => setFilterStatus('processing')}
              >
                <FiClock /> Processing
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
                onClick={() => setFilterStatus('shipped')}
              >
                <FiPackage /> Shipped
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilterStatus('delivered')}
              >
                <FiCheckCircle /> Delivered
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredOrders().length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                        <FiShoppingBag size={48} style={{ color: '#d0d2d6', marginBottom: '10px' }} />
                        <p style={{ color: '#8e8e8e' }}>No orders found</p>
                      </td>
                    </tr>
                  ) : (
                    getFilteredOrders().map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td className="customer-name">{order.customer}</td>
                        <td>{order.product}</td>
                        <td className="order-amount">Rs. {order.amount.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.date}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="view-btn" 
                              title="View Details"
                              onClick={() => handleViewOrder(order._id || order.id)}
                            >
                              <FiEye />
                            </button>
                            <button className="edit-btn" title="Update Status">
                              <FiEdit2 />
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
        )}

        {/* Seller Approval Tab */}
        {activeTab === 'seller-approval' && (
          <div className="content-section">
            {/* Export All Button at Top */}
            <div className="export-all-section">
              <button 
                className="export-all-btn" 
                onClick={downloadAllSellersCSV}
                disabled={pendingSellers.length + approvedSellers.length + suspendedSellers.length + rejectedSellers.length === 0}
              >
                <FiDownload /> Export
              </button>
            </div>

            {/* Pending Sellers Section */}
            <div className="section-header">
              <h2>
                <FiClock className="section-icon" />
                Pending Approvals ({pendingSellers.length})
              </h2>
            </div>
            
            {pendingSellers.length === 0 ? (
              <div className="empty-state-card">
                <FiUserCheck size={64} />
                <h3>No Pending Applications</h3>
                <p>All seller applications have been reviewed</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Seller Name</th>
                      <th>Store Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Applied Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSellers.map(seller => (
                      <tr key={seller.id}>
                        <td>
                          <div className="seller-name-cell">
                            <div className="seller-avatar-small">{seller.name.charAt(0)}</div>
                            <span>{seller.name}</span>
                          </div>
                        </td>
                        <td className="store-name-cell">{seller.storeName}</td>
                        <td>{seller.email}</td>
                        <td>{seller.phone}</td>
                        <td>{seller.address}</td>
                        <td>{seller.appliedDate}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="approve-btn"
                              onClick={() => handleApproveSeller(seller.id)}
                              title="Approve Seller"
                            >
                              <FiCheckCircle />
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleRejectSeller(seller.id)}
                              title="Reject Seller"
                            >
                              <FiXCircle />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Approved Sellers Section */}
            <div className="section-header" style={{marginTop: '40px'}}>
              <h2>
                <FiCheckCircle className="section-icon" />
                Approved Sellers ({approvedSellers.length})
              </h2>
            </div>
            
            {approvedSellers.length === 0 ? (
              <div className="empty-state-card">
                <FiUserCheck size={64} />
                <h3>No Approved Sellers</h3>
                <p>No sellers have been approved yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Seller Name</th>
                      <th>Store Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Total Sales</th>
                      <th>Products</th>
                      <th>Rating</th>
                      <th>Trust Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedSellers.map(seller => (
                      <tr key={seller.id} className="approved-row">
                        <td>
                          <div className="seller-name-cell">
                            <div className="seller-avatar-small approved">{seller.name.charAt(0)}</div>
                            <span>{seller.name}</span>
                          </div>
                        </td>
                        <td className="store-name-cell">{seller.storeName}</td>
                        <td>{seller.email}</td>
                        <td>{seller.phone}</td>
                        <td className="sales-cell">Rs. {seller.totalSales.toLocaleString()}</td>
                        <td className="products-cell">{seller.totalProducts}</td>
                        <td className="rating-cell">
                          <span className="rating-badge">⭐ {seller.rating.toFixed(1)}</span>
                        </td>
                        <td className="trust-cell">
                          <span className={`trust-badge ${seller.trustScore >= 70 ? 'high' : seller.trustScore >= 40 ? 'medium' : 'low'}`}>
                            {seller.trustScore}/100
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="view-btn"
                              onClick={() => handleViewSeller(seller.id)}
                              title="View Profile"
                            >
                              <FiEye />
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleSuspendSeller(seller.id)}
                              title="Suspend Seller"
                            >
                              <FiXCircle />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Suspended Sellers Section */}
            <div className="section-header" style={{marginTop: '40px'}}>
              <h2>
                <FiAlertCircle className="section-icon" style={{color: '#ff9800'}} />
                Suspended Sellers ({suspendedSellers.length})
              </h2>
            </div>
            
            {suspendedSellers.length === 0 ? (
              <div className="empty-state-card">
                <FiAlertCircle size={64} />
                <h3>No Suspended Sellers</h3>
                <p>No sellers have been suspended</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Seller Name</th>
                      <th>Store Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Suspended Date</th>
                      <th>Reason</th>
                      <th>Total Sales</th>
                      <th>Products</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspendedSellers.map(seller => (
                      <tr key={seller.id} className="suspended-row">
                        <td>
                          <div className="seller-name-cell">
                            <div className="seller-avatar-small suspended">{seller.name.charAt(0)}</div>
                            <span>{seller.name}</span>
                          </div>
                        </td>
                        <td className="store-name-cell">{seller.storeName}</td>
                        <td>{seller.email}</td>
                        <td>{seller.phone}</td>
                        <td>{seller.suspendedDate}</td>
                        <td className="reason-cell">{seller.suspensionReason}</td>
                        <td className="sales-cell">Rs. {seller.totalSales.toLocaleString()}</td>
                        <td className="products-cell">{seller.totalProducts}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="view-btn"
                              onClick={() => handleViewSeller(seller.id)}
                              title="View Profile"
                            >
                              <FiEye />
                            </button>
                            <button 
                              className="approve-btn"
                              onClick={() => handleReactivateSeller(seller.id)}
                              title="Reactivate Seller"
                            >
                              <FiCheckCircle />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rejected Sellers Section */}
            <div className="section-header" style={{marginTop: '40px'}}>
              <h2>
                <FiXCircle className="section-icon" style={{color: '#f44336'}} />
                Rejected Sellers ({rejectedSellers.length})
              </h2>
            </div>
            
            {rejectedSellers.length === 0 ? (
              <div className="empty-state-card">
                <FiXCircle size={64} />
                <h3>No Rejected Sellers</h3>
                <p>No seller applications have been rejected</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Seller Name</th>
                      <th>Store Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Rejected Date</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedSellers.map(seller => (
                      <tr key={seller.id} className="rejected-row">
                        <td>
                          <div className="seller-name-cell">
                            <div className="seller-avatar-small rejected">{seller.name.charAt(0)}</div>
                            <span>{seller.name}</span>
                          </div>
                        </td>
                        <td className="store-name-cell">{seller.storeName}</td>
                        <td>{seller.email}</td>
                        <td>{seller.phone}</td>
                        <td>{seller.address}</td>
                        <td>{seller.rejectedDate}</td>
                        <td className="reason-cell">{seller.rejectionReason}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="view-btn"
                              onClick={() => handleViewSeller(seller.id)}
                              title="View Profile"
                            >
                              <FiEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sales & Reports Tab */}
        {activeTab === 'sales' && (
          <div className="content-section">
            <button 
              className="export-btn" 
              style={{marginBottom: '20px'}}
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch('http://localhost:5000/api/admin/export-sales-report', {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });

                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  }
                } catch (error) {
                  console.error('Error exporting report:', error);
                }
              }}
            >
              <FiDownload /> Export Sales Report
            </button>

            {/* Analytics Stats - Clickable */}
            <div className="analytics-grid">
              <div 
                className={`analytics-card revenue clickable-analytics ${selectedMetric === 'revenue' ? 'active' : ''}`}
                onClick={() => setSelectedMetric(selectedMetric === 'revenue' ? null : 'revenue')}
                title="Click to view revenue charts"
              >
                <p className="analytics-label">Total Revenue</p>
                <h3>Rs. {salesData.totalRevenue.toLocaleString()}</h3>
                <span className="analytics-detail">+{salesData.monthlyGrowth}%</span>
                <FiChevronRight className="card-arrow" />
              </div>

              <div 
                className={`analytics-card orders clickable-analytics ${selectedMetric === 'orders' ? 'active' : ''}`}
                onClick={() => setSelectedMetric(selectedMetric === 'orders' ? null : 'orders')}
                title="Click to view orders charts"
              >
                <p className="analytics-label">Total Orders</p>
                <h3>{salesData.totalOrders}</h3>
                <span className="analytics-detail">This month</span>
                <FiChevronRight className="card-arrow" />
              </div>

              <div 
                className={`analytics-card sellers clickable-analytics ${selectedMetric === 'sellers' ? 'active' : ''}`}
                onClick={() => setSelectedMetric(selectedMetric === 'sellers' ? null : 'sellers')}
                title="Click to view seller charts"
              >
                <p className="analytics-label">Active Sellers</p>
                <h3>{salesData.totalSellers}</h3>
                <span className="analytics-detail">Verified</span>
                <FiChevronRight className="card-arrow" />
              </div>

              <div 
                className={`analytics-card customers clickable-analytics ${selectedMetric === 'customers' ? 'active' : ''}`}
                onClick={() => setSelectedMetric(selectedMetric === 'customers' ? null : 'customers')}
                title="Click to view customer charts"
              >
                <p className="analytics-label">Total Customers</p>
                <h3>{salesData.totalCustomers}</h3>
                <span className="analytics-detail">Registered</span>
                <FiChevronRight className="card-arrow" />
              </div>
            </div>

            {/* Additional Metrics - Clickable */}
            <div className="metrics-row">
              <div 
                className={`metric-card clickable-metric ${selectedMetric === 'avgOrder' ? 'active' : ''}`}
                onClick={() => setSelectedMetric(selectedMetric === 'avgOrder' ? null : 'avgOrder')}
              >
                <h4>Average Order Value</h4>
                <p className="metric-value">Rs. {salesData.averageOrderValue.toLocaleString()}</p>
              </div>
              <div 
                className={`metric-card clickable-metric ${selectedMetric === 'commission' ? 'active' : ''}`}
                onClick={() => setSelectedMetric(selectedMetric === 'commission' ? null : 'commission')}
              >
                <h4>Commission Rate</h4>
                <p className="metric-value">{salesData.commissionRate}%</p>
              </div>
              <div 
                className={`metric-card clickable-metric ${selectedMetric === 'topCategory' ? 'active' : ''}`}
                onClick={() => setSelectedMetric(selectedMetric === 'topCategory' ? null : 'topCategory')}
              >
                <h4>Top Category</h4>
                <p className="metric-value">{salesData.topSellingCategory}</p>
              </div>
            </div>

            {/* Dynamic Charts Based on Selected Metric */}
            {selectedMetric === 'revenue' && (
              <div className="dynamic-charts" style={{marginTop: '30px'}}>
                <div className="chart-container">
                  <RevenueTrendChart data={chartData.revenue} />
                </div>
                <div className="chart-container" style={{marginTop: '20px'}}>
                  <RevenueBreakdownChart data={chartData.revenueBreakdown} title="Revenue Breakdown by Category" />
                </div>
              </div>
            )}

            {selectedMetric === 'orders' && (
              <div className="dynamic-charts" style={{marginTop: '30px'}}>
                <div className="chart-container">
                  <OrdersTrendChart data={chartData.ordersTrend} />
                </div>
              </div>
            )}

            {selectedMetric === 'sellers' && (
              <div className="dynamic-charts" style={{marginTop: '30px'}}>
                <div className="chart-container">
                  <SellerStatsChart data={chartData.sellerStats} title="Seller Growth" />
                </div>
              </div>
            )}

            {selectedMetric === 'customers' && (
              <div className="dynamic-charts" style={{marginTop: '30px'}}>
                <div className="chart-container">
                  <UserGrowthChart data={chartData.userGrowth} />
                </div>
              </div>
            )}

            {selectedMetric === 'avgOrder' && (
              <div className="dynamic-charts" style={{marginTop: '30px'}}>
                <div className="chart-container">
                  <div className="commission-summary" style={{padding: '40px', textAlign: 'center'}}>
                    <h3 style={{fontSize: '16px', marginBottom: '20px', color: '#333', fontWeight: '600'}}>Average Order Value</h3>
                    <div style={{fontSize: '48px', fontWeight: 'bold', color: '#00bcd4', marginBottom: '20px'}}>
                      Rs. {salesData.averageOrderValue?.toLocaleString() || 0}
                    </div>
                    <div style={{fontSize: '18px', color: '#666', marginBottom: '10px'}}>
                      Per Order
                    </div>
                    <div style={{fontSize: '14px', color: '#999'}}>
                      Based on {salesData.totalOrders} total orders with Rs. {salesData.totalRevenue?.toLocaleString()} revenue
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'commission' && (
              <div className="dynamic-charts" style={{marginTop: '30px'}}>
                <div className="chart-container">
                  <div className="commission-summary" style={{padding: '40px', textAlign: 'center'}}>
                    <h3 style={{fontSize: '16px', marginBottom: '20px', color: '#333', fontWeight: '600'}}>Platform Commission Earnings</h3>
                    <div style={{fontSize: '48px', fontWeight: 'bold', color: '#00bcd4', marginBottom: '20px'}}>
                      Rs. {salesData.platformCommission?.toLocaleString() || 0}
                    </div>
                    <div style={{fontSize: '18px', color: '#666', marginBottom: '10px'}}>
                      Total Commission Earned
                    </div>
                    <div style={{fontSize: '14px', color: '#999'}}>
                      Based on {salesData.commissionRate}% commission rate across {salesData.totalOrders} orders
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'topCategory' && (
              <div className="dynamic-charts" style={{marginTop: '30px'}}>
                <div className="chart-container">
                  <TopProductsChart data={chartData.topProducts} title="Top Selling Products by Category" />
                </div>
                <div className="chart-container" style={{marginTop: '20px'}}>
                  <CategoryPerformanceChart data={chartData.categories} />
                </div>
              </div>
            )}

            {/* Default Charts when nothing is selected */}
            {!selectedMetric && (
              <>
                <div className="chart-container" style={{marginTop: '30px'}}>
                  <RevenueTrendChart data={chartData.revenue} />
                </div>

                <div className="metrics-row" style={{marginTop: '20px'}}>
                  <div className="chart-container">
                    <TopProductsChart data={chartData.topProducts} />
                  </div>
                  <div className="chart-container">
                    <CategoryPerformanceChart data={chartData.categories} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
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
        )}

        {/* Fraud Detection Tab */}
        {activeTab === 'fraud-detection' && (
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
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="content-section">
            <button 
              className="export-btn" 
              style={{marginBottom: '20px'}}
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
            >
              <FiBell /> {showAnnouncementForm ? 'Cancel' : 'Create Announcement'}
            </button>

            {showAnnouncementForm && (
              <div className="form-card" style={{marginBottom: '30px'}}>
                <h3>Create New Announcement</h3>
                <form onSubmit={handleCreateAnnouncementForm}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        name="title"
                        value={announcementForm.title}
                        onChange={handleAnnouncementFormChange}
                        required
                        placeholder="Enter announcement title"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      name="message"
                      value={announcementForm.message}
                      onChange={handleAnnouncementFormChange}
                      required
                      rows="4"
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
                      <label>Target Audience</label>
                      <select name="targetAudience" value={announcementForm.targetAudience} onChange={handleAnnouncementFormChange}>
                        <option value="all">All Users</option>
                        <option value="sellers">Sellers Only</option>
                        <option value="customers">Customers Only</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select name="priority" value={announcementForm.priority} onChange={handleAnnouncementFormChange}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Expires At (Optional)</label>
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      value={announcementForm.expiresAt}
                      onChange={handleAnnouncementFormChange}
                    />
                  </div>

                  <button type="submit" className="submit-btn">Create & Send Notifications</button>
                </form>
              </div>
            )}

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
            </div>

            {announcements.length === 0 && !showAnnouncementForm && (
              <div className="empty-state-card">
                <FiBell size={64} />
                <h3>No Announcements</h3>
                <p>Create announcements to notify users</p>
              </div>
            )}
          </div>
        )}

        {/* Loyalty Points Tab */}
        {activeTab === 'loyalty' && (
          <div className="content-section">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Points</th>
                    <th>Tier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyRecords.map(record => (
                    <tr key={record._id}>
                      <td className="user-name">{record.userId?.fullName || 'Unknown'}</td>
                      <td>{record.userId?.email || 'N/A'}</td>
                      <td><strong>{record.points}</strong></td>
                      <td>
                        <span className="type-badge">
                          {record.points >= 1000 ? 'Gold' : record.points >= 500 ? 'Silver' : 'Bronze'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn add-btn"
                            title="Add Points"
                            onClick={() => {
                              const points = prompt('Enter points to add:', '100');
                              if (points && !isNaN(points)) {
                                handleUpdateLoyaltyPoints(record.userId._id, parseInt(points));
                              }
                            }}
                          >
                            + Add
                          </button>
                          <button 
                            className="action-btn subtract-btn"
                            title="Subtract Points"
                            onClick={() => {
                              const points = prompt('Enter points to subtract:', '50');
                              if (points && !isNaN(points)) {
                                handleUpdateLoyaltyPoints(record.userId._id, -parseInt(points));
                              }
                            }}
                          >
                            - Subtract
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loyaltyRecords.length === 0 && (
              <div className="empty-state-card">
                <FiAward size={64} />
                <h3>No Loyalty Records</h3>
                <p>Loyalty points will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="products-section" style={{marginTop: '40px'}}>
            {/* Profile Card */}
            <div className="profile-card">
              {/* Profile Header */}
              <div className="profile-header">
                <div>
                  <h2 className="profile-store-name">
                    {profileData.fullName}
                  </h2>
                  <span className="profile-verified-badge">
                    Admin Account
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="profile-section-title">
                    <FaUserIcon /> Personal Information
                  </h3>
                  <div className="profile-form-grid">
                    <div>
                      <label className="profile-form-label">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        disabled
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
                        disabled
                        className="profile-form-input"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="content-section">
            <div className="settings-form">
              <div className="settings-section">
                <h3>General Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Site Name</label>
                    <input 
                      type="text" 
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      placeholder="Rebuy"
                    />
                  </div>
                  <div className="form-group">
                    <label>Site Email</label>
                    <input 
                      type="email" 
                      value={settings.siteEmail}
                      onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                      placeholder="support@rebuy.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Site Phone</label>
                    <input 
                      type="text" 
                      value={settings.sitePhone}
                      onChange={(e) => setSettings({...settings, sitePhone: e.target.value})}
                      placeholder="+977-1-XXXXXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    >
                      <option value="NPR">NPR - Nepalese Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Financial Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tax Rate (%)</label>
                    <input 
                      type="number" 
                      value={settings.taxRate}
                      onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                      placeholder="13"
                    />
                  </div>
                  <div className="form-group">
                    <label>Shipping Fee (Rs.)</label>
                    <input 
                      type="number" 
                      value={settings.shippingFee}
                      onChange={(e) => setSettings({...settings, shippingFee: parseFloat(e.target.value)})}
                      placeholder="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Free Shipping Threshold (Rs.)</label>
                    <input 
                      type="number" 
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({...settings, freeShippingThreshold: parseFloat(e.target.value)})}
                      placeholder="5000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Order Amount (Rs.)</label>
                    <input 
                      type="number" 
                      value={settings.minOrderAmount}
                      onChange={(e) => setSettings({...settings, minOrderAmount: parseFloat(e.target.value)})}
                      placeholder="1000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Platform Commission Rate (%)</label>
                    <input 
                      type="number" 
                      value={settings.commissionRate || 3}
                      onChange={(e) => setSettings({...settings, commissionRate: parseFloat(e.target.value)})}
                      placeholder="3"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Return Window (Days)</label>
                    <input 
                      type="number" 
                      value={settings.returnWindow || 7}
                      onChange={(e) => setSettings({...settings, returnWindow: parseInt(e.target.value)})}
                      placeholder="7"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Platform Controls</h3>
                <div className="form-group-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    />
                    Maintenance Mode
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.allowSellerRegistration}
                      onChange={(e) => setSettings({...settings, allowSellerRegistration: e.target.checked})}
                    />
                    Allow Seller Registration
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.requireProductApproval}
                      onChange={(e) => setSettings({...settings, requireProductApproval: e.target.checked})}
                    />
                    Require Product Approval
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.loyaltyPointsEnabled}
                      onChange={(e) => setSettings({...settings, loyaltyPointsEnabled: e.target.checked})}
                    />
                    Enable Loyalty Points
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Payment Gateway Configuration</h3>
                <p style={{fontSize: '13px', color: '#666', marginBottom: '20px'}}>
                  Configure eSewa payment gateway. COD (Cash on Delivery) is always available and doesn't require configuration.
                </p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Merchant ID</label>
                    <input 
                      type="text" 
                      value={settings.paymentGateway?.merchantId || ''}
                      onChange={(e) => setSettings({
                        ...settings, 
                        paymentGateway: {...settings.paymentGateway, merchantId: e.target.value}
                      })}
                      placeholder="EPAYTEST"
                    />
                  </div>
                  <div className="form-group">
                    <label>Secret Key</label>
                    <input 
                      type="password" 
                      value={settings.paymentGateway?.secretKey || ''}
                      onChange={(e) => setSettings({
                        ...settings, 
                        paymentGateway: {...settings.paymentGateway, secretKey: e.target.value}
                      })}
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.paymentGateway?.isEnabled || false}
                      onChange={(e) => setSettings({
                        ...settings, 
                        paymentGateway: {...settings.paymentGateway, isEnabled: e.target.checked}
                      })}
                    />
                    Enable eSewa Payment Gateway
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.paymentGateway?.testMode || false}
                      onChange={(e) => setSettings({
                        ...settings, 
                        paymentGateway: {...settings.paymentGateway, testMode: e.target.checked}
                      })}
                    />
                    Test Mode (Use test credentials)
                  </label>
                </div>
              </div>

              <button 
                className="save-settings-btn"
                onClick={handleSaveSettings}
              >
                <FiCheckCircle /> Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={() => setShowOrderModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Order ID:</label>
                    <span>#{selectedOrder._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Date:</label>
                    <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Payment Method:</label>
                    <span>{selectedOrder.paymentMethod?.toUpperCase()}</span>
                  </div>
                  <div className="info-item">
                    <label>Payment Status:</label>
                    <span className={`status-badge ${selectedOrder.paymentStatus?.toLowerCase()}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="info-item">
                      <label>Transaction ID:</label>
                      <span>{selectedOrder.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-info-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress?.fullName}</p>
                <p>{selectedOrder.shippingAddress?.address}</p>
                <p>{selectedOrder.shippingAddress?.city} {selectedOrder.shippingAddress?.postalCode}</p>
                <p>{selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="order-info-section">
                <h3>Order Items</h3>
                <div className="order-items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.productImage} alt={item.productName} />
                      <div className="item-info">
                        <h4>{item.productName}</h4>
                        <p>Seller: {item.sellerName}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        Rs. {item.subtotal?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-info-section">
                <h3>Order Summary</h3>
                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>Rs. {selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>Rs. {selectedOrder.shippingCost?.toLocaleString()}</span>
                  </div>
                  <div className="total-row final">
                    <span>Total:</span>
                    <span>Rs. {selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Product Details</h2>
              <button className="close-btn" onClick={() => setShowProductModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>Product Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Product ID:</label>
                    <span>#{selectedProduct._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Category:</label>
                    <span>{selectedProduct.category}</span>
                  </div>
                  <div className="info-item">
                    <label>Subcategory:</label>
                    <span>{selectedProduct.subcategory || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Price:</label>
                    <span>Rs. {selectedProduct.price?.toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Stock:</label>
                    <span>{selectedProduct.stock} units</span>
                  </div>
                  <div className="info-item">
                    <label>Size:</label>
                    <span>{selectedProduct.size}</span>
                  </div>
                  <div className="info-item">
                    <label>Condition:</label>
                    <span>{selectedProduct.condition}</span>
                  </div>
                  <div className="info-item">
                    <label>Brand:</label>
                    <span>{selectedProduct.brand || 'Unbranded'}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedProduct.status?.toLowerCase()}`}>
                      {selectedProduct.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Seller Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Seller Name:</label>
                    <span>{selectedProduct.sellerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Store Name:</label>
                    <span>{selectedProduct.storeName}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Description</h3>
                <p>{selectedProduct.description}</p>
              </div>

              {selectedProduct.story && (
                <div className="order-info-section">
                  <h3>Product Story</h3>
                  <p>{selectedProduct.story}</p>
                </div>
              )}

              <div className="order-info-section">
                <h3>Product Images</h3>
                <div className="product-images-grid">
                  {selectedProduct.images?.map((img, index) => (
                    <img key={index} src={img} alt={`Product ${index + 1}`} style={{width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px'}} />
                  ))}
                </div>
              </div>

              <div className="order-info-section">
                <h3>Payment Options</h3>
                <p>{selectedProduct.paymentOptions?.join(', ').toUpperCase() || 'N/A'}</p>
              </div>

              {selectedProduct.discount?.active && (
                <div className="order-info-section">
                  <h3>Discount</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Percentage:</label>
                      <span>{selectedProduct.discount.percentage}%</span>
                    </div>
                    <div className="info-item">
                      <label>Start Date:</label>
                      <span>{new Date(selectedProduct.discount.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <label>End Date:</label>
                      <span>{new Date(selectedProduct.discount.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>User Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>User ID:</label>
                    <span>#{selectedUser._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedUser.fullName || selectedUser.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="info-item">
                    <label>User Type:</label>
                    <span className={`type-badge ${selectedUser.userType?.toLowerCase()}`}>
                      {selectedUser.userType}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Joined Date:</label>
                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="order-info-section">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{selectedUser.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.storeName && (
                <div className="order-info-section">
                  <h3>Seller Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Store Name:</label>
                      <span>{selectedUser.storeName}</span>
                    </div>
                    {selectedUser.address && (
                      <div className="info-item">
                        <label>Address:</label>
                        <span>{selectedUser.address}</span>
                      </div>
                    )}
                    {selectedUser.city && (
                      <div className="info-item">
                        <label>City:</label>
                        <span>{selectedUser.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {showSellerModal && selectedSeller && (
        <div className="modal-overlay" onClick={() => setShowSellerModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seller Details</h2>
              <button className="close-btn" onClick={() => setShowSellerModal(false)}>
                <FiXCircle />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>Seller Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Seller ID:</label>
                    <span>#{selectedSeller._id}</span>
                  </div>
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedSeller.fullName || selectedSeller.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedSeller.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{selectedSeller.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedSeller.status}`}>
                      {selectedSeller.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Joined Date:</label>
                    <span>{new Date(selectedSeller.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Store Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Store Name:</label>
                    <span>{selectedSeller.storeName}</span>
                  </div>
                  <div className="info-item">
                    <label>Store Description:</label>
                    <span>{selectedSeller.storeDescription || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Address:</label>
                    <span>{selectedSeller.address}</span>
                  </div>
                  <div className="info-item">
                    <label>City:</label>
                    <span>{selectedSeller.city}</span>
                  </div>
                </div>
              </div>

              <div className="order-info-section">
                <h3>Performance Metrics</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Total Sales:</label>
                    <span className="sales-cell">Rs. {selectedSeller.totalSales?.toLocaleString() || 0}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Products:</label>
                    <span>{selectedSeller.totalProducts || 0}</span>
                  </div>
                  <div className="info-item">
                    <label>Rating:</label>
                    <span>⭐ {selectedSeller.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="info-item">
                    <label>Trust Score:</label>
                    <span className={`trust-badge ${selectedSeller.trustScore?.score >= 70 ? 'high' : selectedSeller.trustScore?.score >= 40 ? 'medium' : 'low'}`}>
                      {selectedSeller.trustScore?.score || 50}/100
                    </span>
                  </div>
                </div>
              </div>

              {selectedSeller.status === 'suspended' && selectedSeller.approvalData?.suspensionReason && (
                <div className="order-info-section">
                  <h3>Suspension Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Reason:</label>
                      <span>{selectedSeller.approvalData.suspensionReason}</span>
                    </div>
                    {selectedSeller.deactivatedAt && (
                      <div className="info-item">
                        <label>Suspended Date:</label>
                        <span>{new Date(selectedSeller.deactivatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default AdminDashboard;
