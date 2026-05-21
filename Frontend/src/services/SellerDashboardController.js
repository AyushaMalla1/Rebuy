import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBox, FaBell, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { apiFetch } from './api';

export default function SellerDashboardController() {
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
    ordersTrend: [],
    avgOrderValue: [],
    platformFees: [],
    netRevenue: [],
    topProducts: [],
    categories: []
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: [],
    orders: [],
    returns: [],
    verifications: [],
    messages: []
  });
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
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
  const [productStatusFilter, setProductStatusFilter] = useState('All');
  const [productStockFilter, setProductStockFilter] = useState('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Verifications State
  const [verifications, setVerifications] = useState([]);
  const [verificationStats, setVerificationStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loadingVerifications, setLoadingVerifications] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);

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
    fetchVerifications(user._id);
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
      const response = await apiFetch(`/sellers/${sellerId}`);
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
    if (!sellerId) {
      console.error('Seller ID is undefined');
      setLoading(false);
      return;
    }
    try {
      const response = await apiFetch(`/sellers/${sellerId}/products`);
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
    if (!sellerId) {
      console.error('Seller ID is undefined');
      return;
    }
    try {
      const response = await apiFetch(`/sellers/${sellerId}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrders = async (sellerId) => {
    if (!sellerId) {
      console.error('Seller ID is undefined');
      setLoadingOrders(false);
      return;
    }
    setLoadingOrders(true);
    try {
      const response = await apiFetch(`/orders/seller/${sellerId}`);
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
      const response = await apiFetch(`/messages/conversations/${sellerId}`);
      const data = await response.json();

      if (data.success && data.conversations) {
        // Transform conversations to message format for display
        const conversationMessages = data.conversations.map(conv => {
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
            read: (conv.unreadCount || 0) === 0,
            unreadCount: conv.unreadCount || 0,
            productId: conv.productId
          };
        });

        setMessages(conversationMessages);
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
      const response = await apiFetch(`/returns/seller/${sellerId}${statusParam}`);
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
      const response = await apiFetch(`/returns/seller/${sellerId}/stats`);
      const data = await response.json();

      if (data.success) {
        setReturnStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching return stats:', error);
    }
  };

  // Fetch Verifications
  const fetchVerifications = async (sellerId) => {
    setLoadingVerifications(true);
    try {
      const response = await apiFetch(`/sellers/${sellerId}/verifications`);
      const data = await response.json();

      if (data.success) {
        const verifs = data.verifications || [];
        setVerifications(verifs);

        // Calculate stats
        setVerificationStats({
          total: verifs.length,
          pending: verifs.filter(v => v.approvalStatus === 'pending').length,
          approved: verifs.filter(v => v.approvalStatus === 'approved').length,
          rejected: verifs.filter(v => v.approvalStatus === 'rejected').length
        });
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoadingVerifications(false);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await apiFetch(`/messages/conversation/${conversationId}?userId=${user._id}`);
      const data = await response.json();

      if (data.success) {
        const messages = data.messages || [];
        setConversationMessages(messages);
        return messages;
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
    return [];
  };

  const handleSelectMessage = async (msg) => {
    const openedMessage = { ...msg, read: true, unreadCount: 0 };
    setSelectedMessage(openedMessage);
    setMessages(prevMessages => prevMessages.map(message => (
      message.conversationId === msg.conversationId ? openedMessage : message
    )));
    await fetchConversationMessages(msg.conversationId);
  };

  const handleDirectReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await apiFetch(`/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: user._id,
          senderModel: 'Seller',
          receiverId: selectedMessage.senderId,
          receiverModel: selectedMessage.senderModel === 'Customer' ? 'User' : selectedMessage.senderModel,
          productId: selectedMessage.productId?._id || selectedMessage.productId,
          message: replyText
        })
      });

      const data = await response.json();

      if (data.success) {
        setReplyText('');
        setAttachedFile(null); // Clear attachment after sending
        // Refresh conversation messages
        await fetchConversationMessages(selectedMessage.conversationId);
        // Refresh message list
        fetchMessages(user._id);
      } else {
        console.error('Failed to send reply:', data);
        alert(`Failed to send reply: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(`Failed to send reply: ${error.message}`);
    }
  };

  const handleFileAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }
        setAttachedFile(file);
        alert(`File "${file.name}" attached`);
      }
    };
    input.click();
  };

  const handleEmojiClick = (emoji) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👏', '😍', '🤔', '😎', '🥰', '😢'];

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await apiFetch(`/orders/${orderId}/status`, {
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

  const getCurrentSellerId = () => {
    if (sellerData?._id) return sellerData._id;

    try {
      return JSON.parse(localStorage.getItem('user'))?._id || null;
    } catch (error) {
      return null;
    }
  };

  const getSellerOrderAmount = (order) => {
    const sellerId = getCurrentSellerId();

    if (sellerId && Array.isArray(order.items)) {
      const sellerSubtotal = order.items.reduce((sum, item) => {
        const itemSellerId = item.seller?._id || item.seller;
        return itemSellerId?.toString() === sellerId.toString()
          ? sum + Number(item.subtotal || (item.price || 0) * (item.quantity || 0))
          : sum;
      }, 0);

      if (sellerSubtotal > 0) return sellerSubtotal;
    }

    return Number(order.subtotal ?? order.total ?? 0);
  };

  const getSellerOrderItems = (order) => {
    if (!order?.items) return [];

    const sellerId = getCurrentSellerId();
    if (!sellerId) return order.items;

    const sellerItems = order.items.filter(item => {
      const itemSellerId = item.seller?._id || item.seller;
      return itemSellerId?.toString() === sellerId.toString();
    });

    return sellerItems.length > 0 ? sellerItems : order.items;
  };

  const getOrderProductImage = (item) => (
    item.product?.images?.[0] ||
    item.productImage ||
    item.image ||
    'https://via.placeholder.com/72?text=Product'
  );

  const getOrderProductName = (item) => (
    item.product?.name ||
    item.productName ||
    'Product'
  );

  const formatShippingAddress = (address) => {
    if (!address) return 'No shipping address provided';

    return [
      address.fullName,
      address.phone,
      address.address,
      address.city,
      address.municipality,
      address.district,
      address.state,
      address.landmark
    ].filter(Boolean).join(', ') || 'No shipping address provided';
  };

  const getShortOrderId = (order) => (
    order?.orderId || `#${order?._id?.slice(-8).toUpperCase()}`
  );

  const isMessageFromCurrentSeller = (message) => {
    const sellerId = getCurrentSellerId();
    const senderId = message?.senderId?._id || message?.senderId;
    return Boolean(sellerId && senderId?.toString() === sellerId.toString());
  };

  const getSelectedConversationProduct = () => (
    selectedMessage?.productId?.name
      ? selectedMessage.productId
      : conversationMessages.find(message => message.productId?.name)?.productId
  );

  const getReturnImage = (returnItem) => (
    returnItem?.images?.[0] ||
    returnItem?.verificationImages?.[0] ||
    returnItem?.product?.images?.[0] ||
    'https://via.placeholder.com/72?text=Return'
  );

  const getReturnOrderLabel = (returnItem) => (
    returnItem?.orderId?.orderId ||
    returnItem?.orderId?._id ||
    returnItem?.orderId ||
    'N/A'
  );

  const getVerificationImage = (verification) => (
    verification?.verificationImages?.[0] ||
    verification?.productImage ||
    verification?.product?.images?.[0] ||
    'https://via.placeholder.com/72?text=Verify'
  );

  const getVerificationProductName = (verification) => (
    verification?.productName ||
    verification?.product?.name ||
    'Unknown Product'
  );

  const getRevenueRangeLabel = () => (
    revenueDateRange === 'all' ? 'All Time' : `Last ${revenueDateRange} Days`
  );

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

      const grossRevenue = dayOrders.reduce((sum, order) => sum + getSellerOrderAmount(order), 0);
      const orderCount = dayOrders.length;
      const avgOrderValue = orderCount > 0 ? grossRevenue / orderCount : 0;
      const platformFees = grossRevenue * 0.03;
      const netRevenue = grossRevenue - platformFees;

      chartDataPoints.push({
        day: daysToShow <= 30 ? dayName : monthDay,
        revenue: Math.round(grossRevenue),
        orders: orderCount,
        avgOrderValue: Math.round(avgOrderValue),
        platformFees: Math.round(platformFees),
        netRevenue: Math.round(netRevenue)
      });
    }

    // Top products
    const topProducts = [...products]
      .sort((a, b) => Math.max(0, b.sold || 0) - Math.max(0, a.sold || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        sales: Math.max(0, p.sold || 0)
      }));

    // Category performance
    const categoryMap = {};
    products.forEach(p => {
      if (categoryMap[p.category]) {
        categoryMap[p.category] += Math.max(0, p.sold || 0);
      } else {
        categoryMap[p.category] = Math.max(0, p.sold || 0);
      }
    });

    const categories = Object.keys(categoryMap)
      .map(key => ({
        name: key,
        value: categoryMap[key]
      }))
      .filter(category => category.value > 0);

    setChartData({
      revenue: chartDataPoints.length > 0 ? chartDataPoints : [{ day: 'No data', revenue: 0, orders: 0 }],
      ordersTrend: chartDataPoints,
      avgOrderValue: chartDataPoints,
      platformFees: chartDataPoints,
      netRevenue: chartDataPoints,
      topProducts: topProducts.length > 0 ? topProducts : [],
      categories
    });
  };

  useEffect(() => {
    if (products.length > 0 || orders.length > 0) {
      prepareChartData();
    }
    fetchNotifications();
  }, [products, orders, revenueDateRange, sellerData]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) return;

    setLoadingNotifications(true);
    try {
      const response = await apiFetch(`/notifications/${user._id}`);
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
      const response = await apiFetch(`/notifications/${user._id}/read-all`, {
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

  const deleteNotification = async (notificationId, e) => {
    // Stop event propagation to prevent notification click
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

  const getNotificationIcon = (type, severity) => {
    if (type === 'order') return <FaShoppingCart />;
    if (type === 'product') return <FaBox />;
    if (type === 'message') return <FaBell />;
    if (type === 'stock') return <FaExclamationTriangle />;
    if (type === 'system') return <FaInfoCircle />;

    // Fallback to severity
    if (severity === 'error') return <FaExclamationTriangle />;
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
      const response = await apiFetch(`/sellers/${user._id}`, {
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

  // Populate live categorized search results for landing-page style dropdown
  useEffect(() => {
    if (!globalSearch || !globalSearch.trim()) {
      setShowSearchResults(false);
      setSearchResults({ products: [], orders: [], returns: [], verifications: [], messages: [] });
      return;
    }

    const query = globalSearch.toLowerCase().trim();

    // 1. Filter products
    const matchedProducts = products.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );

    // 2. Filter orders
    const matchedOrders = orders.filter(o =>
      o._id?.toLowerCase().includes(query) ||
      o.customerName?.toLowerCase().includes(query) ||
      o.customerEmail?.toLowerCase().includes(query) ||
      (Array.isArray(o.items) && o.items.some(item =>
        item.productName?.toLowerCase().includes(query)
      ))
    );

    // 3. Filter returns
    const matchedReturns = returns.filter(r =>
      r.customerName?.toLowerCase().includes(query) ||
      r.reason?.toLowerCase().includes(query) ||
      (r.product?.name || '').toLowerCase().includes(query)
    );

    // 4. Filter verifications
    const matchedVerifications = verifications.filter(v =>
      getVerificationProductName(v).toLowerCase().includes(query) ||
      (v.customerName || v.customer?.fullName || '').toLowerCase().includes(query) ||
      (v.orderId || '').toLowerCase().includes(query)
    );

    // 5. Filter inbox conversations
    const matchedMessages = messages.filter(m =>
      m.senderInfo?.fullName?.toLowerCase().includes(query) ||
      m.senderInfo?.email?.toLowerCase().includes(query) ||
      (m.productId?.name || '').toLowerCase().includes(query) ||
      m.message?.toLowerCase().includes(query)
    );

    setSearchResults({
      products: matchedProducts.slice(0, 5),
      orders: matchedOrders.slice(0, 5),
      returns: matchedReturns.slice(0, 5),
      verifications: matchedVerifications.slice(0, 5),
      messages: matchedMessages.slice(0, 5)
    });
    setShowSearchResults(true);
  }, [globalSearch, products, orders, returns, verifications, messages]);

  useEffect(() => {
    let filtered = [...products];

    if (productStatusFilter !== 'All') {
      filtered = filtered.filter(product => product.status === productStatusFilter);
    }

    if (productStockFilter === 'Active') {
      filtered = filtered.filter(product => product.stock > 20);
    } else if (productStockFilter === 'Low') {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= 20);
    } else if (productStockFilter === 'Out') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Apply globalSearch filter
    if (globalSearch.trim() !== '') {
      const query = globalSearch.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.subcategory?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [products, productStatusFilter, productStockFilter, globalSearch]);

  const filteredMessages = messages.filter(msg => {
    const query = messageSearchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      msg.senderInfo?.fullName?.toLowerCase().includes(query) ||
      msg.senderInfo?.email?.toLowerCase().includes(query) ||
      msg.message?.toLowerCase().includes(query) ||
      msg.productId?.name?.toLowerCase().includes(query)
    );
  });

  // Filter orders based on search query and status filter
  useEffect(() => {
    let filtered = orders;

    // Apply status filter
    if (orderStatusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === orderStatusFilter);
    }

    // Apply search filter (prioritize local query, fallback to globalSearch)
    const activeSearch = (orderSearchQuery || globalSearch).trim();
    if (activeSearch !== '') {
      const query = activeSearch.toLowerCase();
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query) ||
        (order.orderId && order.orderId.toLowerCase().includes(query)) ||
        (Array.isArray(order.items) && order.items.some(item =>
          item.product?.name?.toLowerCase().includes(query) ||
          item.productName?.toLowerCase().includes(query)
        ))
      );
    }

    setFilteredOrders(filtered);
  }, [orderSearchQuery, globalSearch, orderStatusFilter, orders]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) {
      fetchReturns(user._id);
    }
  }, [returnStatusFilter]);

  // Fetch verifications when verifications tab is active
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id && activeTab === 'verifications') {
      fetchVerifications(user._id);
    }
  }, [activeTab]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));

    try {
      const productData = {
        ...newProduct,
        sellerId: user._id,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      };

      const response = await apiFetch(`/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
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
          subcategory: '',
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
      const response = await apiFetch(`/products/${productId}`, {
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

      console.log('Updating product with data:', {
        name: updateData.name,
        category: updateData.category,
        subcategory: updateData.subcategory
      });

      // Remove discount field if it's empty or invalid
      if (!updateData.discount || !updateData.discount.percentage || !updateData.discount.startDate || !updateData.discount.endDate) {
        delete updateData.discount;
      }

      const response = await apiFetch(`/products/${editingProduct._id}`, {
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

      const response = await apiFetch(`/products/${restockProduct._id}`, {
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
      const response = await apiFetch(`/returns/${returnId}/respond`, {
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
      const response = await apiFetch(`/returns/${returnId}/complete`, {
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
      const response = await apiFetch(`/sellers/${user._id}/deactivate`, {
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
      const response = await apiFetch(`/sellers/${user._id}`, {
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
      const response = await apiFetch(`/sellers/${user._id}/${endpoint}`, {
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
      const response = await apiFetch(`/sellers/${user._id}/login-history`);
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
      const response = await apiFetch(`/sellers/${user._id}/change-password`, {
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
        icon: <FaExclamationTriangle />
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

  const handleThreeDotAction = async (action, product) => {
    setShowThreeDotMenu(null);

    switch (action) {
      case 'duplicate':
        setNewProduct({
          name: `${product.name} Copy`,
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          condition: product.condition || 'New',
          size: product.size || '',
          brand: product.brand || '',
          stock: product.stock || '',
          images: product.images?.length ? product.images : [''],
          story: product.story || '',
          paymentOptions: product.paymentOptions || ['cod', 'online'],
          bundleDeal: product.bundleDeal || {
            enabled: false,
            buyQuantity: 2,
            discountPercentage: 10,
            description: ''
          }
        });
        setShowAddProduct(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'featured':
        alert(`${product.name} is ready for admin review. Featured placement is managed by admins.`);
        break;
      case 'analytics':
        setActiveTab('performance');
        break;
      case 'archive':
        await handleDeleteProduct(product._id);
        break;
      default:
        break;
    }
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

    const totalRevenue = completedOrders.reduce((sum, order) => sum + getSellerOrderAmount(order), 0);
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

    const previousRevenue = previousOrders.reduce((sum, order) => sum + getSellerOrderAmount(order), 0);
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
  }, [orders, revenueDateRange, sellerData]);

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
      const grossAmount = getSellerOrderAmount(order);
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

  // Close search results and notification dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle search dropdown click outside
      if (showSearchResults) {
        const searchContainer = document.querySelector('.global-search-container');
        if (searchContainer && !searchContainer.contains(event.target)) {
          setShowSearchResults(false);
        }
      }

      // Handle notification dropdown click outside
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
  }, [showSearchResults, showNotifications]);



  const sellerDashboardContext = {
    activeTab,
    attachedFile,
    changePasswordData,
    chartData,
    conversationMessages,
    currentPage,
    deleteNotification,
    editingProduct,
    fetchConversationMessages,
    fetchMessages,
    fetchNotifications,
    fetchOrders,
    fetchProducts,
    fetchReturnStats,
    fetchReturns,
    fetchSellerData,
    fetchStats,
    fetchVerifications,
    filteredOrders,
    filteredProducts,
    formatNotificationTime,
    formatShippingAddress,
    getCurrentSellerId,
    getNotificationIcon,
    getOrderProductImage,
    getOrderProductName,
    getReturnImage,
    getReturnOrderLabel,
    getRevenueRangeLabel,
    getSelectedConversationProduct,
    getSellerOrderAmount,
    getSellerOrderItems,
    getShortOrderId,
    getStockStatusBadge,
    getVerificationImage,
    getVerificationProductName,
    globalSearch,
    handleAddProduct,
    handleChangePassword,
    handleCompleteReturn,
    handleConfirm2FA,
    handleDeactivateAccount,
    handleDeleteAccount,
    handleDeleteProduct,
    handleDirectReply,
    handleDisable2FA,
    handleEditProduct,
    handleEmojiClick,
    handleEnable2FA,
    handleExportOrders,
    handleExportPerformance,
    handleExportRevenue,
    handleFileAttachment,
    handleFileUpload,
    handleLogout,
    handleNotificationClick,
    handleOrderStatusUpdate,
    handleProfileImageUpload,
    handleProfileUpdate,
    handleRestockClick,
    handleRestockSubmit,
    handleReturnResponse,
    handleSelectMessage,
    handleThreeDotAction,
    handleUpdateProduct,
    handleViewLoginHistory,
    imageFiles,
    isEditingProfile,
    isMessageFromCurrentSeller,
    loading,
    loadingMessages,
    loadingNotifications,
    loadingOrders,
    loadingReturns,
    loadingVerifications,
    loginHistory,
    markAllAsRead,
    markAsRead,
    messageSearchQuery,
    messages,
    newProduct,
    notifications,
    orderSearchQuery,
    orderStatusFilter,
    orders,
    paginate,
    prepareChartData,
    productStatusFilter,
    productStockFilter,
    products,
    profileData,
    profileImage,
    removeImage,
    replyText,
    restockProduct,
    restockQuantity,
    returnStats,
    returnStatusFilter,
    returns,
    revenueDateRange,
    revenueStats,
    searchResults,
    selectedMessage,
    selectedOrder,
    selectedReturn,
    selectedRevenueMetric,
    selectedVerification,
    sellerData,
    setActiveTab,
    setAttachedFile,
    setChangePasswordData,
    setChartData,
    setConversationMessages,
    setCurrentPage,
    setEditingProduct,
    setFilteredOrders,
    setFilteredProducts,
    setGlobalSearch,
    setImageFiles,
    setIsEditingProfile,
    setLoading,
    setLoadingMessages,
    setLoadingNotifications,
    setLoadingOrders,
    setLoadingReturns,
    setLoadingVerifications,
    setLoginHistory,
    setMessageSearchQuery,
    setMessages,
    setNewProduct,
    setNotifications,
    setOrderSearchQuery,
    setOrderStatusFilter,
    setOrders,
    setProductStatusFilter,
    setProductStockFilter,
    setProducts,
    setProfileData,
    setProfileImage,
    setReplyText,
    setRestockProduct,
    setRestockQuantity,
    setReturnStats,
    setReturnStatusFilter,
    setReturns,
    setRevenueDateRange,
    setRevenueStats,
    setSearchResults,
    setSelectedMessage,
    setSelectedOrder,
    setSelectedReturn,
    setSelectedRevenueMetric,
    setSelectedVerification,
    setSellerData,
    setShow2FAModal,
    setShow2FASuccess,
    setShowAddProduct,
    setShowChangePasswordModal,
    setShowEditModal,
    setShowEmojiPicker,
    setShowLoginHistoryModal,
    setShowNotifications,
    setShowPasswordSuccessModal,
    setShowRestockModal,
    setShowSearchResults,
    setShowThreeDotMenu,
    setStats,
    setTwoFAAction,
    setTwoFAEnabled,
    setTwoFAEnabledDate,
    setTwoFAPassword,
    setUnreadCount,
    setVerificationStats,
    setVerifications,
    show2FAModal,
    show2FASuccess,
    showAddProduct,
    showChangePasswordModal,
    showEditModal,
    showEmojiPicker,
    showLoginHistoryModal,
    showNotifications,
    showPasswordSuccessModal,
    showRestockModal,
    showSearchResults,
    showThreeDotMenu,
    stats,
    twoFAAction,
    twoFAEnabled,
    twoFAEnabledDate,
    twoFAPassword,
    unreadCount,
    verificationStats,
    verifications
  };

  return sellerDashboardContext;
}
