import { useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiCreditCard, FiDollarSign, FiEye, FiRefreshCw, FiXCircle, FiShield } from 'react-icons/fi';
import { useAdminDashboard } from './AdminDashboardContext';
import { buildApiUrl } from '../services/api';

import './AdminPayoutsTab.css';
function AdminPayoutsTab() {
  const [methodFilter, setMethodFilter] = useState('all');
  const {
    payouts,
    payoutStats,
    fetchPayouts,
    handleCompletePayout,
    handleCancelPayout,
    selectedPayout,
    setSelectedPayout,
    showPayoutModal,
    setShowPayoutModal
  } = useAdminDashboard();

  const getSellerName = (payout) => (
    payout.seller?.storeName || payout.seller?.fullName || payout.sellerName || 'Seller'
  );

  const getMethodLabel = (payout) => {
    const method = payout.payoutMethod || payout.method || 'bank';
    return method === 'esewa' ? `ESEWA${payout.esewaId ? ` (${payout.esewaId})` : ''}` : method.toUpperCase();
  };

  const filteredPayouts = useMemo(() => {
    if (methodFilter === 'all') return payouts || [];
    return (payouts || []).filter((payout) => (payout.payoutMethod || payout.method || 'bank') === methodFilter);
  }, [payouts, methodFilter]);

  const methodCounts = useMemo(() => (payouts || []).reduce((counts, payout) => {
    const method = payout.payoutMethod || payout.method || 'bank';
    counts[method] = (counts[method] || 0) + 1;
    return counts;
  }, { all: (payouts || []).length }), [payouts]);

  const pendingCount = (payouts || []).filter(payout => payout.status === 'pending').length;

  // Verify eSewa transaction state
  const [verifyStatus, setVerifyStatus] = useState(null); // null | 'loading' | 'success' | 'failed' | 'unavailable'
  const [verifyMessage, setVerifyMessage] = useState('');

  const handleVerifyTransaction = async (txnRef) => {
    if (!txnRef || !txnRef.trim()) {
      alert('Enter a transaction reference first');
      return;
    }
    setVerifyStatus('loading');
    setVerifyMessage('');
    try {
      const res = await fetch(buildApiUrl('/payouts/verify-esewa-transaction'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionReference: txnRef.trim() })
      });
      const data = await res.json();
      if (data.transactionState === 'API_UNAVAILABLE') {
        setVerifyStatus('unavailable');
        setVerifyMessage('eSewa API unavailable — proceed manually.');
      } else if (data.success) {
        setVerifyStatus('success');
        setVerifyMessage(`Verified ✓ — Transaction COMPLETE${data.amount ? ` (Rs. ${data.amount})` : ''}`);
      } else {
        setVerifyStatus('failed');
        setVerifyMessage(`Verification failed: ${data.message}`);
      }
    } catch (err) {
      setVerifyStatus('unavailable');
      setVerifyMessage('Could not reach verification server.');
    }
  };
  const completedCount = (payouts || []).filter(payout => payout.status === 'completed').length;

  const [transactionRef, setTransactionRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [actionType, setActionType] = useState(null); // 'complete' or 'cancel'

  const resetModalState = () => {
    setTransactionRef('');
    setAdminNotes('');
    setCancelReason('');
    setActionType(null);
  };

  return (
    <div className="content-section">
      <div className="analytics-grid payout-summary-grid">
        <div className="analytics-card">
          <FiClock className="card-icon" />
          <p className="analytics-label">Pending Payouts</p>
          <h3>Rs. {Number(payoutStats.pendingAmount || 0).toLocaleString()}</h3>
          <span>{payoutStats.pendingCount || pendingCount} requests</span>
        </div>
        <div className="analytics-card">
          <FiCheckCircle className="card-icon" />
          <p className="analytics-label">Completed Payouts</p>
          <h3>Rs. {Number(payoutStats.completedAmount || 0).toLocaleString()}</h3>
          <span>{payoutStats.completedCount || completedCount} paid</span>
        </div>
        <div className="analytics-card">
          <FiCreditCard className="card-icon" />
          <p className="analytics-label">eSewa Payouts</p>
          <h3>{methodCounts.esewa || 0}</h3>
          <span>requests using eSewa</span>
        </div>
      </div>

      <div className="table-actions">
        <div className="payout-method-filters">
          {['all', 'esewa', 'manual'].map(method => (
            <button
              key={method}
              className={`payout-method-filter ${methodFilter === method ? 'active' : ''}`}
              onClick={() => setMethodFilter(method)}
            >
              {method.toUpperCase()} <strong>{methodCounts[method] || 0}</strong>
            </button>
          ))}
        </div>
        <button className="secondary-btn" onClick={fetchPayouts}><FiRefreshCw /> Refresh</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Orders</th>
              <th>Requested</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayouts.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table">No payout requests found.</td>
              </tr>
            ) : (
              filteredPayouts.map((payout) => (
                <tr key={payout._id}>
                  <td>{getSellerName(payout)}</td>
                  <td>Rs. {Number(payout.amount || 0).toLocaleString()}</td>
                  <td>{getMethodLabel(payout)}</td>
                  <td>{payout.orders?.length || payout.orderCount || 0}</td>
                  <td>{new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${payout.status}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedPayout(payout);
                          resetModalState();
                          setShowPayoutModal(true);
                        }}
                      >
                        <FiEye /> View
                      </button>
                      {payout.status === 'pending' && (
                        <button
                          className="approve-btn"
                          style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            setSelectedPayout(payout);
                            resetModalState();
                            // Important: set action type after resetting modal state
                            setTimeout(() => setActionType('complete'), 0);
                            setShowPayoutModal(true);
                          }}
                        >
                          <FiCheckCircle /> Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPayoutModal && selectedPayout && (
        <div className="modal-overlay" onClick={() => { setShowPayoutModal(false); resetModalState(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payout Details</h2>
              <button className="close-btn" onClick={() => { setShowPayoutModal(false); resetModalState(); }}>
                <FiXCircle />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Seller</label>
                  <span>{getSellerName(selectedPayout)}</span>
                </div>
                <div className="detail-item">
                  <label>Amount</label>
                  <span>Rs. {Number(selectedPayout.amount || 0).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Method</label>
                  <span>{getMethodLabel(selectedPayout)}</span>
                </div>
                {selectedPayout.esewaId && (
                  <div className="detail-item">
                    <label>eSewa ID</label>
                    <span>{selectedPayout.esewaId}</span>
                  </div>
                )}
                {selectedPayout.khaltiMobile && (
                  <div className="detail-item">
                    <label>Khalti Mobile</label>
                    <span>{selectedPayout.khaltiMobile}</span>
                  </div>
                )}
                {selectedPayout.bankDetails?.accountNumber && (
                  <div className="detail-item">
                    <label>Bank Account</label>
                    <span>{selectedPayout.bankDetails.accountName} - {selectedPayout.bankDetails.accountNumber}</span>
                  </div>
                )}
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedPayout.status}`}>
                    {selectedPayout.status}
                  </span>
                </div>
              </div>

              {selectedPayout.status === 'pending' && actionType === 'complete' && (
                <div className="payout-action-form" style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Complete Payout</h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Transaction Reference / ID *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={transactionRef} 
                        onChange={(e) => { setTransactionRef(e.target.value); setVerifyStatus(null); setVerifyMessage(''); }} 
                        placeholder="e.g. EB123456789"
                        style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      {selectedPayout.payoutMethod === 'esewa' && (
                        <button
                          onClick={() => handleVerifyTransaction(transactionRef)}
                          disabled={verifyStatus === 'loading'}
                          style={{
                            padding: '8px 14px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            background: '#00bcd4', color: 'white', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                            opacity: verifyStatus === 'loading' ? 0.7 : 1
                          }}
                        >
                          <FiShield size={14} />
                          {verifyStatus === 'loading' ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                    </div>
                    {verifyStatus && verifyStatus !== 'loading' && (
                      <div style={{
                        marginTop: '8px', padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                        background: verifyStatus === 'success' ? '#d1fae5' : verifyStatus === 'unavailable' ? '#fef3c7' : '#fee2e2',
                        color: verifyStatus === 'success' ? '#065f46' : verifyStatus === 'unavailable' ? '#92400e' : '#991b1b',
                        border: `1px solid ${verifyStatus === 'success' ? '#a7f3d0' : verifyStatus === 'unavailable' ? '#fde68a' : '#fecaca'}`
                      }}>
                        {verifyMessage}
                      </div>
                    )}
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      * Enter the Transaction ID from your eSewa/Khalti receipt. If you paid manually via your personal mobile app, simply enter the ID and click "Confirm Complete" (the Verify button only works for Merchant Gateway transactions).
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Admin Notes (Optional)</label>
                    <textarea 
                      value={adminNotes} 
                      onChange={(e) => setAdminNotes(e.target.value)} 
                      placeholder="Any additional notes..."
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="approve-btn" 
                      onClick={() => {
                        if(!transactionRef) { alert('Transaction reference is required'); return; }
                        handleCompletePayout(selectedPayout._id, transactionRef, adminNotes);
                        setShowPayoutModal(false);
                        setVerifyStatus(null);
                        setVerifyMessage('');
                      }}
                    >
                      Confirm Complete
                    </button>
                    <button className="secondary-btn" onClick={() => { setActionType(null); setVerifyStatus(null); setVerifyMessage(''); }}>Cancel</button>
                  </div>
                </div>
              )}

              {selectedPayout.status === 'pending' && actionType === 'cancel' && (
                <div className="payout-action-form" style={{ marginTop: '20px', padding: '15px', background: '#fef2f2', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#ef4444' }}>Cancel Payout</h4>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Reason for Cancellation *</label>
                    <textarea 
                      value={cancelReason} 
                      onChange={(e) => setCancelReason(e.target.value)} 
                      placeholder="Please provide a reason..."
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="reject-btn" 
                      onClick={() => {
                        if(!cancelReason) { alert('Cancellation reason is required'); return; }
                        handleCancelPayout(selectedPayout._id, cancelReason);
                        setShowPayoutModal(false);
                      }}
                    >
                      Confirm Cancellation
                    </button>
                    <button className="secondary-btn" onClick={() => setActionType(null)}>Back</button>
                  </div>
                </div>
              )}
            </div>
            {selectedPayout.status === 'pending' && !actionType && (
              <div className="modal-actions">
                <button className="approve-btn" onClick={() => setActionType('complete')}>
                  <FiDollarSign /> Complete Payout
                </button>
                <button className="reject-btn" onClick={() => setActionType('cancel')}>
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayoutsTab;
