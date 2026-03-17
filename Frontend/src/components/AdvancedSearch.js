import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import './AdvancedSearch.css';

function AdvancedSearch({ onApplyFilters, onClose }) {
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    brand: '',
    sortBy: 'newest'
  });

  const categories = ['Men', 'Women', 'Kids', 'Accessories', 'Shoes', 'Bags', 'Other'];
  const conditions = ['New', 'Like New', 'Slightly Used', 'Vintage'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      brand: '',
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div className="advanced-search-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2><FiFilter /> Advanced Filters</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Condition</label>
            <select 
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
            >
              <option value="">All Conditions</option>
              {conditions.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Size</label>
            <div className="size-options">
              {sizes.map(size => (
                <button
                  key={size}
                  className={filters.size === size ? 'active' : ''}
                  onClick={() => setFilters({ ...filters, size: filters.size === size ? '' : size })}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Brand</label>
            <input
              type="text"
              placeholder="Enter brand name"
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleReset} className="reset-btn">
            Reset All
          </button>
          <button onClick={handleApply} className="apply-btn">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearch;
