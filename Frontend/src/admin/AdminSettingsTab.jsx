import { FiCheckCircle, FiCreditCard, FiDollarSign, FiSettings, FiToggleLeft } from 'react-icons/fi';
import { useAdminDashboard } from './AdminDashboardContext';

import './AdminSettingsTab.css';

function AdminSettingsTab() {
  const {
    handleSaveSettings,
    setSettings,
    settings
  } = useAdminDashboard();

  const paymentGateway = settings.paymentGateway || {};
  const payoutMethods = settings.payoutMethods || {
    bank: true,
    esewa: true,
    khalti: true
  };

  const updateSetting = (key, value) => setSettings({ ...settings, [key]: value });
  const updateGateway = (key, value) => setSettings({
    ...settings,
    paymentGateway: { ...paymentGateway, [key]: value }
  });
  const updatePayoutMethod = (key, value) => setSettings({
    ...settings,
    payoutMethods: { ...payoutMethods, [key]: value }
  });

  return (
    <div className="content-section settings-page">
      <div className="settings-form">
        <section className="settings-card">
          <div className="settings-card-title">
            <FiSettings />
            <div>
              <h3>General Settings</h3>
              <p>Basic marketplace identity and order defaults.</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Site Name</label>
              <input value={settings.siteName || ''} onChange={(e) => updateSetting('siteName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Site Email</label>
              <input type="email" value={settings.siteEmail || ''} onChange={(e) => updateSetting('siteEmail', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Site Phone</label>
              <input value={settings.sitePhone || ''} onChange={(e) => updateSetting('sitePhone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={settings.currency || 'NPR'} onChange={(e) => updateSetting('currency', e.target.value)}>
                <option value="NPR">NPR - Nepalese Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-title">
            <FiDollarSign />
            <div>
              <h3>Financial Settings</h3>
              <p>Fees, commission, shipping, and return rules.</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input type="number" value={settings.taxRate || 0} onChange={(e) => updateSetting('taxRate', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Shipping Fee (Rs.)</label>
              <input type="number" value={settings.shippingFee || 0} onChange={(e) => updateSetting('shippingFee', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Free Shipping Threshold (Rs.)</label>
              <input type="number" value={settings.freeShippingThreshold || 0} onChange={(e) => updateSetting('freeShippingThreshold', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Min Order Amount (Rs.)</label>
              <input type="number" value={settings.minOrderAmount || 0} onChange={(e) => updateSetting('minOrderAmount', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Platform Commission Rate (%)</label>
              <input type="number" min="0" max="100" value={settings.commissionRate || 3} onChange={(e) => updateSetting('commissionRate', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Return Window (Days)</label>
              <input type="number" min="1" max="30" value={settings.returnWindow || 7} onChange={(e) => updateSetting('returnWindow', Number(e.target.value))} />
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-title">
            <FiToggleLeft />
            <div>
              <h3>Platform Controls</h3>
              <p>Feature toggles for seller registration, product approval, and rewards.</p>
            </div>
          </div>
          <div className="settings-toggle-grid">
            <label><input type="checkbox" checked={!!settings.maintenanceMode} onChange={(e) => updateSetting('maintenanceMode', e.target.checked)} /> Maintenance Mode</label>
            <label><input type="checkbox" checked={!!settings.allowSellerRegistration} onChange={(e) => updateSetting('allowSellerRegistration', e.target.checked)} /> Allow Seller Registration</label>
            <label><input type="checkbox" checked={!!settings.requireProductApproval} onChange={(e) => updateSetting('requireProductApproval', e.target.checked)} /> Require Product Approval</label>
            <label><input type="checkbox" checked={!!settings.loyaltyPointsEnabled} onChange={(e) => updateSetting('loyaltyPointsEnabled', e.target.checked)} /> Enable Loyalty Points</label>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-title">
            <FiCreditCard />
            <div>
              <h3>Payment and Payouts</h3>
              <p>Configure customer eSewa payments and seller payout methods.</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>eSewa Merchant ID</label>
              <input value={paymentGateway.merchantId || ''} onChange={(e) => updateGateway('merchantId', e.target.value)} placeholder="EPAYTEST" />
            </div>
            <div className="form-group">
              <label>eSewa Secret Key</label>
              <input type="password" value={paymentGateway.secretKey || ''} onChange={(e) => updateGateway('secretKey', e.target.value)} />
            </div>
          </div>
          <div className="settings-toggle-grid">
            <label><input type="checkbox" checked={!!paymentGateway.isEnabled} onChange={(e) => updateGateway('isEnabled', e.target.checked)} /> Enable eSewa Payment Gateway</label>
            <label><input type="checkbox" checked={paymentGateway.testMode !== false} onChange={(e) => updateGateway('testMode', e.target.checked)} /> eSewa Test Mode</label>
            <label><input type="checkbox" checked={!!payoutMethods.bank} onChange={(e) => updatePayoutMethod('bank', e.target.checked)} /> Bank Payouts</label>
            <label><input type="checkbox" checked={!!payoutMethods.esewa} onChange={(e) => updatePayoutMethod('esewa', e.target.checked)} /> eSewa Payouts</label>
            <label><input type="checkbox" checked={!!payoutMethods.khalti} onChange={(e) => updatePayoutMethod('khalti', e.target.checked)} /> Khalti Payouts</label>
          </div>
        </section>

        <button className="save-settings-btn" onClick={handleSaveSettings}>
          <FiCheckCircle /> Save Settings
        </button>
      </div>
    </div>
  );
}

export default AdminSettingsTab;
