// API Base URL
const API_URL = 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  signup: (userData) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  changePassword: (userId, passwordData) => apiCall(`/auth/change-password/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),
};

// Product APIs
export const productAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiCall(`/products/${id}`),
  
  search: (query) => apiCall(`/products?search=${encodeURIComponent(query)}`),
  
  getByCategory: (category) => apiCall(`/products?category=${category}`),
};

// Cart APIs
export const cartAPI = {
  get: (customerId) => apiCall(`/cart/${customerId}`),
  
  add: (customerId, productId, quantity = 1) => apiCall(`/cart/${customerId}/add`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  }),
  
  update: (customerId, productId, quantity) => apiCall(`/cart/${customerId}/update`, {
    method: 'PATCH',
    body: JSON.stringify({ productId, quantity }),
  }),
  
  remove: (customerId, productId) => apiCall(`/cart/${customerId}/remove/${productId}`, {
    method: 'DELETE',
  }),
  
  clear: (customerId) => apiCall(`/cart/${customerId}/clear`, {
    method: 'DELETE',
  }),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  getCustomerOrders: (customerId) => apiCall(`/orders/customer/${customerId}`),
  
  getById: (orderId) => apiCall(`/orders/${orderId}`),
  
  updateStatus: (orderId, status) => apiCall(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  verifyCondition: (orderId, verificationData) => apiCall(`/orders/${orderId}/verify-condition`, {
    method: 'POST',
    body: JSON.stringify(verificationData),
  }),
  
  cancel: (orderId) => apiCall(`/orders/${orderId}/cancel`, {
    method: 'POST',
  }),
};

// Loyalty APIs
export const loyaltyAPI = {
  get: (customerId) => apiCall(`/loyalty/${customerId}`),
  
  redeem: (customerId, points, reason) => apiCall(`/loyalty/${customerId}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ points, reason }),
  }),
};

// Review APIs
export const reviewAPI = {
  getByProduct: (productId) => apiCall(`/reviews/product/${productId}`),
  
  submit: (reviewData) => apiCall('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),
  
  markHelpful: (reviewId) => apiCall(`/reviews/${reviewId}/helpful`, {
    method: 'PUT',
  }),
};

// Wishlist APIs
export const wishlistAPI = {
  get: (customerId) => apiCall(`/wishlist/${customerId}`),
  
  add: (customerId, productId) => apiCall(`/wishlist/${customerId}/add`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  
  remove: (customerId, productId) => apiCall(`/wishlist/${customerId}/remove/${productId}`, {
    method: 'DELETE',
  }),
};

// Seller APIs
export const sellerAPI = {
  get: (sellerId) => apiCall(`/sellers/${sellerId}`),
  
  update: (sellerId, sellerData) => apiCall(`/sellers/${sellerId}`, {
    method: 'PUT',
    body: JSON.stringify(sellerData),
  }),
  
  getProducts: (sellerId) => apiCall(`/sellers/${sellerId}/products`),
  
  getStats: (sellerId) => apiCall(`/sellers/${sellerId}/stats`),
  
  addProduct: (productData) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  
  updateProduct: (productId, productData) => apiCall(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  
  deleteProduct: (productId) => apiCall(`/products/${productId}`, {
    method: 'DELETE',
  }),
};

// Customer APIs
export const customerAPI = {
  get: (userId) => apiCall(`/customers/${userId}`),
  
  update: (userId, customerData) => apiCall(`/customers/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  }),
  
  getAddresses: (userId) => apiCall(`/customers/${userId}/addresses`),
  
  addAddress: (userId, addressData) => apiCall(`/customers/${userId}/addresses`, {
    method: 'POST',
    body: JSON.stringify(addressData),
  }),
  
  updateAddress: (userId, addressId, addressData) => apiCall(`/customers/${userId}/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  }),
  
  deleteAddress: (userId, addressId) => apiCall(`/customers/${userId}/addresses/${addressId}`, {
    method: 'DELETE',
  }),
  
  setDefaultAddress: (userId, addressId) => apiCall(`/customers/${userId}/addresses/${addressId}/default`, {
    method: 'PATCH',
  }),
  
  updatePreferences: (userId, preferences) => apiCall(`/customers/${userId}/preferences`, {
    method: 'PATCH',
    body: JSON.stringify(preferences),
  }),
  
  updateStatus: (userId, status) => apiCall(`/customers/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  update2FA: (userId, enabled) => apiCall(`/customers/${userId}/2fa`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  }),
  
  addLoginHistory: (userId, loginData) => apiCall(`/customers/${userId}/login-history`, {
    method: 'POST',
    body: JSON.stringify(loginData),
  }),
  
  uploadProfileImage: async (userId, imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    
    const response = await fetch(`${API_URL}/customers/${userId}/profile-image`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    
    return data;
  },
  
  deleteProfileImage: (userId) => apiCall(`/customers/${userId}/profile-image`, {
    method: 'DELETE',
  }),
};

export default {
  auth: authAPI,
  products: productAPI,
  cart: cartAPI,
  orders: orderAPI,
  loyalty: loyaltyAPI,
  reviews: reviewAPI,
  wishlist: wishlistAPI,
  seller: sellerAPI,
  customer: customerAPI,
};
