import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email
      });
      
      if (response.data.success) {
        setMessage('OTP has been sent to your email. Please check your inbox.');
        setStep(2); // Move to OTP verification step
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });
      
      if (response.data.success) {
        setMessage('OTP verified successfully! Please enter your new password.');
        setStep(3); // Move to password reset step
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email
      });
      
      if (response.data.success) {
        setMessage('New OTP has been sent to your email.');
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {/* Step 1: Email Input */}
          {step === 1 && (
            <>
              <h2>Forgot Password?</h2>
              <p className="subtitle">Enter your email address and we'll send you an OTP to reset your password.</p>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button type="submit" className="reset-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>

              <div className="back-to-login">
                <Link to="/login">← Back to Login</Link>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <h2>Verify OTP</h2>
              <p className="subtitle">Enter the 6-digit OTP sent to <strong>{email}</strong></p>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleOTPSubmit}>
                <div className="form-group">
                  <label>OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength="6"
                    style={{
                      fontSize: '24px',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <button type="submit" className="reset-btn" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <div className="resend-otp" style={{textAlign: 'center', marginTop: '20px'}}>
                <p style={{color: '#666', fontSize: '14px'}}>
                  Didn't receive the OTP?{' '}
                  <button 
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>

              <div className="back-to-login">
                <button 
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Change Email
                </button>
              </div>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <h2>Reset Password</h2>
              <p className="subtitle">Enter your new password below.</p>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength="8"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength="8"
                  />
                </div>

                <button type="submit" className="reset-btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
