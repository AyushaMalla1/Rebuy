import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiHeart, FiSettings, FiLogOut, FiEdit2, FiSave, FiX, FiHome, FiPackage, FiRefreshCw, FiTruck, FiAward, FiGift, FiMessageSquare, FiSend, FiBell, FiCheckCircle, FiSearch, FiVideo, FiMoreVertical, FiPaperclip, FiSmile, FiShoppingCart, FiMenu, FiRotateCcw, FiClock, FiShield } from 'react-icons/fi';
import './BuyerProfile.css';
import './LandingPage.css'; // Import LandingPage styles for header
import { orderAPI, loyaltyAPI, customerAPI, authAPI, messageAPI, buildApiUrl } from './services/api';
import { getProvinces, getDistrictsByProvince, getMunicipalitiesByDistrict, getAreasByMunicipality } from './data/nepalLocations';

function BuyerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [orderFilter, setOrderFilter] = useState('all'); // all, pending, processing, shipped, delivered
  const [verificationFilter, setVerificationFilter] = useState('to-verify'); // to-verify, verified
  const [returnsFilter, setReturnsFilter] = useState('returns'); // returns, cancellations
  const [loyaltyFilter, setLoyaltyFilter] = useState('points'); // points, rewards
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    profileImage: ''
  });
  const [editData, setEditData] = useState({ ...userData });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [loyaltyData, setLoyaltyData] = useState(null);

  // Wishlist state - load from localStorage
  const [wishlist, setWishlist] = useState([]);

  // Header state
  const [cart, setCart] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Address Book
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    fullName: '',
    phone: '',
    state: '',
    district: '',
    municipality: '',
    city: '',
    landmark: '',
    deliveryType: 'home',
    isDefault: false
  });

  // Chat/Messages
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    matchesDescription: null,
    customerNotes: '',
    images: [],
    rating: 0
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({
    orderId: null,
    productId: null,
    productName: '',
    productImage: '',
    reason: '',
    description: '',
    images: []
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState({
    orderId: null,
    reason: ''
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Fetch conversations from backend
  const fetchConversations = useCallback(async () => {
    if (!userData._id) {
      console.log('No user ID, skipping conversation fetch');
      setLoadingChats(false);
      return;
    }
    
    console.log('Fetching conversations for user:', userData._id);
    
    try {
      setLoadingChats(true);
      
      const response = await messageAPI.getConversations(userData._id);
      
      console.log('Conversations response:', response);
      
      if (response.success) {
        // Transform backend data to match UI format
        const transformedChats = response.conversations.map(conv => {
          console.log('Processing conversation:', {
            name: conv.otherUser.name,
            profileImage: conv.otherUser.profileImage,
            hasImage: !!conv.otherUser.profileImage
          });
          
          const hasProfileImage = conv.otherUser.profileImage && 
                                  conv.otherUser.profileImage.trim() !== '' &&
                                  (conv.otherUser.profileImage.startsWith('http') || 
                                   conv.otherUser.profileImage.startsWith('data:image') ||
                                   conv.otherUser.profileImage.startsWith('/'));
          
          console.log('Has valid profile image:', hasProfileImage);
          
          return {
            id: conv.conversationId,
            conversationId: conv.conversationId,
            sellerName: conv.otherUser.name,
            sellerAvatar: hasProfileImage ? conv.otherUser.profileImage : conv.otherUser.name.substring(0, 2).toUpperCase(),
            sellerId: conv.otherUser._id,
            lastMessage: conv.lastMessage.message,
            time: formatMessageTime(conv.lastMessage.createdAt),
            unread: conv.unreadCount,
            messages: [] // Will be loaded when chat is selected
          };
        });
        
        console.log('Transformed chats:', transformedChats);
        setChats(transformedChats);
      } else {
        console.error('Failed to fetch conversations:', response);
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  }, [userData._id]);

  // Fetch messages for a specific conversation
  const fetchConversationMessages = useCallback(async (conversationId) => {
    if (!userData._id) return;
    
    console.log('Fetching messages for conversation:', conversationId);
    
    try {
      const response = await messageAPI.getConversation(conversationId, userData._id);
      
      console.log('Messages response:', response);
      
      if (response.success) {
        // Transform messages to UI format
        const transformedMessages = response.messages.map(msg => ({
          id: msg._id,
          sender: msg.senderId === userData._id ? 'buyer' : 'seller',
          text: msg.message,
          time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          createdAt: msg.createdAt, // Preserve createdAt for date divider
          read: msg.read
        }));
        
        console.log('Transformed messages:', transformedMessages);
        
        // Update the selected chat with messages
        setSelectedChat(prev => ({
          ...prev,
          messages: transformedMessages
        }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [userData._id]);

  // Format message time
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Format date divider for messages
  const formatDateDivider = (messages) => {
    if (!messages || messages.length === 0) return 'Today';
    
    // Get the most recent message date
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || !latestMessage.createdAt) return 'Today';
    
    const messageDate = new Date(latestMessage.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;
    
    // Get user ID from localStorage as fallback
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = userData?._id || user?._id || user?.id;
    
    if (!userId) {
      showToast('Please log in to send messages', 'error');
      navigate('/login');
      return;
    }

    // Validate sellerId exists
    if (!selectedChat.sellerId) {
      console.error('No sellerId in selectedChat:', selectedChat);
      showToast('Cannot send message: Seller information missing', 'error');
      return;
    }
    
    try {
      const messageData = {
        senderId: userId,
        senderModel: 'User', // Changed from 'Customer' to 'User' to match the Message model enum
        receiverId: selectedChat.sellerId,
        receiverModel: 'Seller',
        message: messageText
      };

      console.log('Sending message with data:', messageData);
      
      const response = await messageAPI.send(messageData);
      
      if (response.success) {
        // Add message to UI immediately
        const newMessage = {
          id: response.data._id,
          sender: 'buyer',
          text: messageText,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(), // Add createdAt for date divider
          read: false
        };
        
        setSelectedChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMessage]
        }));
        
        setMessageText('');
        setAttachedFile(null); // Clear attachment after sending
        
        // Refresh conversations to update last message
        fetchConversations();
        
        showToast('Message sent successfully', 'success');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response || error.message);
      showToast('Failed to send message', 'error');
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
          showToast('File size must be less than 5MB', 'error');
          return;
        }
        setAttachedFile(file);
        showToast(`File "${file.name}" attached`, 'success');
      }
    };
    input.click();
  };

  const handleEmojiClick = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👏', '😍', '🤔', '😎', '🥰', '😢'];

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Notification functions
  const fetchNotifications = async () => {
    const userData = sessionStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    
    try {
      const response = await fetch(buildApiUrl(`/notifications/${user._id}`));
      const data = await response.json();
      
      if (response.ok && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setUnreadNotifications(data.unreadCount || 0); // For header badge
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    const userData = sessionStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    
    try {
      const response = await fetch(buildApiUrl(`/notifications/${user._id}/read-all`), {
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
      const response = await fetch(buildApiUrl(`/notifications/${notificationId}/read`), {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    try {
      const response = await fetch(buildApiUrl(`/notifications/${notificationId}`), {
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

  const getNotificationIcon = (type) => {
    if (type === 'order') return <FiShoppingBag />;
    if (type === 'message') return <FiMessageSquare />;
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

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setShowNotifications(false);
    
    if (notification.type === 'order') {
      setActiveTab('orders');
    } else if (notification.type === 'message') {
      setActiveTab('messages');
    }
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = () => {
    if (!showNotificationDropdown && userData._id) {
      fetchNotifications();
    }
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowProfileDropdown(false);
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    const userDataLocal = sessionStorage.getItem('user');
    if (!userDataLocal) return;

    const user = JSON.parse(userDataLocal);
    
    try {
      const response = await fetch(buildApiUrl(`/notifications/${user._id}/mark-all-read`), {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadNotifications(0);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await authAPI.changePassword(user._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showToast('Password changed successfully! A confirmation email has been sent.', 'success');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      showToast(error.message || 'Failed to change password', 'error');
    }
  };

  const handleRedeemPoints = () => {
    const points = loyaltyData ? loyaltyData.totalPoints : 1250;
    const amount = parseInt(redeemAmount);
    
    if (!redeemAmount || isNaN(amount)) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    
    if (amount <= 0 || amount > points) {
      showToast(`Please enter a value between 1 and ${points}`, 'error');
      return;
    }
    
    showToast(`Successfully redeemed ${amount} points! You received Rs. ${amount / 10} discount.`, 'success');
    setShowRedeemModal(false);
    setRedeemAmount('');
  };

  const handleEnable2FA = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        showToast('Please login to enable 2FA', 'error');
        return;
      }
      
      // Toggle 2FA
      const response = await customerAPI.update2FA(user._id, !twoFactorEnabled);
      
      if (response.success) {
        setTwoFactorEnabled(!twoFactorEnabled);
        showToast(response.message, 'success');
      }
    } catch (error) {
      console.error('Error updating 2FA:', error);
      showToast(error.message || 'Failed to update 2FA settings', 'error');
    }
  };

  const handleViewLoginActivity = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user && user._id) {
        const response = await customerAPI.getLoginHistory(user._id);
        if (response.success) {
          // Store login history in state (we'll need to add this state)
          setLoginHistory(response.loginHistory);
        }
      }
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
    setShowLoginActivityModal(true);
  };

  const handleManagePaymentMethods = () => {
    setShowPaymentMethodsModal(true);
  };

  const handleViewTransactionHistory = () => {
    setShowTransactionModal(true);
  };

  const handleDownloadData = () => {
    if (window.confirm('Download Your Account Data?\n\nThis will include:\n• Profile information\n• Order history\n• Transaction records\n• Wishlist items\n• Messages\n\nYou will receive an email with a download link within 24 hours.')) {
      showToast('Data download request submitted! Check your email within 24 hours.', 'success');
    }
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateModal(true);
  };

  const confirmDeactivateAccount = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        showToast('Please login to deactivate account', 'error');
        return;
      }
      
      const response = await customerAPI.deactivateAccount(user._id);
      
      if (response.success) {
        showToast(response.message, 'success');
        setShowDeactivateModal(false);
        
        // Logout user after deactivation
        setTimeout(() => {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
      showToast(error.message || 'Failed to deactivate account', 'error');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeleteConfirmPassword('');
  };

  const confirmDeleteAccount = async () => {
    if (!deleteConfirmPassword.trim()) {
      showToast('Please enter your password to confirm deletion', 'error');
      return;
    }
    
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        showToast('Please login to delete account', 'error');
        return;
      }
      
      const response = await customerAPI.deleteAccount(user._id, deleteConfirmPassword);
      
      if (response.success) {
        showToast(response.message, 'warning');
        setShowDeleteModal(false);
        setDeleteConfirmPassword('');
        
        // Logout user after deletion
        setTimeout(() => {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast(error.message || 'Failed to delete account. Please check your password.', 'error');
    }
  };

  useEffect(() => {
    // Check if we should open a specific tab from navigation state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    
    // Check if we should open a specific conversation
    if (location.state?.openConversation) {
      const convInfo = location.state.openConversation;
      // Set the selected chat to open the conversation
      setSelectedChat({
        id: convInfo.conversationId,
        conversationId: convInfo.conversationId,
        sellerId: convInfo.sellerId,
        sellerName: convInfo.sellerName,
        sellerAvatar: convInfo.sellerAvatar || convInfo.sellerName.substring(0, 2).toUpperCase(),
        messages: [],
        unread: 0
      });
    }
    
    const user = JSON.parse(sessionStorage.getItem('user'));
    
    if (user) {
      // Redirect sellers to seller dashboard
      if (user.userType === 'seller') {
        navigate('/seller/dashboard');
        return;
      }
      
      const userId = user._id || user.id;
      
      const data = {
        _id: userId,
        fullName: user.fullName || 'John Doe',
        email: user.email || 'john.doe@example.com',
        phone: user.phone || '+977 9812345678',
        address: user.address || 'Kathmandu, Nepal',
        city: user.city || 'Kathmandu'
      };
      setUserData(data);
      setEditData(data);
      
      // Fetch customer profile, orders and loyalty data
      if (userId) {
        fetchCustomerProfile(userId);
        fetchOrders(userId);
        fetchReturns(userId);
        fetchLoyaltyData(userId);
        fetchNotifications();
        fetchCart(userId);
        fetch2FAStatus(userId);
      }
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
    
    // Load wishlist from localStorage favorites
    loadWishlist();
    
    // Check URL params for tab
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location, navigate]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        const notificationWrapper = document.querySelector('.notification-wrapper');
        if (notificationWrapper && !notificationWrapper.contains(event.target)) {
          setShowNotifications(false);
        }
      }
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
      if (showNotificationDropdown && !event.target.closest('.notification-dropdown-container')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileDropdown, showNotificationDropdown]);

  // Fetch conversations when messages tab is active
  useEffect(() => {
    if (activeTab === 'messages') {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const userId = userData._id || user?._id || user?.id;
      
      if (userId) {
        if (!userData._id && userId) {
          setUserData(prev => ({ ...prev, _id: userId }));
        }
        fetchConversations();
      }
    }
  }, [activeTab, userData._id, fetchConversations]);

  // Reload wishlist when wishlist tab is active
  useEffect(() => {
    if (activeTab === 'wishlist') {
      loadWishlist();
    }
  }, [activeTab]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat && selectedChat.conversationId) {
      fetchConversationMessages(selectedChat.conversationId);
    }
  }, [selectedChat?.conversationId, fetchConversationMessages]);

  const fetchCustomerProfile = async (userId) => {
    try {
      const profile = await customerAPI.get(userId);
      
      if (profile) {
        // Update user data with profile info
        setUserData(prev => ({
          ...prev,
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone || '',
          profileImage: profile.profileImage || ''
        }));
        setEditData(prev => ({
          ...prev,
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone || '',
          profileImage: profile.profileImage || ''
        }));
        setProfileImagePreview(profile.profileImage || '');
        
        // Load addresses
        if (profile.addresses && profile.addresses.length > 0) {
          const formattedAddresses = profile.addresses.map(addr => ({
            _id: addr._id,
            id: addr._id,
            name: addr.label || addr.deliveryType,
            fullName: addr.fullName,
            phone: addr.phone,
            address: `${addr.landmark}, ${addr.city}, ${addr.municipality}`,
            city: addr.city,
            state: addr.state,
            district: addr.district,
            municipality: addr.municipality,
            landmark: addr.landmark,
            deliveryType: addr.deliveryType,
            isDefault: addr.isDefault,
            label: addr.label
          }));
          setAddresses(formattedAddresses);
        }
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      // If profile doesn't exist, that's okay - it will be created on first save
    }
  };

  const loadWishlist = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const token = sessionStorage.getItem('token');
      
      if (!user || !token) {
        setWishlist([]);
        return;
      }
      
      // Fetch wishlist from backend
      const response = await fetch(buildApiUrl(`/wishlist/${user._id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Format wishlist items - backend returns { success, wishlist: { items: [...] } }
        const wishlistItems = data.wishlist?.items || [];
        
        const formattedWishlist = wishlistItems
          .filter(item => {
            const hasProduct = item.product && typeof item.product === 'object';
            if (!hasProduct) {
              console.warn('Skipping item without product:', item);
            }
            return hasProduct;
          })
          .map(item => {
            return {
              id: item.product._id,
              name: item.product.name || 'Unknown Product',
              price: item.product.price || 0,
              image: (item.product.images && item.product.images[0]) || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
              seller: item.product.seller,
              sellerName: item.product.sellerName || 'Unknown Seller',
              storeName: item.product.storeName || 'Store',
              stock: item.product.stock || 0,
              status: item.product.status
            };
          });
        
        setWishlist(formattedWishlist);
      } else {
        const errorData = await response.json();
        console.error('Wishlist fetch failed:', errorData);
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
    }
  };

  const fetchOrders = async (customerId) => {
    try {
      const fetchedOrders = await orderAPI.getCustomerOrders(customerId);
      const mappedOrders = (fetchedOrders || []).map(order => ({
        ...order,
        conditionVerified: order.conditionVerification?.adminApproved === true,
        verificationPending: order.conditionVerification?.verified === true && !order.conditionVerification?.adminApproved,
        verifiedDate: order.conditionVerification?.approvedAt ? new Date(order.conditionVerification.approvedAt).toLocaleDateString() : (order.conditionVerification?.verifiedAt ? new Date(order.conditionVerification.verifiedAt).toLocaleDateString() : null)
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchReturns = async (customerId) => {
    setLoadingReturns(true);
    try {
      const response = await fetch(buildApiUrl(`/returns/customer/${customerId}`));
      const data = await response.json();
      
      if (data.success) {
        setReturns(data.returns || []);
      } else {
        setReturns([]);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      setReturns([]);
    } finally {
      setLoadingReturns(false);
    }
  };

  // Calculate order counts by status
  const getOrderCounts = () => {
    return {
      pending: orders.filter(o => o.paymentStatus === 'Pending').length, // Orders with pending payment (COD not yet delivered)
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length
    };
  };

  const fetchLoyaltyData = async (customerId) => {
    try {
      const data = await loyaltyAPI.get(customerId);
      setLoyaltyData(data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const fetch2FAStatus = async (userId) => {
    try {
      const response = await customerAPI.get2FAStatus(userId);
      if (response && response.success) {
        setTwoFactorEnabled(response.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      // Set default to false if fetch fails
      setTwoFactorEnabled(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setShowProfileDropdown(false);
    navigate('/');
  };

  // Fetch cart for header
  const fetchCart = async (userId) => {
    try {
      const response = await fetch(buildApiUrl(`/cart/${userId}`));
      const data = await response.json();
      
      if (response.ok && data.items) {
        setCart(data.items);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Handle profile dropdown menu clicks
  const handleProfileMenuClick = (action) => {
    setShowProfileDropdown(false);
    
    switch(action) {
      case 'settings':
        setActiveTab('settings');
        break;
      case 'orders':
        setActiveTab('orders');
        break;
      case 'wishlist':
        setActiveTab('wishlist');
        break;
      case 'verification':
        setActiveTab('verification');
        break;
      case 'returns':
        setActiveTab('returns');
        break;
      case 'messages':
        setActiveTab('messages');
        break;
      case 'loyalty':
        setActiveTab('loyalty');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
    setProfileImagePreview(userData.profileImage || '');
    setProfileImage(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    try {
      setUploadingImage(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      if (!user || !user._id) {
        showToast('Please login to upload profile image', 'error');
        return;
      }
      
      // Validate user ID format (MongoDB ObjectId is 24 hex characters)
      if (typeof user._id !== 'string' || user._id.length !== 24) {
        console.error('Invalid user ID format:', user._id);
        showToast('Invalid user ID. Please log out and log in again.', 'error');
        return;
      }
      
      const result = await customerAPI.uploadProfileImage(user._id, profileImage);
      
      // Update state
      setUserData(prev => ({ ...prev, profileImage: result.profileImage }));
      setEditData(prev => ({ ...prev, profileImage: result.profileImage }));
      setProfileImagePreview(result.profileImage);
      setProfileImage(null);
      
      // Update localStorage so the image persists across page refreshes
      const updatedUser = { ...user, profileImage: result.profileImage };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('userUpdated'));
      
      showToast('Profile image updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      if (!user || !user._id) {
        showToast('Please login to delete profile image', 'error');
        return;
      }
      
      await customerAPI.deleteProfileImage(user._id);
      
      setUserData(prev => ({ ...prev, profileImage: '' }));
      setEditData(prev => ({ ...prev, profileImage: '' }));
      setProfileImagePreview('');
      setProfileImage(null);
      
      // Update localStorage
      const updatedUser = { ...user, profileImage: '' };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('userUpdated'));
      
      showToast('Profile image deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast(error.message || 'Failed to delete image', 'error');
    }
  };


  const handleSave = async () => {
    
    // Validate required fields
    if (!editData.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }
    
    if (!editData.email.trim()) {
      showToast('Email is required', 'error');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    if (!editData.phone.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }
    
    // Validate phone number format - more lenient
    const cleanPhone = editData.phone.replace(/[\s-+]/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid phone number (at least 10 digits)', 'error');
      return;
    }
    
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      // Update customer profile in backend
      const response = await customerAPI.update(user._id, {
        fullName: editData.fullName,
        email: editData.email,
        phone: editData.phone
      });
      
      setUserData({ ...editData });
      const updatedUser = { ...user, fullName: editData.fullName, email: editData.email, phone: editData.phone };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.response?.data);
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle cascading selections
    if (name === 'state') {
      // Reset dependent fields when state changes
      setNewAddress(prev => ({
        ...prev,
        state: value,
        district: '',
        municipality: '',
        city: ''
      }));
    } else if (name === 'district') {
      // Reset dependent fields when district changes
      setNewAddress(prev => ({
        ...prev,
        district: value,
        municipality: '',
        city: ''
      }));
    } else if (name === 'municipality') {
      // Reset city when municipality changes
      setNewAddress(prev => ({
        ...prev,
        municipality: value,
        city: ''
      }));
    } else {
      setNewAddress(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
    setEditingAddress(null);
    setNewAddress({
      label: '',
      fullName: userData.fullName || '',
      phone: userData.phone || '',
      state: '',
      district: '',
      municipality: '',
      city: '',
      landmark: '',
      deliveryType: 'home',
      isDefault: false
    });
  };

  const handleEditAddress = (address) => {
    setShowAddressForm(true);
    setEditingAddress(address._id);
    setNewAddress({
      label: address.label || '',
      fullName: address.fullName,
      phone: address.phone,
      state: address.state || '',
      district: address.district || '',
      municipality: address.municipality || '',
      city: address.city,
      landmark: address.landmark || '',
      deliveryType: address.deliveryType || 'home',
      isDefault: address.isDefault
    });
  };

  const handleSaveAddress = async () => {
    
    // Validate required fields
    if (!newAddress.fullName.trim()) {
      showToast('Full name is required', 'error');
      return;
    }
    
    if (!newAddress.phone.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }
    
    // Validate phone number format - more lenient
    const cleanPhone = newAddress.phone.replace(/[\s-+]/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid phone number (at least 10 digits)', 'error');
      return;
    }
    
    if (!newAddress.state.trim()) {
      showToast('State/Province is required', 'error');
      return;
    }
    
    if (!newAddress.district.trim()) {
      showToast('District is required', 'error');
      return;
    }
    
    if (!newAddress.municipality.trim()) {
      showToast('Municipality is required', 'error');
      return;
    }
    
    if (!newAddress.city.trim()) {
      showToast('City/Area is required', 'error');
      return;
    }
    
    if (!newAddress.landmark.trim()) {
      showToast('Nearest landmark is required', 'error');
      return;
    }
    
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      if (editingAddress) {
        // Update existing address
        await customerAPI.updateAddress(user._id, editingAddress, newAddress);
        showToast('Address updated successfully!', 'success');
      } else {
        // Add new address
        await customerAPI.addAddress(user._id, newAddress);
        showToast('Address added successfully!', 'success');
      }
      
      // Refresh addresses
      await fetchCustomerProfile(user._id);
      setShowAddressForm(false);
      setEditingAddress(null);
      
      // Reset form
      setNewAddress({
        label: '',
        fullName: '',
        phone: '',
        state: '',
        district: '',
        municipality: '',
        city: '',
        landmark: '',
        deliveryType: 'home',
        isDefault: false
      });
    } catch (error) {
      console.error('Error saving address:', error);
      showToast(error.message || 'Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const response = await customerAPI.deleteAddress(user._id, id);
        
        // Refresh addresses
        await fetchCustomerProfile(user._id);
        showToast('Address deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting address:', error);
        console.error('Error details:', error.response?.data);
        showToast('Failed to delete address', 'error');
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await customerAPI.setDefaultAddress(user._id, id);
      
      // Refresh addresses
      await fetchCustomerProfile(user._id);
      showToast('Default address updated', 'success');
    } catch (error) {
      console.error('Error setting default address:', error);
      showToast('Failed to set default address', 'error');
    }
  };

  const filteredChats = chats.filter(chat => {
    const query = chatSearchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      chat.sellerName?.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    );
  });

  const handleAddToCartFromWishlist = async (item) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      // Add to cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
          seller: item.seller,
          sellerName: item.sellerName,
          storeName: item.storeName
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      showToast('Item added to cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart', 'error');
    }
  };

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const token = sessionStorage.getItem('token');
      
      if (!user || !token) {
        showToast('Please login to manage wishlist', 'error');
        return;
      }
      
      // Remove from backend - using DELETE method with URL params
      const response = await fetch(buildApiUrl(`/wishlist/${user._id}/remove/${itemId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Reload wishlist from backend
        await loadWishlist();
        showToast('Item removed from wishlist', 'success');
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove item from wishlist', 'error');
    }
  };

  const formatOrderDate = (order) => {
    const raw = order?.date || order?.createdAt || order?.placedAt || order?.orderDate;
    if (!raw) return 'N/A';
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return String(raw);
    return parsed.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    if (!status) return 'processing';
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'delivered';
      case 'shipped':
      case 'in transit':
        return 'shipped';
      case 'processing':
      case 'confirmed':
        return 'processing';
      case 'pending':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      case 'returned':
        return 'cancelled';
      default:
        return 'processing';
    }
  };

  const handleVerifyCondition = async (orderId) => {
    const order = orders.find(o => o._id === orderId || o.id === orderId);
    setSelectedOrder(order);
    setShowVerificationModal(true);
  };

  const submitVerification = async () => {
    if (verificationData.matchesDescription === null) {
      showToast('Please select if the item matches the description', 'error');
      return;
    }
    
    // REQUIRED: Star rating must be provided
    if (!verificationData.rating || verificationData.rating === 0) {
      showToast('Please provide a star rating', 'error');
      return;
    }
    
    // Note and images are optional per user request
    
    try {
      // Convert boolean to string format expected by backend
      const matchesDescriptionValue = verificationData.matchesDescription ? 'yes' : 'no';
      
      // Convert images to base64 for upload
      const imagePromises = verificationData.images.map(img => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(img.file);
        });
      });
      
      const imageBase64Array = await Promise.all(imagePromises);
      
      const response = await orderAPI.verifyCondition(selectedOrder._id || selectedOrder.id, {
        matchesDescription: matchesDescriptionValue,
        customerNotes: verificationData.customerNotes || '',
        images: imageBase64Array,
        rating: verificationData.rating
      });
      
      if (verificationData.matchesDescription) {
        showToast('Thank you! You earned 50 bonus loyalty points!', 'success');
      } else {
        showToast('Thank you for your feedback. Our team will review this.', 'success');
      }
      
      setShowVerificationModal(false);
      setVerificationData({ matchesDescription: null, customerNotes: '', images: [], rating: 0 });
      
      // Refresh orders
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user._id) {
        fetchOrders(user._id);
        fetchLoyaltyData(user._id);
      }
    } catch (error) {
      console.error('Error verifying condition:', error);
      showToast(error.message || 'Failed to submit verification', 'error');
    }
  };

  const handleVerificationImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      showToast('Please select only image files', 'error');
      return;
    }
    
    // Limit to 5 images
    if (verificationData.images.length + validFiles.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }
    
    // Create preview URLs
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setVerificationData({
      ...verificationData,
      images: [...verificationData.images, ...newImages]
    });
  };

  const handleRemoveVerificationImage = (index) => {
    const newImages = [...verificationData.images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setVerificationData({
      ...verificationData,
      images: newImages
    });
  };

  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o._id === orderId || o.id === orderId);
    
    // Check if order can be cancelled
    if (!order) {
      showToast('Order not found', 'error');
      return;
    }
    
    const status = order.status.toLowerCase();
    if (status === 'shipped' || status === 'delivered' || status === 'in transit') {
      showToast('Cannot cancel order - already shipped or delivered', 'error');
      return;
    }
    
    if (status === 'cancelled') {
      showToast('Order is already cancelled', 'error');
      return;
    }
    
    // Show cancel modal
    setCancelData({ orderId, reason: '' });
    setShowCancelModal(true);
  };

  const submitCancelOrder = async () => {
    if (!cancelData.reason.trim()) {
      showToast('Please select a cancellation reason', 'error');
      return;
    }
    
    try {
      await orderAPI.cancel(cancelData.orderId);
      showToast('Order cancelled successfully. Refund will be processed within 3-5 business days.', 'success');
      setShowCancelModal(false);
      setCancelData({ orderId: null, reason: '' });
      
      // Refresh orders
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user._id) {
        fetchOrders(user._id);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('Failed to cancel order', 'error');
    }
  };

  const submitReturnRequest = async () => {
    if (!returnData.reason.trim()) {
      showToast('Please select a return reason', 'error');
      return;
    }
    
    if (!returnData.description.trim()) {
      showToast('Please provide a detailed description', 'error');
      return;
    }
    
    try {
      // In a real app, this would call the backend API
      // await orderAPI.requestReturn(returnData.orderId, returnData);
      
      showToast('Return request submitted successfully! The seller will review your request within 24 hours.', 'success');
      setShowReturnModal(false);
      setReturnData({ orderId: null, reason: '', description: '', images: [] });
      
      // Refresh orders
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user._id) {
        fetchOrders(user._id);
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      showToast('Failed to submit return request', 'error');
    }
  };

  return (
    <div className="buyer-profile-page">
      {/* Reuse Landing Page Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Rebuy" />
        </div>

        <div className="header-right">
          <div className="header-icons">
            {/* Notification Dropdown */}
            <div className="notification-dropdown-container">
              <div 
                className="notification-icon-wrapper" 
                onClick={toggleNotificationDropdown}
              >
                <FiBell />
                {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
              </div>

              {/* Notification Dropdown */}
              {showNotificationDropdown && (
                <div className="notification-dropdown-menu">
                  <div className="notification-dropdown-header">
                    <h3>Notifications</h3>
                    {unreadNotifications > 0 && (
                      <button onClick={markAllNotificationsAsRead} className="mark-all-read-btn">
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="notification-dropdown-body">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">
                        <FiBell size={40} />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification._id);
                            }
                            setShowNotificationDropdown(false);
                            if (notification.type === 'order') {
                              setActiveTab('orders');
                            } else if (notification.type === 'message') {
                              setActiveTab('messages');
                            }
                          }}
                        >
                          <div className="notification-icon">
                            {notification.type === 'order' && <FiPackage />}
                            {notification.type === 'message' && <FiMessageSquare />}
                            {notification.type === 'announcement' && <FiBell />}
                            {!['order', 'message', 'announcement'].includes(notification.type) && <FiBell />}
                          </div>
                          <div className="notification-content">
                            <p className="notification-title">{notification.title}</p>
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {!notification.read && <div className="notification-unread-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <div className="cart-icon-wrapper" onClick={() => navigate('/cart')}>
              <FiShoppingCart />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-dropdown-container">
              <div 
                className="profile-icon-wrapper" 
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotificationDropdown(false);
                }}
              >
                {userData.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt={userData.fullName}
                    className="header-profile-image"
                  />
                ) : (
                  <FiUser />
                )}
              </div>

              {showProfileDropdown && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-item" onClick={() => handleProfileMenuClick('settings')}>
                    <FiSettings />
                    <span>Manage My Account</span>
                  </div>
                  <div className="profile-dropdown-item" onClick={() => handleProfileMenuClick('orders')}>
                    <FiPackage />
                    <span>My Orders</span>
                  </div>
                  <div className="profile-dropdown-item" onClick={() => handleProfileMenuClick('wishlist')}>
                    <FiHeart />
                    <span>My Wishlist</span>
                  </div>
                  <div className="profile-dropdown-item" onClick={() => handleProfileMenuClick('verification')}>
                    <FiCheckCircle />
                    <span>Condition Verification</span>
                  </div>
                  <div className="profile-dropdown-item" onClick={() => handleProfileMenuClick('returns')}>
                    <FiRotateCcw />
                    <span>My Returns & Cancellations</span>
                  </div>
                  <div className="profile-dropdown-item" onClick={() => handleProfileMenuClick('messages')}>
                    <FiMessageSquare />
                    <span>Messages</span>
                  </div>
                  <div className="profile-dropdown-item" onClick={() => handleProfileMenuClick('loyalty')}>
                    <FiGift />
                    <span>Loyalty Points & Rewards</span>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <div className="profile-dropdown-item logout-item" onClick={() => handleProfileMenuClick('logout')}>
                    <FiLogOut />
                    <span>Log out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="profile-sidebar">
        <nav className="sidebar-menu">
          <div className="menu-items">
            <button 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => setActiveTab('settings')}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiSettings /> Manage My Account
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => setActiveTab('orders')}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiPackage /> My Orders
            </button>
            <button 
              className={activeTab === 'wishlist' ? 'active' : ''} 
              onClick={() => setActiveTab('wishlist')}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiHeart /> My Wishlist
            </button>
            <button 
              type="button"
              className={activeTab === 'verification' ? 'active' : ''} 
              onClick={() => setActiveTab('verification')}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiCheckCircle /> Condition Verification
            </button>
            <button 
              className={activeTab === 'returns' ? 'active' : ''} 
              onClick={() => setActiveTab('returns')}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiRotateCcw /> My Returns & Cancellations
            </button>
            <button 
              className={activeTab === 'messages' ? 'active' : ''} 
              onClick={() => setActiveTab('messages')}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiMessageSquare /> Messages
            </button>
            <button 
              className={activeTab === 'loyalty' ? 'active' : ''} 
              onClick={() => setActiveTab('loyalty')}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiGift /> Loyalty Points & Rewards
            </button>
          </div>
          <div className="menu-footer">
            <button onClick={handleLogout} className="logout-menu-btn" style={{cursor: 'pointer', color: '#f44336'}}>
              <FiLogOut /> Log out
            </button>
          </div>
        </nav>
      </aside>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
          <div className="orders-section">

            {/* Order Status Tabs with Counts */}
            <div className="order-status-tabs">
              <div 
                key="status-all"
                className={`status-tab ${orderFilter === 'all' ? 'active' : ''}`}
                onClick={() => setOrderFilter('all')}
              >
                <div className="status-tab-icon shopping">
                  <FiShoppingBag />
                </div>
                <div className="status-tab-info">
                  <span className="status-tab-label">Items Ordered</span>
                  <span className="status-tab-count">({orders.length})</span>
                </div>
              </div>

              <div 
                key="status-processing"
                className={`status-tab ${orderFilter === 'processing' ? 'active' : ''}`}
                onClick={() => setOrderFilter('processing')}
              >
                <div className="status-tab-icon confirmed">
                  <FiCheckCircle />
                </div>
                <div className="status-tab-info">
                  <span className="status-tab-label">Items Confirmed</span>
                  <span className="status-tab-count">({getOrderCounts().processing})</span>
                </div>
              </div>

              <div 
                key="status-shipped"
                className={`status-tab ${orderFilter === 'shipped' ? 'active' : ''}`}
                onClick={() => setOrderFilter('shipped')}
              >
                <div className="status-tab-icon dispatched">
                  <FiTruck />
                </div>
                <div className="status-tab-info">
                  <span className="status-tab-label">Items Dispatched</span>
                  <span className="status-tab-count">({getOrderCounts().shipped})</span>
                </div>
              </div>

              <div 
                key="status-delivered"
                className={`status-tab ${orderFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setOrderFilter('delivered')}
              >
                <div className="status-tab-icon completed">
                  <FiPackage />
                </div>
                <div className="status-tab-info">
                  <span className="status-tab-label">Completed Items</span>
                  <span className="status-tab-count">({getOrderCounts().delivered})</span>
                </div>
              </div>

              <div 
                key="status-returned"
                className={`status-tab ${orderFilter === 'returned' ? 'active' : ''}`}
                onClick={() => setOrderFilter('returned')}
              >
                <div className="status-tab-icon returned">
                  <FiRotateCcw />
                </div>
                <div className="status-tab-info">
                  <span className="status-tab-label">Returned Items</span>
                  <span className="status-tab-count">({orders.filter(o => o.status === 'Returned').length})</span>
                </div>
              </div>

              <div 
                key="status-cancelled"
                className={`status-tab ${orderFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setOrderFilter('cancelled')}
              >
                <div className="status-tab-icon cancelled">
                  <FiX />
                </div>
                <div className="status-tab-info">
                  <span className="status-tab-label">Cancelled Items</span>
                  <span className="status-tab-count">({orders.filter(o => o.status === 'Cancelled').length})</span>
                </div>
              </div>
            </div>

            <div className="orders-grid">
              {orders
                .filter(order => {
                  if (orderFilter === 'all') return true;
                  const status = order.status.toLowerCase();
                  if (orderFilter === 'pending') return order.paymentStatus === 'Pending';
                  if (orderFilter === 'processing') return status === 'processing' || status === 'confirmed';
                  if (orderFilter === 'shipped') return status === 'shipped' || status === 'in transit';
                  if (orderFilter === 'delivered') return status === 'delivered' || status === 'completed';
                  if (orderFilter === 'returned') return status === 'returned';
                  if (orderFilter === 'cancelled') return status === 'cancelled';
                  return true;
                })
                .map(order => (
                <div key={order.id} className="order-card-compact">
                  <div className="order-header-compact">
                    <div className="order-id-date">
                      <h3>Order ID : {order.orderId || order.id || order._id}</h3>
                      <span className="order-date-compact">Order Placed On : {formatOrderDate(order)}</span>
                    </div>
                    <button 
                      className="view-details-link"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      View Details ›
                    </button>
                  </div>

                  <div className="order-products-list">
                    {(Array.isArray(order.items) ? order.items : Array.isArray(order.products) ? order.products : []).map((item, idx) => (
                      <div key={item._id || item.productId || `item-${order._id}-${idx}`} className="order-product-item">
                        <img 
                          src={item.image || item.productImage || 'https://via.placeholder.com/80'} 
                          alt={item.name || item.productName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80';
                          }}
                        />
                        <div className="product-item-details">
                          <h4>{item.name || item.productName}</h4>
                          <p className="product-quantity">Quantity : {item.quantity || 1}</p>
                          <p className="product-price">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                        </div>
                        <div className="product-item-actions">
                          <span className={`status-badge-compact ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                          {(order.status === 'Delivered' || order.status === 'delivered' || order.status === 'Completed') && (
                            <button 
                              className="return-btn-compact"
                              onClick={() => {
                                // Get the product ID - it could be an object with _id or just the ID string
                                const productId = item.product?._id || item.product || item.productId;
                                
                                setReturnData({
                                  orderId: order._id || order.id,
                                  productId: productId,
                                  productName: item.name || item.productName,
                                  productImage: item.image || item.productImage,
                                  reason: '',
                                  description: '',
                                  images: []
                                });
                                setShowReturnModal(true);
                              }}
                            >
                              <FiRefreshCw /> Return
                            </button>
                          )}
                          {(order.status === 'Pending' || order.status === 'pending' || order.status === 'Processing' || order.status === 'processing' || order.status === 'Confirmed') && idx === 0 && (
                            <button 
                              className="cancel-btn-compact"
                              onClick={() => handleCancelOrder(order._id || order.id)}
                            >
                              <FiX /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {orders.filter(order => {
              if (orderFilter === 'all') return true;
              const status = order.status.toLowerCase();
              if (orderFilter === 'pending') return order.paymentStatus === 'Pending'; // Filter by payment status for "To Pay"
              if (orderFilter === 'processing') return status === 'processing' || status === 'confirmed';
              if (orderFilter === 'shipped') return status === 'shipped' || status === 'in transit';
              if (orderFilter === 'delivered') return status === 'delivered' || status === 'completed';
              return true;
            }).length === 0 && (
              <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
                <FiShoppingBag size={64} style={{marginBottom: '20px', opacity: 0.3}} />
                <h3 style={{fontSize: '20px', marginBottom: '10px', color: '#666'}}>No orders found</h3>
                <p>You don't have any orders in this category</p>
              </div>
            )}

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
              <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
                <div className="modal-content-compact" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header-compact">
                    <div>
                      <h2>ITEM DETAILS</h2>
                      <p style={{fontSize: '13px', color: '#666', margin: '4px 0 0 0'}}>Order ID: {selectedOrder.id || selectedOrder._id}</p>
                    </div>
                    <button className="close-modal" onClick={() => setShowOrderDetails(false)}>
                      <FiX />
                    </button>
                  </div>
                  
                  <div className="modal-body-compact">
                    {/* Product Items */}
                    <div className="modal-products-list">
                      {(Array.isArray(selectedOrder.items) ? selectedOrder.items : Array.isArray(selectedOrder.products) ? selectedOrder.products : []).map((item, index) => (
                        <div key={item._id || item.productId || `modal-item-${selectedOrder._id}-${index}`} className="modal-product-item">
                          <img 
                            src={item.image || item.productImage || 'https://via.placeholder.com/80'} 
                            alt={item.name || item.productName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/80';
                            }}
                          />
                          <div className="modal-product-info">
                            <h4>{item.name || item.productName}</h4>
                            <p>Quantity : {item.quantity || 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Two Column Layout */}
                    <div className="modal-details-grid">
                      {/* Shipping Address */}
                      <div className="modal-section">
                        <h3>Shipping Address</h3>
                        <div className="address-details">
                          <p><FiUser style={{marginRight: '8px'}} />{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                          <p><FiMapPin style={{marginRight: '8px'}} />
                            {selectedOrder.shippingAddress?.municipality || ''}, {selectedOrder.shippingAddress?.district || ''} - {selectedOrder.shippingAddress?.landmark || ''}, {selectedOrder.shippingAddress?.state || ''}
                          </p>
                          <p><FiPhone style={{marginRight: '8px'}} />{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Bill Summary */}
                      <div className="modal-section">
                        <h3>Bill Summary</h3>
                        <div className="bill-details">
                          <div className="bill-row">
                            <span>Subtotal</span>
                            <span>Rs. {(selectedOrder.total - (selectedOrder.shippingCost || 0)).toLocaleString()}</span>
                          </div>
                          <div className="bill-row">
                            <span>Shipping Charge</span>
                            <span>Rs. {selectedOrder.shippingCost || 0}</span>
                          </div>
                          <div className="bill-row total-row">
                            <span>Total</span>
                            <span className="total-amount">Rs. {selectedOrder.total.toLocaleString()}</span>
                          </div>
                          <div className="payment-method">
                            {selectedOrder.paymentMethod === 'cod' 
                              ? selectedOrder.paymentStatus === 'Paid' 
                                ? 'Paid By Cash on Delivery (COD)' 
                                : 'To Pay By Cash on Delivery (COD)'
                              : selectedOrder.paymentMethod === 'esewa'
                                ? 'Paid By eSewa'
                                : selectedOrder.paymentMethod === 'khalti'
                                  ? 'Paid By Khalti'
                                  : `Paid By ${selectedOrder.paymentMethod}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Tracking Timeline */}
                    <div className="modal-section tracking-section">
                      <h3>Order Tracking</h3>
                      <div className="tracking-timeline">
                        <div className={`tracking-step ${['Processing', 'Confirmed', 'Shipped', 'Delivered'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                          <div className="tracking-dot"></div>
                          <div className="tracking-content">
                            <h4>Order Placed</h4>
                            <p>{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className={`tracking-step ${['Confirmed', 'Shipped', 'Delivered'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'Processing' ? 'active' : ''}`}>
                          <div className="tracking-dot"></div>
                          <div className="tracking-content">
                            <h4>Processing</h4>
                            <p>{selectedOrder.confirmedAt ? new Date(selectedOrder.confirmedAt).toLocaleString() : selectedOrder.status === 'Processing' ? 'In Progress' : 'Pending'}</p>
                          </div>
                        </div>
                        
                        <div className={`tracking-step ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'completed' : selectedOrder.status === 'Confirmed' ? 'active' : ''}`}>
                          <div className="tracking-dot"></div>
                          <div className="tracking-content">
                            <h4>Shipped</h4>
                            <p>{selectedOrder.shippedAt ? new Date(selectedOrder.shippedAt).toLocaleString() : selectedOrder.status === 'Shipped' ? 'In Transit' : 'Pending'}</p>
                            {selectedOrder.trackingNumber && (
                              <p className="tracking-number">Tracking: {selectedOrder.trackingNumber}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className={`tracking-step ${selectedOrder.status === 'Delivered' ? 'completed' : selectedOrder.status === 'Shipped' ? 'active' : ''}`}>
                          <div className="tracking-dot"></div>
                          <div className="tracking-content">
                            <h4>Delivered</h4>
                            <p>{selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleString() : selectedOrder.estimatedDelivery ? `Est: ${new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}` : 'Pending'}</p>
                          </div>
                        </div>

                        {selectedOrder.status === 'Cancelled' && (
                          <div className="tracking-step cancelled">
                            <div className="tracking-dot"></div>
                            <div className="tracking-content">
                              <h4>Order Cancelled</h4>
                              <p>{selectedOrder.cancelledAt ? new Date(selectedOrder.cancelledAt).toLocaleString() : 'N/A'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Returns Tab */}
        {activeTab === 'returns' && (
          <div className="returns-section">

            {/* Returns Filter Tabs */}
            <div className="returns-filter-tabs">
              <button 
                className={returnsFilter === 'returns' ? 'active' : ''}
                onClick={() => setReturnsFilter('returns')}
              >
                Returns ({returns.filter(r => r.type !== 'cancellation').length})
              </button>
              <button 
                className={returnsFilter === 'cancellations' ? 'active' : ''}
                onClick={() => setReturnsFilter('cancellations')}
              >
                Cancellations ({orders.filter(o => o.status === 'Cancelled').length})
              </button>
            </div>

            {loadingReturns ? (
              <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
                <p>Loading...</p>
              </div>
            ) : returnsFilter === 'returns' ? (
              returns.filter(r => r.type !== 'cancellation').length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
                  <FiRefreshCw size={64} style={{marginBottom: '20px', opacity: 0.3}} />
                  <h3 style={{fontSize: '20px', marginBottom: '10px', color: '#666'}}>No return requests</h3>
                  <p>You haven't requested any returns yet</p>
                </div>
              ) : (
                <div className="returns-list">
                  {returns.filter(r => r.type !== 'cancellation').map((returnItem) => (
                    <div key={returnItem._id} className="return-item-card">
                      {/* Product Info with Image */}
                      <div className="return-item-main">
                        <img 
                          src={returnItem.product?.images?.[0] || 'https://via.placeholder.com/100'} 
                          alt={returnItem.product?.name}
                          className="return-item-image"
                        />
                        <div className="return-item-details">
                          <h3 className="return-item-name">{returnItem.product?.name}</h3>
                          <div className="return-item-meta">
                            <span className="return-item-order">Order #{returnItem.orderId?.orderId || 'N/A'}</span>
                            <span className="return-item-dot">•</span>
                            <span className="return-item-date">{new Date(returnItem.requestedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="return-item-reason">
                            <strong>Reason:</strong> {returnItem.reason}
                          </div>
                        </div>
                        <div className="return-item-status-section">
                          <span className={`return-status-badge status-${returnItem.status.toLowerCase()}`}>
                            {returnItem.status}
                          </span>
                          <div className="return-item-amount">Rs. {returnItem.refundAmount.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Seller Response */}
                      {returnItem.sellerResponse && (
                        <div className="return-seller-response">
                          <div className="response-header">
                            <FiMessageSquare size={16} />
                            <span>Seller's Response</span>
                          </div>
                          <p className="response-text">{returnItem.sellerResponse}</p>
                        </div>
                      )}

                      {/* Status Messages */}
                      {returnItem.status === 'Approved' && (
                        <div className="return-status-message approved">
                          <FiCheckCircle size={16} />
                          <span>Return approved! Please ship the item back to receive your refund.</span>
                        </div>
                      )}

                      {returnItem.status === 'Refunded' && (
                        <div className="return-status-message refunded">
                          <FiCheckCircle size={16} />
                          <span>Refund of Rs. {returnItem.refundAmount.toLocaleString()} has been processed to your account.</span>
                        </div>
                      )}

                      {returnItem.status === 'Rejected' && (
                        <div className="return-status-message rejected">
                          <FiX size={16} />
                          <span>Return request was not approved.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Cancellations Tab
              orders.filter(o => o.status === 'Cancelled').length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
                  <FiX size={64} style={{marginBottom: '20px', opacity: 0.3}} />
                  <h3 style={{fontSize: '20px', marginBottom: '10px', color: '#666'}}>No cancelled orders</h3>
                  <p>You haven't cancelled any orders</p>
                </div>
              ) : (
                <div className="returns-list">
                  {orders.filter(o => o.status === 'Cancelled').map((order) => (
                    <div key={order.id} className="return-item-card">
                      <div className="return-item-main">
                        <div className="return-item-details" style={{flex: 1}}>
                          <h3 className="return-item-name">Order #{order.id}</h3>
                          <div className="return-item-meta">
                            <span className="return-item-date">Cancelled on: {order.cancelledDate || order.date}</span>
                          </div>
                          <div className="return-item-reason">
                            <strong>Items:</strong> {(order.items || order.products || []).length} product(s)
                          </div>
                        </div>
                        <div className="return-item-status-section">
                          <span className="return-status-badge status-cancelled">
                            Cancelled
                          </span>
                          <div className="return-item-amount">Rs. {order.total.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="return-status-message refunded">
                        <FiCheckCircle size={16} />
                        <span>Refund will be processed within 3-5 business days</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-section">

            {wishlist.length === 0 ? (
              <div className="empty-wishlist-table">
                <FiHeart size={64} style={{marginBottom: '20px', opacity: 0.3}} />
                <h3 style={{fontSize: '20px', marginBottom: '10px', color: '#666'}}>Your wishlist is empty</h3>
                <p style={{marginBottom: '20px'}}>Add items you love to your wishlist</p>
                <button 
                  onClick={() => navigate('/')}
                  style={{
                    padding: '12px 28px',
                    background: '#00bcd4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="wishlist-table-container">
                <table className="wishlist-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlist.map(item => (
                      <tr key={item.id}>
                        <td className="product-name-cell">
                          <div className="product-info-row">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="wishlist-product-image"
                              onClick={() => navigate(`/product/${item.id}`)}
                            />
                            <span 
                              className="product-name-text"
                              onClick={() => navigate(`/product/${item.id}`)}
                            >
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="stock-status-cell">
                          <span className={`stock-badge ${item.stock > 0 ? 'available' : 'unavailable'}`}>
                            {item.stock > 0 ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="remove-wishlist-btn"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Condition Verification Tab */}
        {activeTab === 'verification' && (
          <div className="verification-section">

            {/* Verification Filter Tabs */}
            <div className="verification-filter-tabs">
              <button 
                className={verificationFilter === 'to-verify' ? 'active' : ''}
                onClick={() => setVerificationFilter('to-verify')}
              >
                To Be Verified ({orders.filter(o => (o.status.toLowerCase() === 'delivered' || o.status.toLowerCase() === 'completed') && !o.conditionVerified).length})
              </button>
              <button 
                className={verificationFilter === 'verified' ? 'active' : ''}
                onClick={() => setVerificationFilter('verified')}
              >
                Verified History ({orders.filter(o => o.conditionVerified).length})
              </button>
            </div>

            <div className="orders-grid">
              {orders
                .filter(order => {
                  const status = order.status.toLowerCase();
                  const isDelivered = (status === 'delivered' || status === 'completed');
                  
                  if (verificationFilter === 'to-verify') {
                    return isDelivered && !order.conditionVerified;
                  } else {
                    return order.conditionVerified;
                  }
                })
                .map(order => (
                <div key={order._id || order.id} className="order-card-compact">
                  <div className="order-header-compact">
                    <div className="order-id-date">
                      <h3>Order ID : {order.orderId || order.id || order._id}</h3>
                      <span className="order-date-compact">
                        {order.conditionVerified ? 'Verified On : ' : 'Delivered On : '}
                        {order.verifiedDate || order.deliveredDate || order.date}
                      </span>
                    </div>
                  </div>

                  <div className="order-products-list">
                    {(Array.isArray(order.items) ? order.items : Array.isArray(order.products) ? order.products : []).map((item, idx) => (
                      <div key={item._id || item.productId || `cancelled-item-${order._id}-${idx}`} className="order-product-item">
                        <img 
                          src={item.image || item.productImage || 'https://via.placeholder.com/80'} 
                          alt={item.name || item.productName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80';
                          }}
                        />
                        <div className="product-item-details">
                          <h4>{item.name || item.productName}</h4>
                          <p className="product-quantity">Quantity : {item.quantity || 1}</p>
                          <p className="product-price">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                        </div>
                        {idx === 0 && (
                          <div className="product-item-actions">
                            <span className={`status-badge-compact ${getStatusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="verification-actions">
                    {order.conditionVerified ? (
                      <div className="verified-badge-large">
                        <FiCheckCircle /> VERIFIED
                      </div>
                    ) : order.verificationPending ? (
                      <div className="verified-badge-large" style={{ background: '#fff3cd', color: '#856404', borderColor: '#ffeeba' }}>
                        <FiClock /> PENDING APPROVAL
                      </div>
                    ) : (
                      <button 
                        type="button"
                        className="verify-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleVerifyCondition(order._id || order.id);
                        }}
                        style={{cursor: 'pointer', pointerEvents: 'auto'}}
                      >
                        <FiCheckCircle /> VERIFY CONDITION
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {orders.filter(order => {
              const status = order.status.toLowerCase();
              const isDelivered = (status === 'delivered' || status === 'completed');
              
              if (verificationFilter === 'to-verify') {
                return isDelivered && !order.conditionVerified;
              } else {
                return order.conditionVerified;
              }
            }).length === 0 && (
              <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
                <FiCheckCircle size={64} style={{marginBottom: '20px', opacity: 0.3}} />
                <h3 style={{fontSize: '20px', marginBottom: '10px', color: '#666'}}>
                  {verificationFilter === 'to-verify' ? 'No orders to verify' : 'No verified orders'}
                </h3>
                <p>
                  {verificationFilter === 'to-verify' 
                    ? "You don't have any delivered orders to verify yet." 
                    : "You haven't verified any orders yet."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-section">

            <div className="messages-wrapper">
              {/* Sidebar - Conversations List */}
              <div className="messages-sidebar">
                <div className="messages-sidebar-header">
                  <h2>Messages</h2>
                  <div className="messages-search">
                    <FiSearch />
                    <input
                      type="text"
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                    />
                  </div>
                </div>

                <div className="conversations-list">
                  {loadingChats ? (
                    <div className="conversations-loading">
                      <div className="spinner"></div>
                      <p>Loading conversations...</p>
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="conversations-empty">
                      <FiMessageSquare size={48} />
                      <h3>No messages yet</h3>
                      <p>Start a conversation with a seller from any product page</p>
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className="conversations-empty">
                      <FiSearch size={44} />
                      <h3>No conversations found</h3>
                      <p>Try another seller name or message</p>
                    </div>
                  ) : (
                    filteredChats.map(chat => (
                      <div 
                        key={chat.id} 
                        className={`conversation-item ${selectedChat?.id === chat.id ? 'active' : ''} ${chat.unread > 0 ? 'unread' : ''}`}
                        onClick={() => {
                          setSelectedChat({
                            ...chat,
                            messages: chat.messages || []
                          });
                        }}
                      >
                        <div 
                          className="conversation-avatar"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/seller/${chat.sellerId}`);
                          }}
                          style={{ cursor: 'pointer' }}
                          title="View seller profile"
                        >
                          {chat.sellerAvatar && (chat.sellerAvatar.startsWith('http') || chat.sellerAvatar.startsWith('data:image') || chat.sellerAvatar.startsWith('/')) ? (
                            <img src={chat.sellerAvatar} alt={chat.sellerName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            chat.sellerAvatar
                          )}
                        </div>
                        <div className="conversation-content">
                          <div className="conversation-header">
                            <h4>{chat.sellerName}</h4>
                            <span className="conversation-time">{chat.time}</span>
                          </div>
                          <div className="conversation-preview">
                            <p>{chat.lastMessage}</p>
                            {chat.unread > 0 && (
                              <span className="conversation-unread">{chat.unread}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="messages-main">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="messages-chat-header">
                      <div className="chat-header-info">
                        <div 
                          className="chat-header-avatar"
                          onClick={() => navigate(`/seller/${selectedChat.sellerId}`)}
                          style={{ cursor: 'pointer' }}
                          title="View seller profile"
                        >
                          {selectedChat.sellerAvatar && (selectedChat.sellerAvatar.startsWith('http') || selectedChat.sellerAvatar.startsWith('data:image') || selectedChat.sellerAvatar.startsWith('/')) ? (
                            <img src={selectedChat.sellerAvatar} alt={selectedChat.sellerName} />
                          ) : (
                            selectedChat.sellerAvatar
                          )}
                        </div>
                        <div className="chat-header-details">
                          <h3 
                            onClick={() => navigate(`/seller/${selectedChat.sellerId}`)}
                            style={{ cursor: 'pointer' }}
                            title="View seller profile"
                          >
                            {selectedChat.sellerName}
                          </h3>
                          <span className="chat-header-status">
                            <span className="status-dot"></span>
                            Active now
                          </span>
                        </div>
                      </div>
                      <div className="chat-header-actions">
                        <button className="chat-action-btn" title="More options">
                          <FiMoreVertical />
                        </button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="messages-chat-body">
                      <div className="messages-date-divider">
                        <span>{formatDateDivider(selectedChat.messages)}</span>
                      </div>
                      {selectedChat.messages && selectedChat.messages.length > 0 ? (
                        selectedChat.messages.map((msg, index) => (
                          <div key={msg.id || `msg-${index}`} className={`message-row ${msg.sender === 'buyer' ? 'message-sent' : 'message-received'}`}>
                            {msg.sender === 'seller' && (
                              <div className="message-avatar-small">
                                {selectedChat.sellerAvatar && (selectedChat.sellerAvatar.startsWith('http') || selectedChat.sellerAvatar.startsWith('data:image') || selectedChat.sellerAvatar.startsWith('/')) ? (
                                  <img src={selectedChat.sellerAvatar} alt={selectedChat.sellerName} />
                                ) : (
                                  selectedChat.sellerAvatar
                                )}
                              </div>
                            )}
                            <div className="message-bubble">
                              <p>{msg.text}</p>
                              <span className="message-timestamp">{msg.time}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="messages-empty-state">
                          <FiMessageSquare size={48} />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="messages-chat-footer">
                      <button className="chat-footer-btn" title="Attach file" onClick={handleFileAttachment}>
                        <FiPaperclip />
                      </button>
                      <div className="emoji-picker-container">
                        <button 
                          className="chat-footer-btn" 
                          title="Add emoji"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <FiSmile />
                        </button>
                        {showEmojiPicker && (
                          <div className="emoji-picker-popup">
                            {commonEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                className="emoji-btn"
                                onClick={() => handleEmojiClick(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="message-input-wrapper">
                        {attachedFile && (
                          <div className="attached-file-indicator">
                            <FiPaperclip size={12} />
                            <span>{attachedFile.name}</span>
                            <button onClick={() => setAttachedFile(null)}>×</button>
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && messageText.trim()) {
                              handleSendMessage();
                            }
                          }}
                        />
                      </div>
                      <button 
                        className={`message-send-btn ${messageText.trim() ? 'active' : ''}`}
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <FiSend />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="messages-no-selection">
                    <div className="no-selection-content">
                      <FiMessageSquare size={80} />
                      <h2>Your Messages</h2>
                      <p>Select a conversation from the list to start chatting with sellers</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Points & Rewards Tab */}
        {activeTab === 'loyalty' && (
          <div className="loyalty-section">
            
            {/* Loyalty Filter Tabs */}
            <div className="loyalty-filter-tabs">
              <button 
                className={loyaltyFilter === 'points' ? 'active' : ''}
                onClick={() => setLoyaltyFilter('points')}
              >
                Loyalty Points
              </button>
              <button 
                className={loyaltyFilter === 'rewards' ? 'active' : ''}
                onClick={() => setLoyaltyFilter('rewards')}
              >
                Rewards
              </button>
            </div>

            {/* Loyalty Points Tab */}
            {loyaltyFilter === 'points' && (
              <>
                {/* Points Display Card */}
                <div className="loyalty-points-card">
                  <div className="points-display-large">
                    <div className="points-circle-large">
                      <FiGift className="points-icon-large" />
                      <span className="points-number-large">{loyaltyData ? loyaltyData.totalPoints : 0}</span>
                      <span className="points-label-large">Available Points</span>
                    </div>
                    <button 
                      className="redeem-btn-large"
                      onClick={() => setShowRedeemModal(true)}
                      disabled={!loyaltyData || loyaltyData.totalPoints === 0}
                    >
                      <FiGift /> Redeem Points
                    </button>
                  </div>
                </div>

                {/* Points History */}
                <div className="points-history-section">
                  <h3>Points History</h3>
                  {loyaltyData && loyaltyData.pointsHistory && loyaltyData.pointsHistory.length > 0 ? (
                    <div className="points-history-list">
                      {loyaltyData.pointsHistory.slice().reverse().map((transaction, index) => (
                        <div key={transaction._id || `transaction-${index}`} className="points-history-item">
                          <div className={`points-history-icon ${transaction.type === 'earned' ? 'earned' : 'redeemed'}`}>
                            {transaction.type === 'earned' ? <FiShoppingBag /> : <FiGift />}
                          </div>
                          <div className="points-history-details">
                            <h4>{transaction.reason || (transaction.type === 'earned' ? 'Points Earned' : 'Points Redeemed')}</h4>
                            <p>{new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
                          <div className={`points-history-amount ${transaction.type === 'earned' ? 'earned' : 'redeemed'}`}>
                            {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
                      <FiGift size={64} style={{marginBottom: '20px', opacity: 0.3}} />
                      <h3 style={{fontSize: '20px', marginBottom: '10px', color: '#666'}}>No transactions yet</h3>
                      <p>Start shopping to earn loyalty points!</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Rewards Tab */}
            {loyaltyFilter === 'rewards' && (
              <div className="rewards-section">
                <div className="rewards-info-card">
                  <div className="rewards-info-content">
                    <FiAward className="rewards-info-icon" />
                    <h3>Redeem Your Points for Rewards</h3>
                    <p>Use your loyalty points to get discounts on your next purchase</p>
                  </div>
                </div>

                <div className="rewards-grid">
                  {/* Reward Option 1 */}
                  <div className="reward-card">
                    <div className="reward-icon-wrapper">
                      <FiGift className="reward-icon" />
                    </div>
                    <h4>Rs. 100 Off</h4>
                    <p className="reward-points">500 Points</p>
                    <p className="reward-description">Get Rs. 100 discount on orders above Rs. 1000</p>
                    <button 
                      className="redeem-reward-btn"
                      onClick={() => {
                        if (loyaltyData && loyaltyData.totalPoints >= 500) {
                          setRedeemAmount('500');
                          setShowRedeemModal(true);
                        } else {
                          showToast('Insufficient points', 'error');
                        }
                      }}
                      disabled={!loyaltyData || loyaltyData.totalPoints < 500}
                    >
                      {loyaltyData && loyaltyData.totalPoints >= 500 ? 'Redeem' : 'Not Enough Points'}
                    </button>
                  </div>

                  {/* Reward Option 2 */}
                  <div className="reward-card">
                    <div className="reward-icon-wrapper">
                      <FiGift className="reward-icon" />
                    </div>
                    <h4>Rs. 250 Off</h4>
                    <p className="reward-points">1000 Points</p>
                    <p className="reward-description">Get Rs. 250 discount on orders above Rs. 2000</p>
                    <button 
                      className="redeem-reward-btn"
                      onClick={() => {
                        if (loyaltyData && loyaltyData.totalPoints >= 1000) {
                          setRedeemAmount('1000');
                          setShowRedeemModal(true);
                        } else {
                          showToast('Insufficient points', 'error');
                        }
                      }}
                      disabled={!loyaltyData || loyaltyData.totalPoints < 1000}
                    >
                      {loyaltyData && loyaltyData.totalPoints >= 1000 ? 'Redeem' : 'Not Enough Points'}
                    </button>
                  </div>

                  {/* Reward Option 3 */}
                  <div className="reward-card">
                    <div className="reward-icon-wrapper">
                      <FiGift className="reward-icon" />
                    </div>
                    <h4>Rs. 500 Off</h4>
                    <p className="reward-points">2000 Points</p>
                    <p className="reward-description">Get Rs. 500 discount on orders above Rs. 4000</p>
                    <button 
                      className="redeem-reward-btn"
                      onClick={() => {
                        if (loyaltyData && loyaltyData.totalPoints >= 2000) {
                          setRedeemAmount('2000');
                          setShowRedeemModal(true);
                        } else {
                          showToast('Insufficient points', 'error');
                        }
                      }}
                      disabled={!loyaltyData || loyaltyData.totalPoints < 2000}
                    >
                      {loyaltyData && loyaltyData.totalPoints >= 2000 ? 'Redeem' : 'Not Enough Points'}
                    </button>
                  </div>

                  {/* Reward Option 4 */}
                  <div className="reward-card">
                    <div className="reward-icon-wrapper">
                      <FiGift className="reward-icon" />
                    </div>
                    <h4>Rs. 1000 Off</h4>
                    <p className="reward-points">3500 Points</p>
                    <p className="reward-description">Get Rs. 1000 discount on orders above Rs. 7000</p>
                    <button 
                      className="redeem-reward-btn"
                      onClick={() => {
                        if (loyaltyData && loyaltyData.totalPoints >= 3500) {
                          setRedeemAmount('3500');
                          setShowRedeemModal(true);
                        } else {
                          showToast('Insufficient points', 'error');
                        }
                      }}
                      disabled={!loyaltyData || loyaltyData.totalPoints < 3500}
                    >
                      {loyaltyData && loyaltyData.totalPoints >= 3500 ? 'Redeem' : 'Not Enough Points'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            {/* Personal Information */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                  <button className="edit-btn-small" onClick={handleEdit}>
                    <FiEdit2 /> Edit
                  </button>
                ) : (
                  <div className="edit-actions-inline">
                    <button className="save-btn-small" onClick={handleSave}>
                      <FiSave /> Save
                    </button>
                    <button className="cancel-btn-small" onClick={handleCancel}>
                      <FiX /> Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {/* Profile Image Upload */}
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Profile" className="profile-image-preview" />
                  ) : (
                    <div className="profile-image-placeholder">
                      <FiUser size={48} />
                    </div>
                  )}
                </div>
                <div className="profile-image-actions">
                  <input
                    type="file"
                    id="profileImageInput"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Show Choose Image button only if no image is uploaded yet */}
                  {!profileImagePreview && (
                    <>
                      <label htmlFor="profileImageInput" className="upload-image-btn">
                        <FiEdit2 /> Choose Image
                      </label>
                      <p className="image-hint">Max size: 5MB. Formats: JPG, PNG, WEBP</p>
                    </>
                  )}
                  
                  {/* Show Save Image button only when a new image is selected but not yet uploaded */}
                  {profileImage && (
                    <button 
                      className="save-image-btn" 
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Save Image'}
                    </button>
                  )}
                  
                  {/* Show Remove button only when there's an uploaded image */}
                  {profileImagePreview && !profileImage && (
                    <button className="delete-image-btn" onClick={handleImageDelete}>
                      <FiX /> Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="info-grid">
                <div className="info-field">
                  <label><FiUser /> Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.fullName}</p>
                  )}
                </div>

                <div className="info-field">
                  <label><FiMail /> Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.email}</p>
                  )}
                </div>

                <div className="info-field">
                  <label><FiPhone /> Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.phone}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Address Book */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Address Book</h3>
                <button className="edit-btn-small" onClick={handleAddAddress}>
                  <FiMapPin /> Add New Address
                </button>
              </div>

              {showAddressForm && (
                <div className="address-form">
                  <h4>{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Full Name <span style={{color: 'red'}}>*</span></label>
                      <input
                        type="text"
                        name="fullName"
                        value={newAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number <span style={{color: 'red'}}>*</span></label>
                      <input
                        type="tel"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="+977 9812345678"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>State/Province <span style={{color: 'red'}}>*</span></label>
                      <select
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        required
                      >
                        <option value="">Select State</option>
                        {getProvinces().map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>District <span style={{color: 'red'}}>*</span></label>
                      <select
                        name="district"
                        value={newAddress.district}
                        onChange={handleAddressChange}
                        disabled={!newAddress.state}
                        required
                      >
                        <option value="">Select District</option>
                        {newAddress.state && getDistrictsByProvince(newAddress.state).map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Municipality <span style={{color: 'red'}}>*</span></label>
                      <select
                        name="municipality"
                        value={newAddress.municipality}
                        onChange={handleAddressChange}
                        disabled={!newAddress.district}
                        required
                      >
                        <option value="">Select Municipality</option>
                        {newAddress.state && newAddress.district && 
                          getMunicipalitiesByDistrict(newAddress.state, newAddress.district).map(municipality => (
                            <option key={municipality} value={municipality}>{municipality}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="form-field">
                      <label>City/Area <span style={{color: 'red'}}>*</span></label>
                      <select
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        disabled={!newAddress.municipality}
                        required
                      >
                        <option value="">Select Area</option>
                        {newAddress.state && newAddress.district && newAddress.municipality &&
                          getAreasByMunicipality(newAddress.state, newAddress.district, newAddress.municipality).map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="form-field full-width">
                      <label>Nearest Landmark <span style={{color: 'red'}}>*</span></label>
                      <input
                        type="text"
                        name="landmark"
                        value={newAddress.landmark}
                        onChange={handleAddressChange}
                        placeholder="e.g., Near Ratna Park, Opposite City Mall"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Label for Effective Delivery</label>
                      <select
                        name="deliveryType"
                        value={newAddress.deliveryType}
                        onChange={handleAddressChange}
                      >
                        <option value="home">Home</option>
                        <option value="office">Office</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Custom Label (Optional)</label>
                      <input
                        type="text"
                        name="label"
                        value={newAddress.label}
                        onChange={handleAddressChange}
                        placeholder="e.g., Mom's House, Work"
                      />
                    </div>
                    <div className="form-field full-width">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={newAddress.isDefault}
                          onChange={handleAddressChange}
                        />
                        Set as default address
                      </label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="save-btn-small" onClick={handleSaveAddress}>
                      <FiSave /> Save Address
                    </button>
                    <button type="button" className="cancel-btn-small" onClick={() => setShowAddressForm(false)}>
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="address-list">
                {addresses.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#9ca3af',
                    fontSize: '15px'
                  }}>
                    <FiMapPin style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#6b7280' }}>No addresses added yet</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>Click "Add New Address" to add your first address</p>
                  </div>
                ) : (
                  addresses.map(address => (
                    <div key={address._id} className="address-card">
                      <div className="address-header">
                        <div className="address-label">
                          <span className="label-name">{address.name}</span>
                          {address.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        <div className="address-actions">
                          <button className="icon-btn" onClick={() => handleEditAddress(address)}>
                            <FiEdit2 />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDeleteAddress(address._id)}>
                            <FiX />
                          </button>
                        </div>
                      </div>
                      <div className="address-details">
                        <p className="address-name">{address.fullName}</p>
                        <p className="address-phone">{address.phone}</p>
                        <p className="address-text">
                          {address.landmark && `${address.landmark}, `}
                          {address.city}, {address.municipality}
                          {address.district && `, ${address.district}`}
                          {address.state && `, ${address.state}`}
                        </p>
                      </div>
                      {!address.isDefault && (
                        <button 
                          className="set-default-btn" 
                          onClick={() => handleSetDefaultAddress(address._id)}
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
              <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Change Password</h2>
                    <button className="close-modal" onClick={() => setShowPasswordModal(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-field">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="form-field">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <div className="form-field">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="modal-actions">
                      <button className="save-btn" onClick={handlePasswordSubmit}>
                        <FiSave /> Change Password
                      </button>
                      <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                        <FiX /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Login Activity Modal */}
            {showLoginActivityModal && (
              <div className="modal-overlay" onClick={() => setShowLoginActivityModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Login Activity</h2>
                    <button className="close-modal" onClick={() => setShowLoginActivityModal(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="activity-list">
                      {loginHistory.length === 0 ? (
                        <p style={{textAlign: 'center', padding: '20px', color: '#999'}}>No login history available</p>
                      ) : (
                        loginHistory.map((activity, index) => (
                          <div key={index} className="activity-item">
                            <div className="activity-icon success">✓</div>
                            <div className="activity-details">
                              <h4>{new Date(activity.timestamp).toLocaleString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}</h4>
                              <p>{activity.userAgent || 'Unknown Device'} - {activity.location || 'Unknown Location'}</p>
                              {index === 0 && <span className="activity-status">Current Session</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="security-note">All sessions are secure. If you notice any suspicious activity, please change your password immediately.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History Modal */}
            {showTransactionModal && (
              <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Transaction History</h2>
                    <button className="close-modal" onClick={() => setShowTransactionModal(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="transaction-list">
                      <div className="transaction-item">
                        <div className="transaction-icon">💳</div>
                        <div className="transaction-details">
                          <h4>Order #ORD-001</h4>
                          <p>March 1, 2026</p>
                        </div>
                        <div className="transaction-amount">
                          <span className="amount">Rs. 8,500</span>
                          <span className="status completed">Completed</span>
                        </div>
                      </div>
                      <div className="transaction-item">
                        <div className="transaction-icon">💳</div>
                        <div className="transaction-details">
                          <h4>Order #ORD-002</h4>
                          <p>Feb 28, 2026</p>
                        </div>
                        <div className="transaction-amount">
                          <span className="amount">Rs. 5,200</span>
                          <span className="status completed">Completed</span>
                        </div>
                      </div>
                      <div className="transaction-item">
                        <div className="transaction-icon">💳</div>
                        <div className="transaction-details">
                          <h4>Order #ORD-003</h4>
                          <p>Feb 25, 2026</p>
                        </div>
                        <div className="transaction-amount">
                          <span className="amount">Rs. 12,000</span>
                          <span className="status processing">Processing</span>
                        </div>
                      </div>
                    </div>
                    <div className="transaction-summary">
                      <strong>Total Spent:</strong> <span>Rs. 25,700</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods Modal */}
            {showPaymentMethodsModal && (
              <div className="modal-overlay" onClick={() => setShowPaymentMethodsModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Saved Payment Methods</h2>
                    <button className="close-modal" onClick={() => setShowPaymentMethodsModal(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="payment-methods-list">
                      <div className="payment-method-item">
                        <div className="card-icon">💳</div>
                        <div className="card-details">
                          <h4>Visa ending in 1234</h4>
                          <p>Expires: 12/2027</p>
                        </div>
                        <button className="remove-card-btn">Remove</button>
                      </div>
                      <div className="payment-method-item">
                        <div className="card-icon">💳</div>
                        <div className="card-details">
                          <h4>Mastercard ending in 5678</h4>
                          <p>Expires: 08/2026</p>
                        </div>
                        <button className="remove-card-btn">Remove</button>
                      </div>
                    </div>
                    <button className="add-payment-btn">+ Add New Payment Method</button>
                    <p className="payment-note">You can also add or remove payment methods during checkout.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
              <div className={`toast toast-${toast.type}`}>
                <span>{toast.message}</span>
              </div>
            )}

            <div className="settings-card">
              <h3>Password & Security</h3>
              <div className="setting-item">
                <div>
                  <h4>Change Password</h4>
                  <p>Update your password regularly to keep your account secure</p>
                </div>
                <button className="setting-btn" onClick={handleChangePassword}>Change</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="setting-btn" onClick={handleEnable2FA}>
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Login Activity</h4>
                  <p>View recent login history and active sessions</p>
                </div>
                <button className="setting-btn" onClick={handleViewLoginActivity}>View Activity</button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Account Management</h3>
              <div className="setting-item">
                <div>
                  <h4>Deactivate Account</h4>
                  <p>Temporarily disable your account</p>
                </div>
                <button className="setting-btn" onClick={handleDeactivateAccount}>Deactivate</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all data</p>
                </div>
                <button className="setting-btn danger" onClick={handleDeleteAccount}>Delete</button>
              </div>
            </div>
          </div>
        )}

      {/* Order Verification Modal */}
      {showVerificationModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
          <div className="modal-content modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verify Order Condition</h2>
              <button className="close-modal" onClick={() => setShowVerificationModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom: '16px', color: '#666', fontSize: '13px'}}>
                Order: <strong>{selectedOrder.id}</strong>
              </p>
              <div className="verification-question">
                <label style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px'}}>Does the item match the seller's description?</label>
                <div className="verification-options">
                  <button 
                    className={`verification-btn ${verificationData.matchesDescription === true ? 'selected' : ''}`}
                    onClick={() => setVerificationData({...verificationData, matchesDescription: true})}
                  >
                    ✓ Yes, it matches
                  </button>
                  <button 
                    className={`verification-btn ${verificationData.matchesDescription === false ? 'selected' : ''}`}
                    onClick={() => setVerificationData({...verificationData, matchesDescription: false})}
                  >
                    ✕ No, it doesn't match
                  </button>
                </div>
              </div>
              
              {/* Star Rating - REQUIRED */}
              <div className="form-field" style={{marginTop: '20px'}}>
                <label style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'block'}}>
                  Rate this product <span style={{color: '#e53e3e'}}>*</span>
                </label>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setVerificationData({...verificationData, rating: star})}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '32px',
                        color: star <= verificationData.rating ? '#ffc107' : '#e0e0e0',
                        padding: 0,
                        transition: 'color 0.2s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{marginLeft: '12px', fontSize: '14px', color: '#666'}}>
                    {verificationData.rating > 0 ? `${verificationData.rating} star${verificationData.rating > 1 ? 's' : ''}` : 'Select rating'}
                  </span>
                </div>
              </div>
              
              {/* Image Upload Section - OPTIONAL */}
              <div className="form-field" style={{marginTop: '16px'}}>
                <label style={{fontSize: '13px', fontWeight: '500', marginBottom: '8px', display: 'block'}}>
                  Upload Product Images (Optional)
                </label>
                <p style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
                  You can upload up to 5 clear images of the product.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleVerificationImageSelect}
                  style={{display: 'none'}}
                  id="verification-image-upload"
                />
                <label 
                  htmlFor="verification-image-upload" 
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: '#f5f5f5',
                    border: '1px dashed #00bcd4',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#00bcd4',
                    fontWeight: '500'
                  }}
                >
                  + Add Images ({verificationData.images.length}/5)
                </label>
                
                {/* Image Previews */}
                {verificationData.images.length > 0 && (
                  <div style={{display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap'}}>
                    {verificationData.images.map((img, index) => (
                      <div key={index} style={{position: 'relative', width: '80px', height: '80px'}}>
                        <img 
                          src={img.preview} 
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                        <button
                          onClick={() => handleRemoveVerificationImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            padding: 0
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Notes - OPTIONAL */}
              <div className="form-field" style={{marginTop: '16px'}}>
                <label style={{fontSize: '13px', fontWeight: '500', marginBottom: '8px', display: 'block'}}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Describe the condition of the item you received..."
                  value={verificationData.customerNotes}
                  onChange={(e) => setVerificationData({...verificationData, customerNotes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              {verificationData.matchesDescription === true && (
                <p className="bonus-note" style={{fontSize: '13px', padding: '8px 12px', margin: '12px 0 0 0'}}>🎁 You will earn 50 bonus loyalty points!</p>
              )}
              <div className="modal-actions" style={{marginTop: '16px'}}>
                <button className="save-btn" onClick={submitVerification} style={{padding: '10px 20px', fontSize: '13px'}}>
                  <FiSave /> Submit Verification
                </button>
                <button className="cancel-btn" onClick={() => setShowVerificationModal(false)} style={{padding: '10px 20px', fontSize: '13px'}}>
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Redeem Points Modal */}
      {showRedeemModal && (
        <div className="modal-overlay" onClick={() => setShowRedeemModal(false)}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Redeem Loyalty Points</h2>
              <button className="close-modal" onClick={() => setShowRedeemModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="redeem-info">
                <p>Available Points: <strong>{loyaltyData ? loyaltyData.totalPoints : 1250}</strong></p>
                <p>Conversion Rate: <strong>100 points = Rs. 10</strong></p>
              </div>
              <div className="form-field">
                <label>Points to Redeem</label>
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="Enter points amount"
                  min="1"
                  max={loyaltyData ? loyaltyData.totalPoints : 1250}
                />
                {redeemAmount && !isNaN(redeemAmount) && (
                  <p className="conversion-preview">
                    You will receive: <strong>Rs. {(parseInt(redeemAmount) / 10).toFixed(2)}</strong>
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={handleRedeemPoints}>
                  <FiGift /> Redeem Now
                </button>
                <button className="cancel-btn" onClick={() => setShowRedeemModal(false)}>
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Return</h2>
              <button className="close-modal" onClick={() => setShowReturnModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom: '20px', color: '#666', fontSize: '14px'}}>
                Returns are accepted within 7 days of delivery. The seller will review your request within 24 hours.
              </p>
              <div className="form-field">
                <label>Return Reason *</label>
                <select
                  value={returnData.reason}
                  onChange={(e) => setReturnData({...returnData, reason: e.target.value})}
                  style={{width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'Arial, sans-serif'}}
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Item is defective or damaged</option>
                  <option value="wrong_item">Wrong item received</option>
                  <option value="not_as_described">Item not as described</option>
                  <option value="size_issue">Size or fit issue</option>
                  <option value="quality">Quality not satisfactory</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Detailed Description *</label>
                <textarea
                  value={returnData.description}
                  onChange={(e) => setReturnData({...returnData, description: e.target.value})}
                  placeholder="Please provide details about why you want to return this item..."
                  rows="4"
                  style={{width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'Arial, sans-serif'}}
                />
              </div>
              <div className="info-box" style={{background: '#fff3e0', padding: '12px', borderRadius: '6px', marginTop: '16px'}}>
                <p style={{margin: 0, fontSize: '13px', color: '#e65100'}}>
                  <strong>Return Policy:</strong><br/>
                  • Item must be unused and in original packaging<br/>
                  • Return shipping may be charged based on reason<br/>
                  • Refund will be processed within 5-7 business days after approval
                </p>
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={submitReturnRequest}>
                  <FiRefreshCw /> Submit Return Request
                </button>
                <button className="cancel-btn" onClick={() => setShowReturnModal(false)}>
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Order</h2>
              <button className="close-modal" onClick={() => setShowCancelModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p style={{marginBottom: '20px', color: '#666', fontSize: '14px'}}>
                You can only cancel orders before they are shipped. Once shipped, you'll need to request a return instead.
              </p>
              <div className="form-field">
                <label>Cancellation Reason *</label>
                <select
                  value={cancelData.reason}
                  onChange={(e) => setCancelData({...cancelData, reason: e.target.value})}
                  style={{width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'Arial, sans-serif'}}
                >
                  <option value="">Select a reason</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="found_better_price">Found a better price</option>
                  <option value="ordered_by_mistake">Ordered by mistake</option>
                  <option value="delivery_time">Delivery time too long</option>
                  <option value="payment_issue">Payment issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="info-box" style={{background: '#e8f5e9', padding: '12px', borderRadius: '6px', marginTop: '16px'}}>
                <p style={{margin: 0, fontSize: '13px', color: '#2e7d32'}}>
                  <strong>Refund Information:</strong><br/>
                  • Full refund will be processed to your original payment method<br/>
                  • Refund typically takes 3-5 business days<br/>
                  • You'll receive an email confirmation once processed
                </p>
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={submitCancelOrder} style={{background: '#f44336'}}>
                  <FiX /> Cancel Order
                </button>
                <button className="cancel-btn" onClick={() => setShowCancelModal(false)}>
                  Keep Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Deactivate Your Account?</h2>
              <button className="close-modal" onClick={() => setShowDeactivateModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-box" style={{background: '#fff3e0', padding: '16px', borderRadius: '8px', marginBottom: '20px'}}>
                <p style={{margin: '0 0 12px 0', fontSize: '15px', color: '#e65100', fontWeight: '600'}}>
                  What happens when you deactivate:
                </p>
                <ul style={{margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px', lineHeight: '1.8'}}>
                  <li>Your profile will be hidden</li>
                  <li>You won't receive notifications</li>
                  <li>Your orders will remain accessible</li>
                  <li>You can reactivate anytime by logging in</li>
                </ul>
              </div>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>
                Are you sure you want to continue?
              </p>
              <div className="modal-actions">
                <button className="save-btn" onClick={confirmDeactivateAccount} style={{background: '#ff9800'}}>
                  Yes, Deactivate
                </button>
                <button className="cancel-btn" onClick={() => setShowDeactivateModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{background: '#ffebee'}}>
              <h2 style={{color: '#c62828'}}>⚠️ Permanent Account Deletion</h2>
              <button className="close-modal" onClick={() => setShowDeleteModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-box" style={{background: '#ffebee', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #ef5350'}}>
                <p style={{margin: '0 0 12px 0', fontSize: '15px', color: '#c62828', fontWeight: '600'}}>
                  ⚠️ THIS ACTION CANNOT BE UNDONE!
                </p>
                <p style={{margin: '0 0 12px 0', fontSize: '14px', color: '#c62828', fontWeight: '600'}}>
                  This will permanently delete:
                </p>
                <ul style={{margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px', lineHeight: '1.8'}}>
                  <li>Your profile and personal information</li>
                  <li>All order history</li>
                  <li>Wishlist and favorites</li>
                  <li>Messages and chat history</li>
                  <li>Loyalty points</li>
                </ul>
              </div>
              <div className="info-box" style={{background: '#e8f5e9', padding: '12px', borderRadius: '6px', marginBottom: '20px'}}>
                <p style={{margin: 0, fontSize: '13px', color: '#2e7d32'}}>
                  <strong>Grace Period:</strong> Your account will be scheduled for deletion in 30 days. You can cancel by logging in before that date.
                </p>
              </div>
              <div className="form-field">
                <label style={{color: '#c62828', fontWeight: '600'}}>Enter your password to confirm deletion *</label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{width: '100%', padding: '12px', border: '2px solid #ef5350', borderRadius: '6px', fontFamily: 'Arial, sans-serif'}}
                />
              </div>
              <div className="modal-actions">
                <button className="save-btn" onClick={confirmDeleteAccount} style={{background: '#f44336'}}>
                  Delete My Account
                </button>
                <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                  Keep My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Item Modal */}
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Return Item</h2>
              <button className="close-modal" onClick={() => setShowReturnModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {returnData.productName && (
                <div className="return-product-info" style={{display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
                  <img 
                    src={returnData.productImage || 'https://via.placeholder.com/80'} 
                    alt={returnData.productName}
                    style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px'}}
                  />
                  <div>
                    <h4 style={{margin: '0 0 5px 0', fontSize: '16px'}}>{returnData.productName}</h4>
                    <p style={{margin: 0, color: '#666', fontSize: '14px'}}>Order ID: {returnData.orderId}</p>
                  </div>
                </div>
              )}
              
              <div className="form-field">
                <label>Reason for Return *</label>
                <select
                  value={returnData.reason}
                  onChange={(e) => setReturnData({...returnData, reason: e.target.value})}
                  required
                  style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px'}}
                >
                  <option value="">Select a reason</option>
                  <option value="Defective/Damaged">Defective/Damaged</option>
                  <option value="Wrong Item">Wrong Item</option>
                  <option value="Not as Described">Not as Described</option>
                  <option value="Size Issue">Size Issue</option>
                  <option value="Changed Mind">Changed Mind</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-field">
                <label>Description *</label>
                <textarea
                  value={returnData.description}
                  onChange={(e) => setReturnData({...returnData, description: e.target.value})}
                  placeholder="Please provide details about why you want to return this item..."
                  rows="4"
                  required
                  style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical'}}
                />
              </div>

              <div className="info-box" style={{background: '#e3f2fd', padding: '12px', borderRadius: '6px', marginTop: '15px'}}>
                <p style={{margin: 0, fontSize: '13px', color: '#1976d2'}}>
                  <strong>Note:</strong> The seller will review your return request. If approved, you'll receive instructions for returning the item and processing your refund.
                </p>
              </div>

              <div className="modal-actions">
                <button 
                  className="save-btn" 
                  onClick={async () => {
                    if (!returnData.reason || !returnData.description.trim()) {
                      showToast('Please fill in all required fields', 'error');
                      return;
                    }

                    try {
                      const response = await fetch(buildApiUrl('/returns/create'), {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          orderId: returnData.orderId,
                          productId: returnData.productId,
                          reason: returnData.reason,
                          description: returnData.description,
                          images: returnData.images
                        }),
                      });

                      const data = await response.json();
                      
                      if (response.ok) {
                        showToast('Return request submitted successfully! The seller will review your request.', 'success');
                        setShowReturnModal(false);
                        setReturnData({
                          orderId: null,
                          productId: null,
                          productName: '',
                          productImage: '',
                          reason: '',
                          description: '',
                          images: []
                        });
                        
                        // Refresh returns list
                        const user = JSON.parse(sessionStorage.getItem('user'));
                        if (user && user._id) {
                          fetchReturns(user._id);
                        }
                      } else {
                        showToast(data.message || 'Failed to submit return request', 'error');
                      }
                    } catch (error) {
                      console.error('Error submitting return:', error);
                      showToast('Failed to submit return request', 'error');
                    }
                  }}
                >
                  Submit Return Request
                </button>
                <button className="cancel-btn" onClick={() => setShowReturnModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerProfile;
