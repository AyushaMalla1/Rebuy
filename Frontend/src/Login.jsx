import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { buildApiUrl } from './services/api';


function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Check if user is already logged in
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Redirect based on existing user role
        if (userData.role === 'admin' || userData.isAdmin) {
          navigate('/admin/dashboard');
        } else if (userData.role === 'seller' || userData.isSeller) {
          navigate('/seller/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        // If parsing fails, clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  const handleTabChange = (tab) => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        const currentRole = userData.role || (userData.isAdmin ? 'admin' : userData.isSeller ? 'seller' : 'customer');
        
        // If trying to switch to a different role, show error
        if (tab !== currentRole) {
          setError(`You are already logged in as ${currentRole}. Please logout first to switch accounts.`);
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    setActiveTab(tab);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(buildApiUrl('/auth/login'), {
        email: formData.email,
        password: formData.password,
        userType: activeTab
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on user type
        if (activeTab === 'admin') {
          navigate('/admin/dashboard');
        } else if (activeTab === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="back-home">← Home</Link>
        
        <h1>Login</h1>
        <p className="subtitle">Welcome back to Rebuy</p>

        {error && <div className="error-message">{error}</div>}

        {/* Tab Buttons */}
        <div className="login-tabs">
          <button 
            className={activeTab === 'customer' ? 'active' : ''} 
            onClick={() => setActiveTab('customer')}
          >
            Customer Login
          </button>
          <button 
            className={activeTab === 'seller' ? 'active' : ''} 
            onClick={() => setActiveTab('seller')}
          >
            Seller Login
          </button>
          <button 
            className={activeTab === 'admin' ? 'active' : ''} 
            onClick={() => setActiveTab('admin')}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              name="email"
              placeholder="Enter email or username"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        {/* Divider - Show for all login types */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '25px 0',
          gap: '15px'
        }}>
          <div style={{flex: 1, height: '1px', background: '#e0e0e0'}}></div>
          <span style={{color: '#999', fontSize: '13px', fontWeight: '500'}}>OR</span>
          <div style={{flex: 1, height: '1px', background: '#e0e0e0'}}></div>
        </div>

        {/* Google Sign In Button - Available for all user types */}
        <button
          type="button"
          onClick={() => {
            // Store the intended user type in sessionStorage before redirecting
            sessionStorage.setItem('googleAuthUserType', activeTab);
            window.location.href = buildApiUrl(`/auth/google?userType=${activeTab}`);
          }}
          style={{
            width: '100%',
            padding: '14px',
            background: 'white',
            color: '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f8f9fa';
            e.currentTarget.style.borderColor = '#00bcd4';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e0e0e0';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
