import AdminSalesReportsTab from './AdminSalesReportsTab';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminSalesTab.css';

function AdminSalesTab() {
  const {
    selectedMetric,
    setSelectedMetric,
    salesData,
    salesCharts,
    timeRange,
    setTimeRange
  } = useAdminDashboard();

  return (
    <AdminSalesReportsTab
      selectedMetric={selectedMetric}
      setSelectedMetric={setSelectedMetric}
      salesData={salesData}
      salesCharts={salesCharts}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
    />
  );
}

export default AdminSalesTab;
