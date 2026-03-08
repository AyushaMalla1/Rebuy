import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiCamera, FiLogOut, FiHome, FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiUsers } from 'react-icons/fi';
import './SellerProfile.css';

function SellerProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    storeName: '',
    storeDescription: '',
    profileImage: ''
  });

  const [editData, setEditData] = useState({ ...profileData });

  useEffect(() => {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const data = {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '+92 300 1234567',
        address: user.address || '123 Main Street',
        city: user.city || 'Karachi',
        country: user.country || 'Pakistan',
        storeName: user.storeName || 'My Thrift Store',
        storeDescription: user.storeDescription || 'Quality second-hand fashion at affordable prices',
        profileImage: user.profileImage || ''
      };
      setProfileData(data);
      setEditData(data);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    // Update localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...user, ...editData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="seller-profile-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Rebuy" className="sidebar-logo" />
          <h2>Seller Center</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-label">MAIN MENU</p>
            <Link to="/seller/dashboard" className="nav-link">
              <FiHome /> Dashboard
            </Link>
            <Link to="/seller/dashboard" className="nav-link">
              <FiPackage /> Products
            </Link>
            <Link to="/seller/dashboard" className="nav-link">
              <FiShoppingBag /> Orders
            </Link>
          </div>

          <div className="nav-section">
            <p className="nav-label">ANALYTICS</p>
            <Link to="/seller/dashboard" className="nav-link">
              <FiDollarSign /> Revenue
            </Link>
            <Link to="/seller/dashboard" className="nav-link">
              <FiTrendingUp /> Performance
            </Link>
          </div>

          <div className="nav-section">
            <p className="nav-label">ACCOUNT</p>
            <Link to="/seller/profile" className="nav-link active">
              <FiUser /> Profile
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
      <main className="profile-main">
        <header className="profile-header">
          <div>
            <h1>Seller Profile</h1>
            <p className="header-subtitle">Manage your account information</p>
          </div>
          {!isEditing ? (
            <button className="edit-profile-btn" onClick={handleEdit}>
              <FiEdit2 /> Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>
                <FiSave /> Save Changes
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <FiX /> Cancel
              </button>
            </div>
          )}
        </header>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" />
                ) : (
                  <FiUsers size={64} />
                )}
              </div>
              {isEditing && (
                <button className="change-photo-btn">
                  <FiCamera /> Change Photo
                </button>
              )}
              <h2>{profileData.fullName}</h2>
              <p className="profile-email">{profileData.email}</p>
              <span className="seller-badge">Verified Seller</span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="info-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="info-grid">
              <div className="info-field">
                <label>
                  <FiUser /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={editData.fullName}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profileData.fullName}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <FiMail /> Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profileData.email}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <FiPhone /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profileData.phone}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <FiMapPin /> City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={editData.city}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profileData.city}</p>
                )}
              </div>

              <div className="info-field full-width">
                <label>
                  <FiMapPin /> Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editData.address}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profileData.address}</p>
                )}
              </div>

              <div className="info-field">
                <label>
                  <FiMapPin /> Country
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={editData.country}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profileData.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Store Information */}
          <div className="info-section">
            <h3 className="section-title">Store Information</h3>
            <div className="info-grid">
              <div className="info-field full-width">
                <label>
                  <FiPackage /> Store Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="storeName"
                    value={editData.storeName}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{profileData.storeName}</p>
                )}
              </div>

              <div className="info-field full-width">
                <label>
                  <FiEdit2 /> Store Description
                </label>
                {isEditing ? (
                  <textarea
                    name="storeDescription"
                    value={editData.storeDescription}
                    onChange={handleChange}
                    rows="3"
                  />
                ) : (
                  <p>{profileData.storeDescription}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="info-section">
            <h3 className="section-title">Account Statistics</h3>
            <div className="stats-row">
              <div className="stat-box">
                <FiPackage className="stat-icon" />
                <div>
                  <h4>2</h4>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-box">
                <FiShoppingBag className="stat-icon" />
                <div>
                  <h4>0</h4>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-box">
                <FiDollarSign className="stat-icon" />
                <div>
                  <h4>Rs. 0</h4>
                  <p>Total Revenue</p>
                </div>
              </div>
              <div className="stat-box">
                <FiTrendingUp className="stat-icon" />
                <div>
                  <h4>0%</h4>
                  <p>Growth Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerProfile;
