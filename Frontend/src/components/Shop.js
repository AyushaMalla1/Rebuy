import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingCart, FiHeart, FiArrowLeft, FiStar, FiArrowRight, FiTag, FiFilter } from 'react-icons/fi';
import './Shop.css';
import { productAPI, cartAPI } from '../services/api';;

function Shop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  }, [categoryParam, selectedCategory]);

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
      
      // Build search params
      const params = {
        limit: 20,
        page: 1
      };
      
      if (searchQuery.trim()) {
        params.q = searchQuery;
      }
      
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }
      
      // Use advanced search if there are filters, otherwise use regular getAll
      const response = searchQuery.trim() || selectedCategory !== 'ALL' 
        ? await productAPI.search(params)
        : await productAPI.getAll(params);
      
      const products = response.products || response;
      
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
      } else {
        setAllProducts([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch search suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await productAPI.getSuggestions(query);
      if (response.success) {
        // Format suggestions with product images
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
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchProducts();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    
    // If it's a category, set the category filter
    if (suggestion.type === 'category') {
      setSelectedCategory(suggestion.name.toUpperCase());
    }
    
    // Trigger search
    setTimeout(() => fetchProducts(), 100);
  };

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
        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search"
                onClick={() => {
                  setSearchQuery('');
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                  fetchProducts();
                }}
              >
                ×
              </button>
            )}
          </form>
          {showSuggestions && (searchSuggestions.products?.length > 0 || searchSuggestions.collections?.length > 0 || searchSuggestions.sellers?.length > 0) && (
            <div className="search-suggestions">
              {/* Products Section */}
              {searchSuggestions.products && searchSuggestions.products.length > 0 && (
                <div className="suggestions-section">
                  <div className="suggestions-header">
                    <span className="suggestions-title">PRODUCTS</span>
                    <FiArrowRight className="suggestions-arrow" />
                  </div>
                  {searchSuggestions.products.map((product, index) => (
                    <div
                      key={`product-${index}`}
                      className="suggestion-item product-suggestion"
                      onClick={() => {
                        navigate(`/product/${product._id}`);
                        setShowSuggestions(false);
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

              {/* Collections Section (Categories + Brands) */}
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
              {searchSuggestions.sellers && searchSuggestions.sellers.length > 0 && (
                <div className="suggestions-section">
                  <div className="suggestions-header">
                    <span className="suggestions-title">SELLERS</span>
                    <FiArrowRight className="suggestions-arrow" />
                  </div>
                  {searchSuggestions.sellers.map((seller, index) => (
                    <div
                      key={`seller-${index}`}
                      className="suggestion-item seller-suggestion"
                      onClick={() => {
                        setSearchQuery(seller.name);
                        setShowSuggestions(false);
                        setTimeout(() => fetchProducts(), 100);
                      }}
                    >
                      <div className="suggestion-icon-wrapper">
                        <FiUser />
                      </div>
                      <span className="suggestion-text">{seller.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
              {allProducts.map(product => (
                <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
                  <div className="product-image-container">
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
                    <button 
                      className="wishlist-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      <FiHeart className={favorites.includes(product.id) ? 'favorited' : ''} />
                    </button>
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <div className="product-pricing">
                      {product.discount && isDiscountActive(product.discount) ? (
                        <>
                          <span className="current-price">Rs. {product.discountedPrice.toLocaleString()}</span>
                          <span className="original-price">Rs. {product.price.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="current-price">Rs. {product.price.toLocaleString()}</span>
                      )}
                    </div>
                    {product.condition && (
                      <span className="product-condition">{product.condition}</span>
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
