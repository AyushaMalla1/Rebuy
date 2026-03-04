import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import { FiSearch, FiUser, FiShoppingCart, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import Chatbot from './components/Chatbot';

function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Products
  const allProducts = [
    { id: 1, name: 'Hoodie', price: 5100, category: 'NEW', image: 'https://i.pinimg.com/1200x/85/50/eb/8550eb7065f3ae9b2617558814ff21f7.jpg', rating: 4.5 },
    { id: 2, name: 'T-Shirt', price: 3000, category: 'BEST', image: 'https://i.pinimg.com/736x/28/68/77/2868771ebc5e4708ba23a67646d12663.jpg', rating: 4.8 },
    { id: 3, name: 'Vintage Jacket', price: 8000, category: 'TOP', image: 'https://i.pinimg.com/1200x/06/56/44/065644e9485e9b7010771873bc5b61c8.jpg', rating: 4.9 },
    { id: 4, name: 'Jersey', price: 4200, category: 'NEW', image: 'https://i.pinimg.com/1200x/9f/66/52/9f665241f2a2f3347c91a5f0104b2733.jpg', rating: 4.3 },
    { id: 5, name: 'Blazer', price: 3100, category: 'BEST', image: 'https://i.pinimg.com/736x/f5/6e/01/f56e016ac0abff71aff30bf64cab7b83.jpg', rating: 4.6 },
    { id: 6, name: 'Jeans', price: 4100, category: 'TOP', image: 'https://i.pinimg.com/1200x/d3/71/05/d371058d1ac4ee47396aaa35a37f0684.jpg', rating: 4.7 },
    { id: 7, name: 'Jacket', price: 5200, category: 'NEW', image: 'https://i.pinimg.com/1200x/1a/96/f6/1a96f6aed31f53371dd7d9642d4b01c0.jpg', rating: 4.4 },
    { id: 8, name: 'Jorts', price: 3100, category: 'BEST', image: 'https://i.pinimg.com/736x/78/52/04/7852042ddd26913b9576eb80db5515a2.jpg', rating: 4.2 },
  ];

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load favorites and cart from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    const savedCart = localStorage.getItem('cart');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Filter products based on active tab and search
  const filteredProducts = allProducts.filter(product => {
    const matchesTab = activeTab === 'ALL' || product.category === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleFavorite = (productId) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addToCart = (product) => {
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
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId, change) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already filtered in real-time
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="rebuy" />
        </div>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="search-icon" />
        </form>

        <div className="header-right">
          <div className="header-links">
            <Link to="/seller">Become a Seller</Link>
            {user ? (
              <>
                <span>Hi, {user.fullName}</span>
                <button onClick={handleLogout} style={{background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: '14px', fontWeight: 500}}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            )}
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="header-icons">
            <div className="cart-icon-wrapper" onClick={() => setShowCart(!showCart)}>
              <FiShoppingCart />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </div>
            <Link to={user ? '/profile' : '/login'}>
              <FiUser />
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Dropdown */}
      {showCart && (
        <div className="cart-dropdown">
          <div className="cart-header">
            <h3>Shopping Cart ({cart.length})</h3>
            <button onClick={() => setShowCart(false)}>
              <FiX />
            </button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p>Rs. {item.price.toLocaleString()}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <FiX />
                    </button>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total:</strong>
                  <strong>Rs. {getTotalPrice().toLocaleString()}</strong>
                </div>
                <button className="checkout-btn">Proceed to Checkout</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collections Navigation */}
      <nav className="collections-nav">
        <a href="#men">MEN'S COLLECTIONS</a>
        <a href="#women">WOMEN'S COLLECTIONS</a>
        <a href="#kid">KID'S COLLECTIONS</a>
        <a href="#sportswear">SPORTSWEAR COLLECTIONS</a>
        <a href="#vintage">VINTAGE COLLECTIONS</a>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>THE HOME OF REBUY</h1>
          <p>Discover second-hand thrift fashion. Shop is sustainable, affordable, and stylish.</p>
          <button className="cta-button">Shop Now</button>
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
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-placeholder">
                <img src={product.image} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                <FiHeart 
                  className={`product-heart-icon ${favorites.includes(product.id) ? 'favorited' : ''}`}
                  onClick={() => toggleFavorite(product.id)}
                />
              </div>
              <h3>{product.name}</h3>
              <div className="product-rating">
                {'⭐'.repeat(Math.floor(product.rating))} {product.rating}
              </div>
              <p>Rs. {product.price.toLocaleString()}</p>
              <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <p className="no-products">No products found matching your search.</p>
        )}
        <button className="view-all">View All Products</button>
      </section>

      {/* Collections */}
      <section className="category-sections">
        <div className="category-card">
          <div className="category-image-placeholder">
            <img src="https://i.pinimg.com/474x/bc/83/08/bc8308ad115003adae43e7743ef2254f.jpg" alt="Men's Apparel" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <h3>MEN'S APPAREL</h3>
          <ul>
            <li>Men's Jacket</li>
            <li>Men's Shirt</li>
            <li>Men's Pants</li>
          </ul>
        </div>
        <div className="category-card">
          <div className="category-image-placeholder">
            <img src="https://i.pinimg.com/1200x/0c/84/90/0c8490ba8312437f20816c196febce73.jpg" alt="Women's Apparel" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <h3>WOMEN'S APPAREL</h3>
          <ul>
            <li>Women's Jacket</li>
            <li>Women's Shirt</li>
            <li>Women's Pants</li>
          </ul>
        </div>
        <div className="category-card">
          <div className="category-image-placeholder">
            <img src="https://i.pinimg.com/736x/db/ca/a2/dbcaa2ff3acec468b323a56ce5c6461a.jpg" alt="Shop Outlet" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <h3>SHOP OUTLET</h3>
          <ul>
            <li>Men's Outlet</li>
            <li>Women's Outlet</li>
            <li>Kids Outlet</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <h2>FREQUENTLY ASKED QUESTIONS</h2>
        <div className="faq-tabs">
          <button className="active">All FAQs</button>
          <button>Shipping</button>
          <button>Returns</button>
        </div>
        <div className="faq-items">
          <div className="faq-item">
            <p>Can I cancel my order?</p>
          </div>
          <div className="faq-item">
            <p>Can I change the shipping address on my order?</p>
          </div>
          <div className="faq-item">
            <p>Can I add or remove and item from my order?</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-section">
          <h4>SHOP BY</h4>
          <ul>
            <li>Men</li>
            <li>Women</li>
            <li>Kids</li>
            <li>Brands</li>
            <li>On Sale</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>COMPANY INFO</h4>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Sustainability</li>
            <li>Affiliates Program</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>SUPPORT</h4>
          <ul>
            <li>F.A.Q</li>
            <li>Shipping</li>
            <li>Returns</li>
            <li>Order Status</li>
            <li>Payment Options</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div className="footer-logo">
          <img src="/logo.png" alt="rebuy" style={{height: '40px', marginBottom: '10px'}} />
          <p>THRIFT SHOP</p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default LandingPage;
