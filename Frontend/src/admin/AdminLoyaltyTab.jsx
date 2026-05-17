import { FiAward, FiMinusCircle, FiPlusCircle, FiRefreshCw } from 'react-icons/fi';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminLoyaltyTab.css';

function AdminLoyaltyTab() {
  const {
    fetchAdminData,
    handleUpdateLoyaltyPoints,
    loyaltyRecords
  } = useAdminDashboard();

  const records = loyaltyRecords || [];
  const totalPoints = records.reduce((sum, record) => sum + Number(record.points || 0), 0);
  const activeMembers = records.filter(record => Number(record.points || 0) > 0).length;

  const changePoints = (record, direction) => {
    const userId = record.userId?._id || record.userId || record.customer?._id || record.customer;
    if (!userId) {
      alert('Cannot update this record because the customer ID is missing.');
      return;
    }

    const defaultValue = direction === 'add' ? '100' : '50';
    const label = direction === 'add' ? 'add' : 'subtract';
    const input = prompt(`Enter points to ${label}:`, defaultValue);
    const points = Number(input);

    if (!input || Number.isNaN(points) || points <= 0) return;
    handleUpdateLoyaltyPoints(userId, direction === 'add' ? points : -points);
  };

  return (
    <div className="content-section loyalty-page">
      <div className="loyalty-summary-grid">
        <div className="loyalty-summary-card">
          <FiAward />
          <span>Total Points</span>
          <strong>{totalPoints.toLocaleString()}</strong>
        </div>
        <div className="loyalty-summary-card">
          <FiAward />
          <span>Active Members</span>
          <strong>{activeMembers}</strong>
        </div>
        <button className="loyalty-refresh-btn" onClick={fetchAdminData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Points</th>
              <th>Tier</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">No loyalty records found.</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record._id}>
                  <td className="user-name">{record.userId?.fullName || record.customer?.fullName || 'Unknown Customer'}</td>
                  <td>{record.userId?.email || record.customer?.email || 'N/A'}</td>
                  <td><strong>{Number(record.points || 0).toLocaleString()}</strong></td>
                  <td>
                    <span className={`loyalty-tier ${(record.tier || 'bronze').toLowerCase()}`}>
                      {record.tier || 'Bronze'}
                    </span>
                  </td>
                  <td>{record.updatedAt ? new Date(record.updatedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn add-btn" onClick={() => changePoints(record, 'add')}>
                        <FiPlusCircle /> Add
                      </button>
                      <button className="action-btn subtract-btn" onClick={() => changePoints(record, 'subtract')}>
                        <FiMinusCircle /> Subtract
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLoyaltyTab;
