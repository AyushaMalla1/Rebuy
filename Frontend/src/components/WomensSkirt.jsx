import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import './CategoryPage.css';

function WomensSkirt() {
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
      const skirts = data.filter(p => 
        p.category === "Women's Collection" && 
        p.subcategory === "Women's Skirt"
      );
      setProducts(skirts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="outlet-page">
      <div className="outlet-breadcrumb">
        <span onClick={() => navigate('/')}>Home</span> / <span>Women's Skirt</span>
      </div>

      <h1 className="outlet-title">Women's Skirt</h1>

      <div className="outlet-container">
        <aside className="outlet-sidebar">
          <div className="filter-search">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search shirts" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </aside>

        <main className="outlet-main">
          <div className="outlet-header">
            <span className="product-count">{products.length} Products</span>
          </div>

          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : (
            <div className="outlet-grid">
              {products.map(product => (
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

export default WomensSkirt;
