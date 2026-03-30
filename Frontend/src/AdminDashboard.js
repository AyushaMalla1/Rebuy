import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiShoppingBag, FiPackage, FiTrendingUp, 
  FiSettings, FiLogOut, FiHome, FiShield, FiEdit2, FiTrash2, 
  FiEye, FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiDownload,
  FiBarChart2, FiPieChart, FiActivity, FiClock, FiAlertCircle,
  FiUserCheck, FiMonitor, FiAward, FiBell, FiMessageSquare, FiGrid, FiUser
} from 'react-icons/fi';
import { 
  MdPeople, MdStorefront, MdInventory, MdAttachMoney, MdShowChart, MdAccessTime
} from 'react-icons/md';
import './AdminDashboard.css';
import Chatbot from './components/Chatbot';
import { RevenueTrendChart, TopProductsChart, CategoryPerformanceChart, StockLevelsChart } from './components/Charts';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
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
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  // Chart data
  const [chartData, setChartData] = useState({
    revenue: [
      { day: 'Mon', revenue: 1200 },
      { day: 'Tue', revenue: 1900 },
      { day: 'Wed', revenue: 1500 },
      { day: 'Thu', revenue: 2200 },
      { day: 'Fri', revenue: 2800 },
      { day: 'Sat', revenue: 3200 },
      { day: 'Sun', revenue: 2600 }
    ],
    topProducts: [
      { name: 'Vintage Jacket', sales: 45 },
      { name: 'Retro Shoes', sales: 38 },
      { name: 'Classic Watch', sales: 32 },
      { name: 'Denim Jeans', sales: 28 },
      { name: 'Leather Bag', sales: 25 }
    ],
    categories: [
      { name: 'Vintage', value: 35 },
      { name: 'Retro', value: 25 },
      { name: 'Classic', value: 20 },
      { name: 'Modern', value: 15 },
      { name: 'Other', value: 5 }
    ]
  });

  React.useEffect(() => {
    fetchAdminData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

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

      const [statsRes, usersRes, sellersRes, productsRes, ordersRes, fraudRes, auditRes, announcementsRes, loyaltyRes, settingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', { headers }).catch(err => {
          console.error('Stats fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/users', { headers }).catch(err => {
          console.error('Users fetch error:', err);
          return { ok: false, status: 500 };
        }),
        fetch('http://localhost:5000/api/admin/sellers/pending', { headers }).catch(err => {
          console.error('Sellers fetch error:', err);
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
        fetch('http://localhost:5000/api/admin/fraud-alerts', { headers }).catch(err => {
          console.error('Fraud alerts fetch error:', err);
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
        })
      ]);

      console.log('API Response statuses:', {
        stats: statsRes.status,
        users: usersRes.status,
        sellers: sellersRes.status,
        products: productsRes.status,
        orders: ordersRes.status,
        fraud: fraudRes.status,
        audit: auditRes.status,
        announcements: announcementsRes.status,
        loyalty: loyaltyRes.status,
        settings: settingsRes.status
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
      const sellersData = await sellersRes.json().catch(() => ({ success: false }));
      const productsData = await productsRes.json().catch(() => ({ success: false }));
      const ordersData = await ordersRes.json().catch(() => ({ success: false }));
      const fraudData = await fraudRes.json().catch(() => ({ success: false }));
      const auditData = await auditRes.json().catch(() => ({ success: false }));
      const announcementsData = await announcementsRes.json().catch(() => ({ success: false }));
      const loyaltyData = await loyaltyRes.json().catch(() => ({ success: false }));
      const settingsData = await settingsRes.json().catch(() => ({ success: false }));

      console.log('Parsed data:', { stats, usersData, sellersData, productsData, ordersData, fraudData, auditData, announcementsData, loyaltyData, settingsData });

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
      if (sellersData.success) {
        setPendingSellers(sellersData.sellers.map(s => ({
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
      if (fraudData.success) {
        setFraudAlerts(fraudData.alerts || []);
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

  const handleInvestigateFraud = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/fraud-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'investigating' })
      });
      
      if (response.ok) {
        alert('Fraud alert marked as investigating');
        fetchAdminData();
      } else {
        alert('Failed to update fraud alert');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating fraud alert');
    }
  };

  const handleBlockFraudUser = async (alertId) => {
    if (window.confirm('Block this user and mark alert as resolved?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/fraud-alerts/${alertId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'blocked' })
        });
        
        if (response.ok) {
          alert('User blocked and alert resolved');
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

  const handleCreateAnnouncement = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/announcements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert('Announcement created successfully');
        fetchAdminData();
      } else {
        alert('Failed to create announcement');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating announcement');
    }
  };

  const handleToggleAnnouncement = async (id, isActive) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      
      if (response.ok) {
        alert(`Announcement ${isActive ? 'activated' : 'deactivated'}`);
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
        const response = await fetch(`http://localhost:5000/api/admin/announcements/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
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

  // Stats
  const { totalUsers, totalSellers, totalProducts, totalOrders, totalRevenue, pendingProducts } = adminStats;

  // Sales Analytics Data
  const salesData = {
    totalRevenue: adminStats.totalRevenue,
    totalOrders: adminStats.totalOrders,
    totalSellers: adminStats.totalSellers,
    totalCustomers: adminStats.totalUsers,
    monthlyGrowth: 15.5,
    topSellingCategory: 'Vintage',
    averageOrderValue: adminStats.totalOrders > 0 ? (adminStats.totalRevenue / adminStats.totalOrders).toFixed(0) : 0,
    conversionRate: 3.2
  };

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
            className={activeTab === 'fraud' ? 'active' : ''} 
            onClick={() => setActiveTab('fraud')}
          >
            <FiShield /> Fraud Detection
          </button>
          <button 
            className={activeTab === 'audit' ? 'active' : ''} 
            onClick={() => setActiveTab('audit')}
          >
            <FiClock /> Audit Log
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
              {activeTab === 'fraud' && 'Fraud Detection'}
              {activeTab === 'audit' && 'Audit Log'}
              {activeTab === 'announcements' && 'Announcements'}
              {activeTab === 'loyalty' && 'Loyalty Points'}
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
              {activeTab === 'fraud' && 'Monitor suspicious activities'}
              {activeTab === 'audit' && 'View system activity logs'}
              {activeTab === 'announcements' && 'Manage platform announcements'}
              {activeTab === 'loyalty' && 'Manage loyalty points program'}
              {activeTab === 'settings' && 'Configure platform settings'}
            </p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="admin-info">
              <div className="admin-avatar">
                <FiShield />
              </div>
              <div className="admin-details">
                <p className="admin-name">Administrator</p>
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
              <div className="stat-card blue">
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper blue">
                    <MdPeople className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Users</p>
                    <h3 className="stat-value">{totalUsers}</h3>
                    <p className="stat-description">+5 new users this month</p>
                  </div>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper green">
                    <MdStorefront className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Sellers</p>
                    <h3 className="stat-value">{totalSellers}</h3>
                    <p className="stat-description">+2 new sellers this month</p>
                  </div>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper orange">
                    <MdInventory className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Products</p>
                    <h3 className="stat-value">{totalProducts}</h3>
                    <p className="stat-description">{pendingProducts} pending approval</p>
                  </div>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper purple">
                    <FiShoppingBag className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Orders</p>
                    <h3 className="stat-value">{totalOrders}</h3>
                    <p className="stat-description">+8% from last month</p>
                  </div>
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
                    <p className="stat-description">Excellent performance</p>
                  </div>
                </div>
              </div>

              <div className="stat-card cyan">
                <div className="stat-card-content">
                  <div className="stat-icon-wrapper cyan">
                    <MdAttachMoney className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Revenue</p>
                    <h3 className="stat-value">Rs. {totalRevenue.toLocaleString()}</h3>
                    <p className="stat-description">+15% from last month</p>
                  </div>
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
                    <span className="badge warning">{pendingProducts}</span>
                  </div>
                  <div className="activity-list">
                    {products.filter(p => p.status === 'Pending').map(product => (
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
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="activity-section">
              <div className="section-title-row">
                <h2>
                  <FiBarChart2 className="section-icon" />
                  Analytics Overview
                </h2>
              </div>
              <div className="chart-container">
                <RevenueTrendChart data={chartData.revenue} />
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
            <div className="sellers-grid">
              {pendingSellers.map(seller => (
                <div key={seller.id} className="seller-approval-card">
                  <div className="seller-card-header">
                    <div className="seller-avatar">{seller.name.charAt(0)}</div>
                    <div className="seller-info">
                      <h3>{seller.name}</h3>
                      <p className="store-name">{seller.storeName}</p>
                    </div>
                    <span className={`doc-badge ${seller.documents.toLowerCase()}`}>
                      {seller.documents}
                    </span>
                  </div>

                  <div className="seller-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{seller.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{seller.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{seller.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Experience:</span>
                      <span className="detail-value">{seller.experience}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Applied:</span>
                      <span className="detail-value">{seller.appliedDate}</span>
                    </div>
                  </div>

                  <div className="seller-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApproveSeller(seller.id)}
                    >
                      <FiCheckCircle /> Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleRejectSeller(seller.id)}
                    >
                      <FiXCircle /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pendingSellers.length === 0 && (
              <div className="empty-state-card">
                <FiUserCheck size={64} />
                <h3>No Pending Applications</h3>
                <p>All seller applications have been reviewed</p>
              </div>
            )}
          </div>
        )}

        {/* Sales & Reports Tab */}
        {activeTab === 'sales' && (
          <div className="content-section">
            <button className="export-btn" style={{marginBottom: '20px'}}>
              <FiDownload /> Export Report
            </button>

            {/* Analytics Stats */}
            <div className="analytics-grid">
              <div className="analytics-card revenue">
                <p className="analytics-label">Total Revenue</p>
                <h3>Rs. {salesData.totalRevenue.toLocaleString()}</h3>
                <span className="analytics-detail">+{salesData.monthlyGrowth}%</span>
              </div>

              <div className="analytics-card orders">
                <p className="analytics-label">Total Orders</p>
                <h3>{salesData.totalOrders}</h3>
                <span className="analytics-detail">This month</span>
              </div>

              <div className="analytics-card sellers">
                <p className="analytics-label">Active Sellers</p>
                <h3>{salesData.totalSellers}</h3>
                <span className="analytics-detail">Verified</span>
              </div>

              <div className="analytics-card customers">
                <p className="analytics-label">Total Customers</p>
                <h3>{salesData.totalCustomers}</h3>
                <span className="analytics-detail">Registered</span>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="metrics-row">
              <div className="metric-card">
                <h4>Average Order Value</h4>
                <p className="metric-value">Rs. {salesData.averageOrderValue.toLocaleString()}</p>
              </div>
              <div className="metric-card">
                <h4>Conversion Rate</h4>
                <p className="metric-value">{salesData.conversionRate}%</p>
              </div>
              <div className="metric-card">
                <h4>Top Category</h4>
                <p className="metric-value">{salesData.topSellingCategory}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="chart-container">
              <h4>Revenue Trend</h4>
              <RevenueTrendChart data={chartData.revenue} />
            </div>

            <div className="metrics-row">
              <div className="chart-container">
                <h4>Top Products</h4>
                <TopProductsChart data={chartData.topProducts} />
              </div>
              <div className="chart-container">
                <h4>Category Performance</h4>
                <CategoryPerformanceChart data={chartData.categories} />
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detection Tab */}
        {activeTab === 'fraud' && (
          <div className="content-section">
            <div className="fraud-alerts">
              {fraudAlerts.map(alert => (
                <div key={alert._id} className={`fraud-card risk-${alert.riskLevel}`}>
                  <div className="fraud-header">
                    <div className="fraud-icon">
                      <FiAlertCircle />
                    </div>
                    <div className="fraud-info">
                      <h3>{alert.type.replace(/_/g, ' ').toUpperCase()}</h3>
                      <p>{alert.description}</p>
                    </div>
                    <span className={`risk-badge ${alert.riskLevel}`}>
                      {alert.riskLevel} Risk
                    </span>
                  </div>

                  <div className="fraud-details">
                    <div className="fraud-detail-item">
                      <FiClock />
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="fraud-detail-item">
                      <FiActivity />
                      <span>Status: {alert.status}</span>
                    </div>
                    {alert.amount && (
                      <div className="fraud-detail-item">
                        <MdAttachMoney />
                        <span>Rs. {alert.amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="fraud-actions">
                    <button 
                      className="investigate-btn"
                      onClick={() => handleInvestigateFraud(alert._id)}
                    >
                      <FiEye /> Investigate
                    </button>
                    <button 
                      className="block-btn"
                      onClick={() => handleBlockFraudUser(alert._id)}
                    >
                      <FiXCircle /> Block User
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {fraudAlerts.length === 0 && (
              <div className="empty-state-card">
                <FiShield size={64} />
                <h3>No Suspicious Activities</h3>
                <p>All transactions are secure</p>
              </div>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="content-section">
            <div className="filter-buttons">
              <button className="filter-btn active">
                <FiActivity /> All Activities
              </button>
              <button className="filter-btn">
                <FiUsers /> User Actions
              </button>
              <button className="filter-btn">
                <FiPackage /> Product Changes
              </button>
              <button className="filter-btn">
                <FiSettings /> System Events
              </button>
            </div>

            <div className="audit-timeline">
              <div className="audit-entry">
                <div className="audit-icon user">
                  <FiUserCheck />
                </div>
                <div className="audit-content">
                  <div className="audit-header">
                    <h4>Seller Approved</h4>
                    <span className="audit-time">2 hours ago</span>
                  </div>
                  <p className="audit-description">
                    Admin approved seller application for <strong>John's Vintage Store</strong>
                  </p>
                  <div className="audit-meta">
                    <span className="audit-user">
                      <FiUser /> Administrator
                    </span>
                    <span className="audit-ip">
                      IP: 192.168.1.1
                    </span>
                  </div>
                </div>
              </div>

              <div className="audit-entry">
                <div className="audit-icon product">
                  <FiPackage />
                </div>
                <div className="audit-content">
                  <div className="audit-header">
                    <h4>Product Deleted</h4>
                    <span className="audit-time">5 hours ago</span>
                  </div>
                  <p className="audit-description">
                    Admin deleted product <strong>"Vintage Jacket"</strong> due to policy violation
                  </p>
                  <div className="audit-meta">
                    <span className="audit-user">
                      <FiUser /> Administrator
                    </span>
                    <span className="audit-ip">
                      IP: 192.168.1.1
                    </span>
                  </div>
                </div>
              </div>

              <div className="audit-entry">
                <div className="audit-icon system">
                  <FiSettings />
                </div>
                <div className="audit-content">
                  <div className="audit-header">
                    <h4>System Settings Updated</h4>
                    <span className="audit-time">1 day ago</span>
                  </div>
                  <p className="audit-description">
                    Payment gateway configuration updated
                  </p>
                  <div className="audit-meta">
                    <span className="audit-user">
                      <FiUser /> Administrator
                    </span>
                    <span className="audit-ip">
                      IP: 192.168.1.1
                    </span>
                  </div>
                </div>
              </div>

              <div className="audit-entry">
                <div className="audit-icon warning">
                  <FiAlertCircle />
                </div>
                <div className="audit-content">
                  <div className="audit-header">
                    <h4>User Suspended</h4>
                    <span className="audit-time">2 days ago</span>
                  </div>
                  <p className="audit-description">
                    Admin suspended user <strong>suspicious_user@email.com</strong> for fraudulent activity
                  </p>
                  <div className="audit-meta">
                    <span className="audit-user">
                      <FiUser /> Administrator
                    </span>
                    <span className="audit-ip">
                      IP: 192.168.1.1
                    </span>
                  </div>
                </div>
              </div>

              <div className="audit-entry">
                <div className="audit-icon success">
                  <FiCheckCircle />
                </div>
                <div className="audit-content">
                  <div className="audit-header">
                    <h4>Bulk Product Approval</h4>
                    <span className="audit-time">3 days ago</span>
                  </div>
                  <p className="audit-description">
                    Admin approved 15 pending products in bulk operation
                  </p>
                  <div className="audit-meta">
                    <span className="audit-user">
                      <FiUser /> Administrator
                    </span>
                    <span className="audit-ip">
                      IP: 192.168.1.1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="content-section">
            <button 
              className="export-btn" 
              style={{marginBottom: '20px'}}
              onClick={() => {
                const title = prompt('Announcement Title:');
                const message = prompt('Announcement Message:');
                const type = prompt('Type (info/warning/success/error):', 'info');
                const targetAudience = prompt('Target (all/sellers/customers):', 'all');
                if (title && message) {
                  handleCreateAnnouncement({ title, message, type, targetAudience });
                }
              }}
            >
              <FiBell /> Create Announcement
            </button>

            <div className="announcements-list">
              {announcements.map(announcement => (
                <div key={announcement._id} className={`announcement-card ${announcement.type}`}>
                  <div className="announcement-header">
                    <h3>{announcement.title}</h3>
                    <span className={`type-badge ${announcement.type}`}>{announcement.type}</span>
                  </div>
                  <p className="announcement-message">{announcement.message}</p>
                  <div className="announcement-meta">
                    <span>Target: {announcement.targetAudience}</span>
                    <span>Priority: {announcement.priority}</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="announcement-actions">
                    <button 
                      className={announcement.isActive ? 'deactivate-btn' : 'activate-btn'}
                      onClick={() => handleToggleAnnouncement(announcement._id, !announcement.isActive)}
                    >
                      {announcement.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {announcements.length === 0 && (
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
                            className="edit-btn"
                            onClick={() => {
                              const points = prompt('Add/Subtract points:', '0');
                              if (points) {
                                handleUpdateLoyaltyPoints(record.userId._id, parseInt(points));
                              }
                            }}
                          >
                            <FiEdit2 />
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
                    />
                  </div>
                  <div className="form-group">
                    <label>Site Email</label>
                    <input 
                      type="email" 
                      value={settings.siteEmail}
                      onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Site Phone</label>
                    <input 
                      type="text" 
                      value={settings.sitePhone}
                      onChange={(e) => setSettings({...settings, sitePhone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <input 
                      type="text" 
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    />
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
                    />
                  </div>
                  <div className="form-group">
                    <label>Shipping Fee (Rs.)</label>
                    <input 
                      type="number" 
                      value={settings.shippingFee}
                      onChange={(e) => setSettings({...settings, shippingFee: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Free Shipping Threshold (Rs.)</label>
                    <input 
                      type="number" 
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({...settings, freeShippingThreshold: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Order Amount (Rs.)</label>
                    <input 
                      type="number" 
                      value={settings.minOrderAmount}
                      onChange={(e) => setSettings({...settings, minOrderAmount: parseFloat(e.target.value)})}
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
                <div className="form-grid">
                  <div className="form-group">
                    <label>Payment Provider</label>
                    <select 
                      value={settings.paymentGateway?.provider || 'none'}
                      onChange={(e) => setSettings({
                        ...settings, 
                        paymentGateway: {...settings.paymentGateway, provider: e.target.value}
                      })}
                    >
                      <option value="none">None</option>
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="esewa">eSewa</option>
                      <option value="khalti">Khalti</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Merchant ID</label>
                    <input 
                      type="text" 
                      value={settings.paymentGateway?.merchantId || ''}
                      onChange={(e) => setSettings({
                        ...settings, 
                        paymentGateway: {...settings.paymentGateway, merchantId: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>API Key</label>
                    <input 
                      type="password" 
                      value={settings.paymentGateway?.apiKey || ''}
                      onChange={(e) => setSettings({
                        ...settings, 
                        paymentGateway: {...settings.paymentGateway, apiKey: e.target.value}
                      })}
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
                    Enable Payment Gateway
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
                    Test Mode
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

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default AdminDashboard;
