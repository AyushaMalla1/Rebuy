import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiDollarSign, FiShield, FiCheckCircle } from 'react-icons/fi';
import './PaymentOptions.css';

function PaymentOptions() {
  const navigate = useNavigate();

  const paymentMethods = [
    {
      icon: <FiCreditCard size={36} />,
      name: 'eSewa',
      color: '#60bb46',
      description: 'Nepal\'s leading digital wallet for instant payments',
      features: ['Instant payment confirmation', 'No transaction fees', 'Secure and encrypted', 'Refunds within 3-5 days'],
      howTo: ['Select eSewa at checkout', 'Login to your eSewa account', 'Confirm payment', 'Order confirmed instantly']
    },
    {
      icon: <FiDollarSign size={36} />,
      name: 'Cash on Delivery',
      color: '#00bcd4',
      description: 'Pay when you receive your order at your doorstep',
      features: ['No advance payment needed', 'Inspect before paying', 'Available in select areas', 'Extra charges may apply'],
      howTo: ['Select COD at checkout', 'Confirm your address', 'Receive your order', 'Pay to delivery person']
    }
  ];

  return (
    <div className="payment-options-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="payment-hero">
        <h1>Payment Options</h1>
        <p>Choose your preferred payment method for a seamless shopping experience</p>
      </div>

      <div className="payment-content">
        <section className="security-section">
          <FiShield size={32} color="#00bcd4" />
          <h2>100% Secure Payments</h2>
          <p>All transactions are encrypted and protected with industry-standard security protocols</p>
        </section>

        <section className="payment-methods-section">
          <h2>Available Payment Methods</h2>
          <div className="payment-methods-grid">
            {paymentMethods.map((method, index) => (
              <div key={index} className="payment-method-card">
                <div className="payment-icon" style={{color: method.color}}>
                  {method.icon}
                </div>
                <h3 style={{color: method.color}}>{method.name}</h3>
                <p className="payment-description">{method.description}</p>
                
                <div className="payment-features">
                  <h4>Features:</h4>
                  <ul>
                    {method.features.map((feature, idx) => (
                      <li key={idx}>
                        <FiCheckCircle size={16} color="#4caf50" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="payment-howto">
                  <h4>How to Pay:</h4>
                  <ol>
                    {method.howTo.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="payment-info-section">
          <h2>Payment Information</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Refund Policy</h3>
              <p>Refunds are processed within 3-5 business days to your original payment method. For COD orders, refunds are issued via bank transfer.</p>
            </div>
            <div className="info-card">
              <h3>Payment Security</h3>
              <p>We use SSL encryption and PCI-DSS compliant payment gateways to ensure your payment information is always secure.</p>
            </div>
            <div className="info-card">
              <h3>Transaction Fees</h3>
              <p>No additional fees for eSewa. COD may have delivery charges.</p>
            </div>
            <div className="info-card">
              <h3>Payment Issues</h3>
              <p>If you face any payment issues, contact our support team immediately. We'll help resolve it within 24 hours.</p>
            </div>
          </div>
        </section>

        <section className="payment-faq-section">
          <h2>Common Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h4>Can I change my payment method after placing an order?</h4>
              <p>Payment methods cannot be changed after order confirmation. Please cancel and place a new order if needed.</p>
            </div>
            <div className="faq-item">
              <h4>What if my eSewa payment fails?</h4>
              <p>If payment fails, the amount will be automatically refunded within 5-7 business days. You can retry the payment or choose Cash on Delivery.</p>
            </div>
            <div className="faq-item">
              <h4>Are there extra charges for Cash on Delivery?</h4>
              <p>COD may have minimal delivery charges depending on your location. The exact amount will be shown at checkout.</p>
            </div>
            <div className="faq-item">
              <h4>Is eSewa payment secure?</h4>
              <p>Yes, eSewa uses bank-level encryption and security. Your payment information is completely safe and secure.</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Need Help?</h2>
          <div className="help-buttons">
            <button onClick={() => navigate('/contact')}>Contact Support</button>
            <button onClick={() => navigate('/faq')}>View FAQs</button>
            <button onClick={() => {
              const token = sessionStorage.getItem('token');
              if (token) {
                navigate('/profile');
              } else {
                navigate('/login');
              }
            }}>My Account</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PaymentOptions;
