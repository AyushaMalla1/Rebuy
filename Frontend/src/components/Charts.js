// Charts.js - Reusable Chart Components
import React from "react";
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
  ResponsiveContainer,
} from "recharts";

// Revenue Trend Chart
export const RevenueTrendChart = ({ data, title = "Revenue Trend (Last 7 Days)" }) => {
  // Handle empty or undefined data
  const chartData = data && data.length > 0 ? data : [
    { day: 'Mon', revenue: 0 },
    { day: 'Tue', revenue: 0 },
    { day: 'Wed', revenue: 0 },
    { day: 'Thu', revenue: 0 },
    { day: 'Fri', revenue: 0 },
    { day: 'Sat', revenue: 0 },
    { day: 'Sun', revenue: 0 }
  ];

  return (
    <div className="chart-card">
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#00bcd4" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No revenue data available for the last 7 days</p>
        </div>
      )}
    </div>
  );
};

// Top Products Chart
export const TopProductsChart = ({ data, title = "Top Selling Products" }) => {
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#00bcd4" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No product sales data available</p>
        </div>
      )}
    </div>
  );
};

// Category Performance Chart
export const CategoryPerformanceChart = ({ data, title = "Category Performance" }) => {
  const COLORS = ['#00bcd4', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];
  
  return (
    <div className="chart-card">
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No category data available</p>
        </div>
      )}
    </div>
  );
};

// Stock Levels Chart
export const StockLevelsChart = ({ data }) => {
  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#00bcd4" name="Products" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Monthly Sales Overview (Original)
export const MonthlySalesChart = ({ data }) => {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3>Monthly Sales Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Default export for backward compatibility
const Charts = MonthlySalesChart;
export default Charts;

// Payment Methods Chart
export const PaymentMethodsChart = ({ data }) => {
  const COLORS = ['#00bcd4', '#4caf50', '#ff9800', '#9c27b0'];
  
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3>Payment Methods Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Payment Status Chart
export const PaymentStatusChart = ({ data }) => {
  const COLORS = {
    completed: '#4caf50',
    pending: '#ff9800',
    failed: '#f44336',
    refunded: '#9c27b0'
  };
  
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3>Payment Status Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#00bcd4" name="Payments">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#00bcd4'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Daily Revenue Chart
export const DailyRevenueChart = ({ data }) => {
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3>Daily Revenue (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#4caf50" strokeWidth={2} name="Revenue (Rs.)" />
          <Line type="monotone" dataKey="orders" stroke="#00bcd4" strokeWidth={2} name="Orders" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// User Growth Chart
export const UserGrowthChart = ({ data, title = "User Growth Trend" }) => {
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
            <Line type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={2} name="New Users" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No user growth data available</p>
        </div>
      )}
    </div>
  );
};

// Seller Statistics Chart
export const SellerStatsChart = ({ data, title = "Seller Statistics" }) => {
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sellers" fill="#10b981" name="Active Sellers" />
            <Bar dataKey="newSellers" fill="#6366f1" name="New Sellers" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No seller statistics available</p>
        </div>
      )}
    </div>
  );
};

// Product Distribution Chart
export const ProductDistributionChart = ({ data, title = "Product Distribution" }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No product distribution data available</p>
        </div>
      )}
    </div>
  );
};

// Orders Trend Chart
export const OrdersTrendChart = ({ data, title = "Orders Trend" }) => {
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#a855f7" strokeWidth={2} name="Orders" />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No orders trend data available</p>
        </div>
      )}
    </div>
  );
};

// Growth Rate Chart
export const GrowthRateChart = ({ data }) => {
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3>Monthly Growth Rate</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="growthRate" fill="#ef4444" name="Growth Rate (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Revenue Breakdown Chart
export const RevenueBreakdownChart = ({ data, title = "Revenue Breakdown" }) => {
  const COLORS = ['#00bcd4', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#2196f3'];
  
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3 style={{fontSize: '16px', marginBottom: '15px', color: '#333', fontWeight: '600'}}>{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={(entry) => `${entry.name}: Rs. ${entry.value.toLocaleString()}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>No revenue breakdown data available</p>
        </div>
      )}
    </div>
  );
};