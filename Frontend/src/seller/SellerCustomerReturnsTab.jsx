import { FaArchive, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaClock, FaEye } from 'react-icons/fa';
import { useSellerDashboard } from './DashboardContext';
import './SellerCustomerReturnsTab.css';

function SellerCustomerReturnsTab() {
  const {
    returns,
    returnStats,
    returnStatusFilter,
    setReturnStatusFilter,
    loadingReturns,
    getReturnOrderLabel,
    getReturnImage,
    setSelectedReturn,
    handleReturnResponse,
    handleCompleteReturn,
  } = useSellerDashboard();

  const filtered = returnStatusFilter === 'All'
    ? returns
    : returns.filter(r => r.status === returnStatusFilter);

  return (
    <div className="seller-returns-section">
      {/* Filter Tabs */}
      <div className="returns-filter-tabs">
        {['All', 'Pending', 'Approved', 'Rejected', 'Refunded'].map(status => (
          <button
            key={status}
            onClick={() => setReturnStatusFilter(status)}
            className={`returns-filter-tab ${returnStatusFilter === status ? 'active' : ''}`}
          >
            {status}
            <span className="returns-count-badge">
              {status === 'All' ? returns.length : returns.filter(r => r.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Returns List */}
      {loadingReturns ? (
        <div className="returns-loading">
          <p>Loading returns...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="returns-empty">
          <FaArchive size={56} className="returns-empty-icon" />
          <h3>No Returns Found</h3>
          <p>{returnStatusFilter === 'All' ? 'No return requests from customers yet.' : `No ${returnStatusFilter.toLowerCase()} returns.`}</p>
        </div>
      ) : (
        <div className="returns-list">
          {filtered.map(ret => (
            <div key={ret._id} className="return-card">
              <div className="return-card-image">
                <img src={getReturnImage(ret)} alt={ret.product?.name || 'Product'} />
              </div>
              <div className="return-card-info">
                <div className="return-card-header">
                  <div>
                    <h4 className="return-product-name">{ret.product?.name || 'Unknown Product'}</h4>
                    <p className="return-order-id">Order: #{getReturnOrderLabel(ret)}</p>
                    <p className="return-customer">{ret.customer?.fullName || 'Customer'}</p>
                  </div>
                  <span className={`return-status-badge ${ret.status?.toLowerCase()}`}>{ret.status}</span>
                </div>
                <div className="return-card-details">
                  <div className="return-detail-item">
                    <span className="return-detail-label">Reason</span>
                    <span className="return-detail-value">{ret.reason}</span>
                  </div>
                  <div className="return-detail-item">
                    <span className="return-detail-label">Refund Amount</span>
                    <span className="return-detail-value return-refund">Rs. {Number(ret.refundAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="return-detail-item">
                    <span className="return-detail-label">Requested</span>
                    <span className="return-detail-value">{new Date(ret.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="return-card-actions">
                  <button className="return-btn view" onClick={() => setSelectedReturn(ret)}>
                    <FaEye /> View Details
                  </button>
                  {ret.status === 'Pending' && (
                    <>
                      <button className="return-btn approve" onClick={() => handleReturnResponse(ret._id, 'Approved')}>
                        <FaCheckCircle /> Approve
                      </button>
                      <button className="return-btn reject" onClick={() => handleReturnResponse(ret._id, 'Rejected')}>
                        <FaTimesCircle /> Reject
                      </button>
                    </>
                  )}
                  {ret.status === 'Approved' && (
                    <button className="return-btn complete" onClick={() => handleCompleteReturn(ret._id)}>
                      <FaCheckCircle /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerCustomerReturnsTab;
