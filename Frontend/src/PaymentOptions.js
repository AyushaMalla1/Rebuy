import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiDollarSign, FiShield, FiCheckCircle } from 'react-icons/fi';
import './PaymentOptions.css';

function PaymentOptions() {
  const navigate = useNavigate();

  const paymentMethods = [
    {
      icon: <FiCreditCard size={48} />,
      name: 'eSewa',
      color: '#60bb46',
      description: 'Nepal\'s leading digital wallet for instant payments',
      features: ['Instant payment confirmation', 'No transaction fees', 'Secure and encrypted', 'Refunds within 3-5 days'],
      howTo: ['Select eSewa at checkout', 'Login to your eSewa account', 'Confirm payment', 'Order confirmed instantly']
    },
    {
      icon: <FiCreditCard size={48} />,
      name: 'Khalti',
      color: '#5d2e8e',
      description: 'Popular digital wallet for seamless online transactions',
      features: ['Quick payment process', 'Cashback offers available', 'Bank account linking', 'Easy refund process'],
      howTo: ['Choose Khalti at checkout', 'Enter your Khalti PIN', 'Verify transaction', 'Payment complete']
    },
    {
      icon: <FiCreditCard size={48} />,
      name: 'Credit/Debit Cards',
      color: '#ff6b6b',
      description: 'Pay with Visa, Mastercard, or other major cards',
      features: ['Widely accepted', 'Secure payment gateway', 'International cards supported', 'EMI options available'],
      howTo: ['Select card payment', 'Enter card details', 'Complete OTP verification', 'Order confirmed']
    },
    {
      icon: <FiDollarSign size={48} />,
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
          <FiShield size={48} color="#00bcd4" />
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
              <p>No additional fees for eSewa and Khalti. Card payments may have minimal processing fees. COD may have delivery charges.</p>
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
              <h4>Is it safe to save my card details?</h4>
              <p>Yes, we use tokenization to securely store card information. Your actual card details are never stored on our servers.</p>
            </div>
            <div className="faq-item">
              <h4>What if my payment fails?</h4>
              <p>If payment fails, the amount will be automatically refunded within 5-7 business days. You can retry the payment or choose a different method.</p>
            </div>
            <div className="faq-item">
              <h4>Do you accept international payments?</h4>
              <p>Yes, we accept international credit and debit cards. However, eSewa and Khalti are only available for Nepali users.</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Need Help?</h2>
          <div className="help-buttons">
            <button onClick={() => navigate('/contact')}>Contact Support</button>
            <button onClick={() => navigate('/faq')}>View FAQs</button>
            <button onClick={() => {
              const token = localStorage.getItem('token');
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
