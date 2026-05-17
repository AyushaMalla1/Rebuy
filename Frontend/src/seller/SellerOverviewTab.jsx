import React from 'react';
import { useSellerDashboard } from './DashboardContext';
import { FaBox, FaShoppingBag, FaDollarSign, FaChartLine, FaPlus, FaShoppingCart, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import './SellerOverviewTab.css';

function SellerOverviewTab() {
  const {
    products,
    orders,
    chartData,
    setActiveTab,
    setShowAddProduct,
    getShortOrderId,
    getSellerOrderAmount
  } = useSellerDashboard();

  // Calculate metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const potentialRevenue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
  const totalOrders = orders.length;

  const activeStock = products.filter(p => Number(p.stock) > 20).length;
  const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 20).length;
  const outOfStock = products.filter(p => Number(p.stock) === 0).length;
  const lowOrNoStockCount = lowStock + outOfStock;

  const recentOrders = orders.slice(0, 5);

  const stockChartData = [
    { name: 'Active', value: activeStock, fill: '#22c55e' },
    { name: 'Low', value: lowStock, fill: '#f59e0b' },
    { name: 'Empty', value: outOfStock, fill: '#ef4444' }
  ];

  return (
    <div className="seller-overview-v2">
      {/* Top Stats Grid */}
      <div className="overview-stats-grid-v2">
        <div className="stat-card-v2 clickable" onClick={() => setActiveTab('products')}>
          <div className="stat-icon-v2 blue"><FaBox /></div>
          <div className="stat-info-v2">
            <p>TOTAL PRODUCTS</p>
            <h3>{totalProducts}</h3>
          </div>
        </div>
        <div className="stat-card-v2 clickable" onClick={() => setActiveTab('products')}>
          <div className="stat-icon-v2 green"><FaShoppingBag /></div>
          <div className="stat-info-v2">
            <p>TOTAL STOCK</p>
            <h3>{totalStock}</h3>
          </div>
        </div>
        <div className="stat-card-v2 clickable" onClick={() => setActiveTab('revenue')}>
          <div className="stat-icon-v2 yellow"><FaDollarSign /></div>
          <div className="stat-info-v2">
            <p>POTENTIAL REVENUE</p>
            <h3>Rs. {potentialRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card-v2 clickable" onClick={() => setActiveTab('orders')}>
          <div className="stat-icon-v2 purple"><FaChartLine /></div>
          <div className="stat-info-v2">
            <p>TOTAL ORDERS</p>
            <h3>{totalOrders}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="seller-quick-actions-grid">
          <div className="action-card" onClick={() => setActiveTab('products')}>
            <FaBox className="action-icon" />
            <span>Manage Products</span>
          </div>
          <div className="action-card" onClick={() => { setActiveTab('products'); setShowAddProduct(true); }}>
            <FaPlus className="action-icon" />
            <span>Add New Product</span>
          </div>
          <div className="action-card" onClick={() => setActiveTab('orders')}>
            <FaShoppingCart className="action-icon" />
            <span>View Orders</span>
          </div>
          <div className="action-card" onClick={() => setActiveTab('revenue')}>
            <FaChartLine className="action-icon" />
            <span>View Revenue</span>
          </div>
        </div>
      </div>

      {/* Stock Levels Overview */}
      <div className="stock-levels-section">
        <div className="stock-levels-header">
          <h3 className="section-title">Stock Levels Overview</h3>
          <p className="section-subtitle">Monitor your inventory distribution across all products</p>
        </div>

        {lowOrNoStockCount > 0 && (
          <div className="stock-alert-banner">
            <FaExclamationTriangle className="alert-icon" />
            <div className="alert-content">
              <strong>Stock Alert</strong>
              <p>You have {lowOrNoStockCount} product(s) with low or no stock. Consider restocking to avoid missing sales opportunities.</p>
            </div>
          </div>
        )}

        <div className="stock-content-grid">
          <div className="stock-cards-grid">
            <div className="stock-card active">
              <div className="stock-card-header">
                <FaCheckCircle className="stock-card-icon" />
                <span>Active Stock</span>
              </div>
              <h2>{activeStock}</h2>
              <p>Products with 20+ units</p>
            </div>
            <div className="stock-card low">
              <div className="stock-card-header">
                <FaExclamationTriangle className="stock-card-icon" />
                <span>Low Stock</span>
              </div>
              <h2>{lowStock}</h2>
              <p>Products with 1-20 units</p>
            </div>
            <div className="stock-card empty">
              <div className="stock-card-header">
                <FaTimesCircle className="stock-card-icon" />
                <span>Out of Stock</span>
              </div>
              <h2>{outOfStock}</h2>
              <p>Products need restocking</p>
            </div>
          </div>
          
          <div className="stock-chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={stockChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stockChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Products']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart and Recent Orders Grid */}
      <div className="overview-main-content" style={{ marginTop: '40px' }}>
        <div className="overview-chart-section">
          <div className="section-header">
            <h3>Revenue Trend (Last 30 Days)</h3>
          </div>
          <div className="chart-container" style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData?.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `Rs.${value}`} />
                <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#00bcd4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overview-recent-orders">
          <div className="section-header">
            <h3>Recent Orders</h3>
          </div>
          {recentOrders.length > 0 ? (
            <div className="recent-orders-list">
              {recentOrders.map(order => (
                <div key={order._id} className="recent-order-item">
                  <div className="recent-order-info">
                    <strong>{getShortOrderId(order)}</strong>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="recent-order-customer">
                    <strong>{order.customerName || 'Customer'}</strong>
                    <p>{order.status}</p>
                  </div>
                  <div className="recent-order-amount">
                    <strong>Rs. {getSellerOrderAmount(order).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent orders found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerOverviewTab;
