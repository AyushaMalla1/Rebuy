import {
  FaArchive,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaUser,
  FaReceipt,
} from 'react-icons/fa';
import { useSellerDashboard } from './DashboardContext';
import './SellerCustomerReturnsTab.css';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Refunded'];

function SellerCustomerReturnsTab() {
  const {
    returns,
    returnStatusFilter,
    setReturnStatusFilter,
    loadingReturns,
    getReturnOrderLabel,
    getReturnImage,
    setSelectedReturn,
    handleReturnResponse,
    handleCompleteReturn,
    globalSearch,
  } = useSellerDashboard();

  const getCustomerName = (ret) =>
    ret.customer?.fullName ||
    ret.orderId?.customerName ||
    'Unknown customer';

  let filtered =
    returnStatusFilter === 'All'
      ? returns
      : returns.filter((r) => r.status === returnStatusFilter);

  if (globalSearch?.trim()) {
    const query = globalSearch.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        (r.product?.name || '').toLowerCase().includes(query) ||
        getReturnOrderLabel(r).toLowerCase().includes(query) ||
        getCustomerName(r).toLowerCase().includes(query) ||
        (r.reason || '').toLowerCase().includes(query)
    );
  }

  const countForStatus = (status) =>
    status === 'All' ? returns.length : returns.filter((r) => r.status === status).length;

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="seller-returns-section">
      <div className="returns-filter-tabs" role="tablist" aria-label="Filter returns">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={returnStatusFilter === status}
            onClick={() => setReturnStatusFilter(status)}
            className={`returns-filter-tab ${returnStatusFilter === status ? 'active' : ''}`}
          >
            {status}
            <span className="returns-count-badge">{countForStatus(status)}</span>
          </button>
        ))}
      </div>

      {loadingReturns ? (
        <div className="returns-loading">
          <div className="returns-loading-spinner" />
          <p>Loading return requests…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="returns-empty">
          <div className="returns-empty-icon-wrap">
            <FaArchive size={28} />
          </div>
          <h3>No returns found</h3>
          <p>
            {returnStatusFilter === 'All'
              ? 'When customers request a return, it will show up here.'
              : `No ${returnStatusFilter.toLowerCase()} returns right now.`}
          </p>
        </div>
      ) : (
        <div className="returns-list">
          {filtered.map((ret) => {
            const statusKey = ret.status?.toLowerCase() || 'pending';
            return (
              <article
                key={ret._id}
                className={`return-card return-card--${statusKey}`}
              >
                <div className="return-card-image">
                  <img src={getReturnImage(ret)} alt="" />
                </div>

                <div className="return-card-main">
                  <div className="return-card-top">
                    <h4 className="return-product-name">
                      {ret.product?.name || 'Unknown product'}
                    </h4>
                    <span className={`return-status-badge ${statusKey}`}>
                      {ret.status}
                    </span>
                  </div>

                  <div className="return-card-meta">
                    <span className="return-meta-chip">
                      <FaReceipt aria-hidden />
                      #{getReturnOrderLabel(ret)}
                    </span>
                    <span className="return-meta-chip">
                      <FaUser aria-hidden />
                      {getCustomerName(ret)}
                    </span>
                  </div>

                  <div className="return-card-footer">
                    <dl className="return-facts">
                      <div className="return-fact">
                        <dt>Reason</dt>
                        <dd>{ret.reason}</dd>
                      </div>
                      <div className="return-fact return-fact--refund">
                        <dt>Refund</dt>
                        <dd>Rs. {Number(ret.refundAmount || 0).toLocaleString()}</dd>
                      </div>
                      <div className="return-fact">
                        <dt>Requested</dt>
                        <dd>{formatDate(ret.createdAt)}</dd>
                      </div>
                    </dl>

                    <div className="return-card-actions">
                      <button
                        type="button"
                        className="return-btn return-btn--primary"
                        onClick={() => setSelectedReturn(ret)}
                      >
                        <FaEye aria-hidden /> Details
                      </button>
                      {ret.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="return-btn return-btn--approve"
                            onClick={() => handleReturnResponse(ret._id, 'Approved')}
                          >
                            <FaCheckCircle aria-hidden /> Approve
                          </button>
                          <button
                            type="button"
                            className="return-btn return-btn--reject"
                            onClick={() => handleReturnResponse(ret._id, 'Rejected')}
                          >
                            <FaTimesCircle aria-hidden /> Reject
                          </button>
                        </>
                      )}
                      {ret.status === 'Approved' && (
                        <button
                          type="button"
                          className="return-btn return-btn--complete"
                          onClick={() => handleCompleteReturn(ret._id)}
                        >
                          <FaCheckCircle aria-hidden /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SellerCustomerReturnsTab;
