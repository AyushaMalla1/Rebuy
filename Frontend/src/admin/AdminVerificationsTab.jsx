import { useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiEye, FiRefreshCw, FiUser, FiXCircle } from 'react-icons/fi';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminVerificationsTab.css';

function AdminVerificationsTab() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeVerification, setActiveVerification] = useState(null);
  const {
    fetchVerifications,
    handleApproveVerification,
    handleRejectVerification,
    verificationStats,
    verifications
  } = useAdminDashboard();

  const filteredVerifications = useMemo(() => {
    const list = verifications || [];
    if (statusFilter === 'all') return list;
    return list.filter(item => (item.approvalStatus || 'pending') === statusFilter);
  }, [verifications, statusFilter]);

  const statusCounts = {
    all: verifications?.length || 0,
    pending: verificationStats?.pending || 0,
    approved: verificationStats?.approved || 0,
    rejected: verificationStats?.rejected || 0
  };

  const getStatus = (verification) => verification.approvalStatus || 'pending';
  const getCondition = (verification) => (
    verification.matchesDescription === 'yes' || verification.conditionMatches === true ? 'Good' : 'Needs Review'
  );

  return (
    <div className="content-section verifications-page">


      {filteredVerifications.length === 0 ? (
        <div className="empty-state-card">
          <FiCheckCircle size={56} />
          <h3>No Condition Verifications</h3>
          <p>Customer condition checks will appear here for review.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>ORDER ID</th>
                <th style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>CUSTOMER</th>
                <th style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>PRODUCT</th>
                <th style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>CONDITION STATUS</th>
                <th style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>SUBMITTED</th>
                <th style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>APPROVAL STATUS</th>
                <th style={{ color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredVerifications.map((verification) => (
                <tr key={verification._id}>
                  <td>#{(verification.orderId || '').slice(-6).toUpperCase() || 'N/A'}</td>
                  <td>
                    <div className="user-cell">
                      <FiUser />
                      <span>{verification.customerName || verification.customer?.fullName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{verification.productName || verification.product?.name || 'Unknown Product'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#6b7280' }}>
                      {getCondition(verification) === 'Good' ? <FiCheckCircle style={{ color: '#10b981' }}/> : <FiXCircle style={{ color: '#6b7280' }}/>}
                      {getCondition(verification) === 'Good' ? 'GOOD' : 'BAD'}
                    </div>
                  </td>
                  <td>{verification.createdAt ? new Date(verification.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#6b7280', fontSize: '13px' }}>
                      {getStatus(verification) === 'approved' && <FiCheckCircle style={{color: '#10b981'}}/>}
                      {getStatus(verification) === 'rejected' && <FiXCircle style={{color: '#ef4444'}}/>}
                      {getStatus(verification) === 'pending' && <FiClock />}
                      {getStatus(verification).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ gap: '10px' }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => setActiveVerification(verification)}
                        style={{ color: '#00bcd4', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                      >
                        <FiEye />
                      </button>
                      {getStatus(verification) === 'pending' && (
                        <>
                          <button 
                            className="icon-btn" 
                            onClick={() => handleApproveVerification(verification._id)}
                            style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                          >
                            <FiCheckCircle />
                          </button>
                          <button 
                            className="icon-btn" 
                            onClick={() => handleRejectVerification(verification._id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                          >
                            <FiXCircle />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeVerification && (
        <div className="modal-overlay" onClick={() => setActiveVerification(null)}>
          <div className="order-modal-content verification-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Condition Verification</h2>
              <button className="close-btn" onClick={() => setActiveVerification(null)}>
                <FiXCircle />
              </button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Customer</label>
                  <span>{activeVerification.customerName || activeVerification.customer?.fullName || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <label>Product</label>
                  <span>{activeVerification.productName || activeVerification.product?.name || 'Unknown Product'}</span>
                </div>
                <div className="info-item">
                  <label>Rating</label>
                  <span>{activeVerification.rating || 0}/5</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatus(activeVerification)}`}>
                    {getStatus(activeVerification)}
                  </span>
                </div>
              </div>
              <div className="verification-comment">
                <label>Customer Notes</label>
                <p>{activeVerification.customerNotes || activeVerification.comment || activeVerification.notes || 'No notes provided.'}</p>
              </div>
              
              {activeVerification.verificationImages && activeVerification.verificationImages.length > 0 && (
                <div className="verification-images" style={{ marginTop: '20px' }}>
                  <label style={{ color: '#64748b', display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>Attached Images</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {activeVerification.verificationImages.slice(0, 4).map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`Verification ${idx + 1}`} 
                        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {getStatus(activeVerification) === 'pending' && (
              <div className="modal-actions">
                <button className="approve-btn" onClick={() => handleApproveVerification(activeVerification._id)}>
                  <FiCheckCircle /> Approve
                </button>
                <button className="reject-btn" onClick={() => handleRejectVerification(activeVerification._id)}>
                  <FiXCircle /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVerificationsTab;
