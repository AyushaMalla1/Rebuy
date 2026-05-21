import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaStar } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { useSellerDashboard } from './DashboardContext';
import './SellerVerificationsTab.css';

function SellerVerificationsTab() {
  const {
    verifications,
    verificationStats,
    loadingVerifications,
    getVerificationImage,
    getVerificationProductName,
    setSelectedVerification,
    fetchVerifications,
    sellerData,
    globalSearch,
  } = useSellerDashboard();

  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (sellerData?._id) {
      fetchVerifications(sellerData._id);
    }
  }, [sellerData]);

  let filtered = statusFilter === 'All'
    ? verifications
    : verifications.filter(v => v.approvalStatus === statusFilter.toLowerCase());

  if (globalSearch && globalSearch.trim() !== '') {
    const query = globalSearch.toLowerCase().trim();
    filtered = filtered.filter(v =>
      getVerificationProductName(v).toLowerCase().includes(query) ||
      (v.customerName || v.customer?.fullName || '').toLowerCase().includes(query) ||
      (v.orderId || '').toLowerCase().includes(query) ||
      (v.customerNotes || '').toLowerCase().includes(query)
    );
  }

  return (
    <div className="verifications-section">
      {/* Filter Tabs */}
      <div className="verif-filter-tabs">
        {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`verif-filter-tab ${statusFilter === status ? 'active' : ''}`}
          >
            {status}
            <span className="verif-count-badge">
              {status === 'All'
                ? verifications.length
                : verifications.filter(v => v.approvalStatus === status.toLowerCase()).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loadingVerifications ? (
        <div className="verif-loading"><p>Loading verifications...</p></div>
      ) : filtered.length === 0 ? (
        <div className="verif-empty">
          <MdVerified size={56} className="verif-empty-icon" />
          <h3>No Verifications Found</h3>
          <p>{statusFilter === 'All' ? 'No product verifications from customers yet.' : `No ${statusFilter.toLowerCase()} verifications.`}</p>
        </div>
      ) : (
        <div className="verif-list">
          {filtered.map(verif => (
            <div key={verif._id} className="verif-card">
              <div className="verif-card-image">
                <img src={getVerificationImage(verif)} alt={getVerificationProductName(verif)} />
              </div>
              <div className="verif-card-info">
                <div className="verif-card-header">
                  <div>
                    <h4 className="verif-product-name">{getVerificationProductName(verif)}</h4>
                    <p className="verif-customer">{verif.customerName || verif.customer?.fullName || 'Customer'}</p>
                    <p className="verif-order-id">Order: #{verif.orderId || 'N/A'}</p>
                  </div>
                  <span className={`verif-status-badge ${verif.approvalStatus}`}>{verif.approvalStatus}</span>
                </div>

                <div className="verif-card-details">
                  <div className="verif-detail-item">
                    <span className="verif-detail-label">Rating</span>
                    <span className="verif-detail-value verif-rating">
                      <FaStar /> {verif.rating || 0}/5
                    </span>
                  </div>
                  <div className="verif-detail-item">
                    <span className="verif-detail-label">Condition Match</span>
                    <span className={`verif-detail-value ${verif.matchesDescription === 'yes' ? 'match-yes' : 'match-no'}`}>
                      {verif.matchesDescription === 'yes' ? 'Matches' : 'Does not match'}
                    </span>
                  </div>
                  <div className="verif-detail-item">
                    <span className="verif-detail-label">Date</span>
                    <span className="verif-detail-value">{new Date(verif.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {verif.customerNotes && (
                  <p className="verif-notes">"{verif.customerNotes}"</p>
                )}

                <div className="verif-card-actions">
                  <button className="verif-btn view" onClick={() => setSelectedVerification(verif)}>
                    <FaEye /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerVerificationsTab;
