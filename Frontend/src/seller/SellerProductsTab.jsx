import {
  FaArchive,
  FaBox,
  FaBullseye,
  FaChartPie,
  FaCopy,
  FaEdit,
  FaLightbulb,
  FaPlus,
  FaSearch,
  FaStar,
  FaTrash
} from 'react-icons/fa';
import { useSellerDashboard } from './DashboardContext';

import './SellerProductsTab.css';
function SellerProductsTab() {
  const {
    currentPage,
    filteredProducts,
    getStockStatusBadge,
    handleAddProduct,
    handleDeleteProduct,
    handleEditProduct,
    handleFileUpload,
    handleRestockClick,
    handleThreeDotAction,
    newProduct,
    paginate,
    productStatusFilter,
    productStockFilter,
    products,
    removeImage,
    setNewProduct,
    setProductStatusFilter,
    setProductStockFilter,
    setShowAddProduct,
    setShowThreeDotMenu,
    showAddProduct,
    showThreeDotMenu
  } = useSellerDashboard();

  const productsPerPage = 10;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="products-section">
      <div className="product-management-panel">
        <div className="product-management-topbar">
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="add-product-btn"
          >
            <FaPlus /> {showAddProduct ? 'Close Form' : 'Add Product'}
          </button>

          <div className="product-toolbar">
            <select
              value={productStatusFilter}
              onChange={(e) => setProductStatusFilter(e.target.value)}
              className="product-filter-select"
            >
              <option value="All">All approval</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={productStockFilter}
              onChange={(e) => setProductStockFilter(e.target.value)}
              className="product-filter-select"
            >
              <option value="All">All stock</option>
              <option value="Active">Active stock</option>
              <option value="Low">Low stock</option>
              <option value="Out">Out of stock</option>
            </select>
          </div>
        </div>

        <div className="product-summary-strip">
          <button className={`product-summary-item ${productStatusFilter === 'All' && productStockFilter === 'All' ? 'active' : ''}`} onClick={() => { setProductStatusFilter('All'); setProductStockFilter('All'); }}>
            <span>All Products</span>
            <strong>{products.length}</strong>
          </button>
          <button className={`product-summary-item ${productStatusFilter === 'Approved' ? 'active' : ''}`} onClick={() => setProductStatusFilter('Approved')}>
            <span>Approved</span>
            <strong>{products.filter(product => product.status === 'Approved').length}</strong>
          </button>
          <button className={`product-summary-item ${productStatusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setProductStatusFilter('Pending')}>
            <span>Pending</span>
            <strong>{products.filter(product => product.status === 'Pending').length}</strong>
          </button>
          <button className={`product-summary-item ${productStockFilter === 'Low' ? 'active' : ''}`} onClick={() => setProductStockFilter('Low')}>
            <span>Low Stock</span>
            <strong>{products.filter(product => product.stock > 0 && product.stock <= 20).length}</strong>
          </button>
          <button className={`product-summary-item ${productStockFilter === 'Out' ? 'active' : ''}`} onClick={() => setProductStockFilter('Out')}>
            <span>Out of Stock</span>
            <strong>{products.filter(product => product.stock === 0).length}</strong>
          </button>
        </div>
      </div>

      {/* BULK UPLOAD SECTION - REMOVED */}

      {/* ADD PRODUCT FORM */}
      {showAddProduct && (
        <div className="product-form-container">
          <h3 className="product-form-title">Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-grid-2">
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">
                  SKU (Optional)
                  <span className="form-label-hint">
                    Auto-generated if left empty
                  </span>
                </label>
                <input
                  type="text"
                  value={newProduct.sku || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="e.g., ME-1234-N"
                  className="form-input form-input-mono"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Price (Rs.) *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Stock *</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div>
                <label className="form-label">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, category: e.target.value, subcategory: '' });
                  }}
                  required
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  <option value="Men's Collection">Men's Collection</option>
                  <option value="Women's Collection">Women's Collection</option>
                  <option value="Sportswear">Sportswear</option>
                  <option value="Vintage">Vintage</option>
                </select>
              </div>
              <div>
                <label className="form-label">Subcategory</label>
                <select
                  value={newProduct.subcategory || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                  className="form-select"
                  disabled={!newProduct.category}
                >
                  <option value="">Select Subcategory</option>
                  {newProduct.category === "Men's Collection" && (
                    <>
                      <option value="Men's Hoodie">Men's Hoodie</option>
                      <option value="Men's Pants">Men's Pants</option>
                      <option value="Men's Jacket">Men's Jacket</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                  {newProduct.category === "Women's Collection" && (
                    <>
                      <option value="Women's Skirt">Women's Skirt</option>
                      <option value="Women's Blazer">Women's Blazer</option>
                      <option value="Women's Top">Women's Top</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                  {newProduct.category === "Kid's Collection" && (
                    <>
                      <option value="Other">Other</option>
                    </>
                  )}
                  {newProduct.category === "Sportswear" && (
                    <>
                      <option value="Other">Other</option>
                    </>
                  )}
                  {newProduct.category === "Vintage" && (
                    <>
                      <option value="Other">Other</option>
                    </>
                  )}
                  {newProduct.category === "Accessories" && (
                    <>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="form-label">Condition *</label>
                <select
                  value={newProduct.condition}
                  onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Slightly Used">Slightly Used</option>
                  <option value="Vintage">Vintage</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">Size</label>
                <input
                  type="text"
                  value={newProduct.size}
                  onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                  placeholder="e.g., M, L, XL"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="e.g., Nike, Adidas, Zara"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                required
                rows="4"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Product Story
              </label>
              <textarea
                value={newProduct.story}
                onChange={(e) => setNewProduct({ ...newProduct, story: e.target.value })}
                rows="4"
                placeholder="Share the unique story behind this item..."
                className="form-textarea"
                required
              />
            </div>

            {/* Bundle Deal Section */}
            <div className="form-group bundle-deal-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  id="bundleDealEnabled"
                  checked={newProduct.bundleDeal?.enabled || false}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    bundleDeal: {
                      ...newProduct.bundleDeal,
                      enabled: e.target.checked
                    }
                  })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="bundleDealEnabled" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  Enable Bundle Deal
                </label>
              </div>

              {newProduct.bundleDeal?.enabled && (
                <div style={{ marginLeft: '28px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                    <div>
                      <label className="form-label">Buy Quantity *</label>
                      <input
                        type="number"
                        min="2"
                        value={newProduct.bundleDeal?.buyQuantity || 2}
                        onChange={(e) => setNewProduct({
                          ...newProduct,
                          bundleDeal: {
                            ...newProduct.bundleDeal,
                            buyQuantity: parseInt(e.target.value) || 2
                          }
                        })}
                        className="form-input"
                        placeholder="e.g., 2"
                      />
                    </div>
                    <div>
                      <label className="form-label">Discount % *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newProduct.bundleDeal?.discountPercentage || 10}
                        onChange={(e) => setNewProduct({
                          ...newProduct,
                          bundleDeal: {
                            ...newProduct.bundleDeal,
                            discountPercentage: parseInt(e.target.value) || 10
                          }
                        })}
                        className="form-input"
                        placeholder="e.g., 10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Bundle Description (Optional)</label>
                    <input
                      type="text"
                      value={newProduct.bundleDeal?.description || ''}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        bundleDeal: {
                          ...newProduct.bundleDeal,
                          description: e.target.value
                        }
                      })}
                      className="form-input"
                      placeholder="e.g., Buy 2 or more and save!"
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
                    Preview: Buy {newProduct.bundleDeal?.buyQuantity || 2}+ Get {newProduct.bundleDeal?.discountPercentage || 10}% OFF
                  </p>
                </div>
              )}
            </div>

            <div className="image-upload-section">
              <label className="form-label">Product Images (Max 10)</label>

              {/* File Upload Button */}
              <div className="image-upload-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="image-upload-input"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="image-upload-label-dashed"
                >
                  <FaPlus /> Upload Images
                </label>
                <span className="image-count-text">
                  {newProduct.images.filter(img => img !== '').length} / 10 images
                </span>
              </div>

              {/* Image Preview Grid */}
              {newProduct.images.filter(img => img !== '').length > 0 && (
                <div className="image-preview-grid">
                  {newProduct.images.filter(img => img !== '').map((img, index) => (
                    <div key={index} className="image-preview-item-bordered">
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="image-preview-img"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="image-remove-btn-small"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button
                type="submit"
                className="form-btn-submit"
              >
                Add Product
              </button>
              <button
                type="button"
                onClick={() => setShowAddProduct(false)}
                className="form-btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCTS LIST */}
      <div className="products-list-container">
        {filteredProducts.length === 0 && productStatusFilter === 'All' && productStockFilter === 'All' ? (
          <div className="products-empty">
            <FaBox size={64} className="products-empty-icon" />
            <h3 className="products-empty-title">No Products Yet</h3>
            <p className="products-empty-text">Add your first product to get started!</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty">
            <FaBox size={64} className="products-empty-icon" />
            <h3 className="products-empty-title">No Products Found</h3>
            <p className="products-empty-text">Try changing your search or filters</p>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => {
                  const stockStatus = getStockStatusBadge(product.stock);
                  return (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/60'}
                          alt={product.name}
                          className="product-image"
                        />
                      </td>
                      <td>
                        <div>
                          <div className="product-name-cell">{product.name}</div>
                          <div className="product-sku">
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="product-category">{product.category}</td>
                      <td className="product-price">Rs. {product.price?.toLocaleString()}</td>
                      <td>
                        <div className="product-stock-cell">
                          <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock <= 20 ? 'low-stock' : 'active-stock'}`}>
                            <span>{stockStatus.icon}</span>
                            {stockStatus.label}
                          </span>
                          <span className="stock-units">
                            {product.stock} units
                          </span>
                          {product.stock === 0 && (
                            <button
                              onClick={() => handleRestockClick(product)}
                              className="restock-btn"
                              title="Restock Product"
                            >
                              <FaPlus /> Restock
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`approval-badge ${product.status === 'Approved' ? 'approved' : product.status === 'Pending' ? 'pending' : 'rejected'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div className="product-actions">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="product-action-btn edit"
                            title="Edit Product"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="product-action-btn delete"
                            title="Delete Product"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => setShowThreeDotMenu(showThreeDotMenu === product._id ? null : product._id)}
                            className="product-action-btn more"
                            title="More Options"
                          >
                            ⋮
                          </button>

                          {/* Three-dot dropdown menu */}
                          {showThreeDotMenu === product._id && (
                            <div className="three-dot-menu">
                              <button
                                onClick={() => handleThreeDotAction('duplicate', product)}
                                className="three-dot-menu-item"
                              >
                                <FaCopy /> Duplicate Product
                              </button>
                              <button
                                onClick={() => handleThreeDotAction('featured', product)}
                                className="three-dot-menu-item"
                              >
                                <FaStar /> Mark as Featured
                              </button>
                              <button
                                onClick={() => handleThreeDotAction('analytics', product)}
                                className="three-dot-menu-item"
                              >
                                <FaChartPie /> View Analytics
                              </button>
                              <button
                                onClick={() => handleThreeDotAction('archive', product)}
                                className="three-dot-menu-item danger"
                              >
                                <FaArchive /> Archive Product
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
            </div>

            <div className="pagination-buttons">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`pagination-btn-prev ${currentPage === 1 ? 'disabled' : ''}`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`pagination-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`pagination-btn-next ${currentPage === totalPages ? 'disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="pro-tips-wrapper">
        <h3 className="pro-tips-header">
          <FaLightbulb className="pro-tips-icon" /> Pro Tips for Better Sales
        </h3>
        <div className="pro-tips-grid">
          {/* Tip 1: Stock Updates */}
          <div className="pro-tip-card blue">
            <div className="pro-tip-icon blue">
              <FaBox />
            </div>
            <h4 className="pro-tip-title blue">
              Keep Stock Updated
            </h4>
            <p className="pro-tip-text blue">
              Regularly update your stock to avoid customer cancellations and order penalties. Out-of-stock items hurt your seller rating.
            </p>
          </div>

          {/* Tip 2: Smart Categorization */}
          <div className="pro-tip-card yellow">
            <div className="pro-tip-icon yellow">
              <FaBullseye />
            </div>
            <h4 className="pro-tip-title yellow">
              Smart Categorization
            </h4>
            <p className="pro-tip-text yellow">
              Items with clear categories and attributes see 20% higher conversion rates. Choose the most accurate category for your products.
            </p>
          </div>

          {/* Tip 3: SEO Optimized Titles */}
          <div className="pro-tip-card green">
            <div className="pro-tip-icon green">
              <FaSearch />
            </div>
            <h4 className="pro-tip-title green">
              SEO Optimized Titles
            </h4>
            <p className="pro-tip-text green">
              Include keywords in your product names to improve search visibility in-app. Use brand names, colors, and key features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerProductsTab;
