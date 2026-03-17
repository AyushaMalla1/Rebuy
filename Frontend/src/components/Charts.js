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
export const RevenueTrendChart = ({ data }) => {
  return (
    <div className="chart-card">
      <h3>Revenue Trend (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#00bcd4" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Top Products Chart
export const TopProductsChart = ({ data }) => {
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3>Top Selling Products</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#00bcd4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Category Performance Chart
export const CategoryPerformanceChart = ({ data }) => {
  const COLORS = ['#00bcd4', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];
  
  return (
    <div className="chart-card" style={{marginTop: '20px'}}>
      <h3>Category Performance</h3>
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
        </PieChart>
      </ResponsiveContainer>
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