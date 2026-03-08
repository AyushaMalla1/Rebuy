import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiShoppingBag, FiFileText } from 'react-icons/fi';
import './BecomeASeller.css';

function BecomeASeller() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    storeDescription: '',
    address: '',
    city: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.agreeToTerms) {
      setError('Please agree to Terms & Conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: 'seller',
        phone: formData.phone,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        address: formData.address,
        city: formData.city
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        alert('Seller account created successfully! Redirecting to seller dashboard...');
        navigate('/seller/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="become-seller-page">
      <div className="seller-signup-container">
        <Link to="/" className="back-home">← Back to Home</Link>
        
        <div className="seller-header">
          <div className="seller-header-title">
            <FiShoppingBag className="seller-icon" />
            <h1>Become a Seller</h1>
          </div>
          <p className="subtitle">Join Rebuy and start selling your thrift fashion</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FiUser /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FiMail /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FiPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FiMapPin /> City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Your city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <FiMapPin /> Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Your complete address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Store Information</h3>
            
            <div className="form-group">
              <label>
                <FiShoppingBag /> Store Name
              </label>
              <input
                type="text"
                name="storeName"
                placeholder="Your store name"
                value={formData.storeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <FiFileText /> Store Description
              </label>
              <textarea
                name="storeDescription"
                placeholder="Describe your store and products..."
                value={formData.storeDescription}
                onChange={handleChange}
                rows="3"
                required
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h3>Account Security</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FiLock /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FiLock /> Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="terms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="terms">
              I agree to Rebuy's <a href="/terms">Seller Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="seller-signup-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Seller Account'}
          </button>
        </form>

        <p className="login-link">
          Already have a seller account? <Link to="/login">Login as Seller</Link>
        </p>
      </div>
    </div>
  );
}

export default BecomeASeller;
