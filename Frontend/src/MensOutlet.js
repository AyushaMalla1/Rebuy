import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import './components/CategoryPage.css';

function MensOutlet() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      const mensProducts = data.filter(p => p.gender === 'Men' || p.gender === 'Unisex');
      setProducts(mensProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="outlet-page">
      <div className="outlet-breadcrumb">
        <span onClick={() => navigate('/')}>Home</span> / <span>Men's Outlet</span>
      </div>

      <h1 className="outlet-title">Men's Outlet</h1>

      <div className="outlet-container">
        {/* Sidebar Filters */}
        <aside className="outlet-sidebar">
          {/* Search */}
          <div className="filter-search">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </aside>

        {/* Products Grid */}
        <main className="outlet-main">
          <div className="outlet-header">
            <span className="product-count">{filteredProducts.length} Products</span>
          </div>

          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : (
            <div className="outlet-grid">
              {filteredProducts.map(product => (
                <div 
                  key={product._id} 
                  className="outlet-card"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="outlet-card-image">
                    <img src={product.images?.[0] || product.image} alt={product.name} />
                  </div>
                  <div className="outlet-card-info">
                    <h3>{product.name}</h3>
                    <p className="outlet-card-price">Rs.{product.price.toLocaleString()}</p>
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

export default MensOutlet;
