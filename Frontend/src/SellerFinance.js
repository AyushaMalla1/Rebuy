import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCreditCard, FiCalendar, FiCheck, FiClock, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import './SellerFinance.css';

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
    preferredMethod: 'bank'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        console.error('No user found');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payouts/seller/${user._id}/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            preferredMethod: data.seller.payoutMethod || 'bank'
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
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payouts/seller/${user._id}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const getNextFriday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
        </div>

        {/* Next Payout Schedule */}
        <div className="finance-card schedule-card">
          <div className="card-header">
            <FiCalendar className="card-icon" />
            <h2>Next Payout Schedule</h2>
          </div>
          <div className="schedule-info">
            <div className="schedule-item">
              <FiClock className="schedule-icon" />
              <div>
                <p className="schedule-label">Payout Frequency</p>
                <p className="schedule-value">Every Friday at 9:00 AM</p>
              </div>
            </div>
            <div className="schedule-item">
              <FiCalendar className="schedule-icon" />
              <div>
                <p className="schedule-label">Next Payout Date</p>
                <p className="schedule-value">{getNextFriday()}</p>
              </div>
            </div>
            <div className="schedule-item">
              <FiDollarSign className="schedule-icon" />
              <div>
                <p className="schedule-label">Estimated Amount</p>
                <p className="schedule-value">Rs. {(financeData.earnings?.pendingPayout || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="schedule-note">
            <p>💡 Payouts are automatically generated every Friday. You'll receive an email notification when your payout is ready.</p>
          </div>
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
                  value={payoutDetails.preferredMethod}
                  onChange={(e) => setPayoutDetails({...payoutDetails, preferredMethod: e.target.value})}
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
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
                      onChange={(e) => setPayoutDetails({...payoutDetails, esewaId: e.target.value})}
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
                      onChange={(e) => setPayoutDetails({...payoutDetails, khaltiMobile: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {payoutDetails.preferredMethod === 'bank' && (
                <div className="form-section">
                  <h3>Bank Account Details</h3>
                  <div className="form-group">
                    <label>Account Number</label>
                    <input
                      type="text"
                      placeholder="Enter account number"
                      value={payoutDetails.bankAccount.accountNumber}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bankAccount: {...payoutDetails.bankAccount, accountNumber: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Name</label>
                    <input
                      type="text"
                      placeholder="Enter account holder name"
                      value={payoutDetails.bankAccount.accountName}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bankAccount: {...payoutDetails.bankAccount, accountName: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g., NIC Asia Bank"
                      value={payoutDetails.bankAccount.bankName}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bankAccount: {...payoutDetails.bankAccount, bankName: e.target.value}
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Kathmandu"
                      value={payoutDetails.bankAccount.branchName}
                      onChange={(e) => setPayoutDetails({
                        ...payoutDetails,
                        bankAccount: {...payoutDetails.bankAccount, branchName: e.target.value}
                      })}
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
                <span className="detail-value preferred">{payoutDetails.preferredMethod.toUpperCase()}</span>
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
                    <span className="detail-label">Bank:</span>
                    <span className="detail-value">{payoutDetails.bankAccount.bankName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Number:</span>
                    <span className="detail-value">{payoutDetails.bankAccount.accountNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Account Name:</span>
                    <span className="detail-value">{payoutDetails.bankAccount.accountName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Branch:</span>
                    <span className="detail-value">{payoutDetails.bankAccount.branchName}</span>
                  </div>
                </>
              )}
              
              {/* Show warning if no details configured for the preferred method */}
              {((payoutDetails.preferredMethod === 'esewa' && !payoutDetails.esewaId) ||
                (payoutDetails.preferredMethod === 'khalti' && !payoutDetails.khaltiMobile) ||
                (payoutDetails.preferredMethod === 'bank' && !payoutDetails.bankAccount?.accountNumber)) && (
                <div className="no-details">
                  <p>⚠️ No {payoutDetails.preferredMethod.toUpperCase()} details configured</p>
                  <p>Please add your {payoutDetails.preferredMethod} details to receive payments</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="finance-card history-card">
          <div className="card-header">
            <h2>📜 Payout History</h2>
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
                      <td>{new Date(payout.requestedAt).toLocaleDateString()}</td>
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
              <h2>📦 Pending Orders ({financeData.pendingOrders.length})</h2>
            </div>
            <div className="pending-orders-list">
              {financeData.pendingOrders.map((order) => (
                <div key={order.orderId} className="pending-order-item">
                  <div className="order-info">
                    <span className="order-id">Order #{order.orderId}</span>
                    <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="order-amount">
                    <span className="amount">Rs. {order.amount.toLocaleString()}</span>
                    <span className="commission">-Rs. {order.commission} (5%)</span>
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
