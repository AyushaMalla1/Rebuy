import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingCart, FiHeart, FiArrowLeft, FiStar } from 'react-icons/fi';
import './Shop.css';
import { productAPI, cartAPI } from './services/api';

function Shop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showCategoryCards, setShowCategoryCards] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const categoryCards = [
    {
      title: "MEN'S APPAREL",
      image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400",
      subcategories: [
        { name: "Men's Jacket", param: "mens-jacket" },
        { name: "Men's Shirt", param: "mens-shirt" },
        { name: "Men's Pants", param: "mens-pants" }
      ]
    },
    {
      title: "WOMEN'S APPAREL",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
      subcategories: [
        { name: "Women's Jacket", param: "womens-jacket" },
        { name: "Women's Shirt", param: "womens-shirt" },
        { name: "Women's Pants", param: "womens-pants" }
      ]
    },
    {
      title: "SHOP OUTLET",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
      subcategories: [
        { name: "Men's Outlet", param: "mens-outlet" },
        { name: "Women's Outlet", param: "womens-outlet" },
        { name: "Kids Outlet", param: "kids-outlet" }
      ]
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    fetchProducts();
    
    // Always show products with sidebar, never show category cards
    setShowCategoryCards(false);
    if (categoryParam) {
      if (categoryParam.includes('mens')) {
        setSelectedCategory('MEN');
      } else if (categoryParam.includes('womens')) {
        setSelectedCategory('WOMEN');
      } else if (categoryParam.includes('kids')) {
        setSelectedCategory('KIDS');
      }
    }
  }, [categoryParam]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        if (!loadingMore && hasMore) {
          loadMoreProducts();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const products = await productAPI.getAll({ limit: 20, page: nextPage });
      
      if (products && products.length > 0) {
        const mappedProducts = products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.images[0] || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          rating: p.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          reviews: p.reviews || Math.floor(Math.random() * 200 + 50),
          condition: p.condition,
          seller: p.seller,
          sellerName: p.sellerName || 'Ayusha Malla',
          storeName: p.storeName || 'ankita',
          category: p.category || 'Fashion',
          paymentOptions: p.paymentOptions || [],
          discount: p.discount,
          discountedPrice: p.discountedPrice
        }));
        
        setAllProducts(prev => [...prev, ...mappedProducts]);
        setPage(nextPage);
        
        if (products.length < 20) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const products = await productAPI.getAll({ limit: 20, page: 1 });
      
      if (products && products.length > 0) {
        const mappedProducts = products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          image: p.images[0] || 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg',
          rating: p.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          reviews: p.reviews || Math.floor(Math.random() * 200 + 50),
          condition: p.condition,
          seller: p.seller,
          sellerName: p.sellerName || 'Ayusha Malla',
          storeName: p.storeName || 'ankita',
          category: p.category || 'Fashion',
          paymentOptions: p.paymentOptions || [],
          discount: p.discount,
          discountedPrice: p.discountedPrice
        }));
        setAllProducts(mappedProducts);
        setPage(1);
        setHasMore(products.length >= 20);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
      (selectedCategory === 'MEN' && product.name.toLowerCase().includes('men')) ||
      (selectedCategory === 'WOMEN' && product.name.toLowerCase().includes('women')) ||
      (selectedCategory === 'KIDS' && (product.name.toLowerCase().includes('kid') || product.name.toLowerCase().includes('boy') || product.name.toLowerCase().includes('girl'))) ||
      (selectedCategory === 'SPORTS' && (product.name.toLowerCase().includes('sport') || product.name.toLowerCase().includes('track') || product.name.toLowerCase().includes('athletic'))) ||
      (selectedCategory === 'VINTAGE' && product.name.toLowerCase().includes('vintage'));
    
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowCategoryCards(false);
  };

  const handleFilterTabClick = (filter) => {
    setSelectedFilter(filter);
    setShowCategoryCards(false);
  };

  const handleSubcategoryClick = (categoryParam) => {
    navigate(`/shop?category=${categoryParam}`);
    setShowCategoryCards(false);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleGenderChange = (gender) => {
    setSelectedGenders(prev => 
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleColorChange = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handlePriceRangeChange = (range) => {
    setSelectedPriceRange(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const isDiscountActive = (discount) => {
    if (!discount || !discount.active) return false;
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    return now >= start && now <= end;
  };

  const toggleFavorite = (productId) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addToCart = async (product) => {
    try {
      if (user && user._id) {
        try {
          await cartAPI.add(user._id, product.id, 1);
          const backendCart = await cartAPI.get(user._id);
          const formattedCart = backendCart.items.map(item => {
            const prod = item.product;
            const effectivePrice = prod.discountedPrice || prod.price || item.price;
            
            return {
              id: prod._id || prod,
              name: prod.name || item.productName,
              price: effectivePrice,
              originalPrice: prod.price || item.price,
              image: (prod.images && prod.images[0]) || item.productImage,
              quantity: item.quantity,
              discount: prod.discount,
              discountedPrice: prod.discountedPrice
            };
          });
          
          setCart(formattedCart);
          localStorage.setItem('cart', JSON.stringify(formattedCart));
          return;
        } catch (error) {
          console.error('Backend cart error:', error);
        }
      }
      
      const existingItem = cart.find(item => item.id === product.id);
      let newCart;

      if (existingItem) {
        newCart = cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const effectivePrice = product.discountedPrice || product.price;
        newCart = [...cart, { 
          ...product, 
          quantity: 1,
          price: effectivePrice,
          originalPrice: product.price
        }];
      }

      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="shop-page">
      <header className="shop-header">
        <h1>Shop All Products</h1>
      </header>

      <div className="filter-tabs">
        <button 
          className={selectedFilter === 'ALL' ? 'active' : ''} 
          onClick={() => handleFilterTabClick('ALL')}
        >
          ALL
        </button>
        <button 
          className={selectedFilter === 'NEW_ARRIVALS' ? 'active' : ''} 
          onClick={() => handleFilterTabClick('NEW_ARRIVALS')}
        >
          NEW ARRIVALS
        </button>
        <button 
          className={selectedFilter === 'TOP_RATED' ? 'active' : ''} 
          onClick={() => handleFilterTabClick('TOP_RATED')}
        >
          TOP RATED
        </button>
      </div>

      <div className="shop-container">
        <main className="shop-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : showCategoryCards ? (
            <div className="category-cards-grid">
              {categoryCards.map((card, index) => (
                <div key={index} className="category-card">
                  <div className="category-card-image">
                    <img src={card.image} alt={card.title} />
                  </div>
                  <h3 className="category-card-title">{card.title}</h3>
                  <div className="category-card-links">
                    {card.subcategories.map((sub, idx) => (
                      <div 
                        key={idx} 
                        className="category-link"
                        onClick={() => handleSubcategoryClick(sub.param)}
                      >
                        {sub.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image" onClick={() => navigate(`/product/${product.id}`)}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://i.pinimg.com/736x/97/a1/91/97a191e1e99f977fa20a3d79836ac487.jpg';
                      }}
                    />
                    {product.discount && isDiscountActive(product.discount) && (
                      <div className="discount-badge">{product.discount.percentage}% OFF</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    {product.discount && isDiscountActive(product.discount) ? (
                      <div className="price-container">
                        <p className="product-price discounted">Rs. {product.discountedPrice.toLocaleString()}</p>
                        <p className="product-price original">Rs. {product.price.toLocaleString()}</p>
                      </div>
                    ) : (
                      <p className="product-price">Rs. {product.price.toLocaleString()}</p>
                    )}
                    {product.discount && isDiscountActive(product.discount) && (
                      <p className="discount-validity">
                        Valid until {new Date(product.discount.endDate).toLocaleDateString()}
                      </p>
                    )}
                    {product.paymentOptions && product.paymentOptions.length > 0 && (
                      <div className="payment-icons">
                        {product.paymentOptions.map((option) => {
                          const icons = {
                            cod: '💵',
                            online: '💳',
                            esewa: '🟢',
                            khalti: '🟣',
                            card: '💳'
                          };
                          return (
                            <span key={option} className="payment-icon-small" title={option.toUpperCase()}>
                              {icons[option] || '💳'}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {loadingMore && (
            <div className="loading-more">
              <div className="spinner-small"></div>
              <p>Loading more products...</p>
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        <div className="footer-section">
          <h4>SHOP BY</h4>
          <ul>
            <li onClick={() => setSelectedCategory('MEN')} style={{cursor: 'pointer'}}>Men</li>
            <li onClick={() => setSelectedCategory('WOMEN')} style={{cursor: 'pointer'}}>Women</li>
            <li onClick={() => setSelectedCategory('KIDS')} style={{cursor: 'pointer'}}>Kids</li>
            <li onClick={() => navigate('/shop')} style={{cursor: 'pointer'}}>Brands</li>
            <li onClick={() => navigate('/shop')} style={{cursor: 'pointer'}}>On Sale</li>
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
    </div>
  );
}

export default Shop;
