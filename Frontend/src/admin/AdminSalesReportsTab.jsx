import { FiChevronRight, FiDownload } from 'react-icons/fi';
import {
  RevenueTrendChart,
  TopProductsChart,
  CategoryPerformanceChart,
  UserGrowthChart,
  SellerStatsChart,
  OrdersTrendChart,
  RevenueBreakdownChart
} from '../components/Charts';
import { apiFetch } from '../services/api';

import './AdminSalesReportsTab.css';
function AdminSalesReportsTab({
  selectedMetric,
  setSelectedMetric,
  salesData = {},
  salesCharts = {},
  timeRange,
  setTimeRange
}) {
  const metric = {
    totalRevenue: Number(salesData.totalRevenue || 0),
    totalOrders: Number(salesData.totalOrders || 0),
    totalSellers: Number(salesData.totalSellers || 0),
    totalCustomers: Number(salesData.totalCustomers || 0),
    monthlyGrowth: Number(salesData.monthlyGrowth || 0),
    averageOrderValue: Number(salesData.averageOrderValue || 0),
    commissionRate: Number(salesData.commissionRate || 0),
    platformCommission: Number(salesData.platformCommission || 0),
    topSellingCategory: salesData.topSellingCategory || 'No category data'
  };

  const charts = {
    revenue: salesCharts.revenue || [],
    ordersTrend: salesCharts.ordersTrend || [],
    topProducts: salesCharts.topProducts || [],
    categories: salesCharts.categories || [],
    userGrowth: salesCharts.userGrowth || [],
    sellerStats: salesCharts.sellerStats || [],
    revenueBreakdown: salesCharts.revenueBreakdown || []
  };

  const handleExportSalesReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/admin/export-sales-report', {
        headers: {
          Authorization: `Bearer ${token}`
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

  return (
    <div className="content-section">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <button className="export-btn" onClick={handleExportSalesReport}>
          <FiDownload /> Export
        </button>

        <select
          className="time-range-select"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="analytics-grid">
        <div
          className={`analytics-card revenue clickable-analytics ${selectedMetric === 'revenue' ? 'active' : ''}`}
          onClick={() => setSelectedMetric(selectedMetric === 'revenue' ? null : 'revenue')}
          title="Click to view revenue charts"
        >
          <p className="analytics-label">Total Revenue</p>
          <h3>Rs. {metric.totalRevenue.toLocaleString()}</h3>
          <span className="analytics-detail">+{metric.monthlyGrowth}%</span>
          <FiChevronRight className="card-arrow" />
        </div>

        <div
          className={`analytics-card orders clickable-analytics ${selectedMetric === 'orders' ? 'active' : ''}`}
          onClick={() => setSelectedMetric(selectedMetric === 'orders' ? null : 'orders')}
          title="Click to view orders charts"
        >
          <p className="analytics-label">Total Orders</p>
          <h3>{metric.totalOrders}</h3>
          <span className="analytics-detail">This month</span>
          <FiChevronRight className="card-arrow" />
        </div>

        <div
          className={`analytics-card sellers clickable-analytics ${selectedMetric === 'sellers' ? 'active' : ''}`}
          onClick={() => setSelectedMetric(selectedMetric === 'sellers' ? null : 'sellers')}
          title="Click to view seller charts"
        >
          <p className="analytics-label">Active Sellers</p>
          <h3>{metric.totalSellers}</h3>
          <span className="analytics-detail">Verified</span>
          <FiChevronRight className="card-arrow" />
        </div>

        <div
          className={`analytics-card customers clickable-analytics ${selectedMetric === 'customers' ? 'active' : ''}`}
          onClick={() => setSelectedMetric(selectedMetric === 'customers' ? null : 'customers')}
          title="Click to view customer charts"
        >
          <p className="analytics-label">Total Customers</p>
          <h3>{metric.totalCustomers}</h3>
          <span className="analytics-detail">Registered</span>
          <FiChevronRight className="card-arrow" />
        </div>
      </div>

      <div className="metrics-row">
        <div
          className={`metric-card avgorder clickable-metric ${selectedMetric === 'avgOrder' ? 'active' : ''}`}
          onClick={() => setSelectedMetric(selectedMetric === 'avgOrder' ? null : 'avgOrder')}
        >
          <h4>Average Order Value</h4>
          <p className="metric-value">Rs. {metric.averageOrderValue.toLocaleString()}</p>
        </div>
        <div
          className={`metric-card commission clickable-metric ${selectedMetric === 'commission' ? 'active' : ''}`}
          onClick={() => setSelectedMetric(selectedMetric === 'commission' ? null : 'commission')}
        >
          <h4>Commission Rate</h4>
          <p className="metric-value">{metric.commissionRate}%</p>
        </div>
        <div
          className={`metric-card topcategory clickable-metric ${selectedMetric === 'topCategory' ? 'active' : ''}`}
          onClick={() => setSelectedMetric(selectedMetric === 'topCategory' ? null : 'topCategory')}
        >
          <h4>Top Category</h4>
          <p className="metric-value">{metric.topSellingCategory}</p>
        </div>
      </div>

      {selectedMetric === 'revenue' && (
        <div className="dynamic-charts" style={{ marginTop: '30px' }}>
          <div className="chart-container">
            <RevenueTrendChart data={charts.revenue} title={`Revenue Trend (${timeRange === 'all' ? 'All Time' : timeRange === '365' ? 'Last Year' : `Last ${timeRange} Days`})`} />
          </div>
          <div className="chart-container" style={{ marginTop: '20px' }}>
            <RevenueBreakdownChart data={charts.revenueBreakdown} title="Revenue Breakdown by Category" />
          </div>
        </div>
      )}

      {selectedMetric === 'orders' && (
        <div className="dynamic-charts" style={{ marginTop: '30px' }}>
          <div className="chart-container">
            <OrdersTrendChart data={charts.ordersTrend} title={`Orders Trend (${timeRange === 'all' ? 'All Time' : timeRange === '365' ? 'Last Year' : `Last ${timeRange} Days`})`} />
          </div>
        </div>
      )}

      {selectedMetric === 'sellers' && (
        <div className="dynamic-charts" style={{ marginTop: '30px' }}>
          <div className="chart-container">
            <SellerStatsChart data={charts.sellerStats} title="Seller Growth" />
          </div>
        </div>
      )}

      {selectedMetric === 'customers' && (
        <div className="dynamic-charts" style={{ marginTop: '30px' }}>
          <div className="chart-container">
            <UserGrowthChart data={charts.userGrowth} />
          </div>
        </div>
      )}

      {selectedMetric === 'avgOrder' && (
        <div className="dynamic-charts" style={{ marginTop: '30px' }}>
          <div className="chart-container">
            <div className="commission-summary" style={{ padding: '40px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#333', fontWeight: '600' }}>Average Order Value</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#00bcd4', marginBottom: '20px' }}>
                Rs. {metric.averageOrderValue.toLocaleString()}
              </div>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>Per Order</div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                Based on {metric.totalOrders} total orders with Rs. {metric.totalRevenue.toLocaleString()} revenue
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'commission' && (
        <div className="dynamic-charts" style={{ marginTop: '30px' }}>
          <div className="chart-container">
            <div className="commission-summary" style={{ padding: '40px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#333', fontWeight: '600' }}>Platform Commission Earnings</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#00bcd4', marginBottom: '20px' }}>
                Rs. {metric.platformCommission.toLocaleString()}
              </div>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>Total Commission Earned</div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                Based on {metric.commissionRate}% commission rate across {metric.totalOrders} orders
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'topCategory' && (
        <div className="dynamic-charts" style={{ marginTop: '30px' }}>
          <div className="chart-container">
            <TopProductsChart data={charts.topProducts} title="Top Selling Products by Category" />
          </div>
          <div className="chart-container" style={{ marginTop: '20px' }}>
            <CategoryPerformanceChart data={charts.categories} />
          </div>
        </div>
      )}

      {!selectedMetric && (
        <>
          <div className="chart-container" style={{ marginTop: '30px' }}>
            <RevenueTrendChart data={charts.revenue} title={`Revenue Trend (${timeRange === 'all' ? 'All Time' : timeRange === '365' ? 'Last Year' : `Last ${timeRange} Days`})`} />
          </div>

          <div className="metrics-row" style={{ marginTop: '20px' }}>
            <div className="chart-container">
              <TopProductsChart data={charts.topProducts} />
            </div>
            <div className="chart-container">
              <CategoryPerformanceChart data={charts.categories} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminSalesReportsTab;
