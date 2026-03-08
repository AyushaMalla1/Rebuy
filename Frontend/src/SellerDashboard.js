import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiPackage, FiDollarSign, FiShoppingBag, FiTrendingUp, FiUsers, FiHome, FiUser } from 'react-icons/fi';
import './SellerDashboard.css';
import Chatbot from './components/Chatbot';

function SellerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [sellerName, setSellerName] = useState('Seller');
  const [products, setProducts] = useState([
    { id: 1, name: 'Vintage Jacket', price: 8000, stock: 5, category: 'Vintage', status: 'Active', image: 'https://i.pinimg.com/1200x/06/56/44/065644e9485e9b7010771873bc5b61c8.jpg' },
    { id: 2, name: 'Hoodie', price: 5100, stock: 10, category: 'Men\'s Collection', status: 'Active', image: 'https://i.pinimg.com/1200x/85/50/eb/8550eb7065f3ae9b2617558814ff21f7.jpg' },
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setSellerName(user.fullName);
    }
  }, []);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image: '',
    status: 'Active'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      status: 'Active',
      image: newProduct.image || 'https://via.placeholder.com/300'
    };
    setProducts([...products, product]);
    setNewProduct({ name: '', price: '', stock: '', category: '', description: '', image: '', status: 'Active' });
    setShowAddProduct(false);
    alert('Product added successfully!');
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const totalProducts = products.length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="seller-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Rebuy" className="sidebar-logo" />
          <h2>Seller Center</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-label">MAIN MENU</p>
            <button 
              className={activeTab === 'overview' ? 'active' : ''} 
              onClick={() => setActiveTab('overview')}
            >
              <FiHome /> Dashboard
            </button>
            <button 
              className={activeTab === 'products' ? 'active' : ''} 
              onClick={() => setActiveTab('products')}
            >
              <FiPackage /> Products
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => setActiveTab('orders')}
            >
              <FiShoppingBag /> Orders
            </button>
          </div>

          <div className="nav-section">
            <p className="nav-label">ANALYTICS</p>
            <button 
              className={activeTab === 'revenue' ? 'active' : ''} 
              onClick={() => setActiveTab('revenue')}
            >
              <FiDollarSign /> Revenue
            </button>
            <button 
              className={activeTab === 'analytics' ? 'active' : ''} 
              onClick={() => setActiveTab('analytics')}
            >
              <FiTrendingUp /> Performance
            </button>
          </div>

          <div className="nav-section">
            <p className="nav-label">ACCOUNT</p>
            <Link to="/seller/profile" style={{textDecoration: 'none'}}>
              <button>
                <FiUser /> Profile
              </button>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="home-link">
            <FiHome /> Back to Store
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'products' ? 'Product Management' : activeTab === 'orders' ? 'Order Management' : activeTab === 'revenue' ? 'Revenue Analytics' : 'Performance Analytics'}</h1>
            <p className="header-subtitle">Manage your store efficiently</p>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <FiUsers />
            </div>
            <div>
              <p className="user-name">{sellerName}</p>
              <p className="user-role">Seller Account</p>
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon-wrapper blue">
                  <FiPackage className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Products</p>
                  <h3 className="stat-value">{totalProducts}</h3>
                  <span className="stat-change positive">+12% from last month</span>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon-wrapper green">
                  <FiShoppingBag className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Stock</p>
                  <h3 className="stat-value">{totalStock}</h3>
                  <span className="stat-change positive">+8% from last month</span>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon-wrapper orange">
                  <FiDollarSign className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Potential Revenue</p>
                  <h3 className="stat-value">Rs. {totalRevenue.toLocaleString()}</h3>
                  <span className="stat-change positive">+15% from last month</span>
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon-wrapper purple">
                  <FiTrendingUp className="stat-icon" />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Orders</p>
                  <h3 className="stat-value">0</h3>
                  <span className="stat-change neutral">No orders yet</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-cards">
                <button className="action-card" onClick={() => setActiveTab('products')}>
                  <FiPackage />
                  <span>Manage Products</span>
                </button>
                <button className="action-card" onClick={() => { setActiveTab('products'); setShowAddProduct(true); }}>
                  <FiPlus />
                  <span>Add New Product</span>
                </button>
                <button className="action-card" onClick={() => setActiveTab('orders')}>
                  <FiShoppingBag />
                  <span>View Orders</span>
                </button>
                <button className="action-card" onClick={() => setActiveTab('revenue')}>
                  <FiDollarSign />
                  <span>View Revenue</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Products Section */}
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>My Products</h2>
              <button className="add-product-btn" onClick={() => setShowAddProduct(!showAddProduct)}>
                <FiPlus /> Add Product
              </button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <div className="add-product-form">
                <h3>Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (Rs.)</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="mens">Men's Collection</option>
                        <option value="womens">Women's Collection</option>
                        <option value="kids">Kid's Collection</option>
                        <option value="sportswear">Sportswear</option>
                        <option value="vintage">Vintage</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">Add Product</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowAddProduct(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.image} alt={product.name} className="product-thumb" />
                        </td>
                        <td className="product-name">{product.name}</td>
                        <td>{product.category}</td>
                        <td className="product-price">Rs. {product.price.toLocaleString()}</td>
                        <td>
                          <span className={`stock-badge ${product.stock < 5 ? 'low' : ''}`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td>
                          <span className="status-badge active">Active</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-btn" title="Edit Product">
                              <FiEdit2 />
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)} title="Delete Product">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-table">
                        <FiPackage size={48} />
                        <p>No products yet. Add your first product to get started!</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {activeTab === 'orders' && (
          <div className="content-section">
            <div className="empty-state-card">
              <FiShoppingBag size={64} />
              <h3>No Orders Yet</h3>
              <p>Orders from customers will appear here</p>
            </div>
          </div>
        )}

        {/* Revenue Section */}
        {activeTab === 'revenue' && (
          <div className="content-section">
            <div className="empty-state-card">
              <FiDollarSign size={64} />
              <h3>Revenue Analytics</h3>
              <p>Revenue data and insights will appear here</p>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {activeTab === 'analytics' && (
          <div className="content-section">
            <div className="empty-state-card">
              <FiTrendingUp size={64} />
              <h3>Performance Analytics</h3>
              <p>Store performance metrics will appear here</p>
            </div>
          </div>
        )}
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default SellerDashboard;
