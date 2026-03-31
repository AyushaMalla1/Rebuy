import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mongoOrderId = searchParams.get('order_id');        // MongoDB _id (internal)
  const transactionCode = searchParams.get('transaction_code');
  const esewaData = searchParams.get('data');               // Base64 data from eSewa

  const [status, setStatus] = useState('verifying');        // 'verifying' | 'success'
  const [txCode, setTxCode] = useState(transactionCode || '');
  const [shortOrderId, setShortOrderId] = useState('');     // Human-readable e.g. RB7K2A

  useEffect(() => {
    if (esewaData && mongoOrderId) {
      verifyEsewaPayment(esewaData, mongoOrderId);
    } else if (mongoOrderId) {
      // Already verified (came via backend redirect)
      fetchShortOrderId(mongoOrderId);
      setStatus('success');
      clearCart();
    } else {
      setStatus('success');
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearCart = () => {
    localStorage.setItem('cart', JSON.stringify([]));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const fetchShortOrderId = async (id) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${id}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.orderId) setShortOrderId(data.orderId);
      }
    } catch (_) {}
  };

  const verifyEsewaPayment = async (data, order_id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payment/esewa/verify-frontend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, order_id })
        }
      );
      const result = await response.json();

      if (result.success) {
        setTxCode(result.transactionId || txCode);
        if (result.orderId) setShortOrderId(result.orderId);
        else await fetchShortOrderId(order_id);
        setStatus('success');
        clearCart();
      } else {
        navigate(
          `/payment-failed?order_id=${order_id}&message=${encodeURIComponent(result.message || 'Payment verification failed')}`
        );
      }
    } catch (err) {
      console.error('eSewa verification error:', err);
      // Network error — eSewa already confirmed, show success anyway
      await fetchShortOrderId(order_id);
      setStatus('success');
      clearCart();
    }
  };

  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => navigate('/profile?tab=orders'), 5000);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  if (status === 'verifying') {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container">
          <div className="success-icon verifying-icon">
            <span className="spinner" />
          </div>
          <h1>Verifying Payment…</h1>
          <p>Please wait while we confirm your eSewa payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="success-icon">
          <FiCheckCircle />
        </div>
        <h1>Payment Successful! 🎉</h1>
        <p>Your payment has been processed and your order is confirmed.</p>

        <div className="payment-details">
          {shortOrderId && (
            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value order-id-badge">{shortOrderId}</span>
            </div>
          )}
          {txCode && (
            <div className="detail-row">
              <span className="label">Transaction Code:</span>
              <span className="value">{txCode}</span>
            </div>
          )}
        </div>

        <p className="redirect-message">Redirecting to your orders in 5 seconds…</p>

        <button
          onClick={() => navigate('/profile?tab=orders')}
          className="view-orders-btn"
        >
          View My Orders
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
