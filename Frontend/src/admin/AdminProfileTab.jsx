import { FiCamera, FiCheckCircle, FiUser } from 'react-icons/fi';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminProfileTab.css';
function AdminProfileTab() {
  const {
    profileData,
    setProfileData,
    profileImage,
    handleAdminProfileImageUpload,
    handleProfileUpdate
  } = useAdminDashboard();

  return (
    <div className="content-section">
      <div className="profile-panel admin-profile-panel">
        <div className="profile-hero">
          <div className="profile-image-wrapper">
            <img src={profileImage} alt={profileData.fullName || 'Admin'} className="profile-avatar-large" />
            <label className="profile-image-upload">
              <FiCamera />
              <input type="file" accept="image/*" onChange={handleAdminProfileImageUpload} />
            </label>
          </div>
          <div>
            <h2>{profileData.fullName || 'Administrator'}</h2>
            <span className="role-badge">Admin Account</span>
          </div>
        </div>

        <div className="section-header compact">
          <h3><FiUser /> Personal Information</h3>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profileData.fullName || ''}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={profileData.email || ''}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />
          </div>

        </div>

        <button className="save-settings-btn" onClick={handleProfileUpdate}>
          <FiCheckCircle /> Save Profile
        </button>
      </div>
    </div>
  );
}

export default AdminProfileTab;
