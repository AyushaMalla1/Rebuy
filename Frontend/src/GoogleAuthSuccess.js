import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect based on user type
        if (user.userType === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.userType === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login?error=invalid_data');
      }
    } else {
      navigate('/login?error=missing_data');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #00bcd4',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2 style={{color: '#333', marginBottom: '10px'}}>Signing you in...</h2>
        <p style={{color: '#666'}}>Please wait while we complete your Google sign-in</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default GoogleAuthSuccess;
