import React, { createContext, useContext } from 'react';
import SellerDashboardController from '../services/SellerDashboardController';

const SellerDashboardContext = createContext(null);

export function SellerDashboardProvider({ children }) {
  const controller = SellerDashboardController();
  return (
    <SellerDashboardContext.Provider value={controller}>
      {children}
    </SellerDashboardContext.Provider>
  );
}

export function useSellerDashboard() {
  const context = useContext(SellerDashboardContext);
  if (!context) {
    throw new Error('useSellerDashboard must be used within a SellerDashboardProvider');
  }
  return context;
}
