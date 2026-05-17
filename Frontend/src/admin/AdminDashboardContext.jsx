import { createContext, useContext } from 'react';

const AdminDashboardContext = createContext(null);

export function AdminDashboardProvider({ value, children }) {
  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error('useAdminDashboard must be used inside AdminDashboardProvider');
  }
  return context;
}
