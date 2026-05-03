import { useState, useEffect } from 'react';
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
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (step === 2 && otpExpiry) {
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((otpExpiry - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setCanResend(true);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, otpExpiry]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        setOtpExpiry(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        setTimeRemaining(600);
        setCanResend(false);
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
        setOtpExpiry(Date.now() + 10 * 60 * 1000); // Reset 10 minutes timer
        setTimeRemaining(600);
        setCanResend(false);
        setOtp(''); // Clear previous OTP
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

              {/* Countdown Timer */}
              {timeRemaining > 0 ? (
                <div style={{
                  background: '#e0f7fa',
                  border: '2px solid #00bcd4',
                  borderRadius: '10px',
                  padding: '15px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <span style={{fontSize: '20px'}}>⏰</span>
                    <div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: timeRemaining < 60 ? '#F44336' : '#00bcd4',
                        fontFamily: 'monospace'
                      }}>
                        {formatTime(timeRemaining)}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '2px'
                      }}>
                        Time remaining
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#FFEBEE',
                  border: '2px solid #F44336',
                  borderRadius: '10px',
                  padding: '15px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  color: '#F44336'
                }}>
                  <strong>⚠️ OTP Expired</strong>
                  <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>
                    Please request a new OTP
                  </p>
                </div>
              )}

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

                <button 
                  type="submit" 
                  className="reset-btn" 
                  disabled={loading || otp.length !== 6 || timeRemaining === 0}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>

              <div className="resend-otp" style={{textAlign: 'center', marginTop: '20px'}}>
                <p style={{color: '#666', fontSize: '14px'}}>
                  Didn't receive the OTP?{' '}
                  <button 
                    onClick={handleResendOTP}
                    disabled={loading || (!canResend && timeRemaining > 540)} // Can resend after 1 minute
                    style={{
                      background: 'none',
                      border: 'none',
                      color: (loading || (!canResend && timeRemaining > 540)) ? '#ccc' : '#00bcd4',
                      cursor: (loading || (!canResend && timeRemaining > 540)) ? 'not-allowed' : 'pointer',
                      textDecoration: 'underline',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Resend OTP
                  </button>
                </p>
                {!canResend && timeRemaining > 540 && (
                  <p style={{color: '#999', fontSize: '12px', margin: '5px 0 0 0'}}>
                    You can resend OTP after 1 minute
                  </p>
                )}
              </div>

              <div className="back-to-login">
                <button 
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setOtpExpiry(null);
                    setTimeRemaining(600);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00bcd4',
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
