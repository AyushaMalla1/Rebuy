import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaChartBar,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaBell,
  FaHome,
  FaShoppingBag,
  FaQuestionCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCopy,
  FaStar,
  FaChartPie,
  FaArchive,
  FaSearch,
  FaBullseye,
  FaLightbulb,
  FaEnvelope,
  FaBoxOpen,
  FaInfoCircle,
  FaClock,
  FaUpload,
  FaDownload
} from "react-icons/fa";
import { HiTrendingUp } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import { RevenueTrendChart, TopProductsChart, CategoryPerformanceChart, StockLevelsChart, OrdersBarChart, AvgOrderValueChart, PlatformFeesChart, NetRevenueChart } from "./components/Charts";
import SellerFinance from "./SellerFinance";
import HelpCenter from "./components/HelpCenter";
import Chatbot from "./components/Chatbot";
import "./SellerDashboard.css";

const API_URL = 'http://localhost:5000/api';

function SellerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sellerData, setSellerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalRevenue: 0,
    totalSold: 0
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: 'New',
    size: '',
    brand: '',
    stock: '',
    images: [''],
    story: '',
    paymentOptions: ['cod', 'online'],
    bundleDeal: {
      enabled: false,
      buyQuantity: 2,
      discountPercentage: 10,
      description: ''
    }
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [chartData, setChartData] = useState({
    revenue: [],
    topProducts: [],
    categories: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    country: '',
    storeName: '',
    storeDescription: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/100');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [show2FASuccess, setShow2FASuccess] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAEnabledDate, setTwoFAEnabledDate] = useState(null);
  const [twoFAAction, setTwoFAAction] = useState('enable'); // 'enable' or 'disable'
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [revenueDateRange, setRevenueDateRange] = useState('30');
  const [selectedRevenueMetric, setSelectedRevenueMetric] = useState('revenue');
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    platformFees: 0,
    netRevenue: 0,
    growthRate: 0
  });
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [returns, setReturns] = useState([]);
  const [returnStats, setReturnStats] = useState({
    totalReturns: 0,
    pendingReturns: 0,
    approvedReturns: 0,
    completedReturns: 0,
    totalRefundAmount: 0
  });
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnStatusFilter, setReturnStatusFilter] = useState('All');

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setProfileData({ ...profileData, profileImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      navigate('/login');
      return;
    }
    fetchSellerData(user._id);
    fetchProducts(user._id);
    fetchStats(user._id);
    fetchOrders(user._id);
    fetchMessages(user._id);
    fetchReturns(user._id);
    fetchReturnStats(user._id);
    fetchNotifications();
  }, [navigate]);

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

  const fetchSellerData = async (sellerId) => {
    try {
      const response = await fetch(`${API_URL}/sellers/${sellerId}`);
      const data = await response.json();
      if (data.success) {
        setSellerData(data.seller);
        setProfileData({
          fullName: data.seller.fullName || '',
          email: data.seller.email || '',
          phone: data.seller.phone || '',
          city: data.seller.city || '',
          address: data.seller.address || '',
          country: data.seller.country || '',
          storeName: data.seller.storeName || '',
          storeDescription: data.seller.storeDescription || '',
          profileImage: data.seller.profileImage || 'https://i.pravatar.cc/100'
        });
        if (data.seller.profileImage) {
          setProfileImage(data.seller.profileImage);
        }
        // Set 2FA status
        setTwoFAEnabled(data.seller.twoFactorEnabled || false);
        if (data.seller.twoFactorEnabled && data.seller.createdAt) {
          setTwoFAEnabledDate(new Date(data.seller.createdAt));
        }
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    }
  };

  const fetchProducts = async (sellerId) => {
    try {
      const response = await fetch(`${API_URL}/sellers/${sellerId}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchStats = async (sellerId) => {
    try {
      const response = await fetch(`${API_URL}/sellers/${sellerId}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrders = async (sellerId) => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_URL}/orders/seller/${sellerId}`);
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchMessages = async (sellerId) => {
    setLoadingMessages(true);
    try {
      // Fetch conversations for seller
      const response = await fetch(`${API_URL}/messages/conversations/${sellerId}`);
      const data = await response.json();
      
      console.log('Seller conversations data:', data);
      
      if (data.success && data.conversations) {
        // Transform conversations to message format for display
        const conversationMessages = data.conversations.map(conv => {
          console.log('Processing conversation:', conv);
          return {
            _id: conv.conversationId,
            conversationId: conv.conversationId,
            senderId: conv.otherUser._id,
            senderModel: conv.otherUser.model,
            senderInfo: {
              fullName: conv.otherUser.name || 'Customer',
              email: conv.otherUser.email || '',
              profileImage: conv.otherUser.profileImage
            },
            message: conv.lastMessage.message,
            createdAt: conv.lastMessage.createdAt,
            read: conv.lastMessage.read,
            productId: conv.productId
          };
        });
        
        console.log('Transformed seller messages:', conversationMessages);
        setMessages(conversationMessages);
        setUnreadMessages(data.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
      }
    } catch (error) {
      console.error('Error fetching seller messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchReturns = async (sellerId) => {
    setLoadingReturns(true);
    try {
      const statusParam = returnStatusFilter !== 'All' ? `?status=${returnStatusFilter}` : '';
      const response = await fetch(`${API_URL}/returns/seller/${sellerId}${statusParam}`);
      const data = await response.json();
      
      if (data.success) {
        setReturns(data.returns || []);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoadingReturns(false);
    }
  };

  const fetchReturnStats = async (sellerId) => {
    try {
      const response = await fetch(`${API_URL}/returns/seller/${sellerId}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setReturnStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching return stats:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'PATCH'
      });
      const data = await response.json();
      if (data.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        fetchMessages(user._id);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('Message deleted successfully');
        const user = JSON.parse(localStorage.getItem('user'));
        fetchMessages(user._id);
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/messages/conversation/${conversationId}?userId=${user._id}`);
      const data = await response.json();
      
      if (data.success) {
        setConversationMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    // Fetch full conversation
    await fetchConversationMessages(msg.conversationId);
  };

  const handleDirectReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: user._id,
          senderModel: 'Seller',
          receiverId: selectedMessage.senderId,
          receiverModel: selectedMessage.senderModel,
          message: replyText
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setReplyText('');
        // Refresh conversation messages
        await fetchConversationMessages(selectedMessage.conversationId);
        // Refresh message list
        fetchMessages(user._id);
      } else {
        alert('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Order status updated to ${newStatus}`);
        const user = JSON.parse(localStorage.getItem('user'));
        fetchOrders(user._id);
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const prepareChartData = () => {
    const now = new Date();
    let startDate = new Date();
    let daysToShow = parseInt(revenueDateRange) || 30;

    if (revenueDateRange === 'all') {
      startDate = new Date(0);
      daysToShow = 365;
    } else {
      startDate.setDate(now.getDate() - daysToShow);
    }

    // Create array for the selected period
    const chartDataPoints = [];
    const interval = daysToShow > 90 ? Math.ceil(daysToShow / 30) : 1;

    for (let i = daysToShow - 1; i >= 0; i -= interval) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr && (order.status === 'Delivered' || order.status === 'Processing' || order.status === 'Shipped');
      });

      let value = 0;
      switch (selectedRevenueMetric) {
        case 'revenue':
          value = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
          break;
        case 'orders':
          value = dayOrders.length;
          break;
        case 'avg':
          const totalRev = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
          value = dayOrders.length > 0 ? totalRev / dayOrders.length : 0;
          break;
        case 'fees':
          const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
          value = revenue * 0.03;
          break;
        case 'net':
          const gross = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
          value = gross * 0.97;
          break;
        default:
          value = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      }
      
      chartDataPoints.push({
        day: daysToShow <= 30 ? dayName : monthDay,
        revenue: value,
        orders: dayOrders.length
      });
    }

    // Top products
    const topProducts = products
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        sales: p.sold || 0
      }));

    // Category performance
    const categoryMap = {};
    products.forEach(p => {
      if (categoryMap[p.category]) {
        categoryMap[p.category] += p.sold || 0;
      } else {
        categoryMap[p.category] = p.sold || 0;
      }
    });

    const categories = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    }));

    setChartData({
      revenue: chartDataPoints.length > 0 ? chartDataPoints : [{ day: 'No data', revenue: 0, orders: 0 }],
      topProducts: topProducts.length > 0 ? topProducts : [{ name: 'No sales yet', sales: 0 }],
      categories: categories.length > 0 ? categories : [{ name: 'No data', value: 1 }]
    });
  };

  useEffect(() => {
    if (products.length > 0 || orders.length > 0) {
      prepareChartData();
    }
    fetchNotifications();
  }, [products, orders, revenueDateRange, selectedRevenueMetric]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    setLoadingNotifications(true);
    try {
      const response = await fetch(`${API_URL}/notifications/${user._id}`);
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
      const response = await fetch(`${API_URL}/notifications/seller/${user._id}/read-all`, {
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
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
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

  const deleteNotification = async (notificationId, e) => {
    // Stop event propagation to prevent notification click
    if (e) {
      e.stopPropagation();
    }
    
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
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
    if (type === 'order') return <FaShoppingCart />;
    if (type === 'product') return <FaBoxOpen />;
    if (type === 'message') return <FaEnvelope />;
    if (type === 'stock') return <FaExclamationTriangle />;
    if (type === 'system') return <FaInfoCircle />;
    
    // Fallback to severity
    if (severity === 'error') return <FaTimesCircle />;
    if (severity === 'warning') return <FaExclamationTriangle />;
    if (severity === 'success') return <FaCheckCircle />;
    return <FaBell />;
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
    // Mark as read
    await markAsRead(notification._id);
    
    // Close notification dropdown
    setShowNotifications(false);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        setActiveTab('orders');
        break;
      case 'product':
        setActiveTab('products');
        break;
      case 'message':
        setActiveTab('inbox');
        break;
      case 'stock':
        setActiveTab('products');
        break;
      case 'system':
        setActiveTab('dashboard');
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const response = await fetch(`${API_URL}/sellers/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          profileImage: profileImage
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
        
        // Update seller data state to reflect changes in header
        setSellerData({
          ...sellerData,
          storeName: profileData.storeName,
          fullName: profileData.fullName,
          profileImage: profileImage
        });
        
        // Fetch fresh data from server
        await fetchSellerData(user._id);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  useEffect(() => {
    // Filter products based on search query (name, category, SKU)
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, products]);

  // Filter orders based on search query and status filter
  useEffect(() => {
    let filtered = orders;

    // Apply status filter
    if (orderStatusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === orderStatusFilter);
    }

    // Apply search filter
    if (orderSearchQuery.trim() !== '') {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(orderSearchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orderSearchQuery, orderStatusFilter, orders]);

  // Refetch returns when filter changes
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) {
      fetchReturns(user._id);
    }
  }, [returnStatusFilter]);

  // Handle CSV file selection
  const handleCSVFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setUploadResults(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  // Parse CSV and upload products
  const handleBulkUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Parse products
      const products = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const product = {};
        
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });
        
        products.push(product);
      }

      // Upload to backend
      const response = await fetch('http://localhost:5000/api/products/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          sellerId: sellerData._id
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadResults(data.results);
        alert(`Upload complete! ${data.results.successful.length} products added, ${data.results.failed.length} failed.`);
        
        // Refresh products list
        fetchProducts();
        
        // Clear file
        setCsvFile(null);
      } else {
        alert(data.message || 'Failed to upload products');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV file');
    }
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const template = `name,description,price,category,condition,size,brand,stock,images,story,paymentOptions,discountType,discountValue
Example Product,Product description,1500,Men's Clothing,New,M,Nike,10,https://example.com/image1.jpg|https://example.com/image2.jpg,Product story,cod|online,percentage,10`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProduct,
          sellerId: user._id,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Product added successfully! Waiting for admin approval.');
        setShowAddProduct(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          condition: 'Good',
          size: '',
          brand: '',
          stock: '',
          images: [''],
          story: '',
          paymentOptions: ['cod', 'online'],
          bundleDeal: {
            enabled: false,
            buyQuantity: 2,
            discountPercentage: 10,
            description: ''
          }
        });
        fetchProducts(user._id);
        fetchStats(user._id);
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully');
        const user = JSON.parse(localStorage.getItem('user'));
        fetchProducts(user._id);
        fetchStats(user._id);
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      images: product.images || ['']
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      // Prepare update data
      const updateData = {
        ...editingProduct,
        sellerId: user._id,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock)
      };
      
      // Remove discount field if it's empty or invalid
      if (!updateData.discount || !updateData.discount.percentage || !updateData.discount.startDate || !updateData.discount.endDate) {
        delete updateData.discount;
      }
      
      const response = await fetch(`${API_URL}/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Product updated successfully!');
        setShowEditModal(false);
        setEditingProduct(null);
        fetchProducts(user._id);
        fetchStats(user._id);
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleRestockClick = (product) => {
    setRestockProduct(product);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!restockQuantity || parseInt(restockQuantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const newStock = restockProduct.stock + parseInt(restockQuantity);
      
      // Prepare update payload with all required fields
      const updatePayload = {
        name: restockProduct.name,
        description: restockProduct.description,
        price: parseFloat(restockProduct.price),
        category: restockProduct.category,
        condition: restockProduct.condition,
        size: restockProduct.size,
        brand: restockProduct.brand || 'Unbranded',
        stock: newStock,
        images: restockProduct.images,
        story: restockProduct.story || '',
        paymentOptions: restockProduct.paymentOptions || ['cod', 'online'],
        sellerId: user._id
      };

      // Include discount if it exists and is valid
      if (restockProduct.discount && 
          restockProduct.discount.percentage !== undefined &&
          restockProduct.discount.startDate &&
          restockProduct.discount.endDate &&
          restockProduct.discount.active !== undefined) {
        updatePayload.discount = restockProduct.discount;
      }

      const response = await fetch(`${API_URL}/products/${restockProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }
      
      if (response.ok) {
        alert(`Product restocked successfully! New stock: ${newStock} units`);
        setShowRestockModal(false);
        setRestockProduct(null);
        setRestockQuantity('');
        fetchProducts(user._id);
        fetchStats(user._id);
      } else {
        console.error('Restock error:', data);
        alert(data.message || data.errors?.join(', ') || 'Failed to restock product');
      }
    } catch (error) {
      console.error('Error restocking product:', error);
      alert('Error restocking product: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleReturnResponse = async (returnId, status) => {
    const sellerResponse = prompt(`Please provide a response to the customer (optional):`);
    
    try {
      const response = await fetch(`${API_URL}/returns/${returnId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          sellerResponse: sellerResponse || ''
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Return request ${status.toLowerCase()} successfully`);
        const user = JSON.parse(localStorage.getItem('user'));
        fetchReturns(user._id);
        fetchReturnStats(user._id);
      } else {
        alert(data.message || 'Failed to update return request');
      }
    } catch (error) {
      console.error('Error updating return request:', error);
      alert('Error updating return request');
    }
  };

  const handleCompleteReturn = async (returnId) => {
    if (!window.confirm('Mark this return as completed and process refund?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/returns/${returnId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Return completed and refund processed successfully');
        const user = JSON.parse(localStorage.getItem('user'));
        fetchReturns(user._id);
        fetchReturnStats(user._id);
      } else {
        alert(data.message || 'Failed to complete return');
      }
    } catch (error) {
      console.error('Error completing return:', error);
      alert('Error completing return');
    }
  };

  // Settings handlers
  const handleDeactivateAccount = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    if (!window.confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sellers/${user._id}/deactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Account deactivated successfully');
        handleLogout();
      } else {
        alert(data.message || 'Failed to deactivate account');
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      alert('Failed to deactivate account');
    }
  };

  const handleDeleteAccount = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    if (!window.confirm('⚠️ WARNING: This will permanently delete your account and all data. This action CANNOT be undone. Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sellers/${user._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Account deleted successfully');
        handleLogout();
      } else {
        alert(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleEnable2FA = () => {
    setTwoFAAction('enable');
    setShow2FAModal(true);
    setTwoFAPassword('');
  };

  const handleDisable2FA = () => {
    setTwoFAAction('disable');
    setShow2FAModal(true);
    setTwoFAPassword('');
  };

  const handleConfirm2FA = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    if (!twoFAPassword) {
      alert('Please enter your password');
      return;
    }

    try {
      const endpoint = twoFAAction === 'enable' ? 'enable-2fa' : 'disable-2fa';
      const response = await fetch(`${API_URL}/sellers/${user._id}/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: twoFAPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        setShow2FAModal(false);
        setTwoFAPassword('');
        setShow2FASuccess(true);
        
        if (twoFAAction === 'enable') {
          setTwoFAEnabled(true);
          setTwoFAEnabledDate(new Date());
        } else {
          setTwoFAEnabled(false);
          setTwoFAEnabledDate(null);
        }
      } else {
        alert(data.message || `Failed to ${twoFAAction} 2FA`);
      }
    } catch (error) {
      console.error(`Error ${twoFAAction}ing 2FA:`, error);
      alert(`Failed to ${twoFAAction} 2FA`);
    }
  };

  const handleViewLoginHistory = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    try {
      const response = await fetch(`${API_URL}/sellers/${user._id}/login-history`);
      const data = await response.json();
      
      if (data.success) {
        setLoginHistory(data.loginHistory || []);
        setShowLoginHistoryModal(true);
      } else {
        alert(data.message || 'Failed to fetch login history');
      }
    } catch (error) {
      console.error('Error fetching login history:', error);
      alert('Failed to fetch login history');
    }
  };

  const handleChangePassword = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    if (!changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (changePasswordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sellers/${user._id}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setShowChangePasswordModal(false);
        setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSuccessModal(true);
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  // Helper function to get stock status badge
  const getStockStatusBadge = (stock) => {
    if (stock === 0) {
      return {
        label: 'Out of Stock',
        bg: '#fee2e2',
        color: '#991b1b',
        icon: <FaTimesCircle />
      };
    } else if (stock <= 20) {
      return {
        label: 'Low Stock',
        bg: '#fed7aa',
        color: '#9a3412',
        icon: <FaExclamationTriangle />
      };
    } else {
      return {
        label: 'Active',
        bg: '#d1fae5',
        color: '#065f46',
        icon: <FaCheckCircle />
      };
    }
  };

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleThreeDotAction = (action, product) => {
    setShowThreeDotMenu(null);
    
    switch(action) {
      case 'duplicate':
        alert(`Duplicate feature coming soon for: ${product.name}`);
        break;
      case 'featured':
        alert(`Mark as Featured coming soon for: ${product.name}`);
        break;
      case 'analytics':
        alert(`View Analytics coming soon for: ${product.name}`);
        break;
      case 'archive':
        alert(`Archive feature coming soon for: ${product.name}`);
        break;
      default:
        break;
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...newProduct.images];
    newImages[index] = value;
    setNewProduct({ ...newProduct, images: newImages });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 10) {
      return;
    }

    // Convert files to base64 or upload to cloud storage
    const filePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Images = await Promise.all(filePromises);
      setImageFiles([...imageFiles, ...files]);
      
      // Add base64 images to product images
      const currentImages = newProduct.images.filter(img => img !== '');
      setNewProduct({ 
        ...newProduct, 
        images: [...currentImages, ...base64Images] 
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    }
  };

  const removeImage = (index) => {
    const newImages = newProduct.images.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setNewProduct({ ...newProduct, images: newImages.length > 0 ? newImages : [''] });
  };

  // Export orders to CSV
  const handleExportOrders = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    // Create CSV content
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Items', 'Total', 'Payment Method', 'Payment Status', 'Order Status', 'Date'];
    const csvRows = [headers.join(',')];

    filteredOrders.forEach(order => {
      const row = [
        `"${order._id}"`,
        `"${order.customerName || 'N/A'}"`,
        `"${order.customerEmail || 'N/A'}"`,
        order.items.length,
        order.total || 0,
        `"${order.paymentMethod || 'N/A'}"`,
        `"${order.paymentStatus || 'N/A'}"`,
        `"${order.status}"`,
        `"${new Date(order.createdAt).toLocaleDateString()}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate revenue stats based on date range
  useEffect(() => {
    if (orders.length === 0) return;

    const now = new Date();
    let startDate = new Date();

    switch (revenueDateRange) {
      case '7':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90':
        startDate.setDate(now.getDate() - 90);
        break;
      case '365':
        startDate.setDate(now.getDate() - 365);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const filteredByDate = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });

    const completedOrders = filteredByDate.filter(order => 
      order.status === 'Delivered' || order.status === 'Processing' || order.status === 'Shipped'
    );

    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const platformFees = totalRevenue * 0.03;
    const netRevenue = totalRevenue - platformFees;

    const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);

    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousStartDate && orderDate < startDate &&
             (order.status === 'Delivered' || order.status === 'Processing' || order.status === 'Shipped');
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
    const growthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;

    setRevenueStats({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      platformFees,
      netRevenue,
      growthRate
    });
  }, [orders, revenueDateRange]);

  // Export revenue report
  const handleExportRevenue = () => {
    if (orders.length === 0) {
      alert('No revenue data to export');
      return;
    }

    const now = new Date();
    let startDate = new Date();

    switch (revenueDateRange) {
      case '7':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90':
        startDate.setDate(now.getDate() - 90);
        break;
      case '365':
        startDate.setDate(now.getDate() - 365);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const filteredByDate = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now &&
             (order.status === 'Delivered' || order.status === 'Processing' || order.status === 'Shipped');
    });

    const headers = ['Date', 'Order ID', 'Customer', 'Items', 'Gross Amount', 'Platform Fee (3%)', 'Net Amount', 'Status'];
    const csvRows = [headers.join(',')];

    csvRows.push('');
    csvRows.push(`REVENUE REPORT - Last ${revenueDateRange === 'all' ? 'All Time' : revenueDateRange + ' Days'}`);
    csvRows.push(`Generated on: ${new Date().toLocaleString()}`);
    csvRows.push('');
    csvRows.push(`Total Orders,${revenueStats.totalOrders}`);
    csvRows.push(`Gross Revenue,Rs. ${revenueStats.totalRevenue.toFixed(2)}`);
    csvRows.push(`Platform Fees,Rs. ${revenueStats.platformFees.toFixed(2)}`);
    csvRows.push(`Net Revenue,Rs. ${revenueStats.netRevenue.toFixed(2)}`);
    csvRows.push(`Average Order Value,Rs. ${revenueStats.avgOrderValue.toFixed(2)}`);
    csvRows.push(`Growth Rate,${revenueStats.growthRate.toFixed(2)}%`);
    csvRows.push('');
    csvRows.push(headers.join(','));

    filteredByDate.forEach(order => {
      const grossAmount = order.total || 0;
      const platformFee = grossAmount * 0.03;
      const netAmount = grossAmount - platformFee;

      const row = [
        `"${new Date(order.createdAt).toLocaleDateString()}"`,
        `"${order._id}"`,
        `"${order.customerName || 'N/A'}"`,
        order.items.length,
        grossAmount.toFixed(2),
        platformFee.toFixed(2),
        netAmount.toFixed(2),
        `"${order.status}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const rangeLabel = revenueDateRange === 'all' ? 'all_time' : `${revenueDateRange}_days`;
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue_report_${rangeLabel}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export performance report
  const handleExportPerformance = () => {
    if (products.length === 0) {
      alert('No performance data to export');
      return;
    }

    const csvRows = [];
    
    csvRows.push('PERFORMANCE REPORT');
    csvRows.push(`Generated on: ${new Date().toLocaleString()}`);
    csvRows.push('');
    
    // Summary stats
    csvRows.push('SUMMARY');
    csvRows.push(`Total Products,${stats.totalProducts}`);
    csvRows.push(`Total Stock,${stats.totalStock}`);
    csvRows.push(`Total Revenue,Rs. ${stats.totalRevenue.toLocaleString()}`);
    csvRows.push(`Total Sold,${stats.totalSold}`);
    csvRows.push('');
    
    // Top selling products
    csvRows.push('TOP SELLING PRODUCTS');
    csvRows.push('Product Name,Sales,Stock,Price,Revenue');
    chartData.topProducts.forEach(product => {
      const fullProduct = products.find(p => p.name.includes(product.name.substring(0, 10)));
      if (fullProduct) {
        csvRows.push(`"${fullProduct.name}",${fullProduct.sold || 0},${fullProduct.stock},Rs. ${fullProduct.price},Rs. ${(fullProduct.price * (fullProduct.sold || 0)).toFixed(2)}`);
      }
    });
    csvRows.push('');
    
    // Category performance
    csvRows.push('CATEGORY PERFORMANCE');
    csvRows.push('Category,Sales');
    chartData.categories.forEach(cat => {
      csvRows.push(`"${cat.name}",${cat.value}`);
    });
    csvRows.push('');
    
    // All products
    csvRows.push('ALL PRODUCTS');
    csvRows.push('Product Name,Category,Condition,Price,Stock,Sold,Revenue,Status');
    products.forEach(product => {
      csvRows.push(`"${product.name}","${product.category}","${product.condition}",Rs. ${product.price},${product.stock},${product.sold || 0},Rs. ${(product.price * (product.sold || 0)).toFixed(2)},"${product.status}"`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `performance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addImageField = () => {
    if (newProduct.images.length < 10) {
      setNewProduct({ ...newProduct, images: [...newProduct.images, ''] });
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="seller-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <img src="/logo.png" alt="Rebuy" className="sidebar-logo-img" />
        
        <div className="menu-items-scrollable">
          <div 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <MdDashboard /> Dashboard
          </div>
          <div 
            className={`menu-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBox /> Products
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingCart /> Orders
          </div>
          
          <div 
            className={`menu-item ${activeTab === 'customer-returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer-returns')}
          >
            <FaArchive /> Customer Returns
          </div>

          <div 
            className={`menu-item ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            <FaDollarSign /> Finance
          </div>

          <div 
            className={`menu-item ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <FaBell /> Inbox
          </div>

          <div 
            className={`menu-item ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <FaChartLine /> Revenue
          </div>
          <div 
            className={`menu-item ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <FaChartBar /> Performance
          </div>

          <div 
            className="menu-item"
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </div>
        </div>

        <div className="bottom-menu">
          <div 
            className={`menu-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <FaQuestionCircle /> Help Center
          </div>
          <div 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Settings
          </div>
          <div className="menu-item logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD */}
      <div className="dashboard">
        {/* HEADER */}
        <div className="header">
          <div>
            <h2>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Product Management'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'customer-returns' && 'Customer Returns'}
              {activeTab === 'finance' && 'Finance & Payouts'}
              {activeTab === 'inbox' && 'Inbox'}
              {activeTab === 'revenue' && 'Revenue Analytics'}
              {activeTab === 'performance' && 'Performance Analytics'}
              {activeTab === 'profile' && 'Seller Profile'}
              {activeTab === 'settings' && 'Account Settings'}
              {activeTab === 'help' && 'Help Center'}
            </h2>
            <p>
              {activeTab === 'dashboard' && 'Manage your store efficiently with real-time insights.'}
              {activeTab === 'products' && 'Manage your product inventory and listings.'}
              {activeTab === 'orders' && 'Track and manage customer orders.'}
              {activeTab === 'customer-returns' && 'Handle customer return requests.'}
              {activeTab === 'finance' && 'View your earnings and manage payout details.'}
              {activeTab === 'inbox' && 'View and respond to customer messages.'}
              {activeTab === 'revenue' && 'View your revenue trends and analytics.'}
              {activeTab === 'performance' && 'Analyze your store performance metrics.'}
              {activeTab === 'profile' && 'Manage your account information'}
              {activeTab === 'settings' && 'Manage security and account preferences'}
              {activeTab === 'help' && 'Get support and find answers to your questions'}
            </p>
          </div>
          <div className="header-actions">
            <div className="notification-wrapper">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notification-btn"
                title="Notifications"
              >
                <FaBell />
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
                          <FaBell size={36} />
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
                                  <FaClock size={10} />
                                  {formatNotificationTime(notif.createdAt)}
                                </span>
                                <button
                                  onClick={(e) => deleteNotification(notif._id, e)}
                                  className="notification-delete-btn"
                                >
                                  <FaTrash size={10} />
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
            <div className="user">
              <img
                src={profileImage || 'https://i.pravatar.cc/40'}
                alt="user"
                className="user-avatar"
              />
              <div>
                <strong>{sellerData?.storeName || sellerData?.fullName || 'Seller'}</strong>
                <p>Seller ID: {sellerData?._id?.slice(-6) || '000000'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {/* STATS */}
            <div className="stats-grid">
              <div className="card clickable-card" onClick={() => setActiveTab('products')}>
                <div className="card-content">
                  <div className="icon blue">
                    <FaBox />
                  </div>
                  <div className="card-info">
                    <h4>TOTAL PRODUCTS</h4>
                    <h2>{stats.totalProducts}</h2>
                  </div>
                </div>
              </div>
              <div className="card clickable-card" onClick={() => setActiveTab('products')}>
                <div className="card-content">
                  <div className="icon green">
                    <FaShoppingBag />
                  </div>
                  <div className="card-info">
                    <h4>TOTAL STOCK</h4>
                    <h2>{stats.totalStock}</h2>
                  </div>
                </div>
              </div>
              <div className="card clickable-card" onClick={() => setActiveTab('revenue')}>
                <div className="card-content">
                  <div className="icon orange">
                    <FaDollarSign />
                  </div>
                  <div className="card-info">
                    <h4>POTENTIAL REVENUE</h4>
                    <h2>Rs. {stats.totalRevenue?.toLocaleString() || 0}</h2>
                    <p className="green"></p>
                  </div>
                </div>
              </div>
              <div className="card clickable-card" onClick={() => setActiveTab('orders')}>
                <div className="card-content">
                  <div className="icon purple">
                    <HiTrendingUp />
                  </div>
                  <div className="card-info">
                    <h4>TOTAL ORDERS</h4>
                    <h2>{stats.totalOrders || 0}</h2>
                    <p>{stats.totalOrders > 0 ? '' : 'No orders yet'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions">
              <div className="action-card" onClick={() => setActiveTab('products')}>
                <FaBox />
                <p>Manage Products</p>
              </div>
              <div className="action-card" onClick={() => { setActiveTab('products'); setShowAddProduct(true); }}>
                <FaPlus />
                <p>Add New Product</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('orders')}>
                <FaShoppingCart />
                <p>View Orders</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('revenue')}>
                <FaChartLine />
                <p>View Revenue</p>
              </div>
            </div>

            {/* STOCK LEVELS CHART */}
            {products.length > 0 && (
              <div className="stock-levels-container">
                <div className="stock-levels-header">
                  <div>
                    <h3 className="stock-levels-title">
                      Stock Levels Overview
                    </h3>
                    <p className="stock-levels-subtitle">
                      Monitor your inventory distribution across all products
                    </p>
                  </div>
                </div>

                {/* Stock Alert - Moved to Top */}
                {products.filter(p => p.stock <= 20).length > 0 && (
                  <div className="stock-alert">
                    <FaExclamationTriangle className="stock-alert-icon" />
                    <div>
                      <h4 className="stock-alert-title">
                        Stock Alert
                      </h4>
                      <p className="stock-alert-message">
                        You have {products.filter(p => p.stock <= 20).length} product(s) with low or no stock. 
                        Consider restocking to avoid missing sales opportunities.
                      </p>
                    </div>
                  </div>
                )}

                <div className="stock-cards-grid">
                  {/* Active Stock */}
                  <div 
                    onClick={() => setActiveTab('products')}
                    className="stock-card active"
                  >
                    <div className="stock-card-header">
                      <FaCheckCircle className="stock-card-icon active" />
                      <h4 className="stock-card-label active">
                        Active Stock
                      </h4>
                    </div>
                    <h2 className="stock-card-count active">
                      {products.filter(p => p.stock > 20).length}
                    </h2>
                    <p className="stock-card-description active">
                      Products with 20+ units
                    </p>
                  </div>

                  {/* Low Stock */}
                  <div 
                    onClick={() => setActiveTab('products')}
                    className="stock-card low"
                  >
                    <div className="stock-card-header">
                      <FaExclamationTriangle className="stock-card-icon low" />
                      <h4 className="stock-card-label low">
                        Low Stock
                      </h4>
                    </div>
                    <h2 className="stock-card-count low">
                      {products.filter(p => p.stock > 0 && p.stock <= 20).length}
                    </h2>
                    <p className="stock-card-description low">
                      Products with 1-20 units
                    </p>
                  </div>

                  {/* Out of Stock */}
                  <div 
                    onClick={() => setActiveTab('products')}
                    className="stock-card out"
                  >
                    <div className="stock-card-header">
                      <FaTimesCircle className="stock-card-icon out" />
                      <h4 className="stock-card-label out">
                        Out of Stock
                      </h4>
                    </div>
                    <h2 className="stock-card-count out">
                      {products.filter(p => p.stock === 0).length}
                    </h2>
                    <p className="stock-card-description out">
                      Products need restocking
                    </p>
                  </div>
                </div>

                {/* Stock Chart */}
                <StockLevelsChart 
                  data={[
                    { name: 'Active Stock (20+)', count: products.filter(p => p.stock > 20).length },
                    { name: 'Low Stock (1-20)', count: products.filter(p => p.stock > 0 && p.stock <= 20).length },
                    { name: 'Out of Stock (0)', count: products.filter(p => p.stock === 0).length }
                  ]}
                />
              </div>
            )}

            {/* BANNER - Only show when no products */}
            {products.length === 0 && (
              <div className="banner">
                <div>
                  <h3>Ready to grow your business?</h3>
                  <p>
                    Add more products to your catalog to reach a wider audience.
                    Sellers with 10+ products see a 40% increase in weekly orders.
                  </p>
                </div>
                <button onClick={() => { setActiveTab('products'); setShowAddProduct(true); }}>
                  List First Product
                </button>
              </div>
            )}
          </>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="products-header">
              <h3 className="products-title"></h3>
              
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <svg 
                  className="search-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="add-product-btn"
                >
                  <FaPlus /> Add Product
                </button>
                
                <button 
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                  className="add-product-btn"
                  style={{ background: '#10b981' }}
                >
                  <FaUpload /> Bulk Upload CSV
                </button>
              </div>
            </div>

            {/* BULK UPLOAD SECTION */}
            {showBulkUpload && (
              <div className="product-form-container" style={{ marginBottom: '20px' }}>
                <h3 className="product-form-title">Bulk Upload CSV</h3>
                <div style={{ padding: '15px' }}>
                  
                  <button 
                    onClick={downloadCSVTemplate}
                    style={{
                      padding: '6px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      fontSize: '13px'
                    }}
                  >
                    <FaDownload style={{ marginRight: '5px' }} />
                    Template
                  </button>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVFileSelect}
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleBulkUpload}
                      disabled={!csvFile}
                      style={{
                        padding: '6px 12px',
                        background: csvFile ? '#10b981' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: csvFile ? 'pointer' : 'not-allowed',
                        fontSize: '13px'
                      }}
                    >
                      Upload
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowBulkUpload(false);
                        setCsvFile(null);
                        setUploadResults(null);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {uploadResults && (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#f3f4f6', borderRadius: '4px', fontSize: '13px' }}>
                      <p style={{ color: '#10b981', margin: 0 }}>
                        ✓ {uploadResults.successful.length} uploaded
                      </p>
                      {uploadResults.failed.length > 0 && (
                        <p style={{ color: '#ef4444', margin: '4px 0 0 0' }}>
                          ✗ {uploadResults.failed.length} failed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADD PRODUCT FORM */}
            {showAddProduct && (
              <div className="product-form-container">
                <h3 className="product-form-title">Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        SKU (Optional)
                        <span className="form-label-hint">
                          Auto-generated if left empty
                        </span>
                      </label>
                      <input
                        type="text"
                        value={newProduct.sku || ''}
                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                        placeholder="e.g., ME-1234-N"
                        className="form-input form-input-mono"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">Price (Rs.) *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        required
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Stock *</label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div>
                      <label className="form-label">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => {
                          setNewProduct({...newProduct, category: e.target.value, subcategory: ''});
                        }}
                        required
                        className="form-select"
                      >
                        <option value="">Select Category</option>
                        <option value="Men's Collection">Men's Collection</option>
                        <option value="Women's Collection">Women's Collection</option>
                        <option value="Sportswear">Sportswear</option>
                        <option value="Vintage">Vintage</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Subcategory</label>
                      <select
                        value={newProduct.subcategory || ''}
                        onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})}
                        className="form-select"
                        disabled={!newProduct.category}
                      >
                        <option value="">Select Subcategory</option>
                        {newProduct.category === "Men's Collection" && (
                          <>
                            <option value="Men's Hoodie">Men's Hoodie</option>
                            <option value="Men's Pants">Men's Pants</option>
                            <option value="Men's Jacket">Men's Jacket</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                        {newProduct.category === "Women's Collection" && (
                          <>
                            <option value="Women's Skirt">Women's Skirt</option>
                            <option value="Women's Blazer">Women's Blazer</option>
                            <option value="Women's Top">Women's Top</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                        {newProduct.category === "Sportswear" && (
                          <>
                            <option value="Sports T-Shirts">Sports T-Shirts</option>
                            <option value="Tank Tops">Tank Tops</option>
                            <option value="Jerseys">Jerseys</option>
                            <option value="Tracksuits">Tracksuits</option>
                            <option value="Joggers">Joggers</option>
                            <option value="Track Pants">Track Pants</option>
                            <option value="Sports Shorts">Sports Shorts</option>
                            <option value="Leggings">Leggings</option>
                            <option value="Windbreakers">Windbreakers</option>
                            <option value="Sports Hoodies">Sports Hoodies</option>
                            <option value="Sports Jackets">Sports Jackets</option>
                          </>
                        )}
                        {newProduct.category === "Vintage" && (
                          <>
                            <option value="Vintage Tops">Vintage Tops</option>
                            <option value="Vintage Bottoms">Vintage Bottoms</option>
                            <option value="Vintage Dresses">Vintage Dresses</option>
                            <option value="Vintage Outerwear">Vintage Outerwear</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Condition *</label>
                      <select
                        value={newProduct.condition}
                        onChange={(e) => setNewProduct({...newProduct, condition: e.target.value})}
                        required
                        className="form-select"
                      >
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Slightly Used">Slightly Used</option>
                        <option value="Vintage">Vintage</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">Size</label>
                      <input
                        type="text"
                        value={newProduct.size}
                        onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
                        placeholder="e.g., M, L, XL"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Brand</label>
                      <input
                        type="text"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                        placeholder="e.g., Nike, Adidas, Zara"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      required
                      rows="4"
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Product Story
                    </label>
                    <textarea
                      value={newProduct.story}
                      onChange={(e) => setNewProduct({...newProduct, story: e.target.value})}
                      rows="4"
                      placeholder="Share the unique story behind this item..."
                      className="form-textarea"
                      required
                    />
                  </div>

                  {/* Bundle Deal Section */}
                  <div className="form-group bundle-deal-section">
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                      <input
                        type="checkbox"
                        id="bundleDealEnabled"
                        checked={newProduct.bundleDeal?.enabled || false}
                        onChange={(e) => setNewProduct({
                          ...newProduct,
                          bundleDeal: {
                            ...newProduct.bundleDeal,
                            enabled: e.target.checked
                          }
                        })}
                        style={{width: '18px', height: '18px', cursor: 'pointer'}}
                      />
                      <label htmlFor="bundleDealEnabled" className="form-label" style={{margin: 0, cursor: 'pointer'}}>
                        Enable Bundle Deal
                      </label>
                    </div>

                    {newProduct.bundleDeal?.enabled && (
                      <div style={{marginLeft: '28px', padding: '12px', background: '#f8f9fa', borderRadius: '8px'}}>
                        <div className="form-grid-2" style={{marginBottom: '12px'}}>
                          <div>
                            <label className="form-label">Buy Quantity *</label>
                            <input
                              type="number"
                              min="2"
                              value={newProduct.bundleDeal?.buyQuantity || 2}
                              onChange={(e) => setNewProduct({
                                ...newProduct,
                                bundleDeal: {
                                  ...newProduct.bundleDeal,
                                  buyQuantity: parseInt(e.target.value) || 2
                                }
                              })}
                              className="form-input"
                              placeholder="e.g., 2"
                            />
                          </div>
                          <div>
                            <label className="form-label">Discount % *</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={newProduct.bundleDeal?.discountPercentage || 10}
                              onChange={(e) => setNewProduct({
                                ...newProduct,
                                bundleDeal: {
                                  ...newProduct.bundleDeal,
                                  discountPercentage: parseInt(e.target.value) || 10
                                }
                              })}
                              className="form-input"
                              placeholder="e.g., 10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="form-label">Bundle Description (Optional)</label>
                          <input
                            type="text"
                            value={newProduct.bundleDeal?.description || ''}
                            onChange={(e) => setNewProduct({
                              ...newProduct,
                              bundleDeal: {
                                ...newProduct.bundleDeal,
                                description: e.target.value
                              }
                            })}
                            className="form-input"
                            placeholder="e.g., Buy 2 or more and save!"
                          />
                        </div>
                        <p style={{fontSize: '12px', color: '#666', marginTop: '8px', marginBottom: 0}}>
                          Preview: Buy {newProduct.bundleDeal?.buyQuantity || 2}+ Get {newProduct.bundleDeal?.discountPercentage || 10}% OFF
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="image-upload-section">
                    <label className="form-label">Product Images (Max 10)</label>
                    
                    {/* File Upload Button */}
                    <div className="image-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="image-upload-input"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="image-upload-label-dashed"
                      >
                        <FaPlus /> Upload Images
                      </label>
                      <span className="image-count-text">
                        {newProduct.images.filter(img => img !== '').length} / 10 images
                      </span>
                    </div>

                    {/* Image Preview Grid */}
                    {newProduct.images.filter(img => img !== '').length > 0 && (
                      <div className="image-preview-grid">
                        {newProduct.images.filter(img => img !== '').map((img, index) => (
                          <div key={index} className="image-preview-item-bordered">
                            <img
                              src={img}
                              alt={`Product ${index + 1}`}
                              className="image-preview-img"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="image-remove-btn-small"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-buttons">
                    <button
                      type="submit"
                      className="form-btn-submit"
                    >
                      Add Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="form-btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PRODUCTS LIST */}
            <div className="products-list-container">
              {filteredProducts.length === 0 && searchQuery === '' ? (
                <div className="products-empty">
                  <FaBox size={64} className="products-empty-icon" />
                  <h3 className="products-empty-title">No Products Yet</h3>
                  <p className="products-empty-text">Add your first product to get started!</p>
                </div>
              ) : filteredProducts.length === 0 && searchQuery !== '' ? (
                <div className="products-empty">
                  <FaBox size={64} className="products-empty-icon" />
                  <h3 className="products-empty-title">No Products Found</h3>
                  <p className="products-empty-text">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="products-table-wrapper">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock Status</th>
                        <th>Approval</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.map((product) => {
                        const stockStatus = getStockStatusBadge(product.stock);
                        return (
                        <tr key={product._id}>
                          <td>
                            <img 
                              src={product.images?.[0] || 'https://via.placeholder.com/60'} 
                              alt={product.name}
                              className="product-image"
                            />
                          </td>
                          <td>
                            <div>
                              <div className="product-name-cell">{product.name}</div>
                              <div className="product-sku">
                                SKU: {product.sku || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="product-category">{product.category}</td>
                          <td className="product-price">Rs. {product.price?.toLocaleString()}</td>
                          <td>
                            <div className="product-stock-cell">
                              <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock <= 20 ? 'low-stock' : 'active-stock'}`}>
                                <span>{stockStatus.icon}</span>
                                {stockStatus.label}
                              </span>
                              <span className="stock-units">
                                {product.stock} units
                              </span>
                              {product.stock === 0 && (
                                <button
                                  onClick={() => handleRestockClick(product)}
                                  className="restock-btn"
                                  title="Restock Product"
                                >
                                  <FaPlus /> Restock
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`approval-badge ${product.status === 'Approved' ? 'approved' : product.status === 'Pending' ? 'pending' : 'rejected'}`}>
                              {product.status}
                            </span>
                          </td>
                          <td>
                            <div className="product-actions">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="product-action-btn edit"
                                title="Edit Product"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="product-action-btn delete"
                                title="Delete Product"
                              >
                                <FaTrash />
                              </button>
                              <button
                                onClick={() => setShowThreeDotMenu(showThreeDotMenu === product._id ? null : product._id)}
                                className="product-action-btn more"
                                title="More Options"
                              >
                                ⋮
                              </button>
                              
                              {/* Three-dot dropdown menu */}
                              {showThreeDotMenu === product._id && (
                                <div className="three-dot-menu">
                                  <button
                                    onClick={() => handleThreeDotAction('duplicate', product)}
                                    className="three-dot-menu-item"
                                  >
                                    <FaCopy /> Duplicate Product
                                  </button>
                                  <button
                                    onClick={() => handleThreeDotAction('featured', product)}
                                    className="three-dot-menu-item"
                                  >
                                    <FaStar /> Mark as Featured
                                  </button>
                                  <button
                                    onClick={() => handleThreeDotAction('analytics', product)}
                                    className="three-dot-menu-item"
                                  >
                                    <FaChartPie /> View Analytics
                                  </button>
                                  <button
                                    onClick={() => handleThreeDotAction('archive', product)}
                                    className="three-dot-menu-item danger"
                                  >
                                    <FaArchive /> Archive Product
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                  
                  <div className="pagination-buttons">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`pagination-btn-prev ${currentPage === 1 ? 'disabled' : ''}`}
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`pagination-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`pagination-btn-next ${currentPage === totalPages ? 'disabled' : ''}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div className="pro-tips-wrapper">
              <h3 className="pro-tips-header">
                <FaLightbulb className="pro-tips-icon" /> Pro Tips for Better Sales
              </h3>
              <div className="pro-tips-grid">
                {/* Tip 1: Stock Updates */}
                <div className="pro-tip-card blue">
                  <div className="pro-tip-icon blue">
                    <FaBox />
                  </div>
                  <h4 className="pro-tip-title blue">
                    Keep Stock Updated
                  </h4>
                  <p className="pro-tip-text blue">
                    Regularly update your stock to avoid customer cancellations and order penalties. Out-of-stock items hurt your seller rating.
                  </p>
                </div>

                {/* Tip 2: Smart Categorization */}
                <div className="pro-tip-card yellow">
                  <div className="pro-tip-icon yellow">
                    <FaBullseye />
                  </div>
                  <h4 className="pro-tip-title yellow">
                    Smart Categorization
                  </h4>
                  <p className="pro-tip-text yellow">
                    Items with clear categories and attributes see 20% higher conversion rates. Choose the most accurate category for your products.
                  </p>
                </div>

                {/* Tip 3: SEO Optimized Titles */}
                <div className="pro-tip-card green">
                  <div className="pro-tip-icon green">
                    <FaSearch />
                  </div>
                  <h4 className="pro-tip-title green">
                    SEO Optimized Titles
                  </h4>
                  <p className="pro-tip-text green">
                    Include keywords in your product names to improve search visibility in-app. Use brand names, colors, and key features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="products-section">
            <div className="orders-header">
              <h3 className="orders-title"></h3>
              
              <div className="orders-controls">
                <div className="order-search-container">
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer Name..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <svg 
                    className="search-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <button 
                  onClick={handleExportOrders}
                  className="export-btn"
                  disabled={filteredOrders.length === 0}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="order-status-tabs">
              <button
                onClick={() => setOrderStatusFilter('All')}
                className={`order-status-tab ${orderStatusFilter === 'All' ? 'active' : ''}`}
              >
                <FaShoppingCart />
                All
                <span className="order-count-badge">{orders.length}</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('Pending')}
                className={`order-status-tab ${orderStatusFilter === 'Pending' ? 'active' : ''}`}
              >
                <FaClock />
                Pending
                <span className="order-count-badge">{orders.filter(o => o.status === 'Pending').length}</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('Processing')}
                className={`order-status-tab ${orderStatusFilter === 'Processing' ? 'active' : ''}`}
              >
                <FaCheckCircle />
                Confirmed
                <span className="order-count-badge">{orders.filter(o => o.status === 'Processing').length}</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('Shipped')}
                className={`order-status-tab ${orderStatusFilter === 'Shipped' ? 'active' : ''}`}
              >
                <FaBoxOpen />
                Shipped
                <span className="order-count-badge">{orders.filter(o => o.status === 'Shipped').length}</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('Delivered')}
                className={`order-status-tab ${orderStatusFilter === 'Delivered' ? 'active' : ''}`}
              >
                <FaCheckCircle />
                Completed
                <span className="order-count-badge">{orders.filter(o => o.status === 'Delivered').length}</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('Cancelled')}
                className={`order-status-tab ${orderStatusFilter === 'Cancelled' ? 'active' : ''}`}
              >
                <FaTimesCircle />
                Cancelled
                <span className="order-count-badge">{orders.filter(o => o.status === 'Cancelled').length}</span>
              </button>
            </div>
            
            {loadingOrders ? (
              <div className="orders-loading">
                <h3>Loading orders...</h3>
              </div>
            ) : filteredOrders.length === 0 && orders.length === 0 ? (
              <div className="orders-empty">
                <FaShoppingCart size={64} className="orders-empty-icon" />
                <h3 className="orders-empty-title">No Orders Yet</h3>
                <p className="orders-empty-text">Orders from customers will appear here</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="orders-empty">
                <FaShoppingCart size={64} className="orders-empty-icon" />
                <h3 className="orders-empty-title">No Orders Found</h3>
                <p className="orders-empty-text">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <div className="order-id">
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="order-customer-name">{order.customerName}</div>
                              <div className="order-customer-email">{order.customerEmail}</div>
                            </div>
                          </td>
                          <td className="order-items">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </td>
                          <td className="order-total">
                            Rs. {order.total?.toLocaleString()}
                          </td>
                          <td>
                            <div className="order-payment-method">
                              {order.paymentMethod}
                            </div>
                            <span className={`order-payment-badge ${order.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                              disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                              className={`order-status-select ${order.status.toLowerCase()}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="order-date">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="order-actions">
                              {order.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order._id, 'Processing')}
                                    className="order-action-btn approve"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOrderStatusUpdate(order._id, 'Cancelled')}
                                    className="order-action-btn cancel"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {order.status === 'Processing' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Shipped')}
                                  className="order-action-btn ship"
                                >
                                  Mark as Shipped
                                </button>
                              )}
                              {order.status === 'Shipped' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order._id, 'Delivered')}
                                  className="order-action-btn deliver"
                                >
                                  Mark as Delivered
                                </button>
                              )}
                              {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                                <span className="order-no-actions">
                                  No actions available
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER RETURNS TAB */}
        {activeTab === 'customer-returns' && (
          <div className="returns-section">
            <div className="returns-stats">
              <div className="stat-card">
                <h4>Total Returns</h4>
                <p className="stat-number">{returnStats.totalReturns || 0}</p>
              </div>
              <div className="stat-card pending">
                <h4>Pending</h4>
                <p className="stat-number">{returnStats.pendingReturns || 0}</p>
              </div>
              <div className="stat-card approved">
                <h4>Approved</h4>
                <p className="stat-number">{returnStats.approvedReturns || 0}</p>
              </div>
              <div className="stat-card completed">
                <h4>Completed</h4>
                <p className="stat-number">{returnStats.completedReturns || 0}</p>
              </div>
            </div>

            <div className="returns-filters">
              <select 
                value={returnStatusFilter}
                onChange={(e) => setReturnStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Returns</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {loadingReturns ? (
              <div className="loading-state">Loading returns...</div>
            ) : returns.length === 0 ? (
              <div className="empty-state">
                <FaArchive style={{ fontSize: '64px', color: '#00bcd4', marginBottom: '20px' }} />
                <h3>No Return Requests</h3>
                <p>You don't have any return requests yet.</p>
              </div>
            ) : (
              <div className="returns-list">
                {returns.map((returnItem) => (
                  <div key={returnItem._id} className="return-card">
                    <div className="return-header">
                      <div className="return-info">
                        <h4>Order #{returnItem.orderId?.orderId}</h4>
                        <span className={`return-status ${returnItem.status.toLowerCase()}`}>
                          {returnItem.status}
                        </span>
                      </div>
                      <div className="return-date">
                        {new Date(returnItem.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="return-body">
                      <div className="return-product">
                        {returnItem.product?.images?.[0] && (
                          <img src={returnItem.product.images[0]} alt={returnItem.product.name} />
                        )}
                        <div>
                          <h5>{returnItem.product?.name}</h5>
                          <p className="return-customer">Customer: {returnItem.customer?.fullName}</p>
                        </div>
                      </div>
                      
                      <div className="return-details">
                        <p><strong>Reason:</strong> {returnItem.reason}</p>
                        <p><strong>Description:</strong> {returnItem.description}</p>
                        <p><strong>Refund Amount:</strong> Rs. {returnItem.refundAmount.toLocaleString()}</p>
                      </div>

                      {returnItem.status === 'Pending' && (
                        <div className="return-actions">
                          <button 
                            className="approve-btn"
                            onClick={() => handleReturnResponse(returnItem._id, 'Approved')}
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleReturnResponse(returnItem._id, 'Rejected')}
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </div>
                      )}

                      {returnItem.status === 'Approved' && (
                        <div className="return-actions">
                          <button 
                            className="complete-btn"
                            onClick={() => handleCompleteReturn(returnItem._id)}
                          >
                            <FaCheckCircle /> Mark as Completed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <SellerFinance />
        )}

        {/* INBOX TAB */}
        {activeTab === 'inbox' && (
          <div className="messages-section">
            <div className="messages-container">
              {/* Conversations List */}
              <div className="chat-list">
                <div className="chat-list-header">
                  <h3>Customer Messages</h3>
                </div>
                
                {loadingMessages ? (
                  <div className="loading-chats">
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="no-chats">
                    <FaBell size={48} />
                    <p>No Messages Yet</p>
                    <small>Customer inquiries will appear here</small>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className="chat-item"
                      onClick={() => handleSelectMessage(msg)}
                    >
                      <div className="chat-info">
                        <div className="chat-header-row">
                          <h4>{msg.senderInfo?.fullName || 'Customer'}</h4>
                          <span className="chat-time">
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="chat-last-message">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message View */}
              <div className="chat-window">
                {selectedMessage ? (
                  <>
                    <div className="chat-window-header">
                      <div className="seller-info">
                        <div>
                          <h3 
                            onClick={() => {
                              // Navigate to customer profile if available
                              // For now, just show an alert with customer info
                              alert(`Customer: ${selectedMessage.senderInfo?.fullName || 'Customer'}\nEmail: ${selectedMessage.senderInfo?.email || 'N/A'}`);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {selectedMessage.senderInfo?.fullName || 'Customer'}
                          </h3>
                          <span className="customer-email">{selectedMessage.senderInfo?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat-messages">
                      {conversationMessages.length > 0 ? (
                        conversationMessages.map((msg) => {
                          const user = JSON.parse(localStorage.getItem('user'));
                          const isSeller = msg.senderId === user._id;
                          
                          return (
                            <div key={msg._id} className={`message ${isSeller ? 'buyer' : 'seller'}`}>
                              <div className="message-bubble">
                                <div className="message-sender-name">
                                  {isSeller ? 'You' : (msg.senderInfo?.fullName || 'Customer')}
                                </div>
                                <p>{msg.message}</p>
                                <span className="message-time">
                                  {new Date(msg.createdAt).toLocaleString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="message seller">
                          <div className="message-bubble">
                            <div className="message-sender-name">
                              {selectedMessage.senderInfo?.fullName || 'Customer'}
                            </div>
                            <p>{selectedMessage.message}</p>
                            <span className="message-time">
                              {new Date(selectedMessage.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {selectedMessage.productId && (
                        <div className="message-product-info">
                          <small>Regarding product:</small>
                          <div className="product-mini">
                            {selectedMessage.productId.images?.[0] && (
                              <img src={selectedMessage.productId.images[0]} alt={selectedMessage.productId.name} />
                            )}
                            <span>{selectedMessage.productId.name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="chat-input-container">
                      <input
                        type="text"
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && replyText.trim()) {
                            handleDirectReply();
                          }
                        }}
                      />
                      <button
                        onClick={handleDirectReply}
                        disabled={!replyText.trim()}
                        className="send-btn"
                      >
                        <FiSend />
                      </button>
                      <button
                        onClick={() => window.location.href = `mailto:${selectedMessage.senderInfo?.email}?subject=Re: Your inquiry`}
                        className="reply-email-btn"
                      >
                        Reply via Email
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <FaBell size={64} />
                    <h3>Select a message</h3>
                    <p>Choose a customer message from the list to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div className="products-section">
            <div className="revenue-container">
              <div className="revenue-header">
                <h3 className="revenue-title"></h3>
                <div className="revenue-controls">
                  <div className="date-range-selector">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="calendar-icon">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                    </svg>
                    <select
                      value={revenueDateRange}
                      onChange={(e) => setRevenueDateRange(e.target.value)}
                      className="date-range-select"
                    >
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 90 Days</option>
                      <option value="365">Last Year</option>
                      <option value="all">All Time</option>
                    </select>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="chevron-icon">
                      <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
                    </svg>
                  </div>
                  <button 
                    onClick={handleExportRevenue}
                    className="export-btn"
                    disabled={orders.length === 0}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </button>
                </div>
              </div>

              <div className="revenue-stats-grid">
                <div 
                  className={`revenue-stat-card clickable ${selectedRevenueMetric === 'revenue' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('revenue')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">TOTAL REVENUE</p>
                    <div className={`revenue-growth-badge ${revenueStats.growthRate >= 0 ? 'positive' : 'negative'}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {revenueStats.growthRate >= 0 ? (
                          <polyline points="18 15 12 9 6 15" strokeWidth="2.5"/>
                        ) : (
                          <polyline points="6 9 12 15 18 9" strokeWidth="2.5"/>
                        )}
                      </svg>
                      {Math.abs(revenueStats.growthRate).toFixed(1)}%
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {revenueStats.totalRevenue.toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">
                    {revenueStats.growthRate >= 0 ? '+' : ''}{revenueStats.growthRate.toFixed(1)}% from last period
                  </p>
                </div>

                <div 
                  className={`revenue-stat-card orders-card clickable ${selectedRevenueMetric === 'orders' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('orders')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">TOTAL ORDERS</p>
                    <div className="revenue-stat-icon orders">
                      <FaShoppingCart />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">{revenueStats.totalOrders}</h2>
                  <p className="revenue-stat-subtitle">Completed orders</p>
                </div>

                <div 
                  className={`revenue-stat-card avg-card clickable ${selectedRevenueMetric === 'avg' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('avg')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">AVG. ORDER VALUE</p>
                    <div className="revenue-stat-icon avg">
                      <FaDollarSign />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {Math.round(revenueStats.avgOrderValue).toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">Per transaction</p>
                </div>

                <div 
                  className={`revenue-stat-card fees-card clickable ${selectedRevenueMetric === 'fees' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('fees')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">PLATFORM FEES</p>
                    <div className="revenue-stat-icon fees">
                      <FaChartPie />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {Math.round(revenueStats.platformFees).toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">3% from revenue</p>
                </div>

                <div 
                  className={`revenue-stat-card net-card clickable ${selectedRevenueMetric === 'net' ? 'selected' : ''}`}
                  onClick={() => setSelectedRevenueMetric('net')}
                >
                  <div className="revenue-stat-header">
                    <p className="revenue-stat-label">NET REVENUE</p>
                    <div className="revenue-stat-icon net">
                      <FaCheckCircle />
                    </div>
                  </div>
                  <h2 className="revenue-stat-value">Rs. {Math.round(revenueStats.netRevenue).toLocaleString()}</h2>
                  <p className="revenue-stat-subtitle">After platform fees</p>
                </div>
              </div>

              <div className="revenue-chart-section">
                <div className="revenue-chart-header">
                  <h4 className="revenue-chart-title">
                    {selectedRevenueMetric === 'revenue' && 'Revenue Trend'}
                    {selectedRevenueMetric === 'orders' && 'Orders Trend'}
                    {selectedRevenueMetric === 'avg' && 'Average Order Value Trend'}
                    {selectedRevenueMetric === 'fees' && 'Platform Fees Trend'}
                    {selectedRevenueMetric === 'net' && 'Net Revenue Trend'}
                  </h4>
                  <p className="revenue-chart-subtitle">
                    Click on any card above to view its trend
                  </p>
                </div>
                
                {/* Different chart types based on selected metric */}
                {selectedRevenueMetric === 'revenue' && (
                  <RevenueTrendChart 
                    data={chartData.revenue} 
                    title={`Revenue Trend (Last ${revenueDateRange} Days)`}
                  />
                )}
                
                {selectedRevenueMetric === 'orders' && (
                  <OrdersBarChart 
                    data={chartData.revenue} 
                    title={`Orders Trend (Last ${revenueDateRange} Days)`}
                  />
                )}
                
                {selectedRevenueMetric === 'avg' && (
                  <AvgOrderValueChart 
                    data={chartData.revenue} 
                    title={`Average Order Value Trend (Last ${revenueDateRange} Days)`}
                  />
                )}
                
                {selectedRevenueMetric === 'fees' && (
                  <PlatformFeesChart 
                    data={chartData.revenue} 
                    title={`Platform Fees Breakdown (Last ${revenueDateRange} Days)`}
                  />
                )}
                
                {selectedRevenueMetric === 'net' && (
                  <NetRevenueChart 
                    data={chartData.revenue} 
                    title={`Net Revenue Trend (Last ${revenueDateRange} Days)`}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="products-section">
            <div className="performance-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <div>
                <h3 className="performance-title" style={{margin: 0}}></h3>
              </div>
              <button 
                className="export-btn"
                onClick={handleExportPerformance}
                style={{
                  background: '#00bcd4',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <FaChartBar /> Export Report
              </button>
            </div>
            <div className="performance-container">
              <TopProductsChart data={chartData.topProducts} />
              <CategoryPerformanceChart data={chartData.categories} />
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="products-section">
            <div className="profile-header-row">
              <h3 className="profile-main-title"></h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="profile-edit-btn"
              >
                <FaEdit /> {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-avatar-wrapper">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <div className="profile-status-indicator"></div>
                  
                  {/* Camera Icon Overlay */}
                  {isEditingProfile && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="profile-image-input"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="profile-camera-label"
                        title="Change profile picture"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      </label>
                    </>
                  )}
                </div>
                <div>
                  <h2 className="profile-store-name">
                    {profileData.storeName || 'Store Name'}
                  </h2>
                  <span className="profile-verified-badge">
                    Verified Seller
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                {/* Personal Information */}
                <div className="profile-section">
                  <h3 className="profile-section-title">
                    <FaUser /> Personal Information
                  </h3>
                  <div className="profile-form-grid">
                    <div>
                      <label className="profile-form-label">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        disabled={!isEditingProfile}
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
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        CITY
                      </label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div className="profile-full-width">
                      <label className="profile-form-label">
                        ADDRESS
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        COUNTRY
                      </label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Store Information */}
                <div className="profile-section">
                  <h3 className="profile-section-title">
                    <FaBox /> Store Information
                  </h3>
                  <div className="messages-grid">
                    <div>
                      <label className="profile-form-label">
                        STORE NAME
                      </label>
                      <input
                        type="text"
                        value={profileData.storeName}
                        onChange={(e) => setProfileData({...profileData, storeName: e.target.value})}
                        disabled={!isEditingProfile}
                        className="profile-form-input"
                      />
                    </div>
                    <div>
                      <label className="profile-form-label">
                        STORE DESCRIPTION
                      </label>
                      <textarea
                        value={profileData.storeDescription}
                        onChange={(e) => setProfileData({...profileData, storeDescription: e.target.value})}
                        disabled={!isEditingProfile}
                        rows="4"
                        className="profile-form-textarea"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Statistics */}
                <div>
                  <h3 className="profile-section-title">
                    <FaChartBar /> Account Statistics
                  </h3>
                  <div className="profile-stats-grid">
                    <div className="profile-stat-card blue">
                      <FaBox size={24} className="profile-stat-icon blue" />
                      <p className="profile-stat-label">TOTAL PRODUCTS</p>
                      <h3 className="profile-stat-value">{stats.totalProducts}</h3>
                      <p className="profile-stat-growth">+5%</p>
                    </div>
                    <div className="profile-stat-card green">
                      <FaShoppingCart size={24} className="profile-stat-icon green" />
                      <p className="profile-stat-label">TOTAL ORDERS</p>
                      <h3 className="profile-stat-value">{stats.totalOrders || 0}</h3>
                    </div>
                    <div className="profile-stat-card yellow">
                      <FaChartLine size={24} className="profile-stat-icon yellow" />
                      <p className="profile-stat-label">TOTAL REVENUE</p>
                      <h3 className="profile-stat-value">Rs. {stats.totalRevenue || 0}</h3>
                    </div>
                    <div className="profile-stat-card purple">
                      <FaChartBar size={24} className="profile-stat-icon purple" />
                      <p className="profile-stat-label">GROWTH RATE</p>
                      <h3 className="profile-stat-value">0%</h3>
                    </div>
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="profile-actions">
                    <button
                      type="submit"
                      className="profile-save-btn"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="profile-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* HELP CENTER TAB */}
        {activeTab === 'help' && (
          <HelpCenter sellerId={sellerData?._id} />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="products-section">
            <h3 className="inbox-title"></h3>

            {/* Security Settings */}
            <div className="settings-card">
              <h4 className="settings-section-title">
                <FaCog /> Security Settings
              </h4>

              {/* Change Password */}
              <div className="settings-item">
                <div>
                  <h5 className="settings-item-title">
                    Change Password
                  </h5>
                  <p className="settings-item-description">
                    Update your password to keep your account secure
                  </p>
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="settings-change-btn"
                >
                  Change
                </button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="settings-item">
                <div className="settings-item-content">
                  <h5 className="settings-item-title">
                    Two-Factor Authentication
                  </h5>
                  <p className="settings-item-description">
                    Add an extra layer of security to your account
                  </p>
                  {twoFAEnabled && (
                    <div className="settings-2fa-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span className="settings-2fa-badge-text">
                        On since {twoFAEnabledDate ? twoFAEnabledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
                      </span>
                    </div>
                  )}
                </div>
                {twoFAEnabled ? (
                  <button
                    onClick={handleDisable2FA}
                    className="settings-disable-btn"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={handleEnable2FA}
                    className="settings-enable-btn"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* Login History */}
              <div className="settings-item">
                <div>
                  <h5 className="settings-item-title">
                    Login History
                  </h5>
                  <p className="settings-item-description">
                    View your recent login activity
                  </p>
                </div>
                <button
                  onClick={handleViewLoginHistory}
                  className="settings-view-btn"
                >
                  View
                </button>
              </div>
            </div>

            {/* Account Management */}
            <div className="settings-card">
              <h4 className="settings-section-title">
                <FaUser /> Account Management
              </h4>

              {/* Deactivate Account */}
              <div className="settings-deactivate-item">
                <div>
                  <h5 className="settings-deactivate-title">
                    Deactivate Account
                  </h5>
                  <p className="settings-deactivate-description">
                    Temporarily disable your account. You can reactivate it anytime.
                  </p>
                </div>
                <button
                  onClick={handleDeactivateAccount}
                  className="settings-deactivate-btn"
                >
                  Deactivate
                </button>
              </div>

              {/* Delete Account */}
              <div className="settings-delete-item">
                <div>
                  <h5 className="settings-delete-title">
                    Delete Account
                  </h5>
                  <p className="settings-delete-description">
                    Permanently delete your account and all data. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="settings-delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Edit Product</h3>
            <form onSubmit={handleUpdateProduct}>
              <div className="modal-form-grid">
                <div className="modal-form-group">
                  <label className="modal-form-label">Product Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    required
                    className="modal-form-input"
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">
                    SKU
                    <span className="modal-form-hint">
                      (Read-only)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku || 'Auto-generated'}
                    disabled
                    className="modal-form-input"
                  />
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="modal-form-group">
                  <label className="modal-form-label">Price (Rs.) *</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    required
                    className="modal-form-input"
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">Stock *</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                    required
                    className="modal-form-input"
                  />
                </div>
              </div>

              <div className="modal-form-grid">
                <div className="modal-form-group">
                  <label className="modal-form-label">Condition *</label>
                  <select
                    value={editingProduct.condition}
                    onChange={(e) => setEditingProduct({...editingProduct, condition: e.target.value})}
                    required
                    className="modal-form-select"
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Slightly Used">Slightly Used</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">Category *</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value, subcategory: ''})}
                    required
                    className="modal-form-select"
                  >
                    <option value="">Select Category</option>
                    <option value="Men's Collection">Men's Collection</option>
                    <option value="Women's Collection">Women's Collection</option>
                    <option value="Sportswear">Sportswear</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label className="modal-form-label">Subcategory</label>
                  <select
                    value={editingProduct.subcategory || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, subcategory: e.target.value})}
                    className="modal-form-select"
                    disabled={!editingProduct.category}
                  >
                    <option value="">Select Subcategory</option>
                    {editingProduct.category === "Men's Collection" && (
                      <>
                        <option value="Men's Hoodie">Men's Hoodie</option>
                        <option value="Men's Pants">Men's Pants</option>
                        <option value="Men's Jacket">Men's Jacket</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                    {editingProduct.category === "Women's Collection" && (
                      <>
                        <option value="Women's Skirt">Women's Skirt</option>
                        <option value="Women's Blazer">Women's Blazer</option>
                        <option value="Women's Top">Women's Top</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                    {editingProduct.category === "Sportswear" && (
                      <>
                        <option value="Sports T-Shirts">Sports T-Shirts</option>
                        <option value="Tank Tops">Tank Tops</option>
                        <option value="Jerseys">Jerseys</option>
                        <option value="Tracksuits">Tracksuits</option>
                        <option value="Joggers">Joggers</option>
                        <option value="Track Pants">Track Pants</option>
                        <option value="Sports Shorts">Sports Shorts</option>
                        <option value="Leggings">Leggings</option>
                        <option value="Windbreakers">Windbreakers</option>
                        <option value="Sports Hoodies">Sports Hoodies</option>
                        <option value="Sports Jackets">Sports Jackets</option>
                      </>
                    )}
                    {editingProduct.category === "Vintage" && (
                      <>
                        <option value="Vintage Tops">Vintage Tops</option>
                        <option value="Vintage Bottoms">Vintage Bottoms</option>
                        <option value="Vintage Dresses">Vintage Dresses</option>
                        <option value="Vintage Outerwear">Vintage Outerwear</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-form-full-width">
                <label className="modal-form-label">Description *</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  required
                  rows="4"
                  className="modal-form-textarea"
                />
              </div>

              {/* Bundle Deal Section */}
              <div className="modal-form-full-width" style={{marginTop: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                  <input
                    type="checkbox"
                    id="editBundleDealEnabled"
                    checked={editingProduct.bundleDeal?.enabled || false}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      bundleDeal: {
                        ...editingProduct.bundleDeal,
                        enabled: e.target.checked,
                        buyQuantity: editingProduct.bundleDeal?.buyQuantity || 2,
                        discountPercentage: editingProduct.bundleDeal?.discountPercentage || 10,
                        description: editingProduct.bundleDeal?.description || ''
                      }
                    })}
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <label htmlFor="editBundleDealEnabled" className="modal-form-label" style={{margin: 0, cursor: 'pointer'}}>
                    Enable Bundle Deal
                  </label>
                </div>

                {editingProduct.bundleDeal?.enabled && (
                  <div style={{marginLeft: '28px', padding: '12px', background: '#f8f9fa', borderRadius: '8px'}}>
                    <div className="modal-form-grid">
                      <div className="modal-form-group">
                        <label className="modal-form-label">Buy Quantity *</label>
                        <input
                          type="number"
                          min="2"
                          value={editingProduct.bundleDeal?.buyQuantity || 2}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            bundleDeal: {
                              ...editingProduct.bundleDeal,
                              buyQuantity: parseInt(e.target.value) || 2
                            }
                          })}
                          className="modal-form-input"
                        />
                      </div>
                      <div className="modal-form-group">
                        <label className="modal-form-label">Discount % *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editingProduct.bundleDeal?.discountPercentage || 10}
                          onChange={(e) => setEditingProduct({
                            ...editingProduct,
                            bundleDeal: {
                              ...editingProduct.bundleDeal,
                              discountPercentage: parseInt(e.target.value) || 10
                            }
                          })}
                          className="modal-form-input"
                        />
                      </div>
                    </div>
                    <div className="modal-form-group" style={{marginTop: '12px'}}>
                      <label className="modal-form-label">Bundle Description (Optional)</label>
                      <input
                        type="text"
                        value={editingProduct.bundleDeal?.description || ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          bundleDeal: {
                            ...editingProduct.bundleDeal,
                            description: e.target.value
                          }
                        })}
                        className="modal-form-input"
                        placeholder="e.g., Buy 2 or more and save!"
                      />
                    </div>
                    <p style={{fontSize: '12px', color: '#666', marginTop: '8px', marginBottom: 0}}>
                      Preview: Buy {editingProduct.bundleDeal?.buyQuantity || 2}+ Get {editingProduct.bundleDeal?.discountPercentage || 10}% OFF
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-submit-btn"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
                  className="modal-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {showRestockModal && restockProduct && (
        <div className="modal-overlay">
          <div className="restock-modal-content">
            <div className="restock-modal-header">
              <div className="restock-icon">
                <FaPlus />
              </div>
              <h3 className="restock-modal-title">Restock Product</h3>
            </div>
            
            <div className="restock-product-info">
              <img 
                src={restockProduct.images?.[0] || 'https://via.placeholder.com/80'} 
                alt={restockProduct.name}
                className="restock-product-image"
              />
              <div className="restock-product-details">
                <h4 className="restock-product-name">{restockProduct.name}</h4>
                <p className="restock-product-sku">SKU: {restockProduct.sku || 'N/A'}</p>
                <div className="restock-current-stock">
                  <span className="stock-badge out-of-stock">
                    <FaTimesCircle /> Out of Stock
                  </span>
                  <span className="current-stock-text">Current: {restockProduct.stock} units</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleRestockSubmit}>
              <div className="restock-form-group">
                <label className="restock-form-label">
                  Add Quantity *
                  <span className="restock-form-hint">
                    How many units do you want to add?
                  </span>
                </label>
                <input
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  min="1"
                  required
                  placeholder="Enter quantity to add"
                  autoFocus
                  className="restock-form-input"
                />
                {restockQuantity && parseInt(restockQuantity) > 0 && (
                  <div className="restock-preview">
                    <span className="restock-preview-label">New stock will be:</span>
                    <span className="restock-preview-value">
                      {restockProduct.stock + parseInt(restockQuantity)} units
                    </span>
                  </div>
                )}
              </div>

              <div className="restock-actions">
                <button
                  type="submit"
                  className="restock-submit-btn"
                >
                  <FaCheckCircle /> Confirm Restock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false);
                    setRestockProduct(null);
                    setRestockQuantity('');
                  }}
                  className="restock-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA PASSWORD VERIFICATION MODAL */}
      {show2FAModal && (
        <div className="twofa-modal-overlay">
          <div className="twofa-modal-content">
            <h3 className="twofa-modal-title">
              {twoFAAction === 'enable' ? 'Enable' : 'Disable'} Two-Factor Authentication
            </h3>
            <p className="twofa-modal-description">
              Please enter your password to confirm and {twoFAAction} two-factor authentication for your account.
            </p>

            <div className="twofa-form-group">
              <label className="twofa-form-label">
                Password
              </label>
              <input
                type="password"
                value={twoFAPassword}
                onChange={(e) => setTwoFAPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConfirm2FA()}
                placeholder="Enter your password"
                autoFocus
                className="twofa-form-input"
              />
            </div>

            <div className="twofa-actions">
              <button
                onClick={handleConfirm2FA}
                className={`twofa-confirm-btn ${twoFAAction === 'enable' ? 'enable' : 'disable'}`}
              >
                {twoFAAction === 'enable' ? 'Enable' : 'Disable'} 2FA
              </button>
              <button
                onClick={() => {
                  setShow2FAModal(false);
                  setTwoFAPassword('');
                }}
                className="twofa-cancel-btn"
              >
                Cancel
              </button>
            </div>

            <div className="twofa-note">
              <p className="twofa-note-text">
                <strong>Note:</strong> Two-factor authentication adds an extra layer of security to your account by requiring additional verification when logging in.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2FA SUCCESS MODAL */}
      {show2FASuccess && (
        <div className="twofa-modal-overlay">
          <div className="success-modal-content">
            {/* Success Icon */}
            <div className={`success-icon ${twoFAAction === 'enable' ? 'enable' : 'disable'}`}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 className="success-modal-title">
              Two-Factor Authentication {twoFAAction === 'enable' ? 'Enabled' : 'Disabled'}!
            </h3>
            
            <p className="success-modal-description">
              {twoFAAction === 'enable' 
                ? 'Your account is now protected with an additional layer of security.'
                : 'Two-factor authentication has been removed from your account.'}
            </p>

            <button
              onClick={() => setShow2FASuccess(false)}
              className="success-ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* LOGIN HISTORY MODAL */}
      {showLoginHistoryModal && (
        <div className="twofa-modal-overlay">
          <div className="login-history-modal-content">
            <div className="login-history-header">
              <h3 className="login-history-title">
                Login History
              </h3>
              <button
                onClick={() => setShowLoginHistoryModal(false)}
                className="login-history-close-btn"
              >
                ×
              </button>
            </div>

            {loginHistory.length === 0 ? (
              <div className="login-history-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="login-history-empty-icon">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="login-history-empty-title">No Login History</p>
                <p className="login-history-empty-text">Your login activity will appear here</p>
              </div>
            ) : (
              <div>
                {loginHistory.map((login, index) => (
                  <div key={index} className="login-history-item">
                    <div className="login-history-item-header">
                      <div className="login-history-item-content">
                        <div className="login-history-device">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00bcd4" strokeWidth="2">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                          </svg>
                          <span className="login-history-device-name">
                            {login.userAgent || 'Unknown Device'}
                          </span>
                        </div>
                        <div className="login-history-time">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span className="login-history-time-text">
                            {new Date(login.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {login.ipAddress && (
                          <div className="login-history-ip">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="2" y1="12" x2="22" y2="12"></line>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            <span className="login-history-ip-text">
                              IP: {login.ipAddress}
                            </span>
                          </div>
                        )}
                      </div>
                      {index === 0 && (
                        <span className="login-history-current-badge">
                          CURRENT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLoginHistoryModal(false)}
              className="login-history-close-bottom-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePasswordModal && (
        <div className="twofa-modal-overlay">
          <div className="change-password-modal-content">
            <h3 className="twofa-modal-title">
              Change Password
            </h3>
            <p className="twofa-modal-description">
              Enter your current password and choose a new one
            </p>

            <div className="change-password-form-group">
              <label className="change-password-label">
                Current Password
              </label>
              <input
                type="password"
                value={changePasswordData.currentPassword}
                onChange={(e) => setChangePasswordData({...changePasswordData, currentPassword: e.target.value})}
                placeholder="Enter current password"
                className="change-password-input"
              />
            </div>

            <div className="change-password-form-group">
              <label className="change-password-label">
                New Password
              </label>
              <input
                type="password"
                value={changePasswordData.newPassword}
                onChange={(e) => setChangePasswordData({...changePasswordData, newPassword: e.target.value})}
                placeholder="Enter new password"
                className="change-password-input"
              />
            </div>

            <div className="change-password-form-group">
              <label className="change-password-label">
                Confirm New Password
              </label>
              <input
                type="password"
                value={changePasswordData.confirmPassword}
                onChange={(e) => setChangePasswordData({...changePasswordData, confirmPassword: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleChangePassword()}
                placeholder="Confirm new password"
                className="change-password-input"
              />
            </div>

            <div className="change-password-actions">
              <button
                onClick={handleChangePassword}
                className="change-password-submit-btn"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="change-password-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD CHANGE SUCCESS MODAL */}
      {showPasswordSuccessModal && (
        <div className="twofa-modal-overlay">
          <div className="success-modal-content">
            <div className="success-icon enable">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 className="success-modal-title">
              Password Changed Successfully!
            </h3>
            
            <p className="success-modal-description">
              Your password has been updated. Please use your new password for future logins.
            </p>

            <button
              onClick={() => setShowPasswordSuccessModal(false)}
              className="success-ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
}

export default SellerDashboard;
