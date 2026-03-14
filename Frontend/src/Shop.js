import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingCart, FiHeart, FiArrowLeft, FiStar } from 'react-icons/fi';
import './Shop.css';
import { productAPI, cartAPI } from './services/api';

function Shop() {
  const navigate = useNavigate();
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
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const products = await productAPI.getAll({ limit: 100 });
      
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
          category: p.category || 'Fashion'
        }));
        setAllProducts(mappedProducts);
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
      (selectedCategory === 'KIDS' && product.name.toLowerCase().includes('kid')) ||
      (selectedCategory === 'FASHION' && product.category === 'Fashion') ||
      (selectedCategory === 'OTHER');
    
    const matchesGender = selectedGenders.length === 0 || selectedGenders.some(gender => 
      product.name.toLowerCase().includes(gender.toLowerCase())
    );
    
    const matchesSize = selectedSizes.length === 0;
    
    const matchesBrand = selectedBrands.length === 0;
    
    const matchesColor = selectedColors.length === 0 || selectedColors.some(color =>
      product.name.toLowerCase().includes(color.toLowerCase())
    );
    
    const matchesPrice = selectedPriceRange.length === 0 || selectedPriceRange.some(range => {
      if (range === 'under1000') return product.price < 1000;
      if (range === '1000-2500') return product.price >= 1000 && product.price <= 2500;
      if (range === '2500-5000') return product.price >= 2500 && product.price <= 5000;
      if (range === '5000-10000') return product.price >= 5000 && product.price <= 10000;
      if (range === 'over10000') return product.price > 10000;
      return true;
    });
    
    return matchesSearch && matchesCategory && matchesGender && matchesSize && matchesBrand && matchesColor && matchesPrice;
  });

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
          const formattedCart = backendCart.items.map(item => ({
            id: item.product._id || item.product,
            name: item.product.name || item.productName,
            price: item.product.price || item.price,
            image: (item.product.images && item.product.images[0]) || item.productImage,
            quantity: item.quantity
          }));
          
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
        newCart = [...cart, { ...product, quantity: 1 }];
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
          onClick={() => setSelectedFilter('ALL')}
        >
          ALL
        </button>
        <button 
          className={selectedFilter === 'NEW_ARRIVALS' ? 'active' : ''} 
          onClick={() => setSelectedFilter('NEW_ARRIVALS')}
        >
          NEW ARRIVALS
        </button>
        <button 
          className={selectedFilter === 'TOP_RATED' ? 'active' : ''} 
          onClick={() => setSelectedFilter('TOP_RATED')}
        >
          TOP RATED
        </button>
      </div>

      <div className="shop-container">
        <aside className="sidebar">
          <div className="filter-section">
            <h3 onClick={() => toggleSection('gender')}>
              <span className={`arrow ${collapsedSections.gender ? 'collapsed' : ''}`}>▼</span>
              Gender
            </h3>
            {!collapsedSections.gender && (
              <div className="filter-options">
                <label>
                  <input type="checkbox" checked={selectedGenders.includes("men")} onChange={() => handleGenderChange("men")} />
                  <span>Men's</span><span className="count">(245)</span>
                </label>
                <label>
                  <input type="checkbox" checked={selectedGenders.includes("women")} onChange={() => handleGenderChange("women")} />
                  <span>Women's</span><span className="count">(189)</span>
                </label>
                <label>
                  <input type="checkbox" checked={selectedGenders.includes("boy")} onChange={() => handleGenderChange("boy")} />
                  <span>Boys</span><span className="count">(32)</span>
                </label>
                <label>
                  <input type="checkbox" checked={selectedGenders.includes("girl")} onChange={() => handleGenderChange("girl")} />
                  <span>Girls</span><span className="count">(28)</span>
                </label>
              </div>
            )}
          </div>

          <div className="filter-section">
            <h3 onClick={() => toggleSection('size')}>
              <span className={`arrow ${collapsedSections.size ? 'collapsed' : ''}`}>▼</span>
              Size
            </h3>
            {!collapsedSections.size && (
              <div className="filter-options">
                <label><input type="checkbox" checked={selectedSizes.includes("XS")} onChange={() => handleSizeChange("XS")} /><span>XS</span><span className="count">(45)</span></label>
                <label><input type="checkbox" checked={selectedSizes.includes("S")} onChange={() => handleSizeChange("S")} /><span>S</span><span className="count">(128)</span></label>
                <label><input type="checkbox" checked={selectedSizes.includes("M")} onChange={() => handleSizeChange("M")} /><span>M</span><span className="count">(156)</span></label>
                <label><input type="checkbox" checked={selectedSizes.includes("L")} onChange={() => handleSizeChange("L")} /><span>L</span><span className="count">(142)</span></label>
                <label><input type="checkbox" checked={selectedSizes.includes("XL")} onChange={() => handleSizeChange("XL")} /><span>XL</span><span className="count">(98)</span></label>
                <label><input type="checkbox" checked={selectedSizes.includes("2XL")} onChange={() => handleSizeChange("2XL")} /><span>2XL</span><span className="count">(34)</span></label>
              </div>
            )}
          </div>

          <div className="filter-section">
            <h3 onClick={() => toggleSection('brand')}>
              <span className={`arrow ${collapsedSections.brand ? 'collapsed' : ''}`}>▼</span>
              Brand
            </h3>
            {!collapsedSections.brand && (
              <div className="filter-options scrollable">
                <label><input type="checkbox" checked={selectedBrands.includes("Nike")} onChange={() => handleBrandChange("Nike")} /><span>Nike</span><span className="count">(42)</span></label>
                <label><input type="checkbox" checked={selectedBrands.includes("Adidas")} onChange={() => handleBrandChange("Adidas")} /><span>Adidas</span><span className="count">(38)</span></label>
                <label><input type="checkbox" checked={selectedBrands.includes("Puma")} onChange={() => handleBrandChange("Puma")} /><span>Puma</span><span className="count">(25)</span></label>
                <label><input type="checkbox" checked={selectedBrands.includes("Reebok")} onChange={() => handleBrandChange("Reebok")} /><span>Reebok</span><span className="count">(18)</span></label>
                <label><input type="checkbox" checked={selectedBrands.includes("Levi's")} onChange={() => handleBrandChange("Levi's")} /><span>Levi's</span><span className="count">(32)</span></label>
                <label><input type="checkbox" checked={selectedBrands.includes("H&M")} onChange={() => handleBrandChange("H&M")} /><span>H&M</span><span className="count">(28)</span></label>
                <label><input type="checkbox" checked={selectedBrands.includes("Zara")} onChange={() => handleBrandChange("Zara")} /><span>Zara</span><span className="count">(22)</span></label>
                <label><input type="checkbox" checked={selectedBrands.includes("Gap")} onChange={() => handleBrandChange("Gap")} /><span>Gap</span><span className="count">(15)</span></label>
              </div>
            )}
          </div>

          <div className="filter-section">
            <h3 onClick={() => toggleSection('color')}>
              <span className={`arrow ${collapsedSections.color ? 'collapsed' : ''}`}>▼</span>
              Color
            </h3>
            {!collapsedSections.color && (
              <div className="filter-options">
                <label><input type="checkbox" checked={selectedColors.includes("Black")} onChange={() => handleColorChange("Black")} /><span>Black</span><span className="count">(156)</span></label>
                <label><input type="checkbox" checked={selectedColors.includes("Blue")} onChange={() => handleColorChange("Blue")} /><span>Blue</span><span className="count">(98)</span></label>
                <label><input type="checkbox" checked={selectedColors.includes("White")} onChange={() => handleColorChange("White")} /><span>White</span><span className="count">(87)</span></label>
                <label><input type="checkbox" checked={selectedColors.includes("Red")} onChange={() => handleColorChange("Red")} /><span>Red</span><span className="count">(45)</span></label>
                <label><input type="checkbox" checked={selectedColors.includes("Green")} onChange={() => handleColorChange("Green")} /><span>Green</span><span className="count">(34)</span></label>
                <label><input type="checkbox" checked={selectedColors.includes("Grey")} onChange={() => handleColorChange("Grey")} /><span>Grey</span><span className="count">(67)</span></label>
              </div>
            )}
          </div>

          <div className="filter-section">
            <h3 onClick={() => toggleSection('price')}>
              <span className={`arrow ${collapsedSections.price ? 'collapsed' : ''}`}>▼</span>
              Price Range
            </h3>
            {!collapsedSections.price && (
              <div className="filter-options">
                <label><input type="checkbox" checked={selectedPriceRange.includes("under1000")} onChange={() => handlePriceRangeChange("under1000")} /><span>Under Rs. 1,000</span></label>
                <label><input type="checkbox" checked={selectedPriceRange.includes("1000-2500")} onChange={() => handlePriceRangeChange("1000-2500")} /><span>Rs. 1,000 - 2,500</span></label>
                <label><input type="checkbox" checked={selectedPriceRange.includes("2500-5000")} onChange={() => handlePriceRangeChange("2500-5000")} /><span>Rs. 2,500 - 5,000</span></label>
                <label><input type="checkbox" checked={selectedPriceRange.includes("5000-10000")} onChange={() => handlePriceRangeChange("5000-10000")} /><span>Rs. 5,000 - 10,000</span></label>
                <label><input type="checkbox" checked={selectedPriceRange.includes("over10000")} onChange={() => handlePriceRangeChange("over10000")} /><span>Over Rs. 10,000</span></label>
              </div>
            )}
          </div>
        </aside>

        <main className="shop-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
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
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-price">Rs. {product.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Shop;
