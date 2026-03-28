import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, 
  FiSettings, FiLogOut, FiHome, FiShield, FiEdit2, FiTrash2, 
  FiEye, FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiDownload,
  FiBarChart2, FiPieChart, FiActivity, FiClock, FiAlertCircle,
  FiUserCheck, FiMonitor, FiAward, FiBell, FiMessageSquare, FiGrid
} from 'react-icons/fi';
import './AdminDashboard.css';
import Chatbot from './components/Chatbot';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // State
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  React.useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes, sellersRes, productsRes, ordersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', { headers }),
        fetch('http://localhost:5000/api/admin/users', { headers }),
        fetch('http://localhost:5000/api/admin/sellers/pending', { headers }),
        fetch('http://localhost:5000/api/admin/products', { headers }),
        fetch('http://localhost:5000/api/admin/orders', { headers })
      ]);

      const stats = await statsRes.json();
      const usersData = await usersRes.json();
      const sellersData = await sellersRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (stats.success) setAdminStats(stats.stats);
      if (usersData.success) {
        setUsers(usersData.users.map(u => ({
          id: u._id,
          name: u.fullName,
          email: u.email,
          type: u.userType === 'seller' ? 'Seller' : 'User',
          status: u.isActive ? 'Active' : 'Inactive',
          joined: new Date(u.createdAt).toLocaleDateString()
        })));
      }
      if (sellersData.success) {
        setPendingSellers(sellersData.sellers.map(s => ({
          id: s._id,
          name: s.fullName,
          email: s.email,
          storeName: s.storeName,
          phone: s.phone,
          address: s.address,
          appliedDate: new Date(s.createdAt).toLocaleDateString(),
          documents: 'Pending',
          experience: 'Checking...'
        })));
      }
      if (productsData.success) {
        setProducts(productsData.products.map(p => ({
          id: p._id,
          name: p.name,
          seller: p.seller?.name || p.sellerName || 'Unknown',
          price: p.price,
          stock: p.stock,
          status: p.status
        })));
      }
      if (ordersData.success) {
        setOrders(ordersData.orders.map(o => ({
          id: o._id,
          customer: o.customerName,
          product: o.items?.[0]?.productName + (o.items?.length > 1 ? ' + more' : '') || 'Items',
          amount: o.total,
          status: o.status,
          date: new Date(o.orderDate).toLocaleDateString()
        })));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
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
        await fetch(`http://localhost:5000/api/customers/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'deactivated' })
        });
        fetchAdminData();
      } catch (err) { console.error(err); }
    }
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleApproveSeller = async (id) => {
    if (window.confirm('Approve this seller application?')) {
      try {
        const row = pendingSellers.find(s => s.id === id);
        await fetch(`http://localhost:5000/api/sellers/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
        alert(`${row.name} has been approved as a seller!`);
        fetchAdminData();
      } catch (err) { console.error(err); }
    }
  };

  const handleRejectSeller = async (id) => {
    if (window.confirm('Reject this seller application?')) {
      try {
        await fetch(`http://localhost:5000/api/sellers/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
        fetchAdminData();
      } catch (err) { console.error(err); }
    }
  };

  const handleBlockUser = async (userId) => {
    if (window.confirm('Block this user for suspicious activity?')) {
      try {
        await fetch(`http://localhost:5000/api/customers/${userId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'suspended' })
        });
        alert('User has been blocked!');
        fetchAdminData();
      } catch (err) { console.error(err); }
    }
  };

  const handleApproveProduct = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
  };

  const handleRejectProduct = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
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
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-label">MAIN MENU</p>
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
          </div>

          <div className="nav-section">
            <p className="nav-label">ANALYTICS & REPORTS</p>
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
          </div>

          <div className="nav-section">
            <p className="nav-label">ENGAGEMENT</p>
            <button 
              className={activeTab === 'loyalty' ? 'active' : ''} 
              onClick={() => setActiveTab('loyalty')}
            >
              <FiAward /> Loyalty Points
            </button>
            <button 
              className={activeTab === 'announcements' ? 'active' : ''} 
              onClick={() => setActiveTab('announcements')}
            >
              <FiBell /> Announcements
            </button>
            <button 
              className={activeTab === 'chatbot' ? 'active' : ''} 
              onClick={() => setActiveTab('chatbot')}
            >
              <FiMessageSquare /> AI Chatbot
            </button>
          </div>

          <div className="nav-section">
            <p className="nav-label">SYSTEM</p>
            <button 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings /> Settings
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="home-link">
            <FiHome /> Back to Store
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p className="header-subtitle">
              <FiActivity className="subtitle-icon" />
              Manage your e-commerce platform efficiently
            </p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search anything..." />
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
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-header">
                  <div className="stat-icon-wrapper blue">
                    <FiUsers className="stat-icon" />
                  </div>
                  <div className="stat-trend positive">
                    <FiTrendingUp />
                    <span>+12%</span>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Users</p>
                  <h3 className="stat-value">{totalUsers}</h3>
                  <p className="stat-description">+5 new users this month</p>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-header">
                  <div className="stat-icon-wrapper green">
                    <FiShoppingBag className="stat-icon" />
                  </div>
                  <div className="stat-trend positive">
                    <FiTrendingUp />
                    <span>+8%</span>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Sellers</p>
                  <h3 className="stat-value">{totalSellers}</h3>
                  <p className="stat-description">+2 new sellers this month</p>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-header">
                  <div className="stat-icon-wrapper orange">
                    <FiPackage className="stat-icon" />
                  </div>
                  <div className="stat-trend warning">
                    <FiAlertCircle />
                    <span>{pendingProducts}</span>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Products</p>
                  <h3 className="stat-value">{totalProducts}</h3>
                  <p className="stat-description">{pendingProducts} pending approval</p>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-header">
                  <div className="stat-icon-wrapper purple">
                    <FiBarChart2 className="stat-icon" />
                  </div>
                  <div className="stat-trend positive">
                    <FiTrendingUp />
                    <span>+15%</span>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Orders</p>
                  <h3 className="stat-value">{totalOrders}</h3>
                  <p className="stat-description">+8% from last month</p>
                </div>
              </div>

              <div className="stat-card cyan">
                <div className="stat-header">
                  <div className="stat-icon-wrapper cyan">
                    <FiDollarSign className="stat-icon" />
                  </div>
                  <div className="stat-trend positive">
                    <FiTrendingUp />
                    <span>+18%</span>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Revenue</p>
                  <h3 className="stat-value">Rs. {totalRevenue.toLocaleString()}</h3>
                  <p className="stat-description">+15% from last month</p>
                </div>
              </div>

              <div className="stat-card red">
                <div className="stat-header">
                  <div className="stat-icon-wrapper red">
                    <FiPieChart className="stat-icon" />
                  </div>
                  <div className="stat-trend positive">
                    <FiTrendingUp />
                    <span>+5%</span>
                  </div>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Growth Rate</p>
                  <h3 className="stat-value">12.5%</h3>
                  <p className="stat-description">Excellent performance</p>
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
          </>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="content-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>
                  <FiUsers className="section-icon" />
                  Users Management
                </h2>
                <p className="section-subtitle">{totalUsers} total users registered</p>
              </div>
              <div className="header-actions">
                <div className="filter-buttons">
                  <button className="filter-btn active">
                    <FiUsers /> All Users
                  </button>
                  <button className="filter-btn">
                    <FiShoppingBag /> Sellers
                  </button>
                  <button className="filter-btn">
                    <FiUsers /> Customers
                  </button>
                </div>
                <button className="export-btn">
                  <FiDownload /> Export
                </button>
              </div>
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
                  {users.map(user => (
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
                          <button className="view-btn" title="View Details">
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="content-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>
                  <FiPackage className="section-icon" />
                  Products Management
                </h2>
                <p className="section-subtitle">{totalProducts} products • {pendingProducts} pending approval</p>
              </div>
              <div className="header-actions">
                <div className="filter-buttons">
                  <button className="filter-btn active">
                    <FiPackage /> All Products
                  </button>
                  <button className="filter-btn">
                    <FiCheckCircle /> Approved
                  </button>
                  <button className="filter-btn">
                    <FiClock /> Pending
                  </button>
                  <button className="filter-btn">
                    <FiXCircle /> Rejected
                  </button>
                </div>
                <button className="export-btn">
                  <FiDownload /> Export
                </button>
              </div>
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
                  {products.map(product => (
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
                          <button className="view-btn" title="View Details">
                            <FiEye />
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)} title="Delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="content-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>
                  <FiShoppingBag className="section-icon" />
                  Orders Management
                </h2>
                <p className="section-subtitle">{totalOrders} total orders • Rs. {totalRevenue.toLocaleString()} revenue</p>
              </div>
              <div className="header-actions">
                <div className="filter-buttons">
                  <button className="filter-btn active">
                    <FiFilter /> All Orders
                  </button>
                  <button className="filter-btn">
                    <FiClock /> Processing
                  </button>
                  <button className="filter-btn">
                    <FiPackage /> Shipped
                  </button>
                  <button className="filter-btn">
                    <FiCheckCircle /> Delivered
                  </button>
                </div>
                <button className="export-btn">
                  <FiDownload /> Export
                </button>
              </div>
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
                  {orders.map(order => (
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
                          <button className="view-btn" title="View Details">
                            <FiEye />
                          </button>
                          <button className="edit-btn" title="Update Status">
                            <FiEdit2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seller Approval Tab */}
        {activeTab === 'seller-approval' && (
          <div className="content-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>
                  <FiUserCheck className="section-icon" />
                  Seller Approval
                </h2>
                <p className="section-subtitle">{pendingSellers.length} pending applications</p>
              </div>
            </div>

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
            <div className="section-header">
              <div className="section-title-group">
                <h2>
                  <FiBarChart2 className="section-icon" />
                  Sales & Reports
                </h2>
                <p className="section-subtitle">Comprehensive analytics and insights</p>
              </div>
              <button className="export-btn">
                <FiDownload /> Export Report
              </button>
            </div>

            {/* Analytics Stats */}
            <div className="analytics-grid">
              <div className="analytics-card revenue">
                <div className="analytics-icon">
                  <FiDollarSign />
                </div>
                <div className="analytics-content">
                  <p className="analytics-label">Total Revenue</p>
                  <h3>Rs. {salesData.totalRevenue.toLocaleString()}</h3>
                  <span className="growth-badge positive">
                    <FiTrendingUp /> +{salesData.monthlyGrowth}%
                  </span>
                </div>
              </div>

              <div className="analytics-card orders">
                <div className="analytics-icon">
                  <FiShoppingBag />
                </div>
                <div className="analytics-content">
                  <p className="analytics-label">Total Orders</p>
                  <h3>{salesData.totalOrders}</h3>
                  <span className="analytics-detail">This month</span>
                </div>
              </div>

              <div className="analytics-card sellers">
                <div className="analytics-icon">
                  <FiUsers />
                </div>
                <div className="analytics-content">
                  <p className="analytics-label">Active Sellers</p>
                  <h3>{salesData.totalSellers}</h3>
                  <span className="analytics-detail">Verified</span>
                </div>
              </div>

              <div className="analytics-card customers">
                <div className="analytics-icon">
                  <FiUserCheck />
                </div>
                <div className="analytics-content">
                  <p className="analytics-label">Total Customers</p>
                  <h3>{salesData.totalCustomers}</h3>
                  <span className="analytics-detail">Registered</span>
                </div>
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

            {/* Chart Placeholder */}
            <div className="chart-container">
              <h4>Sales Trend</h4>
              <div className="chart-placeholder">
                <FiPieChart size={48} />
                <p>Sales chart visualization would appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Fraud Detection Tab */}
        {activeTab === 'fraud' && (
          <div className="content-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2>
                  <FiShield className="section-icon" />
                  Fraud Detection
                </h2>
                <p className="section-subtitle">{suspiciousActivities.length} suspicious activities detected</p>
              </div>
            </div>

            <div className="fraud-alerts">
              {suspiciousActivities.map(activity => (
                <div key={activity.id} className={`fraud-card risk-${activity.riskLevel.toLowerCase()}`}>
                  <div className="fraud-header">
                    <div className="fraud-icon">
                      <FiAlertCircle />
                    </div>
                    <div className="fraud-info">
                      <h3>{activity.user}</h3>
                      <p>{activity.activity}</p>
                    </div>
                    <span className={`risk-badge ${activity.riskLevel.toLowerCase()}`}>
                      {activity.riskLevel} Risk
                    </span>
                  </div>

                  <div className="fraud-details">
                    <div className="fraud-detail-item">
                      <FiClock />
                      <span>{activity.date}</span>
                    </div>
                    <div className="fraud-detail-item">
                      <FiActivity />
                      <span>Status: {activity.status}</span>
                    </div>
                  </div>

                  <div className="fraud-actions">
                    <button className="investigate-btn">
                      <FiEye /> Investigate
                    </button>
                    <button 
                      className="block-btn"
                      onClick={() => handleBlockUser(activity.id)}
                    >
                      <FiXCircle /> Block User
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {suspiciousActivities.length === 0 && (
              <div className="empty-state-card">
                <FiShield size={64} />
                <h3>No Suspicious Activities</h3>
                <p>All transactions are secure</p>
              </div>
            )}
          </div>
        )}

        {/* Other Tabs */}
        {(activeTab === 'loyalty' || activeTab === 'announcements' || activeTab === 'chatbot' || 
          activeTab === 'settings') && (
          <div className="content-section">
            <div className="empty-state-card">
              {activeTab === 'loyalty' && (
                <>
                  <FiAward size={64} />
                  <h3>Loyalty Points</h3>
                  <p>Manage customer loyalty rewards program</p>
                </>
              )}
              {activeTab === 'announcements' && (
                <>
                  <FiBell size={64} />
                  <h3>Announcements</h3>
                  <p>Create and manage platform announcements</p>
                </>
              )}

              {activeTab === 'chatbot' && (
                <>
                  <FiMessageSquare size={64} />
                  <h3>AI Chatbot</h3>
                  <p>Configure and monitor AI chatbot interactions</p>
                </>
              )}
              {activeTab === 'settings' && (
                <>
                  <FiSettings size={64} />
                  <h3>Settings</h3>
                  <p>Configure platform settings and preferences</p>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default AdminDashboard;
