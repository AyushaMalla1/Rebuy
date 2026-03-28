import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiHeart, FiSettings, FiLogOut, FiEdit2, FiSave, FiX, FiHome, FiPackage, FiRefreshCw, FiTruck, FiStar, FiAward, FiGift, FiMessageSquare, FiSend, FiChevronRight } from 'react-icons/fi';
import './BuyerProfile.css';
import { orderAPI, loyaltyAPI, customerAPI, authAPI } from './services/api';
import { getProvinces, getDistrictsByProvince, getMunicipalitiesByDistrict, getAreasByMunicipality } from './data/nepalLocations';

function BuyerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [orderFilter, setOrderFilter] = useState('all'); // all, pending, processing, shipped, delivered
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
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample orders data with detailed tracking
  const [sampleOrders] = useState([
    { 
      id: '#ORD-001', 
      date: '2026-03-01', 
      total: 8500, 
      status: 'Delivered', 
      items: 2,
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2026-03-05',
      paymentMethod: 'Online Payment',
      shippingAddress: 'Kathmandu, Nepal',
      products: [
        { name: 'Vintage Jacket', quantity: 1, price: 8000 },
        { name: 'T-Shirt', quantity: 1, price: 500 }
      ]
    },
    { 
      id: '#ORD-002', 
      date: '2026-02-28', 
      total: 5200, 
      status: 'Shipped', 
      items: 1,
      trackingNumber: 'TRK987654321',
      estimatedDelivery: '2026-03-06',
      paymentMethod: 'Cash on Delivery',
      shippingAddress: 'Lalitpur, Nepal',
      products: [
        { name: 'Hoodie', quantity: 1, price: 5200 }
      ]
    },
    { 
      id: '#ORD-003', 
      date: '2026-02-25', 
      total: 12000, 
      status: 'Processing', 
      items: 3,
      trackingNumber: 'Pending',
      estimatedDelivery: '2026-03-08',
      paymentMethod: 'Online Payment',
      shippingAddress: 'Pokhara, Nepal',
      products: [
        { name: 'Blazer', quantity: 2, price: 6200 },
        { name: 'Jeans', quantity: 1, price: 5800 }
      ]
    },
  ]);

  // Wishlist state - load from localStorage
  const [wishlist, setWishlist] = useState([]);

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
  const [chats] = useState([
    { 
      id: 1, 
      sellerName: 'Fashion Store', 
      sellerAvatar: 'FS',
      lastMessage: 'Is this item still available?',
      time: '2 hours ago',
      unread: 2,
      messages: [
        { id: 1, sender: 'buyer', text: 'Hi, is this jacket still available?', time: '10:30 AM' },
        { id: 2, sender: 'seller', text: 'Yes, it is! Would you like to know more details?', time: '10:32 AM' },
        { id: 3, sender: 'buyer', text: 'What size is it?', time: '10:35 AM' },
        { id: 4, sender: 'seller', text: 'It\'s size M. We also have L available.', time: '10:36 AM' },
      ]
    },
    { 
      id: 2, 
      sellerName: 'Vintage Closet', 
      sellerAvatar: 'VC',
      lastMessage: 'Thank you for your purchase!',
      time: '1 day ago',
      unread: 0,
      messages: [
        { id: 1, sender: 'buyer', text: 'When will my order ship?', time: 'Yesterday 3:20 PM' },
        { id: 2, sender: 'seller', text: 'Your order will ship today! Tracking number will be sent soon.', time: 'Yesterday 3:25 PM' },
        { id: 3, sender: 'seller', text: 'Thank you for your purchase!', time: 'Yesterday 3:26 PM' },
      ]
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    matchesDescription: null,
    customerNotes: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showLoginActivityModal, setShowLoginActivityModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({
    orderId: null,
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

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    
    // Add message to chat
    const newMessage = {
      id: selectedChat.messages.length + 1,
      sender: 'buyer',
      text: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    selectedChat.messages.push(newMessage);
    setMessageText('');
    
    // In a real app, this would send to backend
    console.log('Message sent:', newMessage);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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
      const user = JSON.parse(localStorage.getItem('user'));
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

  const handleEnable2FA = () => {
    showToast('Two-Factor Authentication setup will be available soon!', 'success');
  };

  const handleViewLoginActivity = () => {
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

  const confirmDeactivateAccount = () => {
    // In a real app, this would call the backend API
    showToast('Account deactivated successfully. You can reactivate anytime by logging in.', 'success');
    setShowDeactivateModal(false);
    // Optionally logout user
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeleteConfirmPassword('');
  };

  const confirmDeleteAccount = () => {
    if (!deleteConfirmPassword.trim()) {
      showToast('Please enter your password to confirm deletion', 'error');
      return;
    }
    
    // In a real app, this would verify password and call backend API
    showToast('Account deletion scheduled for April 12, 2026. You can cancel by logging in before that date.', 'warning');
    setShowDeleteModal(false);
    setDeleteConfirmPassword('');
    
    // Optionally logout user
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }, 3000);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      // Redirect sellers to seller dashboard
      if (user.userType === 'seller') {
        navigate('/seller/dashboard');
        return;
      }
      
      const data = {
        fullName: user.fullName || 'John Doe',
        email: user.email || 'john.doe@example.com',
        phone: user.phone || '+977 9812345678',
        address: user.address || 'Kathmandu, Nepal',
        city: user.city || 'Kathmandu'
      };
      setUserData(data);
      setEditData(data);
      
      // Fetch customer profile, orders and loyalty data
      if (user._id) {
        fetchCustomerProfile(user._id);
        fetchOrders(user._id);
        fetchLoyaltyData(user._id);
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

  const fetchCustomerProfile = async (userId) => {
    try {
      const profile = await customerAPI.get(userId);
      if (profile) {
        // Update user data with profile info
        setUserData({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone || '',
          address: '', // Will be from addresses array
          city: '',
          profileImage: profile.profileImage || ''
        });
        setEditData({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone || '',
          address: '',
          city: '',
          profileImage: profile.profileImage || ''
        });
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

  const loadWishlist = () => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      const allProductsStr = localStorage.getItem('allProducts');
      
      if (savedFavorites && allProductsStr) {
        const favoriteIds = JSON.parse(savedFavorites);
        const allProducts = JSON.parse(allProductsStr);
        const wishlistItems = allProducts.filter(p => favoriteIds.includes(p.id));
        setWishlist(wishlistItems);
      } else {
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
      if (fetchedOrders && fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
      } else {
        // Use sample orders if no real orders
        setOrders(sampleOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyaltyData = async (customerId) => {
    try {
      const data = await loyaltyAPI.get(customerId);
      setLoyaltyData(data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user._id) {
        showToast('Please login to upload profile image', 'error');
        return;
      }
      
      const result = await customerAPI.uploadProfileImage(user._id, profileImage);
      
      setUserData(prev => ({ ...prev, profileImage: result.profileImage }));
      setEditData(prev => ({ ...prev, profileImage: result.profileImage }));
      setProfileImagePreview(result.profileImage);
      setProfileImage(null);
      
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
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user._id) {
        showToast('Please login to delete profile image', 'error');
        return;
      }
      
      await customerAPI.deleteProfileImage(user._id);
      
      setUserData(prev => ({ ...prev, profileImage: '' }));
      setEditData(prev => ({ ...prev, profileImage: '' }));
      setProfileImagePreview('');
      setProfileImage(null);
      
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
    
    // Validate phone number format
    const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
    const cleanPhone = editData.phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      showToast('Please enter a valid phone number (e.g., 9812345678)', 'error');
      return;
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Update customer profile in backend
      await customerAPI.update(user._id, {
        fullName: editData.fullName,
        email: editData.email,
        phone: editData.phone
      });
      
      setUserData({ ...editData });
      const updatedUser = { ...user, ...editData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
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
    
    // Validate phone number format
    const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
    const cleanPhone = newAddress.phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      showToast('Please enter a valid phone number', 'error');
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
      const user = JSON.parse(localStorage.getItem('user'));
      
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
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        console.log('Deleting address with ID:', id);
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('User ID:', user._id);
        const response = await customerAPI.deleteAddress(user._id, id);
        console.log('Delete response:', response);
        
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
      const user = JSON.parse(localStorage.getItem('user'));
      await customerAPI.setDefaultAddress(user._id, id);
      
      // Refresh addresses
      await fetchCustomerProfile(user._id);
      showToast('Default address updated', 'success');
    } catch (error) {
      console.error('Error setting default address:', error);
      showToast('Failed to set default address', 'error');
    }
  };

  const handleAddToCartFromWishlist = async (item) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
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

  const handleRemoveFromWishlist = (itemId) => {
    try {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== itemId);
      setWishlist(updatedWishlist);
      
      // Update favorites in localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const updatedFavorites = favorites.filter(id => id !== itemId);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      showToast('Item removed from wishlist', 'success');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove item from wishlist', 'error');
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'confirmed': return 'status-shipped';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const handleVerifyCondition = async (orderId) => {
    setSelectedOrder(orders.find(o => o._id === orderId || o.id === orderId));
    setShowVerificationModal(true);
  };

  const submitVerification = async () => {
    if (verificationData.matchesDescription === null) {
      showToast('Please select if the item matches the description', 'error');
      return;
    }
    
    try {
      await orderAPI.verifyCondition(selectedOrder._id || selectedOrder.id, {
        matchesDescription: verificationData.matchesDescription,
        customerNotes: verificationData.customerNotes || '',
        images: []
      });
      
      if (verificationData.matchesDescription) {
        showToast('Thank you! You earned 50 bonus loyalty points!', 'success');
      } else {
        showToast('Thank you for your feedback. Our team will review this.', 'success');
      }
      
      setShowVerificationModal(false);
      setVerificationData({ matchesDescription: null, customerNotes: '' });
      
      // Refresh orders
      const user = JSON.parse(localStorage.getItem('user'));
      if (user._id) {
        fetchOrders(user._id);
        fetchLoyaltyData(user._id);
      }
    } catch (error) {
      console.error('Error verifying condition:', error);
      showToast('Failed to submit verification', 'error');
    }
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
      const user = JSON.parse(localStorage.getItem('user'));
      if (user._id) {
        fetchOrders(user._id);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('Failed to cancel order', 'error');
    }
  };

  const handleRequestReturn = (orderId) => {
    const order = orders.find(o => o._id === orderId || o.id === orderId);
    
    // Check if order can be returned
    if (!order) {
      showToast('Order not found', 'error');
      return;
    }
    
    const status = order.status.toLowerCase();
    if (status !== 'delivered') {
      showToast('Only delivered orders can be returned', 'error');
      return;
    }
    
    // Check if within 7 days
    const deliveryDate = new Date(order.deliveredDate || order.date);
    const daysSinceDelivery = Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceDelivery > 7) {
      showToast('Return period expired. Returns are only accepted within 7 days of delivery.', 'error');
      return;
    }
    
    // Show return modal
    setReturnData({ orderId, reason: '', description: '', images: [] });
    setShowReturnModal(true);
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
      const user = JSON.parse(localStorage.getItem('user'));
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
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="ReStyle" className="sidebar-logo" />
        </div>

        <nav className="sidebar-menu">
          <div className="menu-items">
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => {
                console.log('Profile clicked');
                setActiveTab('profile');
              }}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiUser /> Profile
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => {
                console.log('Orders clicked');
                setActiveTab('orders');
              }}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiShoppingBag /> Orders
            </button>
            <button 
              className={activeTab === 'wishlist' ? 'active' : ''} 
              onClick={() => {
                console.log('Wishlist clicked');
                setActiveTab('wishlist');
              }}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiHeart /> Wishlist
            </button>
            <button 
              className={activeTab === 'messages' ? 'active' : ''} 
              onClick={() => {
                console.log('Messages clicked');
                setActiveTab('messages');
              }}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiMessageSquare /> Messages
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => {
                console.log('Settings clicked');
                setActiveTab('settings');
              }}
              style={{cursor: 'pointer', userSelect: 'none'}}
            >
              <FiSettings /> Settings
            </button>
          </div>
          <div className="menu-footer">
            <button onClick={() => navigate('/')} className="home-menu-btn" style={{cursor: 'pointer'}}>
              <FiHome /> Back to Home
            </button>
            <button onClick={handleLogout} className="logout-menu-btn" style={{cursor: 'pointer'}}>
              <FiLogOut /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="profile-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <div>
                <h1>My Account</h1>
                <p>Manage your profile and track your orders</p>
              </div>
            </div>

            {/* Order Status Cards */}
            <div className="order-status-grid">
              <div 
                className="status-card" 
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('pending');
                }}
                style={{cursor: 'pointer'}}
              >
                <div className="status-icon-wrapper payment">
                  <FiShoppingBag className="status-icon" />
                </div>
                <h3>To Pay</h3>
                <p className="status-count">2</p>
                <span className="status-desc">Pending Payment</span>
              </div>
              <div 
                className="status-card"
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('processing');
                }}
                style={{cursor: 'pointer'}}
              >
                <div className="status-icon-wrapper shipping">
                  <FiPackage className="status-icon" />
                </div>
                <h3>To Ship</h3>
                <p className="status-count">1</p>
                <span className="status-desc">Processing</span>
              </div>
              <div 
                className="status-card"
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('shipped');
                }}
                style={{cursor: 'pointer'}}
              >
                <div className="status-icon-wrapper delivery">
                  <FiTruck className="status-icon" />
                </div>
                <h3>To Receive</h3>
                <p className="status-count">3</p>
                <span className="status-desc">In Transit</span>
              </div>
              <div 
                className="status-card"
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('delivered');
                }}
                style={{cursor: 'pointer'}}
              >
                <div className="status-icon-wrapper review">
                  <FiStar className="status-icon" />
                </div>
                <h3>To Review</h3>
                <p className="status-count">5</p>
                <span className="status-desc">Completed</span>
              </div>
            </div>

            {/* Wishlist Preview */}
            <div className="profile-card">
              <div className="card-header">
                <h3><FiHeart /> My Wishlist</h3>
                <button className="view-all-btn" onClick={() => setActiveTab('wishlist')} style={{cursor: 'pointer'}}>View All</button>
              </div>
              <div className="wishlist-preview">
                {wishlist.slice(0, 3).map(item => (
                  <div 
                    key={item.id} 
                    className="wishlist-preview-item"
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{cursor: 'pointer'}}
                  >
                    <img src={item.image} alt={item.name} />
                    <p>{item.name}</p>
                    <span>Rs. {item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Return & Cancellation */}
            <div className="profile-card">
              <h3>Return & Cancellation</h3>
              <div className="action-list">
                <div className="action-item">
                  <FiRefreshCw />
                  <div>
                    <h4>Return Request</h4>
                    <p>Request a return for delivered orders (within 7 days)</p>
                  </div>
                  <button 
                    className="action-btn"
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderFilter('delivered');
                    }}
                    style={{cursor: 'pointer'}}
                  >
                    Request
                  </button>
                </div>
                <div className="action-item">
                  <FiX />
                  <div>
                    <h4>Cancel Order</h4>
                    <p>Cancel orders before they are shipped</p>
                  </div>
                  <button 
                    className="action-btn"
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderFilter('processing');
                    }}
                    style={{cursor: 'pointer'}}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Loyalty Points & Rewards */}
            <div className="profile-card loyalty-card">
              <h3><FiAward /> Loyalty Points & Rewards</h3>
              <div className="loyalty-content">
                <div className="points-display">
                  <div className="points-circle">
                    <FiGift className="points-icon" />
                    <span className="points-number">{loyaltyData ? loyaltyData.totalPoints : 1250}</span>
                    <span className="points-label">Points</span>
                  </div>
                </div>
                <div className="rewards-list">
                  <div className="reward-item">
                    <div className="reward-icon-wrapper welcome">
                      <FiGift className="reward-icon-svg" />
                    </div>
                    <div>
                      <h4>Welcome Bonus</h4>
                      <p>500 points earned</p>
                    </div>
                    <FiChevronRight />
                  </div>
                  <div className="reward-item">
                    <div className="reward-icon-wrapper purchase">
                      <FiShoppingBag className="reward-icon-svg" />
                    </div>
                    <div>
                      <h4>Purchase Rewards</h4>
                      <p>750 points earned</p>
                    </div>
                    <FiChevronRight />
                  </div>
                  <button 
                    className="redeem-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Redeem button clicked');
                      setShowRedeemModal(true);
                    }}
                    type="button"
                    style={{cursor: 'pointer'}}
                  >
                    <FiGift /> Redeem Points
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <div>
                <h1>My Orders</h1>
                <p>Track and manage your purchases</p>
              </div>
            </div>

            {/* Order Filter Tabs */}
            <div className="order-filter-tabs">
              <button 
                className={orderFilter === 'all' ? 'active' : ''}
                onClick={() => setOrderFilter('all')}
              >
                All Orders
              </button>
              <button 
                className={orderFilter === 'pending' ? 'active' : ''}
                onClick={() => setOrderFilter('pending')}
              >
                To Pay
              </button>
              <button 
                className={orderFilter === 'processing' ? 'active' : ''}
                onClick={() => setOrderFilter('processing')}
              >
                Processing
              </button>
              <button 
                className={orderFilter === 'shipped' ? 'active' : ''}
                onClick={() => setOrderFilter('shipped')}
              >
                Shipped
              </button>
              <button 
                className={orderFilter === 'delivered' ? 'active' : ''}
                onClick={() => setOrderFilter('delivered')}
              >
                Delivered
              </button>
            </div>

            <div className="orders-grid">
              {orders
                .filter(order => {
                  if (orderFilter === 'all') return true;
                  const status = order.status.toLowerCase();
                  if (orderFilter === 'pending') return status === 'pending' || status === 'unpaid';
                  if (orderFilter === 'processing') return status === 'processing' || status === 'confirmed';
                  if (orderFilter === 'shipped') return status === 'shipped' || status === 'in transit';
                  if (orderFilter === 'delivered') return status === 'delivered' || status === 'completed';
                  return true;
                })
                .map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>{order.id}</h3>
                      <span className="order-date">{order.date}</span>
                    </div>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-body">
                    <div className="order-info-row">
                      <span className="info-label">Items:</span>
                      <span className="info-value">
                        {typeof order.items === 'number' 
                          ? `${order.items} items` 
                          : Array.isArray(order.items) 
                            ? `${order.items.length} items`
                            : Array.isArray(order.products)
                              ? `${order.products.length} items`
                              : '0 items'
                        }
                      </span>
                    </div>
                    <div className="order-info-row">
                      <span className="info-label">Total:</span>
                      <span className="info-value total">Rs. {order.total.toLocaleString()}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="info-label">Payment:</span>
                      <span className="info-value">{order.paymentMethod}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="info-label">Tracking:</span>
                      <span className="info-value tracking">{order.trackingNumber}</span>
                    </div>
                    {order.status !== 'Delivered' && (
                      <div className="order-info-row">
                        <span className="info-label">Est. Delivery:</span>
                        <span className="info-value">{order.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      View Details
                    </button>
                    {order.status === 'Delivered' && !order.conditionVerification?.verified && (
                      <button 
                        className="verify-btn"
                        onClick={() => handleVerifyCondition(order._id || order.id)}
                      >
                        Verify Condition
                      </button>
                    )}
                    {order.status === 'Delivered' && order.conditionVerification?.verified && (
                      <>
                        <span className="verified-badge">✓ Verified</span>
                        <button 
                          className="return-btn"
                          onClick={() => handleRequestReturn(order._id || order.id)}
                        >
                          Request Return
                        </button>
                      </>
                    )}
                    {order.status === 'Processing' && (
                      <button 
                        className="cancel-order-btn"
                        onClick={() => handleCancelOrder(order._id || order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {orders.filter(order => {
              if (orderFilter === 'all') return true;
              const status = order.status.toLowerCase();
              if (orderFilter === 'pending') return status === 'pending' || status === 'unpaid';
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
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Order Details - {selectedOrder.id}</h2>
                    <button className="close-modal" onClick={() => setShowOrderDetails(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="detail-section">
                      <h4>Order Status</h4>
                      <div className="tracking-timeline">
                        <div className={`timeline-step ${['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                          <div className="step-icon">📦</div>
                          <div className="step-info">
                            <strong>Order Placed</strong>
                            <span>{selectedOrder.date}</span>
                          </div>
                        </div>
                        <div className={`timeline-step ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                          <div className="step-icon">🚚</div>
                          <div className="step-info">
                            <strong>Shipped</strong>
                            <span>{selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? 'In Transit' : 'Pending'}</span>
                          </div>
                        </div>
                        <div className={`timeline-step ${selectedOrder.status === 'Delivered' ? 'completed' : ''}`}>
                          <div className="step-icon">✅</div>
                          <div className="step-info">
                            <strong>Delivered</strong>
                            <span>{selectedOrder.status === 'Delivered' ? 'Completed' : selectedOrder.estimatedDelivery}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Products</h4>
                      {Array.isArray(selectedOrder.products) && selectedOrder.products.length > 0 && selectedOrder.products.map((item, index) => {
                        // Handle both product objects and item objects
                        const productName = item.name || item.productName || 'Product';
                        const productQty = item.quantity || 1;
                        const productPrice = item.price || 0;
                        
                        return (
                          <div key={index} className="product-row">
                            <span>{productName} x {productQty}</span>
                            <span>Rs. {productPrice.toLocaleString()}</span>
                          </div>
                        );
                      })}
                      {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && selectedOrder.items.map((item, index) => {
                        // Handle backend order items structure
                        // Safely extract product name from nested object
                        let productName = 'Product';
                        if (item.productName) {
                          productName = item.productName;
                        } else if (item.product && typeof item.product === 'object' && item.product.name) {
                          productName = item.product.name;
                        } else if (typeof item.product === 'string') {
                          productName = item.product;
                        }
                        
                        const productQty = item.quantity || 1;
                        const productPrice = item.price || item.subtotal || 0;
                        
                        return (
                          <div key={`item-${index}`} className="product-row">
                            <span>{productName} x {productQty}</span>
                            <span>Rs. {productPrice.toLocaleString()}</span>
                          </div>
                        );
                      })}
                      {(!selectedOrder.products || selectedOrder.products.length === 0) && 
                       (!selectedOrder.items || selectedOrder.items.length === 0) && (
                        <p style={{color: '#666', fontSize: '14px'}}>No product details available</p>
                      )}
                    </div>

                    <div className="detail-section">
                      <h4>Shipping Address</h4>
                      <p>
                        {typeof selectedOrder.shippingAddress === 'string' 
                          ? selectedOrder.shippingAddress
                          : selectedOrder.shippingAddress && typeof selectedOrder.shippingAddress === 'object'
                            ? `${selectedOrder.shippingAddress.fullName || ''}, ${selectedOrder.shippingAddress.phone || ''}, ${selectedOrder.shippingAddress.address || ''}, ${selectedOrder.shippingAddress.city || ''} ${selectedOrder.shippingAddress.postalCode || ''}`.trim()
                            : 'No address provided'
                        }
                      </p>
                    </div>

                    <div className="detail-section">
                      <h4>Payment Method</h4>
                      <p>{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-section">
            <div className="section-header">
              <div>
                <h1>My Wishlist</h1>
                <p>Your saved items and favorites</p>
              </div>
            </div>

            <div className="wishlist-grid">
              {wishlist.length === 0 ? (
                <div className="empty-wishlist" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#999'}}>
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
                wishlist.map(item => (
                  <div key={item.id} className="wishlist-card">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onClick={() => navigate(`/product/${item.id}`)}
                      style={{cursor: 'pointer'}}
                    />
                    <div className="wishlist-info">
                      <h3 
                        onClick={() => navigate(`/product/${item.id}`)}
                        style={{cursor: 'pointer'}}
                      >
                        {item.name}
                      </h3>
                      <p className="price">Rs. {item.price.toLocaleString()}</p>
                      <div className="wishlist-actions">
                        <button 
                          className="add-cart-btn"
                          onClick={() => handleAddToCartFromWishlist(item)}
                        >
                          Add to Cart
                        </button>
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                        >
                          <FiX /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="messages-section">
            <div className="section-header">
              <div>
                <h1>Messages</h1>
                <p>Chat with sellers and support</p>
              </div>
            </div>

            <div className="messages-container">
              {/* Chat List */}
              <div className="chat-list">
                <div className="chat-list-header">
                  <h3>Conversations</h3>
                </div>
                {chats.map(chat => (
                  <div 
                    key={chat.id} 
                    className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar">{chat.sellerAvatar}</div>
                    <div className="chat-info">
                      <div className="chat-header-row">
                        <h4>{chat.sellerName}</h4>
                        <span className="chat-time">{chat.time}</span>
                      </div>
                      <p className="chat-last-message">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="unread-badge">{chat.unread}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Window */}
              <div className="chat-window">
                {selectedChat ? (
                  <>
                    <div className="chat-window-header">
                      <div className="seller-info">
                        <div className="chat-avatar">{selectedChat.sellerAvatar}</div>
                        <div>
                          <h3>{selectedChat.sellerName}</h3>
                          <span className="online-status">Online</span>
                        </div>
                      </div>
                    </div>

                    <div className="chat-messages">
                      {selectedChat.messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender}`}>
                          <div className="message-bubble">
                            <p>{msg.text}</p>
                            <span className="message-time">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="chat-input-container">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && messageText.trim()) {
                            handleSendMessage();
                          }
                        }}
                      />
                      <button 
                        className="send-btn"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <FiSend />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <FiMessageSquare size={64} />
                    <h3>Select a conversation</h3>
                    <p>Choose a seller from the list to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <div className="section-header">
              <div>
                <h1>Account Settings</h1>
                <p>Manage your preferences and security</p>
              </div>
            </div>

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
                  <label htmlFor="profileImageInput" className="upload-image-btn">
                    <FiEdit2 /> Choose Image
                  </label>
                  {profileImage && (
                    <button 
                      className="save-image-btn" 
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Save Image'}
                    </button>
                  )}
                  {profileImagePreview && !profileImage && (
                    <button className="delete-image-btn" onClick={handleImageDelete}>
                      <FiX /> Remove
                    </button>
                  )}
                  <p className="image-hint">Max size: 5MB. Formats: JPG, PNG, WEBP</p>
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

                <div className="info-field">
                  <label><FiMapPin /> City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={editData.city}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.city}</p>
                  )}
                </div>

                <div className="info-field full-width">
                  <label><FiMapPin /> Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={editData.address}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{userData.address}</p>
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
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={newAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-field">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="+977 9812345678"
                      />
                    </div>
                    <div className="form-field">
                      <label>State/Province</label>
                      <select
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                      >
                        <option value="">Select State</option>
                        {getProvinces().map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>District</label>
                      <select
                        name="district"
                        value={newAddress.district}
                        onChange={handleAddressChange}
                        disabled={!newAddress.state}
                      >
                        <option value="">Select District</option>
                        {newAddress.state && getDistrictsByProvince(newAddress.state).map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Municipality</label>
                      <select
                        name="municipality"
                        value={newAddress.municipality}
                        onChange={handleAddressChange}
                        disabled={!newAddress.district}
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
                      <label>City/Area</label>
                      <select
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        disabled={!newAddress.municipality}
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
                      <label>Nearest Landmark</label>
                      <input
                        type="text"
                        name="landmark"
                        value={newAddress.landmark}
                        onChange={handleAddressChange}
                        placeholder="e.g., Near Ratna Park, Opposite City Mall"
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
                    <button className="save-btn-small" onClick={handleSaveAddress}>
                      <FiSave /> Save Address
                    </button>
                    <button className="cancel-btn-small" onClick={() => setShowAddressForm(false)}>
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
                      <div className="activity-item">
                        <div className="activity-icon success">✓</div>
                        <div className="activity-details">
                          <h4>March 13, 2026 - 10:30 AM</h4>
                          <p>Windows PC - Kathmandu, Nepal</p>
                          <span className="activity-status">Current Session</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon success">✓</div>
                        <div className="activity-details">
                          <h4>March 12, 2026 - 3:45 PM</h4>
                          <p>Mobile Device - Kathmandu, Nepal</p>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon success">✓</div>
                        <div className="activity-details">
                          <h4>March 11, 2026 - 9:15 AM</h4>
                          <p>Windows PC - Kathmandu, Nepal</p>
                        </div>
                      </div>
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

            {/* Order Verification Modal */}
            {showVerificationModal && selectedOrder && (
              <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Verify Order Condition</h2>
                    <button className="close-modal" onClick={() => setShowVerificationModal(false)}>
                      <FiX />
                    </button>
                  </div>
                  <div className="modal-body">
                    <p style={{marginBottom: '20px', color: '#666'}}>
                      Order: <strong>{selectedOrder.id}</strong>
                    </p>
                    <div className="verification-question">
                      <label>Does the item match the seller's description?</label>
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
                    <div className="form-field">
                      <label>Additional Notes (Optional)</label>
                      <textarea
                        value={verificationData.customerNotes}
                        onChange={(e) => setVerificationData({...verificationData, customerNotes: e.target.value})}
                        placeholder="Any comments about the item condition..."
                        rows="4"
                        style={{width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontFamily: 'Arial, sans-serif'}}
                      />
                    </div>
                    {verificationData.matchesDescription === true && (
                      <p className="bonus-note">🎁 You will earn 50 bonus loyalty points!</p>
                    )}
                    <div className="modal-actions">
                      <button className="save-btn" onClick={submitVerification}>
                        <FiSave /> Submit Verification
                      </button>
                      <button className="cancel-btn" onClick={() => setShowVerificationModal(false)}>
                        <FiX /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
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
                <button className="setting-btn" onClick={handleEnable2FA}>Enable</button>
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
              <h3>Notifications</h3>
              <div className="setting-item">
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive updates about your orders and promotions</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>SMS Notifications</h4>
                  <p>Get order updates via SMS</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications on your device</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Order Status Updates</h4>
                  <p>Get notified when your order status changes</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Promotional Emails</h4>
                  <p>Receive special offers and discount codes</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-card">
              <h3>Privacy & Data</h3>
              <div className="setting-item">
                <div>
                  <h4>Profile Visibility</h4>
                  <p>Control who can see your profile information</p>
                </div>
                <select className="setting-select">
                  <option>Public</option>
                  <option>Private</option>
                  <option>Friends Only</option>
                </select>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Purchase History Visibility</h4>
                  <p>Show or hide your purchase history from others</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Data Sharing</h4>
                  <p>Allow sharing data with partners for better experience</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Download My Data</h4>
                  <p>Get a copy of all your account data</p>
                </div>
                <button className="setting-btn" onClick={handleDownloadData}>Download</button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Payment & Billing</h3>
              <div className="setting-item">
                <div>
                  <h4>Saved Payment Methods</h4>
                  <p>Manage your saved cards and payment options</p>
                </div>
                <button className="setting-btn" onClick={handleManagePaymentMethods}>Manage</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Billing Address</h4>
                  <p>Update your default billing address</p>
                </div>
                <button className="setting-btn" onClick={() => setActiveTab('settings')}>Edit</button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Transaction History</h4>
                  <p>View all your payment transactions</p>
                </div>
                <button className="setting-btn" onClick={handleViewTransactionHistory}>View</button>
              </div>
            </div>

            <div className="settings-card">
              <h3>Language & Region</h3>
              <div className="setting-item">
                <div>
                  <h4>Language</h4>
                  <p>Choose your preferred language</p>
                </div>
                <select className="setting-select">
                  <option>English</option>
                  <option>Nepali</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Currency</h4>
                  <p>Select your preferred currency</p>
                </div>
                <select className="setting-select">
                  <option>NPR (Rs.)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Time Zone</h4>
                  <p>Set your local time zone</p>
                </div>
                <select className="setting-select">
                  <option>Asia/Kathmandu (GMT+5:45)</option>
                  <option>Asia/Kolkata (GMT+5:30)</option>
                  <option>UTC</option>
                </select>
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
      </main>

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
    </div>
  );
}

export default BuyerProfile;
