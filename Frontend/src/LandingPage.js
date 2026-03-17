import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import { FiSearch, FiUser, FiShoppingCart, FiHeart, FiMenu, FiX, FiFilter } from 'react-icons/fi';
import Chatbot from './components/Chatbot';
import AdvancedSearch from './components/AdvancedSearch';
import { productAPI, cartAPI, wishlistAPI } from './services/api';

function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeFaqTab, setActiveFaqTab] = useState('all');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ products: [], sellers: [], pages: [] });
  const [activeDropdown, setActiveDropdown] = useState(null);

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
    } else {
      // Load cart from localStorage for guest users
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    // Fetch products from backend
    fetchProducts();
  }, []);

  const syncCartWithBackend = async (customerId) => {
    try {
      // Get localStorage cart
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Get backend cart
      const backendCart = await cartAPI.get(customerId);
      
      // If backend has cart items, use them
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
        return;
      }
      
      // If local cart exists but backend is empty, sync to backend
      if (localCart.length > 0) {
        for (const item of localCart) {
          try {
            await cartAPI.add(customerId, item.id, item.quantity);
          } catch (error) {
            console.error('Error syncing item to backend:', error);
          }
        }
        setCart(localCart);
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
      // Fallback to localStorage cart on error
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const products = await productAPI.getAll({ limit: 50 });
      
      if (products && products.length > 0) {
        // Map backend products to frontend format
        const mappedProducts = products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          category: p.featured ? 'TOP' : 'NEW',
          image: p.images[0] || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          rating: p.rating || 4.5,
          reviews: p.reviews || 0,
          condition: p.condition,
          story: p.story,
          seller: p.seller,
          sellerName: p.sellerName,
          storeName: p.storeName
        }));
        setAllProducts(mappedProducts);
        // Save to localStorage for wishlist access
        localStorage.setItem('allProducts', JSON.stringify(mappedProducts));
      } else {
        // Use demo products if backend is empty
        setAllProducts(demoProducts);
        localStorage.setItem('allProducts', JSON.stringify(demoProducts));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use demo products on error
      setAllProducts(demoProducts);
      localStorage.setItem('allProducts', JSON.stringify(demoProducts));
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on active tab, category, and search
  const filteredProducts = allProducts.filter(product => {
    const matchesTab = activeTab === 'ALL' || product.category === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
      (selectedCategory === 'MEN' && product.name.toLowerCase().includes('men')) ||
      (selectedCategory === 'WOMEN' && product.name.toLowerCase().includes('women')) ||
      (selectedCategory === 'KIDS' && product.name.toLowerCase().includes('kid')) ||
      (selectedCategory === 'SPORTSWEAR' && product.name.toLowerCase().includes('sport')) ||
      (selectedCategory === 'VINTAGE' && product.name.toLowerCase().includes('vintage'));
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setActiveTab('ALL');
    document.querySelector('.trending-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShopNow = () => {
    navigate('/shop');
  };

  const handleExploreMore = () => {
    setShowAllProducts(true);
    document.querySelector('.trending-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show only first 8 products initially, or all if "View All" is clicked
  const displayedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 8);

  const toggleFavorite = (productId) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addToCart = async (product) => {
    try {
      // Check if user is logged in
      if (user && user._id) {
        // Add to backend first
        try {
          await cartAPI.add(user._id, product.id, 1);
          
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
          alert(`${product.name} added to cart!`);
          return;
        } catch (error) {
          console.error('Backend cart error, using localStorage:', error);
        }
      }
      
      // Fallback to localStorage for guest users or if backend fails
      const existingItem = cart.find(item => item.id === product.id);
      let newCart;

      if (existingItem) {
        newCart = cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...cart, { ...product, quantity: 1 }];
      }

      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

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

  const updateQuantity = async (productId, change) => {
    try {
      const item = cart.find(i => i.id === productId);
      if (!item) return;
      
      const newQuantity = item.quantity + change;
      
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      // Update backend first if user is logged in
      if (user && user._id) {
        try {
          await cartAPI.update(user._id, productId, newQuantity);
          
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
          console.error('Backend update error, using localStorage:', error);
        }
      }
      
      // Fallback to localStorage
      const newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );

      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      return;
    }
    performSearch(searchQuery);
  };

  const performSearch = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Search products
    const matchedProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      (product.condition && product.condition.toLowerCase().includes(lowerQuery)) ||
      (product.story && product.story.toLowerCase().includes(lowerQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerQuery))
    );

    // Search sellers (from products)
    const sellersMap = new Map();
    allProducts.forEach(product => {
      if (product.sellerName && product.sellerName.toLowerCase().includes(lowerQuery)) {
        if (!sellersMap.has(product.seller)) {
          sellersMap.set(product.seller, {
            id: product.seller,
            name: product.sellerName,
            storeName: product.storeName || product.sellerName,
            productCount: 1
          });
        } else {
          const seller = sellersMap.get(product.seller);
          seller.productCount++;
        }
      }
      if (product.storeName && product.storeName.toLowerCase().includes(lowerQuery)) {
        if (!sellersMap.has(product.seller)) {
          sellersMap.set(product.seller, {
            id: product.seller,
            name: product.sellerName,
            storeName: product.storeName,
            productCount: 1
          });
        } else {
          const seller = sellersMap.get(product.seller);
          seller.productCount++;
        }
      }
    });
    const matchedSellers = Array.from(sellersMap.values());

    // Search pages
    const pages = [
      { name: 'About Us', path: '/about', keywords: ['about', 'company', 'us', 'team', 'mission'] },
      { name: 'Contact', path: '/contact', keywords: ['contact', 'support', 'help', 'email', 'phone'] },
      { name: 'Become a Seller', path: '/seller', keywords: ['seller', 'sell', 'vendor', 'merchant', 'shop'] },
      { name: 'FAQ', path: '/faq', keywords: ['faq', 'questions', 'help', 'answers', 'support'] },
      { name: 'Careers', path: '/careers', keywords: ['careers', 'jobs', 'work', 'hiring', 'employment'] },
      { name: 'Press', path: '/press', keywords: ['press', 'media', 'news', 'announcements'] },
      { name: 'Sustainability', path: '/sustainability', keywords: ['sustainability', 'environment', 'green', 'eco'] },
      { name: 'Affiliates', path: '/affiliates', keywords: ['affiliates', 'partner', 'commission', 'earn'] },
      { name: 'Order Status', path: '/order-status', keywords: ['order', 'status', 'track', 'tracking', 'delivery'] },
      { name: 'Payment Options', path: '/payment-options', keywords: ['payment', 'pay', 'esewa', 'khalti', 'card', 'cod'] },
      { name: 'My Cart', path: '/cart', keywords: ['cart', 'basket', 'checkout'] },
      { name: 'My Profile', path: '/profile', keywords: ['profile', 'account', 'settings', 'orders', 'wishlist'] }
    ];

    const matchedPages = pages.filter(page => 
      page.name.toLowerCase().includes(lowerQuery) ||
      page.keywords.some(keyword => keyword.includes(lowerQuery))
    );

    setSearchResults({
      products: matchedProducts,
      sellers: matchedSellers,
      pages: matchedPages
    });
    setShowSearchResults(true);
  };

  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="landing-page">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Search Results Modal */}
      {showSearchResults && (
        <div className="search-modal-overlay" onClick={closeSearchResults}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h2>Search Results for "{searchQuery}"</h2>
              <button className="close-search-btn" onClick={closeSearchResults}>
                <FiX size={24} />
              </button>
            </div>

            <div className="search-modal-content">
              {/* Products Results */}
              {searchResults.products.length > 0 && (
                <div className="search-section">
                  <h3>Products ({searchResults.products.length})</h3>
                  <div className="search-products-grid">
                    {searchResults.products.slice(0, 8).map(product => (
                      <div 
                        key={product.id} 
                        className="search-product-card"
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          closeSearchResults();
                        }}
                      >
                        <img 
                          src={product.image} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
                          }}
                        />
                        <div className="search-product-info">
                          <h4>{product.name}</h4>
                          <p className="search-product-price">Rs. {product.price.toLocaleString()}</p>
                          {product.sellerName && (
                            <p className="search-product-seller">by {product.sellerName}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {searchResults.products.length > 8 && (
                    <p className="search-more">
                      +{searchResults.products.length - 8} more products. Scroll down to see all.
                    </p>
                  )}
                </div>
              )}

              {/* Sellers Results */}
              {searchResults.sellers.length > 0 && (
                <div className="search-section">
                  <h3>Sellers ({searchResults.sellers.length})</h3>
                  <div className="search-sellers-list">
                    {searchResults.sellers.map(seller => (
                      <div 
                        key={seller.id} 
                        className="search-seller-card"
                        onClick={() => {
                          // Filter products by this seller
                          setSearchQuery(seller.storeName);
                          performSearch(seller.storeName);
                        }}
                      >
                        <div className="search-seller-icon">
                          <FiUser size={24} />
                        </div>
                        <div className="search-seller-info">
                          <h4>{seller.storeName}</h4>
                          <p>{seller.productCount} product{seller.productCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pages Results */}
              {searchResults.pages.length > 0 && (
                <div className="search-section">
                  <h3>Pages ({searchResults.pages.length})</h3>
                  <div className="search-pages-list">
                    {searchResults.pages.map((page, index) => (
                      <div 
                        key={index} 
                        className="search-page-card"
                        onClick={() => {
                          navigate(page.path);
                          closeSearchResults();
                        }}
                      >
                        <FiSearch size={20} />
                        <span>{page.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResults.products.length === 0 && 
               searchResults.sellers.length === 0 && 
               searchResults.pages.length === 0 && (
                <div className="search-no-results">
                  <FiSearch size={48} color="#ccc" />
                  <h3>No results found</h3>
                  <p>Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button type="submit" className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>
        </div>

        <div className={`header-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="header-links">
            <Link to="/seller" onClick={() => setMobileMenuOpen(false)}>Become a Seller</Link>
            {user ? (
              <>
                <span>Hi, {user.fullName}</span>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: '14px', fontWeight: 500}}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Signup</Link>
              </>
            )}
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>

          <div className="header-icons">
            <div className="cart-icon-wrapper" onClick={() => navigate('/cart')}>
              <FiShoppingCart />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </div>
            <Link to={user ? '/profile' : '/login'} onClick={() => setMobileMenuOpen(false)}>
              <FiUser />
            </Link>
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
            <span className="dropdown-arrow">▼</span>
          </a>
          {activeDropdown === 'men' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-sidebar">
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Shop by Category →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Shop by Size →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Shop by Brand →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>New Arrivals →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Sale Items →</div>
              </div>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Tops</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Polos</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Hoodies</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Sweaters</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Jeans</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Shorts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Joggers</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Outerwear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Jackets</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Coats</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Blazers</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Vests</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Accessories</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Belts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Hats</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Bags</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); setActiveDropdown(null); }}>Watches</li>
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
            <span className="dropdown-arrow">▼</span>
          </a>
          {activeDropdown === 'women' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-sidebar">
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Shop by Category →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Shop by Size →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Shop by Brand →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>New Arrivals →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Sale Items →</div>
              </div>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Tops</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Blouses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Sweaters</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Hoodies</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Tank Tops</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Jeans</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Skirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Leggings</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Dresses</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Casual Dresses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Formal Dresses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Maxi Dresses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Mini Dresses</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Accessories</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Bags</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Jewelry</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Scarves</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); setActiveDropdown(null); }}>Sunglasses</li>
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
              setActiveDropdown(activeDropdown === 'kids' ? null : 'kids');
            }}
          >
            KID'S COLLECTIONS
            <span className="dropdown-arrow">▼</span>
          </a>
          {activeDropdown === 'kids' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-sidebar">
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Shop by Age →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Shop by Size →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Boys Collection →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Girls Collection →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Sale Items →</div>
              </div>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Boys</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Shorts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Jackets</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Girls</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Dresses</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Tops</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Skirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Leggings</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Jackets</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Accessories</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Hats</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Bags</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Socks</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); setActiveDropdown(null); }}>Gloves</li>
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
            <span className="dropdown-arrow">▼</span>
          </a>
          {activeDropdown === 'sportswear' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-sidebar">
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Shop by Sport →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Shop by Brand →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Performance Wear →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Training Gear →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Sale Items →</div>
              </div>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Athletic Wear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Sports T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Tank Tops</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Jerseys</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Tracksuits</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Joggers</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Track Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Shorts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Leggings</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Outerwear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Windbreakers</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Hoodies</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Jackets</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Accessories</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Sports Bags</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Headbands</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('SPORTSWEAR'); setActiveDropdown(null); }}>Wristbands</li>
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
            <span className="dropdown-arrow">▼</span>
          </a>
          {activeDropdown === 'vintage' && (
            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-sidebar">
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Shop by Era →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Shop by Size →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Rare Finds →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Designer Vintage →</div>
                <div className="dropdown-sidebar-item" onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Sale Items →</div>
              </div>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Vintage Tops</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage T-Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Shirts</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Sweaters</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Band Tees</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Vintage Bottoms</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Jeans</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Pants</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Shorts</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Vintage Outerwear</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Jackets</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Coats</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Leather Jackets</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Denim Jackets</li>
                  </ul>
                </div>
                <div className="dropdown-section">
                  <h4>Vintage Accessories</h4>
                  <ul>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Bags</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Hats</li>
                    <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('VINTAGE'); setActiveDropdown(null); }}>Vintage Belts</li>
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
        <div className="filter-tabs">
          <button className={activeTab === 'ALL' ? 'active' : ''} onClick={() => setActiveTab('ALL')}>ALL</button>
          <button className={activeTab === 'NEW' ? 'active' : ''} onClick={() => setActiveTab('NEW')}>NEW ARRIVALS</button>
          <button className={activeTab === 'BEST' ? 'active' : ''} onClick={() => setActiveTab('BEST')}>BEST SELLER</button>
          <button className={activeTab === 'TOP' ? 'active' : ''} onClick={() => setActiveTab('TOP')}>TOP RATED</button>
        </div>
        {loading ? (
          <div className="loading-message">
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="product-grid">
            {displayedProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="product-image-placeholder">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
                  }}
                />
                <FiHeart 
                  className={`product-heart-icon ${favorites.includes(product.id) ? 'favorited' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                />
              </div>
              <h3>{product.name}</h3>
              <div className="product-rating">
                {'⭐'.repeat(Math.floor(product.rating))} {product.rating}
              </div>
              <p>Rs. {product.price.toLocaleString()}</p>
              <button 
                className="add-to-cart-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
              >
                Add to Cart
              </button>
            </div>
            ))}
          </div>
        )}
        {!loading && filteredProducts.length === 0 && (
          <p className="no-products">No products found matching your search.</p>
        )}
        {filteredProducts.length > 8 && (
          <button 
            className="view-all" 
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? 'Show Less' : `View All Products (${filteredProducts.length})`}
          </button>
        )}
      </section>

      {/* Collections */}
      <section className="category-sections">
        <div className="category-card" onClick={() => handleCategoryClick('MEN')} style={{cursor: 'pointer'}}>
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
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); }}>Men's Jacket</li>
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); }}>Men's Shirt</li>
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); }}>Men's Pants</li>
          </ul>
        </div>
        <div className="category-card" onClick={() => handleCategoryClick('WOMEN')} style={{cursor: 'pointer'}}>
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
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); }}>Women's Jacket</li>
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); }}>Women's Shirt</li>
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); }}>Women's Pants</li>
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
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('MEN'); }}>Men's Outlet</li>
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('WOMEN'); }}>Women's Outlet</li>
            <li onClick={(e) => { e.stopPropagation(); handleCategoryClick('KIDS'); }}>Kids Outlet</li>
          </ul>
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
            <div className="faq-item" style={{cursor: 'pointer'}} onClick={() => alert('You can cancel your order within 24 hours of placing it from your profile page.')}>
              <p>Can I cancel my order?</p>
            </div>
          )}
          {(activeFaqTab === 'all' || activeFaqTab === 'shipping') && (
            <div className="faq-item" style={{cursor: 'pointer'}} onClick={() => alert('You can change the shipping address before the order is shipped. Contact support for assistance.')}>
              <p>Can I change the shipping address on my order?</p>
            </div>
          )}
          {(activeFaqTab === 'all' || activeFaqTab === 'returns') && (
            <div className="faq-item" style={{cursor: 'pointer'}} onClick={() => alert('You cannot modify items after placing an order. Please cancel and create a new order.')}>
              <p>Can I add or remove an item from my order?</p>
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
            <li onClick={() => handleCategoryClick('KIDS')} style={{cursor: 'pointer'}}>Kids</li>
            <li onClick={handleExploreMore} style={{cursor: 'pointer'}}>Brands</li>
            <li onClick={handleExploreMore} style={{cursor: 'pointer'}}>On Sale</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>COMPANY INFO</h4>
          <ul>
            <li onClick={() => navigate('/about')} style={{cursor: 'pointer'}}>About Us</li>
            <li onClick={() => navigate('/careers')} style={{cursor: 'pointer'}}>Careers</li>
            <li onClick={() => navigate('/press')} style={{cursor: 'pointer'}}>Press</li>
            <li onClick={() => navigate('/sustainability')} style={{cursor: 'pointer'}}>Sustainability</li>
            <li onClick={() => navigate('/affiliates')} style={{cursor: 'pointer'}}>Affiliates Program</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>SUPPORT</h4>
          <ul>
            <li onClick={() => navigate('/faq')} style={{cursor: 'pointer'}}>F.A.Q</li>
            <li onClick={() => navigate('/faq')} style={{cursor: 'pointer'}}>Shipping</li>
            <li onClick={() => navigate('/faq')} style={{cursor: 'pointer'}}>Returns</li>
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
