import { useState, useEffect } from 'react';
import { FiDollarSign, FiCreditCard, FiCheck, FiClock, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import './SellerFinance.css';
import { API_BASE_URL } from '../services/api';


function SellerFinance() {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPayoutDetails, setEditingPayoutDetails] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState({
    khaltiMobile: '',
    esewaId: '',
    bankAccount: {
      accountNumber: '',
      accountName: '',
      bankName: '',
      branchName: ''
    },
    preferredMethod: 'esewa'
  });
  const [saving, setSaving] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        console.error('No user found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/payouts/seller/${user._id}/summary`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFinanceData(data);

        // Set payout details for editing
        if (data.seller) {
          setPayoutDetails({
            khaltiMobile: data.seller.khaltiMobile || '',
            esewaId: data.seller.esewaId || '',
            bankAccount: data.seller.bankAccount || {
              accountNumber: '',
              accountName: '',
              bankName: '',
              branchName: ''
            },
            preferredMethod: data.seller.payoutMethod || 'esewa'
          });
        }
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayoutDetails = async () => {
    try {
      setSaving(true);
      const user = JSON.parse(sessionStorage.getItem('user'));
      const validationError = validatePayoutDetails();

      if (validationError) {
        alert(validationError);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/payouts/seller/${user._id}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(payoutDetails)
      });

      if (response.ok) {
        alert('Payout details updated successfully!');
        setEditingPayoutDetails(false);
        loadFinanceData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update payout details');
      }
    } catch (error) {
      console.error('Error saving payout details:', error);
      alert('Failed to save payout details');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPayout = async () => {
    const validationError = validatePayoutDetails();
    if (validationError) {
      alert(validationError);
      setEditingPayoutDetails(true);
      return;
    }

    if (!window.confirm('Request payout for your pending earnings?')) return;

    try {
      setRequestingPayout(true);
      const user = JSON.parse(sessionStorage.getItem('user'));

      const response = await fetch(`${API_BASE_URL}/payouts/seller/${user._id}/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Payout request submitted!\nAmount: Rs. ${data.payout.amount.toLocaleString()}\nAdmin will process within 2-3 business days.`);
        loadFinanceData();
      } else {
        alert(data.message || 'Failed to request payout');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  };

  const hasConfiguredPayoutDetails = () => {
    if (payoutDetails.preferredMethod === 'esewa') return Boolean(payoutDetails.esewaId);
    if (payoutDetails.preferredMethod === 'khalti') return Boolean(payoutDetails.khaltiMobile);
    if (payoutDetails.preferredMethod === 'bank') return Boolean(payoutDetails.bankAccount?.accountNumber);
    return false;
  };

  const validatePayoutDetails = () => {
    if (payoutDetails.preferredMethod === 'esewa' && !/^98\d{8}$/.test(payoutDetails.esewaId || '')) {
      return 'Please enter a valid eSewa mobile number starting with 98.';
    }
    if (payoutDetails.preferredMethod === 'khalti' && !/^98\d{8}$/.test(payoutDetails.khaltiMobile || '')) {
      return 'Please enter a valid Khalti mobile number starting with 98.';
    }
    if (payoutDetails.preferredMethod === 'bank') {
      if (!payoutDetails.bankAccount?.bankName) return 'Bank name is required';
      if (!payoutDetails.bankAccount?.accountName) return 'Account name is required';
      if (!payoutDetails.bankAccount?.accountNumber) return 'Account number is required';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="seller-finance-page">
        <div className="loading-state">Loading finance data...</div>
      </div>
    );
  }

  if (!financeData) {
    return (
      <div className="seller-finance-page">
        <div className="error-state">Failed to load finance data</div>
      </div>
    );
  }

  return (
    <div className="seller-finance-page">
      <div className="finance-header">
      </div>

      <div className="finance-grid">
        {/* Earnings Summary */}
        <div className="finance-card earnings-card">
          <div className="card-header">
            <FiDollarSign className="card-icon" />
            <h2>Your Earnings</h2>
          </div>
          <div className="earnings-stats">
            <div className="stat-item pending">
              <span className="stat-label">Pending Payout</span>
              <span className="stat-value">Rs. {(financeData.earnings?.pendingPayout || 0).toLocaleString()}</span>
            </div>
            <div className="stat-item total">
              <span className="stat-label">Total Earned</span>
              <span className="stat-value">Rs. {(financeData.earnings?.totalEarned || 0).toLocaleString()}</span>
            </div>
            <div className="stat-item completed">
              <span className="stat-label">Completed Payouts</span>
              <span className="stat-value">Rs. {(financeData.earnings?.completedPayouts || 0).toLocaleString()}</span>
            </div>
            {financeData.earnings?.lastPayoutDate && (
              <div className="stat-item last-payout">
                <span className="stat-label">Last Payout</span>
                <span className="stat-value">{new Date(financeData.earnings.lastPayoutDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {financeData.earnings?.pendingPayout >= 500 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                className="request-payout-btn"
                onClick={handleRequestPayout}
                disabled={requestingPayout || !hasConfiguredPayoutDetails()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: requestingPayout || !hasConfiguredPayoutDetails() ? 'not-allowed' : 'pointer',
                  opacity: requestingPayout || !hasConfiguredPayoutDetails() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                <FiDollarSign />
                {requestingPayout ? 'Requesting...' : 'Request Payout Now'}
              </button>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
                Minimum payout: Rs. 500
              </p>
              {!hasConfiguredPayoutDetails() && (
                <div className="finance-warning">
                  Add valid payout details before requesting payout.
                </div>
              )}
            </div>
          )}
          {financeData.earnings?.pendingPayout > 0 && financeData.earnings?.pendingPayout < 500 && (
            <div style={{ marginTop: '20px', textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', color: '#92400e' }}>
                Minimum payout amount is Rs. 500. Current balance: Rs. {financeData.earnings.pendingPayout}
              </p>
            </div>
          )}
        </div>

        {/* Payout Details */}
        <div className="finance-card payout-details-card">
          <div className="card-header">
            <FiCreditCard className="card-icon" />
            <h2>Payout Method</h2>
            {!editingPayoutDetails && (
              <button className="edit-btn" onClick={() => setEditingPayoutDetails(true)}>
                <FiEdit2 /> Edit
              </button>
            )}
          </div>

          {editingPayoutDetails ? (
            <div className="payout-form">
              <div className="form-group">
                <label>Preferred Payout Method</label>
                  <select
                    value={payoutDetails.preferredMethod || ''}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, preferredMethod: e.target.value })}
                  >
                    <option value="" disabled>Select Payout Method</option>
                    <option value="esewa">eSewa</option>
                    <option value="khalti">Khalti</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
              </div>

              {/* Show only the selected method's fields */}
              {payoutDetails.preferredMethod === 'esewa' && (
                <div className="form-section">
                  <h3>eSewa Details</h3>
                  <div className="form-group">
                    <label>eSewa ID (Mobile Number)</label>
                    <input
                      type="text"
                      placeholder="98XXXXXXXX"
                      value={payoutDetails.esewaId}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, esewaId: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              {payoutDetails.preferredMethod === 'khalti' && (
                <div className="form-section">
                  <h3>Khalti Details</h3>
                  <div className="form-group">
                    <label>Khalti Mobile Number</label>
                    <input
                      type="text"
                      placeholder="98XXXXXXXX"
                      value={payoutDetails.khaltiMobile}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, khaltiMobile: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              {payoutDetails.preferredMethod === 'bank' && (
                <div className="form-section">
                  <h3>Bank Transfer Details</h3>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      value={payoutDetails.bankAccount?.bankName || ''}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, bankAccount: { ...payoutDetails.bankAccount, bankName: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Name</label>
                    <input
                      type="text"
                      value={payoutDetails.bankAccount?.accountName || ''}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, bankAccount: { ...payoutDetails.bankAccount, accountName: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      value={payoutDetails.bankAccount?.accountNumber || ''}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, bankAccount: { ...payoutDetails.bankAccount, accountNumber: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch Name</label>
                    <input
                      type="text"
                      value={payoutDetails.bankAccount?.branchName || ''}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, bankAccount: { ...payoutDetails.bankAccount, branchName: e.target.value } })}
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button className="save-btn" onClick={handleSavePayoutDetails} disabled={saving}>
                  <FiSave /> {saving ? 'Saving...' : 'Save Details'}
                </button>
                <button className="cancel-btn" onClick={() => setEditingPayoutDetails(false)}>
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="payout-details-view">
              <div className="detail-item">
                <span className="detail-label">Preferred Method:</span>
                <span className="detail-value preferred">{(payoutDetails.preferredMethod || '').toUpperCase()}</span>
              </div>

              {/* Show only the details for the preferred method */}
              {payoutDetails.preferredMethod === 'esewa' && payoutDetails.esewaId && (
                <div className="detail-item">
                  <span className="detail-label">eSewa ID:</span>
                  <span className="detail-value">{payoutDetails.esewaId}</span>
                </div>
              )}
              
              {payoutDetails.preferredMethod === 'khalti' && payoutDetails.khaltiMobile && (
                <div className="detail-item">
                  <span className="detail-label">Khalti Mobile:</span>
                  <span className="detail-value">{payoutDetails.khaltiMobile}</span>
                </div>
              )}
              
              {payoutDetails.preferredMethod === 'bank' && payoutDetails.bankAccount?.accountNumber && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Bank Name:</span>
                    <span className="detail-value">{payoutDetails.bankAccount.bankName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Name:</span>
                    <span className="detail-value">{payoutDetails.bankAccount.accountName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account No:</span>
                    <span className="detail-value">{payoutDetails.bankAccount.accountNumber}</span>
                  </div>
                </>
              )}

              {/* Show warning if no details configured for the preferred method */}
              {(payoutDetails.preferredMethod === 'esewa' && !payoutDetails.esewaId) && (
                  <div className="no-details">
                    <p>No eSewa details configured</p>
                    <p>Please add your eSewa details to receive payments</p>
                  </div>
                )}
              {(payoutDetails.preferredMethod === 'khalti' && !payoutDetails.khaltiMobile) && (
                  <div className="no-details">
                    <p>No Khalti details configured</p>
                    <p>Please add your Khalti details to receive payments</p>
                  </div>
                )}
              {(payoutDetails.preferredMethod === 'bank' && !payoutDetails.bankAccount?.accountNumber) && (
                  <div className="no-details">
                    <p>No Bank details configured</p>
                    <p>Please add your Bank details to receive payments</p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="finance-card history-card">
          <div className="card-header">
            <h2>Payout History</h2>
          </div>
          {financeData.payoutHistory && financeData.payoutHistory.length > 0 ? (
            <div className="payout-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.payoutHistory.map((payout) => (
                    <tr key={payout._id}>
                      <td>{new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()}</td>
                      <td>Rs. {payout.amount.toLocaleString()}</td>
                      <td>{payout.payoutMethod.toUpperCase()}</td>
                      <td>
                        <span className={`status-badge ${payout.status}`}>
                          {payout.status === 'completed' && <FiCheck />}
                          {payout.status === 'pending' && <FiClock />}
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-history">
              <p>No payout history yet</p>
              <p>Your payouts will appear here once processed</p>
            </div>
          )}
        </div>

        {/* Pending Orders */}
        {financeData.pendingOrders && financeData.pendingOrders.length > 0 && (
          <div className="finance-card pending-orders-card">
            <div className="card-header">
              <h2>Pending Payout Orders ({financeData.pendingOrders.length})</h2>
            </div>
            <div className="pending-orders-list">
              {financeData.pendingOrders.map((order) => (
                <div key={order.orderId} className="pending-order-item">
                  <div className="order-info">
                    <span className="order-id">Order #{order.orderId}</span>
                    <span className="order-date">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Date unavailable'}</span>
                  </div>
                  <div className="order-amount">
                    <span className="amount">Rs. {order.amount.toLocaleString()}</span>
                    <span className="commission">-Rs. {order.commission} (3%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerFinance;
