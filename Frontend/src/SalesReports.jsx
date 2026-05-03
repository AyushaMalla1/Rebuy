import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './SalesReports.css';

function SalesReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, revenue, orders, sellers, customers
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeSellers: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topCategory: '',
    revenueGrowth: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);

  const COLORS = ['#00bcd4', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];

  useEffect(() => {
    checkAuth();
    fetchSalesData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.userType !== 'admin') {
      navigate('/login');
    }
  };

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/sales-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRevenueData(data.revenueData);
        setTopProducts(data.topProducts);
        setCategoryPerformance(data.categoryPerformance);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
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
  };

  if (loading) {
    return (
      <div className="sales-reports-page">
        <div className="loading">Loading sales data...</div>
      </div>
    );
  }

  return (
    <div className="sales-reports-page">
      <div className="sales-header">
        <div>
          <h1>Sales & Reports</h1>
          <p>View sales analytics and reports</p>
        </div>
        <div className="header-actions">
          {activeView !== 'overview' && (
            <button className="back-btn" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </button>
          )}
          <button className="export-btn" onClick={exportReport}>
            <FiDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards - Clickable */}
      {activeView === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card clickable" onClick={() => setActiveView('revenue')}>
              <div className="stat-header">
                <span className="stat-label">TOTAL REVENUE</span>
                <FiTrendingUp className="stat-icon-small" />
              </div>
              <div className="stat-value">Rs. {stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-change positive">+{stats.revenueGrowth}% This month</div>
              <div className="click-hint">Click to view details →</div>
            </div>

            <div className="stat-card clickable" onClick={() => setActiveView('orders')}>
              <div className="stat-header">
                <span className="stat-label">TOTAL ORDERS</span>
                <FiShoppingBag className="stat-icon-small" />
              </div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-change">This month</div>
              <div className="click-hint">Click to view details →</div>
            </div>

            <div className="stat-card clickable" onClick={() => setActiveView('sellers')}>
              <div className="stat-header">
                <span className="stat-label">ACTIVE SELLERS</span>
                <FiUsers className="stat-icon-small" />
              </div>
              <div className="stat-value">{stats.activeSellers}</div>
              <div className="stat-change">Verified</div>
              <div className="click-hint">Click to view details →</div>
            </div>

            <div className="stat-card clickable" onClick={() => setActiveView('customers')}>
              <div className="stat-header">
                <span className="stat-label">TOTAL CUSTOMERS</span>
                <FiUsers className="stat-icon-small" />
              </div>
              <div className="stat-value">{stats.totalCustomers}</div>
              <div className="stat-change">Registered</div>
              <div className="click-hint">Click to view details →</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="secondary-stats">
            <div className="stat-card-small">
              <span className="stat-label-small">AVERAGE ORDER VALUE</span>
              <div className="stat-value-small">Rs. {stats.averageOrderValue.toLocaleString()}</div>
            </div>

            <div className="stat-card-small">
              <span className="stat-label-small">CONVERSION RATE</span>
              <div className="stat-value-small">{stats.conversionRate}%</div>
            </div>

            <div className="stat-card-small">
              <span className="stat-label-small">TOP CATEGORY</span>
              <div className="stat-value-small">{stats.topCategory}</div>
            </div>
          </div>

          {/* Overview Charts */}
          <div className="chart-section">
            <h2>Quick Overview</h2>
            <div className="charts-grid">
              <div className="chart-container">
                <h3>Revenue Trend (Last 7 Days)</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#00bcd4" 
                        strokeWidth={2}
                        dot={{ fill: '#00bcd4', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-container">
                <h3>Top Selling Products</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#00bcd4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Revenue Detail View */}
      {activeView === 'revenue' && (
        <div className="detail-view">
          <div className="detail-header">
            <h2><FiDollarSign /> Revenue Analytics</h2>
            <p>Detailed revenue breakdown and trends</p>
          </div>
          
          <div className="detail-stats">
            <div className="detail-stat-card">
              <span className="detail-label">Total Revenue</span>
              <div className="detail-value">Rs. {stats.totalRevenue.toLocaleString()}</div>
              <div className="detail-change positive">+{stats.revenueGrowth}% growth</div>
            </div>
            <div className="detail-stat-card">
              <span className="detail-label">Average Order Value</span>
              <div className="detail-value">Rs. {stats.averageOrderValue.toLocaleString()}</div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-container-large">
              <h3>Revenue Trend (Last 7 Days)</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#00bcd4" 
                      strokeWidth={3}
                      dot={{ fill: '#00bcd4', r: 5 }}
                      activeDot={{ r: 8 }}
                      name="Revenue (Rs.)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container-large">
              <h3>Revenue by Category</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ category, count }) => `${category}: ${count}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Detail View */}
      {activeView === 'orders' && (
        <div className="detail-view">
          <div className="detail-header">
            <h2><FiShoppingBag /> Orders Analytics</h2>
            <p>Detailed order statistics and trends</p>
          </div>
          
          <div className="detail-stats">
            <div className="detail-stat-card">
              <span className="detail-label">Total Orders</span>
              <div className="detail-value">{stats.totalOrders}</div>
              <div className="detail-change">This month</div>
            </div>
            <div className="detail-stat-card">
              <span className="detail-label">Average Order Value</span>
              <div className="detail-value">Rs. {stats.averageOrderValue.toLocaleString()}</div>
            </div>
            <div className="detail-stat-card">
              <span className="detail-label">Conversion Rate</span>
              <div className="detail-value">{stats.conversionRate}%</div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-container-large">
              <h3>Top Selling Products</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#00bcd4" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sellers Detail View */}
      {activeView === 'sellers' && (
        <div className="detail-view">
          <div className="detail-header">
            <h2><FiUsers /> Seller Analytics</h2>
            <p>Active seller statistics and performance</p>
          </div>
          
          <div className="detail-stats">
            <div className="detail-stat-card">
              <span className="detail-label">Active Sellers</span>
              <div className="detail-value">{stats.activeSellers}</div>
              <div className="detail-change">Verified sellers</div>
            </div>
            <div className="detail-stat-card">
              <span className="detail-label">Top Category</span>
              <div className="detail-value">{stats.topCategory}</div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-container-large">
              <h3>Category Distribution</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ category, count }) => `${category}: ${count} products`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container-large">
              <h3>Products by Category</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#4caf50" name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Detail View */}
      {activeView === 'customers' && (
        <div className="detail-view">
          <div className="detail-header">
            <h2><FiUsers /> Customer Analytics</h2>
            <p>Customer statistics and behavior insights</p>
          </div>
          
          <div className="detail-stats">
            <div className="detail-stat-card">
              <span className="detail-label">Total Customers</span>
              <div className="detail-value">{stats.totalCustomers}</div>
              <div className="detail-change">Registered users</div>
            </div>
            <div className="detail-stat-card">
              <span className="detail-label">Conversion Rate</span>
              <div className="detail-value">{stats.conversionRate}%</div>
            </div>
            <div className="detail-stat-card">
              <span className="detail-label">Avg Order Value</span>
              <div className="detail-value">Rs. {stats.averageOrderValue.toLocaleString()}</div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-container-large">
              <h3>Revenue Trend</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#9c27b0" 
                      strokeWidth={3}
                      dot={{ fill: '#9c27b0', r: 5 }}
                      activeDot={{ r: 8 }}
                      name="Revenue (Rs.)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container-large">
              <h3>Popular Categories</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#9c27b0" name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesReports;
