import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX, FiFilter, FiArrowRight, FiTag, FiBell, FiPackage, FiHeart, FiStar, FiRotateCcw, FiLogOut, FiSettings, FiMessageSquare, FiGift, FiCheckCircle } from 'react-icons/fi';
import Chatbot from './components/Chatbot';
import { productAPI, cartAPI } from './services/api';

function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaqTab, setActiveFaqTab] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fallback products for demo (if backend has no products)
  const demoProducts = [
    { id: 1, name: 'Hoodie', price: 5100, category: 'NEW', image: 'https://i.pinimg.com/1200x/85/50/eb/8550eb7065f3ae9b2617558814ff21f7.jpg', rating: 4.5, reviews: 128 },
    { id: 2, name: 'T-Shirt', price: 3000, category: 'BEST', image: 'https://i.pinimg.com/736x/28/68/77/2868771ebc5e4708ba23a67646d12663.jpg', rating: 4.8, reviews: 245 },
    { id: 3, name: 'Vintage Jacket', price: 8000, category: 'TOP', image: 'https://i.pinimg.com/1200x/06/56/44/065644e9485e9b7010771873bc5b61c8.jpg', rating: 4.9, reviews: 189 },
    { id: 4, name: 'Jersey', price: 4200, category: 'NEW', image: 'https://i.pinimg.com/1200x/9f/66/52/9f665241f2a2f3347c91a5f0104b2733.jpg', rating: 4.3, reviews: 92 },
    { id: 5, name: 'Blazer', price: 3100, category: 'BEST', image: 'https://i.pinimg.com/736x/f5/6e/01/f56e016ac0abff71aff30bf64cab7b83.jpg', rating: 4.6, reviews: 156 },
    { id: 6, name: 'Jeans', price: 4100, category: 'TOP', image: 'https://i.pinimg.com/1200x/d3/71/05/d371058d1ac4ee47396aaa35a37f0684.jpg', rating: 4.7, reviews: 203 },
    { id: 7, name: 'Jacket', price: 5200, category: 'NEW', image: 'https://i.pinimg.com/1200x/1a/96/f6/1a96f6aed31f53371dd7d9642d4b01c0.jpg', rating: 4.4, reviews: 134 },
    { id: 8, name: 'Jorts', price: 3100, category: 'BEST', image: 'https://i.pinimg.com/736x/78/52/04/7852042ddd26913b9576eb80db5515a2.jpg', rating: 4.2, reviews: 87 },
    { id: 9, name: 'Denim Jacket', price: 6500, category: 'TOP', image: 'https://i.pinimg.com/736x/bc/83/08/bc8308ad115003adae43e7743ef2254f.jpg', rating: 4.8, reviews: 167 },
    { id: 10, name: 'Cargo Pants', price: 4800, category: 'NEW', image: 'https://i.pinimg.com/736x/db/ca/a2/dbcaa2ff3acec468b323a56ce5c6461a.jpg', rating: 4.5, reviews: 112 },
    { id: 11, name: 'Sweater', price: 3800, category: 'BEST', image: 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg', rating: 4.6, reviews: 198 },
    { id: 12, name: 'Leather Jacket', price: 9500, category: 'TOP', image: 'https://i.pinimg.com/1200x/0c/84/90/0c8490ba8312437f20816c196febce73.jpg', rating: 4.9, reviews: 221 },
    { id: 13, name: 'Polo Shirt', price: 2800, category: 'NEW', image: 'https://i.pinimg.com/736x/28/68/77/2868771ebc5e4708ba23a67646d12663.jpg', rating: 4.3, reviews: 89 },
    { id: 14, name: 'Chinos', price: 3500, category: 'BEST', image: 'https://i.pinimg.com/1200x/d3/71/05/d371058d1ac4ee47396aaa35a37f0684.jpg', rating: 4.4, reviews: 145 },
    { id: 15, name: 'Bomber Jacket', price: 7200, category: 'TOP', image: 'https://i.pinimg.com/1200x/1a/96/f6/1a96f6aed31f53371dd7d9642d4b01c0.jpg', rating: 4.7, reviews: 176 },
    { id: 16, name: 'Shorts', price: 2500, category: 'NEW', image: 'https://i.pinimg.com/736x/78/52/04/7852042ddd26913b9576eb80db5515a2.jpg', rating: 4.2, reviews: 73 },
    { id: 17, name: 'Windbreaker', price: 5800, category: 'BEST', image: 'https://i.pinimg.com/1200x/85/50/eb/8550eb7065f3ae9b2617558814ff21f7.jpg', rating: 4.5, reviews: 132 },
    { id: 18, name: 'Track Pants', price: 3200, category: 'TOP', image: 'https://i.pinimg.com/736x/db/ca/a2/dbcaa2ff3acec468b323a56ce5c6461a.jpg', rating: 4.3, reviews: 95 },
    { id: 19, name: 'Puffer Jacket', price: 8500, category: 'NEW', image: 'https://i.pinimg.com/1200x/06/56/44/065644e9485e9b7010771873bc5b61c8.jpg', rating: 4.8, reviews: 187 },
    { id: 20, name: 'Sweatpants', price: 2900, category: 'BEST', image: 'https://i.pinimg.com/1200x/d3/71/05/d371058d1ac4ee47396aaa35a37f0684.jpg', rating: 4.4, reviews: 108 },
    { id: 21, name: 'Flannel Shirt', price: 3400, category: 'TOP', image: 'https://i.pinimg.com/736x/28/68/77/2868771ebc5e4708ba23a67646d12663.jpg', rating: 4.6, reviews: 154 },
    { id: 22, name: 'Trench Coat', price: 9800, category: 'NEW', image: 'https://i.pinimg.com/1200x/0c/84/90/0c8490ba8312437f20816c196febce73.jpg', rating: 4.9, reviews: 213 },
    { id: 23, name: 'Graphic Tee', price: 2200, category: 'BEST', image: 'https://i.pinimg.com/736x/28/68/77/2868771ebc5e4708ba23a67646d12663.jpg', rating: 4.2, reviews: 67 },
    { id: 24, name: 'Overalls', price: 4500, category: 'TOP', image: 'https://i.pinimg.com/1200x/d3/71/05/d371058d1ac4ee47396aaa35a37f0684.jpg', rating: 4.5, reviews: 119 },
  ];

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Sync cart with backend when user is logged in
      syncCartWithBackend(parsedUser._id);
      
      // Fetch notifications if user is a customer
      if (parsedUser.userType === 'customer') {
        fetchNotifications(parsedUser._id);
      }
    } else {
      // Clear cart for non-logged-in users
      setCart([]);
      localStorage.removeItem('cart');
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    // Fetch products from backend
    fetchProducts();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        setCart(JSON.parse(updatedCart));
      } else {
        setCart([]);
      }
    };
    
    // Listen for user profile updates
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const syncCartWithBackend = async (customerId) => {
    try {
      // Get backend cart first
      const backendCart = await cartAPI.get(customerId);
      
      // If backend has cart items, use them and update localStorage
      if (backendCart.items && backendCart.items.length > 0) {
        const formattedCart = backendCart.items.map(item => ({
          id: item.product._id || item.product,
          name: item.product.name || item.productName,
          price: item.product.price || item.price,
          image: (item.product.images && item.product.images[0]) || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          quantity: item.quantity,
          seller: item.product.seller || item.seller,
          sellerName: item.product.sellerName || item.sellerName,
          storeName: item.product.storeName || item.storeName,
          condition: item.product.condition,
          category: item.product.category
        }));
        
        setCart(formattedCart);
        localStorage.setItem('cart', JSON.stringify(formattedCart));
      } else {
        // Backend cart is empty - clear localStorage and set empty cart
        setCart([]);
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      // On error, just set empty cart
      setCart([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:5000/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Map backend products to frontend format
        const mappedProducts = data.map(p => ({
          id: p._id,
          _id: p._id,
          name: p.name,
          price: p.price,
          discountedPrice: p.discount?.active ? p.price * (1 - p.discount.percentage / 100) : null,
          category: 'NEW',
          backendCategory: p.category,
          subcategory: p.subcategory,
          image: (p.images && p.images[0]) || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          images: p.images || [],
          rating: p.averageRating || 0,
          reviews: p.reviewCount || 0,
          condition: p.condition,
          size: p.size,
          brand: p.brand,
          description: p.description || '',
          story: p.story,
          seller: p.seller,
          sellerName: p.sellerName,
          storeName: p.storeName,
          stock: p.stock,
          paymentOptions: p.paymentOptions
        }));
        
        setAllProducts(mappedProducts);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.message);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on active tab, category, subcategory, and search
  // Temporarily show all products to diagnose the issue
  const filteredProducts = allProducts;

  const handleCategoryClick = (category) => {
    document.querySelector('.trending-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubcategoryClick = (subcategory, collection) => {
    // Navigate to appropriate outlet page based on collection
    if (collection === 'men') {
      navigate('/mens-outlet', { state: { subcategory } });
    } else if (collection === 'women') {
      navigate('/womens-outlet', { state: { subcategory } });
    } else if (collection === 'sportswear') {
      navigate('/shop', { state: { category: 'Sportswear', subcategory } });
    } else if (collection === 'vintage') {
      navigate('/shop', { state: { category: 'Vintage', subcategory } });
    } else {
      // Fallback to landing page filtering
      document.querySelector('.trending-products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopNow = () => {
    navigate('/shop');
  };

  const handleExploreMore = () => {
    document.querySelector('.trending-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show only first 4 products
  const displayedProducts = filteredProducts.slice(0, 4);

  const removeFromCart = async (productId) => {
    try {
      // Remove from backend first if user is logged in
      if (user && user._id) {
        try {
          await cartAPI.remove(user._id, productId);
          
          // Fetch updated cart from backend
          const backendCart = await cartAPI.get(user._id);
          const formattedCart = backendCart.items.map(item => ({
            id: item.product._id || item.product,
            name: item.product.name || item.productName,
            price: item.product.price || item.price,
            image: (item.product.images && item.product.images[0]) || item.productImage || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
            quantity: item.quantity,
            seller: item.product.seller || item.seller,
            sellerName: item.product.sellerName || item.sellerName,
            storeName: item.product.storeName || item.storeName
          }));
          
          setCart(formattedCart);
          localStorage.setItem('cart', JSON.stringify(formattedCart));
          return;
        } catch (error) {
          console.error('Backend remove error, using localStorage:', error);
        }
      }
      
      // Fallback to localStorage
      const newCart = cart.filter(item => item.id !== productId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      return;
    }
    // Just keep suggestions open, no modal
    setShowSuggestions(true);
  };

  // Fetch search suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchSuggestions({});
      return;
    }
    
    try {
      const response = await productAPI.getSuggestions(query);
      if (response.success) {
        const formattedSuggestions = {
          products: response.suggestions.products.map(p => ({
            ...p,
            type: 'product'
          })),
          collections: [
            ...response.suggestions.categories.map(c => ({
              name: c.name,
              type: 'category'
            })),
            ...response.suggestions.brands.map(b => ({
              name: b.name,
              type: 'brand'
            }))
          ],
          sellers: response.suggestions.sellers.map(s => ({
            ...s,
            type: 'seller'
          }))
        };
        
        setSearchSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions({});
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchSuggestions({});
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      // Show recent searches when input is empty
      setShowSuggestions(true);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 300);
  };

  // Save search to recent searches
  const saveRecentSearch = (searchTerm, type, id = null) => {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newSearch = {
      term: searchTerm,
      type: type, // 'product', 'seller', 'page'
      id: id,
      timestamp: Date.now()
    };
    
    // Remove duplicate if exists
    const filtered = recentSearches.filter(s => 
      !(s.term === searchTerm && s.type === type)
    );
    
    // Add to beginning and limit to 10
    const updated = [newSearch, ...filtered].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Get recent searches
  const getRecentSearches = () => {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]');
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    localStorage.setItem('recentSearches', '[]');
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      saveRecentSearch(suggestion.name, 'product', suggestion._id);
      navigate(`/product/${suggestion._id}`);
    } else if (suggestion.type === 'seller') {
      saveRecentSearch(suggestion.storeName || suggestion.name, 'seller', suggestion.id);
      navigate(`/seller/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      saveRecentSearch(suggestion.name, 'category');
      handleCategoryClick(suggestion.name.toUpperCase());
    } else if (suggestion.type === 'page') {
      saveRecentSearch(suggestion.name, 'page');
      navigate(suggestion.path);
    }
    
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
  };

  // Fetch notifications for customers
  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${userId}/unread-count`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Handle profile dropdown menu clicks
  const handleProfileMenuClick = (action) => {
    setShowProfileDropdown(false);
    
    switch(action) {
      case 'settings':
        navigate('/profile', { state: { activeTab: 'settings' } });
        break;
      case 'orders':
        navigate('/profile', { state: { activeTab: 'orders' } });
        break;
      case 'wishlist':
        navigate('/profile', { state: { activeTab: 'wishlist' } });
        break;
      case 'verification':
        navigate('/profile', { state: { activeTab: 'verification' } });
        break;
      case 'returns':
        navigate('/profile', { state: { activeTab: 'returns' } });
        break;
      case 'messages':
        navigate('/profile', { state: { activeTab: 'messages' } });
        break;
      case 'loyalty':
        navigate('/profile', { state: { activeTab: 'loyalty' } });
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileDropdown && !e.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  return (
    <div className="landing-page">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="Rebuy" />
        </div>
        
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search products, sellers, pages..." 
              value={searchQuery} 
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                style={{
                  position: 'absolute',
                  right: '45px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#999',
                  fontSize: '18px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiX />
              </button>
            )}
            <button type="submit" className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && (
            <div className="landing-search-suggestions">
              {/* Recent Searches - Show when no query */}
              {!searchQuery && (
                <>
                  {getRecentSearches().length > 0 ? (
                    <div className="suggestions-section">
                      <div className="suggestions-header">
                        <span className="suggestions-title">RECENT SEARCHES</span>
                        <button 
                          onClick={clearRecentSearches}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#00bcd4',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          CLEAR ALL
                        </button>
                      </div>
                      {getRecentSearches().map((recent, index) => (
                        <div
                          key={`recent-${index}`}
                          className="suggestion-item"
                          onClick={() => {
                            if (recent.type === 'product' && recent.id) {
                              navigate(`/product/${recent.id}`);
                            } else if (recent.type === 'seller' && recent.id) {
                              navigate(`/seller/${recent.id}`);
                            } else if (recent.type === 'page') {
                              const page = [
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '/contact' },
                                { name: 'FAQ', path: '/faq' },
                                { name: 'Shop', path: '/shop' }
                              ].find(p => p.name === recent.term);
                              if (page) navigate(page.path);
                            }
                            setShowSuggestions(false);
                          }}
                        >
                          <FiSearch className="suggestion-icon" />
                          <span className="suggestion-text">{recent.term}</span>
                          <span className="suggestion-type">{recent.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="suggestions-section">
                      <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                        No recent searches
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Products Section */}
              {searchQuery && searchSuggestions.products && searchSuggestions.products.length > 0 && (
                <div className="suggestions-section">
                  <div className="suggestions-header">
                    <span className="suggestions-title">PRODUCTS</span>
                    <FiArrowRight className="suggestions-arrow" />
                  </div>
                  {searchSuggestions.products.map((product, index) => (
                    <div
                      key={`product-${index}`}
                      className="suggestion-item product-suggestion"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        navigate(`/product/${product._id}`);
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                    >
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="suggestion-product-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="suggestion-product-placeholder">
                          <FiShoppingCart />
                        </div>
                      )}
                      <div className="suggestion-details">
                        <span className="suggestion-text">{product.name}</span>
                        <div className="suggestion-meta">
                          {product.category && (
                            <span className="suggestion-category">{product.category}</span>
                          )}
                          {product.price && (
                            <span className="suggestion-price">Rs. {product.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Collections Section */}
              {searchSuggestions.collections && searchSuggestions.collections.length > 0 && (
                <div className="suggestions-section">
                  <div className="suggestions-header">
                    <span className="suggestions-title">COLLECTIONS</span>
                    <FiArrowRight className="suggestions-arrow" />
                  </div>
                  {searchSuggestions.collections.map((collection, index) => (
                    <div
                      key={`collection-${index}`}
                      className="suggestion-item collection-suggestion"
                      onClick={() => handleSuggestionClick(collection)}
                    >
                      <div className="suggestion-icon-wrapper">
                        {collection.type === 'brand' ? <FiTag /> : <FiFilter />}
                      </div>
                      <div className="suggestion-details">
                        <span className="suggestion-text">{collection.name}</span>
                        <span className="suggestion-type">{collection.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sellers Section */}
              {searchQuery && searchSuggestions.sellers && searchSuggestions.sellers.length > 0 && (
                <div className="suggestions-section">
                  <div className="suggestions-header">
                    <span className="suggestions-title">SELLERS</span>
                    <FiArrowRight className="suggestions-arrow" />
                  </div>
                  {searchSuggestions.sellers.map((seller, index) => (
                    <div
                      key={`seller-${index}`}
                      className="suggestion-item seller-suggestion"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        saveRecentSearch(seller.storeName || seller.name, 'seller', seller._id || seller.id);
                        navigate(`/seller/${seller._id || seller.id}`);
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="suggestion-icon-wrapper">
                        <FiUser />
                      </div>
                      <div className="suggestion-seller-info">
                        <span className="suggestion-text">{seller.storeName || seller.name}</span>
                        {seller.storeName && seller.name && (
                          <span className="suggestion-subtext">{seller.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`header-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="header-links">
            {!user && <Link to="/seller" onClick={() => setMobileMenuOpen(false)}>Become a Seller</Link>}
            {user ? (
              <>
                <span>Hi, {user.fullName}</span>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Signup</Link>
              </>
            )}
          </div>

          <div className="header-icons">
            {/* Notification Bell - Only for logged-in customers */}
            {user && user.userType === 'customer' && (
              <div className="notification-icon-wrapper" onClick={() => navigate('/profile', { state: { activeTab: 'notifications' } })}>
                <FiBell />
                {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
              </div>
            )}

            {/* Cart Icon */}
            <div className="cart-icon-wrapper" onClick={() => navigate('/cart')}>
              <FiShoppingCart />
              {user && cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </div>

            {/* Profile Icon with Dropdown */}
            {user ? (
              <div className="profile-dropdown-container">
                <div 
                  className="profile-icon-wrapper" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.fullName} 
                      className="header-profile-image"
                    />
                  ) : (
                    <FiUser />
                  )}
                </div>

                {/* Profile Dropdown Menu */}
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
                      <span>My Wishlist & Followed Stores</span>
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
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="profile-link">
                <FiUser />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Cart Dropdown - Removed, now using dedicated cart page */}

      {/* Collections Navigation */}
      <nav className="collections-nav" onClick={(e) => {
        // Close dropdown when clicking outside
        if (e.target === e.currentTarget) {
          setActiveDropdown(null);
        }
      }}>
        <div 
          className="collection-dropdown"
        >
          <a 
            style={{cursor: 'pointer'}}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'men' ? null : 'men');
            }}
          >
            MEN'S COLLECTIONS
          </a>
          {activeDropdown === 'men' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Tops</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('T-Shirts', 'men'); setActiveDropdown(null); }}>T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Shirts', 'men'); setActiveDropdown(null); }}>Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Polos', 'men'); setActiveDropdown(null); }}>Polos</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Hoodies', 'men'); setActiveDropdown(null); }}>Hoodies</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Sweaters', 'men'); setActiveDropdown(null); }}>Sweaters</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Jeans', 'men'); setActiveDropdown(null); }}>Jeans</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Pants', 'men'); setActiveDropdown(null); }}>Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Shorts', 'men'); setActiveDropdown(null); }}>Shorts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Joggers', 'men'); setActiveDropdown(null); }}>Joggers</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Outerwear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Jackets', 'men'); setActiveDropdown(null); }}>Jackets</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Coats', 'men'); setActiveDropdown(null); }}>Coats</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Blazers', 'men'); setActiveDropdown(null); }}>Blazers</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vests', 'men'); setActiveDropdown(null); }}>Vests</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div 
          className="collection-dropdown"
        >
          <a 
            style={{cursor: 'pointer'}}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'women' ? null : 'women');
            }}
          >
            WOMEN'S COLLECTIONS
          </a>
          {activeDropdown === 'women' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Tops</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('T-Shirts', 'women'); setActiveDropdown(null); }}>T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Blouses', 'women'); setActiveDropdown(null); }}>Blouses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Sweaters', 'women'); setActiveDropdown(null); }}>Sweaters</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Hoodies', 'women'); setActiveDropdown(null); }}>Hoodies</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Tank Tops', 'women'); setActiveDropdown(null); }}>Tank Tops</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Jeans', 'women'); setActiveDropdown(null); }}>Jeans</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Pants', 'women'); setActiveDropdown(null); }}>Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Skirts', 'women'); setActiveDropdown(null); }}>Skirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Leggings', 'women'); setActiveDropdown(null); }}>Leggings</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Dresses</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Casual Dresses', 'women'); setActiveDropdown(null); }}>Casual Dresses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Formal Dresses', 'women'); setActiveDropdown(null); }}>Formal Dresses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Maxi Dresses', 'women'); setActiveDropdown(null); }}>Maxi Dresses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Mini Dresses', 'women'); setActiveDropdown(null); }}>Mini Dresses</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div 
          className="collection-dropdown"
        >
          <a 
            style={{cursor: 'pointer'}}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'sportswear' ? null : 'sportswear');
            }}
          >
            SPORTSWEAR COLLECTIONS
          </a>
          {activeDropdown === 'sportswear' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Athletic Wear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Sports T-Shirts', 'sportswear'); setActiveDropdown(null); }}>Sports T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Tank Tops', 'sportswear'); setActiveDropdown(null); }}>Tank Tops</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Jerseys', 'sportswear'); setActiveDropdown(null); }}>Jerseys</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Tracksuits', 'sportswear'); setActiveDropdown(null); }}>Tracksuits</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Joggers', 'sportswear'); setActiveDropdown(null); }}>Joggers</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Track Pants', 'sportswear'); setActiveDropdown(null); }}>Track Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Sports Shorts', 'sportswear'); setActiveDropdown(null); }}>Shorts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Leggings', 'sportswear'); setActiveDropdown(null); }}>Leggings</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Outerwear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Windbreakers', 'sportswear'); setActiveDropdown(null); }}>Windbreakers</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Sports Hoodies', 'sportswear'); setActiveDropdown(null); }}>Hoodies</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Sports Jackets', 'sportswear'); setActiveDropdown(null); }}>Jackets</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div 
          className="collection-dropdown"
        >
          <a 
            style={{cursor: 'pointer'}}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === 'vintage' ? null : 'vintage');
            }}
          >
            VINTAGE COLLECTIONS
          </a>
          {activeDropdown === 'vintage' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Vintage Tops</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Tops', 'vintage'); setActiveDropdown(null); }}>Vintage T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Tops', 'vintage'); setActiveDropdown(null); }}>Vintage Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Tops', 'vintage'); setActiveDropdown(null); }}>Vintage Sweaters</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Tops', 'vintage'); setActiveDropdown(null); }}>Band Tees</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Vintage Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Bottoms', 'vintage'); setActiveDropdown(null); }}>Vintage Jeans</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Bottoms', 'vintage'); setActiveDropdown(null); }}>Vintage Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Bottoms', 'vintage'); setActiveDropdown(null); }}>Vintage Shorts</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Vintage Outerwear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Outerwear', 'vintage'); setActiveDropdown(null); }}>Vintage Jackets</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Outerwear', 'vintage'); setActiveDropdown(null); }}>Vintage Coats</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Outerwear', 'vintage'); setActiveDropdown(null); }}>Leather Jackets</li>
                    <li onClick={(e) => { e.stopPropagation(); handleSubcategoryClick('Vintage Outerwear', 'vintage'); setActiveDropdown(null); }}>Denim Jackets</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>THE HOME OF REBUY</h1>
          <p>Discover second-hand thrift fashion. Shop is sustainable, affordable, and stylish.</p>
          <button className="cta-button" onClick={handleShopNow}>Shop Now</button>
        </div>
        <div className="hero-image">
          <img src="https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg" alt="Cool People Like Thrifting" />
        </div>
      </section>

      {/* Trending Products */}
      <section className="trending-products">
        <h2>OUR TRENDING PRODUCT</h2>
        {loading ? (
          <div className="loading-message">
            <p>Loading products...</p>
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="product-grid">
            {displayedProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="product-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
                  }}
                />
              </div>
              <div className="product-details">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-size">Size: {product.size || 'M'}</p>
                <p className="product-price">Rs. {product.price.toLocaleString()}</p>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <p className="no-products">No products found. Total products loaded: {allProducts.length}</p>
        )}
      </section>

      {/* Collections */}
      <section className="category-sections">
        <div className="category-card" onClick={() => navigate('/mens-outlet')} style={{cursor: 'pointer'}}>
          <div className="category-image-placeholder">
            <img 
              src="https://i.pinimg.com/474x/bc/83/08/bc8308ad115003adae43e7743ef2254f.jpg" 
              alt="Men's Apparel" 
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
              }}
            />
          </div>
          <h3>MEN'S APPAREL</h3>
          <ul>
            <li onClick={(e) => { e.stopPropagation(); navigate('/mens-hoodie'); }}>Men's Hoodie</li>
            <li onClick={(e) => { e.stopPropagation(); navigate('/mens-pants'); }}>Men's Pants</li>
            <li onClick={(e) => { e.stopPropagation(); navigate('/mens-jacket'); }}>Men's Jacket</li>
          </ul>
        </div>
        <div className="category-card" onClick={() => navigate('/womens-outlet')} style={{cursor: 'pointer'}}>
          <div className="category-image-placeholder">
            <img 
              src="https://i.pinimg.com/1200x/0c/84/90/0c8490ba8312437f20816c196febce73.jpg" 
              alt="Women's Apparel" 
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
              }}
            />
          </div>
          <h3>WOMEN'S APPAREL</h3>
          <ul>
            <li onClick={(e) => { e.stopPropagation(); navigate('/womens-skirt'); }}>Women's Skirt</li>
            <li onClick={(e) => { e.stopPropagation(); navigate('/womens-blazer'); }}>Women's Blazer</li>
            <li onClick={(e) => { e.stopPropagation(); navigate('/womens-top'); }}>Women's Top</li>
          </ul>
        </div>
        <div className="category-card" onClick={handleExploreMore} style={{cursor: 'pointer'}}>
          <div className="category-image-placeholder">
            <img 
              src="https://i.pinimg.com/736x/db/ca/a2/dbcaa2ff3acec468b323a56ce5c6461a.jpg" 
              alt="Shop Outlet" 
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
              }}
            />
          </div>
          <h3>SHOP OUTLET</h3>
          <ul>
            <li onClick={(e) => { e.stopPropagation(); navigate('/mens-outlet'); }}>Men's Outlet</li>
            <li onClick={(e) => { e.stopPropagation(); navigate('/womens-outlet'); }}>Women's Outlet</li>
          </ul>
        </div>
      </section>

      {/* News Section */}
      <section className="news-section">
        <h2>THE NEWS</h2>
        <div className="news-grid">
          <div className="news-card" onClick={() => navigate('/blog/why-thrift-shopping-matters')} style={{cursor: 'pointer'}}>
            <div className="news-image">
              <img src="https://i.pinimg.com/736x/23/50/07/235007311b603b79a509aa7fd3ac361d.jpg" alt="Sustainability" />
            </div>
            <div className="news-content">
              <span className="news-category">SUSTAINABILITY</span>
              <h3>Why Thrift Shopping Matters</h3>
              <p>Explore the environmental impact of second-hand fashion and how you can make a difference.</p>
            </div>
          </div>

          <div className="news-card" onClick={() => navigate('/blog/the-vintage-revival')} style={{cursor: 'pointer'}}>
            <div className="news-image">
              <img src="https://i.pinimg.com/1200x/79/ff/84/79ff843d4cbfe334e123e697441b3a36.jpg" alt="Fashion Stories" />
            </div>
            <div className="news-content">
              <span className="news-category">FASHION STORIES</span>
              <h3>The Vintage Revival</h3>
              <p>Discover what makes vintage fashion timeless and how to style classic pieces.</p>
            </div>
          </div>

          <div className="news-card" onClick={() => navigate('/blog/capsule-wardrobe-guide')} style={{cursor: 'pointer'}}>
            <div className="news-image">
              <img src="https://i.pinimg.com/736x/3a/aa/8f/3aaa8f28ad7f0892aeb63cce913dc3eb.jpg" alt="Style Guide" />
            </div>
            <div className="news-content">
              <span className="news-category">STYLE GUIDE</span>
              <h3>How to Build a Capsule Wardrobe</h3>
              <p>Learn the art of creating a Rebuy wardrobe with quality second-hand pieces.</p>
            </div>
          </div>

          <div className="news-card" onClick={() => navigate('/blog/meet-our-sellers')} style={{cursor: 'pointer'}}>
            <div className="news-image">
              <img src="https://i.pinimg.com/736x/e2/0a/42/e20a423958fdb7903cd5419ab02ee243.jpg" alt="Community" />
            </div>
            <div className="news-content">
              <span className="news-category">MY COMMUNITY</span>
              <h3>Meet Our Sellers</h3>
              <p>Get inspired by the stories of local sellers making sustainable fashion accessible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <h2>FREQUENTLY ASKED QUESTIONS</h2>
        <div className="faq-tabs">
          <button 
            className={activeFaqTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveFaqTab('all')}
          >
            All FAQs
          </button>
          <button 
            className={activeFaqTab === 'shipping' ? 'active' : ''} 
            onClick={() => setActiveFaqTab('shipping')}
          >
            Shipping
          </button>
          <button 
            className={activeFaqTab === 'returns' ? 'active' : ''} 
            onClick={() => setActiveFaqTab('returns')}
          >
            Returns
          </button>
        </div>
        <div className="faq-items">
          {(activeFaqTab === 'all' || activeFaqTab === 'returns') && (
            <div 
              className="faq-item" 
              style={{cursor: 'pointer'}} 
              onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
            >
              <p style={{fontWeight: '600', marginBottom: openFaqIndex === 0 ? '8px' : '0'}}>
                Can I cancel my order?
              </p>
              {openFaqIndex === 0 && (
                <p style={{fontSize: '13px', color: '#666', marginTop: '8px'}}>
                  You can cancel your order within 24 hours of placing it from your profile page.
                </p>
              )}
            </div>
          )}
          {(activeFaqTab === 'all' || activeFaqTab === 'shipping') && (
            <div 
              className="faq-item" 
              style={{cursor: 'pointer'}} 
              onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
            >
              <p style={{fontWeight: '600', marginBottom: openFaqIndex === 1 ? '8px' : '0'}}>
                Can I change the shipping address on my order?
              </p>
              {openFaqIndex === 1 && (
                <p style={{fontSize: '13px', color: '#666', marginTop: '8px'}}>
                  You can change the shipping address before the order is shipped. Contact support for assistance.
                </p>
              )}
            </div>
          )}
          {(activeFaqTab === 'all' || activeFaqTab === 'returns') && (
            <div 
              className="faq-item" 
              style={{cursor: 'pointer'}} 
              onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
            >
              <p style={{fontWeight: '600', marginBottom: openFaqIndex === 2 ? '8px' : '0'}}>
                Can I add or remove an item from my order?
              </p>
              {openFaqIndex === 2 && (
                <p style={{fontSize: '13px', color: '#666', marginTop: '8px'}}>
                  You cannot modify items after placing an order. Please cancel and create a new order.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-section">
          <h4>SHOP BY</h4>
          <ul>
            <li onClick={() => handleCategoryClick('MEN')} style={{cursor: 'pointer'}}>Men</li>
            <li onClick={() => handleCategoryClick('WOMEN')} style={{cursor: 'pointer'}}>Women</li>
            <li onClick={handleExploreMore} style={{cursor: 'pointer'}}>sportswear</li>
            <li onClick={handleExploreMore} style={{cursor: 'pointer'}}>vintage</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>COMPANY INFO</h4>
          <ul>
            <li onClick={() => navigate('/about')} style={{cursor: 'pointer'}}>About Us</li>
            <li onClick={() => navigate('/sustainability')} style={{cursor: 'pointer'}}>Sustainability</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>SUPPORT</h4>
          <ul>
            <li onClick={() => navigate('/faq')} style={{cursor: 'pointer'}}>F.A.Q</li>
            <li onClick={() => navigate('/order-status')} style={{cursor: 'pointer'}}>Order Status</li>
            <li onClick={() => navigate('/payment-options')} style={{cursor: 'pointer'}}>Payment Options</li>
            <li onClick={() => navigate('/contact')} style={{cursor: 'pointer'}}>Contact Us</li>
          </ul>
        </div>
        <div className="footer-logo">
          <img src="/logo.png" alt="Rebuy" style={{height: '80px', marginBottom: '3px'}} />
          <p>THRIFT SHOP</p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default LandingPage;
