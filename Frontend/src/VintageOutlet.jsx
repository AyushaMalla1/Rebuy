import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import './components/CategoryPage.css';
import { buildApiUrl } from './services/api';


function VintageOutlet() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(buildApiUrl('/products'));
      const data = await response.json();
      // Filter by category "Vintage"
      const vintageProducts = data.filter(p => p.category === "Vintage");
      setProducts(vintageProducts);
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
        <span onClick={() => navigate('/')}>Home</span> / <span>Vintage Collection</span>
      </div>

      <h1 className="outlet-title">Vintage Collection</h1>

      <div className="outlet-container">
        {/* Sidebar Filters */}
        <aside className="outlet-sidebar">
          {/* Search */}
          <div className="filter-search">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search vintage items" 
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
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No vintage products found.</p>
            </div>
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
                    {product.condition && (
                      <span className="product-condition">{product.condition}</span>
                    )}
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

export default VintageOutlet;
