import { useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiSlash,
  FiUserCheck,
  FiXCircle
} from 'react-icons/fi';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminSellerApprovalTab.css';

const SELLER_VIEWS = [
  { key: 'pending', label: 'Pending', icon: FiClock },
  { key: 'approved', label: 'Approved', icon: FiCheckCircle },
  { key: 'suspended', label: 'Suspended / Blocked', icon: FiSlash },
  { key: 'rejected', label: 'Rejected', icon: FiXCircle }
];

function AdminSellerApprovalTab() {
  const [activeView, setActiveView] = useState('pending');
  const {
    approvedSellers,
    downloadAllSellersCSV,
    handleApproveSeller,
    handleReactivateSeller,
    handleRejectSeller,
    handleSuspendSeller,
    handleViewSeller,
    pendingSellers,
    rejectedSellers,
    suspendedSellers
  } = useAdminDashboard();

  const sellerGroups = useMemo(() => ({
    pending: pendingSellers || [],
    approved: approvedSellers || [],
    suspended: suspendedSellers || [],
    rejected: rejectedSellers || []
  }), [pendingSellers, approvedSellers, suspendedSellers, rejectedSellers]);

  const currentSellers = sellerGroups[activeView] || [];
  const totalSellers = Object.values(sellerGroups).reduce((sum, sellers) => sum + sellers.length, 0);

  const renderActions = (seller) => {
    if (activeView === 'pending') {
      return (
        <>
          <button className="approve-btn" onClick={() => handleApproveSeller(seller.id)}>
            <FiCheckCircle /> Approve
          </button>
          <button className="reject-btn" onClick={() => handleRejectSeller(seller.id)}>
            <FiXCircle /> Reject
          </button>
        </>
      );
    }

    if (activeView === 'approved') {
      return (
        <button className="suspend-btn" onClick={() => handleSuspendSeller(seller.id)}>
          <FiSlash /> Suspend
        </button>
      );
    }

    if (activeView === 'suspended') {
      return (
        <button className="approve-btn" onClick={() => handleReactivateSeller(seller.id)}>
          <FiCheckCircle /> Reactivate
        </button>
      );
    }

    return (
      <button className="approve-btn" onClick={() => handleReactivateSeller(seller.id)}>
        <FiCheckCircle /> Approve
      </button>
    );
  };

  return (
    <div className="content-section seller-approval-page">
      <div className="seller-approval-toolbar">
        <div className="seller-status-tabs">
          {SELLER_VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`seller-status-tab ${activeView === key ? 'active' : ''}`}
              onClick={() => setActiveView(key)}
            >
              <Icon />
              <span>{label}</span>
              <strong>{sellerGroups[key].length}</strong>
            </button>
          ))}
        </div>
        <button
          className="export-all-btn"
          onClick={downloadAllSellersCSV}
          disabled={totalSellers === 0}
        >
          <FiDownload /> Export
        </button>
      </div>

      <div className="section-header">
        <h2>
          <FiUserCheck className="section-icon" />
          {SELLER_VIEWS.find(view => view.key === activeView)?.label} Sellers ({currentSellers.length})
        </h2>
      </div>

      {currentSellers.length === 0 ? (
        <div className="empty-state-card">
          <FiUserCheck size={64} />
          <h3>No {SELLER_VIEWS.find(view => view.key === activeView)?.label} Sellers</h3>
          <p>Seller applications and account statuses will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Store</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>{activeView === 'approved' ? 'Approved' : activeView === 'suspended' ? 'Suspended' : activeView === 'rejected' ? 'Rejected' : 'Applied'}</th>
                {(activeView === 'approved' || activeView === 'suspended') && <th>Sales</th>}
                {activeView === 'rejected' && <th>Reason</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSellers.map((seller) => (
                <tr key={seller.id} className={`${activeView}-row`}>
                  <td>
                    <div className="seller-name-cell">
                      <div className={`seller-avatar-small ${activeView}`}>
                        {(seller.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <span>{seller.name || 'Unknown Seller'}</span>
                    </div>
                  </td>
                  <td className="store-name-cell">{seller.storeName || 'N/A'}</td>
                  <td>{seller.email || 'N/A'}</td>
                  <td>{seller.phone || 'N/A'}</td>
                  <td>{seller.address || seller.city || 'N/A'}</td>
                  <td>{seller.appliedDate || seller.approvedDate || seller.suspendedDate || seller.rejectedDate || 'N/A'}</td>
                  {(activeView === 'approved' || activeView === 'suspended') && (
                    <td className="sales-cell">Rs. {Number(seller.totalSales || 0).toLocaleString()}</td>
                  )}
                  {activeView === 'rejected' && (
                    <td className="reason-cell">{seller.rejectionReason || 'Not specified'}</td>
                  )}
                  <td>
                    <div className="action-buttons seller-actions-row">
                      <button className="view-btn" onClick={() => handleViewSeller(seller.id)}>
                        <FiEye /> View
                      </button>
                      {renderActions(seller)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminSellerApprovalTab;
