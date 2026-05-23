import { Link } from 'react-router-dom';
import './TermsConditions.css';

function SellerTerms() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <Link to="/seller" className="back-link">← Back to Become a Seller</Link>
        
        <h1>Seller Terms & Conditions</h1>
        <p className="last-updated">Last Updated: May 26, 2026</p>

        <div className="terms-content">
          <section>
            <h2>1. Seller Agreement</h2>
            <p>
              By registering as a seller on ReBuy, you agree to these Seller Terms & Conditions. 
              These terms govern your use of the ReBuy platform as a seller and your relationship with ReBuy and its customers.
            </p>
          </section>

          <section>
            <h2>2. Seller Registration & Verification</h2>
            <h3>2.1 Eligibility</h3>
            <p>To become a seller on ReBuy, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Have a valid email address and phone number</li>
              <li>Comply with all applicable laws in Nepal</li>
            </ul>

            <h3>2.2 Verification Process</h3>
            <p>
              All seller accounts are subject to verification by ReBuy administrators. You must provide:
            </p>
            <ul>
              <li>Valid identification documents</li>
              <li>Store name and description</li>
              <li>Contact information</li>
              <li>Payout details (bank account or mobile wallet)</li>
            </ul>
          </section>

          <section>
            <h2>3. Product Listings</h2>
            <h3>3.1 Product Requirements</h3>
            <p>All products listed must:</p>
            <ul>
              <li>Be second-hand or pre-owned clothing items</li>
              <li>Have accurate descriptions and condition tags</li>
              <li>Include clear, high-quality images (up to 10 images)</li>
              <li>Be priced fairly and competitively</li>
              <li>Comply with ReBuy's prohibited items policy</li>
            </ul>

            <h3>3.2 Condition Tagging</h3>
            <p>You must accurately tag each item with one of the following conditions:</p>
            <ul>
              <li><strong>New:</strong> Never worn, with original tags</li>
              <li><strong>Like New:</strong> Worn once or twice, no visible wear</li>
              <li><strong>Slightly Used:</strong> Minor signs of wear, good condition</li>
              <li><strong>Vintage:</strong> Older items with character and history</li>
            </ul>

            <h3>3.3 Prohibited Items</h3>
            <p>You may not list:</p>
            <ul>
              <li>Counterfeit or replica items</li>
              <li>Stolen goods</li>
              <li>Items with offensive or inappropriate content</li>
              <li>Damaged items not disclosed in the description</li>
              <li>Items that violate intellectual property rights</li>
            </ul>
          </section>

          <section>
            <h2>4. Pricing & Fees</h2>
            <h3>4.1 Platform Commission</h3>
            <p>
              ReBuy charges a <strong>3% platform commission</strong> on each successful sale. 
              This fee is automatically deducted from your earnings.
            </p>

            <h3>4.2 Pricing Guidelines</h3>
            <ul>
              <li>Maximum price per item: Rs. 5,000</li>
              <li>Prices must be in Nepali Rupees (NPR)</li>
              <li>You may offer discounts and promotions</li>
              <li>Price changes must be reasonable and not misleading</li>
            </ul>
          </section>

          <section>
            <h2>5. Order Fulfillment</h2>
            <h3>5.1 Processing Time</h3>
            <p>
              You must process and ship orders within <strong>2 business days</strong> of receiving payment confirmation.
            </p>

            <h3>5.2 Shipping Responsibilities</h3>
            <ul>
              <li>Package items securely to prevent damage</li>
              <li>Provide tracking information when available</li>
              <li>Communicate delivery timelines to customers</li>
              <li>Handle shipping costs as agreed with the customer</li>
            </ul>

            <h3>5.3 Order Cancellations</h3>
            <p>
              You may cancel an order only if:
            </p>
            <ul>
              <li>The item is no longer available</li>
              <li>There is a pricing error</li>
              <li>The customer requests cancellation before shipping</li>
            </ul>
          </section>

          <section>
            <h2>6. Payments & Payouts</h2>
            <h3>6.1 Payment Methods</h3>
            <p>ReBuy supports the following payment methods:</p>
            <ul>
              <li>eSewa (online payment)</li>
              <li>Cash on Delivery (COD)</li>
            </ul>

            <h3>6.2 Payout Schedule</h3>
            <p>
              Payouts are processed <strong>weekly</strong> to your registered bank account or mobile wallet. 
              Funds are released after successful delivery confirmation.
            </p>

            <h3>6.3 Payout Requirements</h3>
            <ul>
              <li>Minimum payout threshold: Rs. 500</li>
              <li>Valid payout details must be provided</li>
              <li>Payouts may be delayed for verification or fraud checks</li>
            </ul>
          </section>

          <section>
            <h2>7. Returns & Refunds</h2>
            <h3>7.1 Return Policy</h3>
            <p>
              Customers may request returns within <strong>7 days</strong> of delivery if:
            </p>
            <ul>
              <li>The item does not match the description</li>
              <li>The item is damaged or defective</li>
              <li>The wrong item was sent</li>
            </ul>

            <h3>7.2 Seller Responsibilities</h3>
            <ul>
              <li>Accept valid return requests promptly</li>
              <li>Provide return shipping instructions</li>
              <li>Issue refunds within 3 business days of receiving returned items</li>
              <li>Cover return shipping costs for seller errors</li>
            </ul>
          </section>

          <section>
            <h2>8. Seller Performance & Trust Score</h2>
            <h3>8.1 Performance Metrics</h3>
            <p>Your seller performance is evaluated based on:</p>
            <ul>
              <li>Order fulfillment rate</li>
              <li>Customer ratings and reviews</li>
              <li>Response time to customer inquiries</li>
              <li>Return and refund rate</li>
              <li>Policy compliance</li>
            </ul>

            <h3>8.2 Trust Score</h3>
            <p>
              ReBuy maintains a Trust Score for each seller based on transaction history, 
              customer feedback, and compliance with platform policies.
            </p>
          </section>

          <section>
            <h2>9. Fraud Detection & Prevention</h2>
            <h3>9.1 Automated Monitoring</h3>
            <p>
              ReBuy uses automated fraud detection systems to monitor seller activity. 
              Suspicious behavior may trigger account review or suspension.
            </p>

            <h3>9.2 Prohibited Activities</h3>
            <ul>
              <li>Creating fake reviews or ratings</li>
              <li>Manipulating prices or inventory</li>
              <li>Engaging in fraudulent transactions</li>
              <li>Misrepresenting product conditions</li>
              <li>Circumventing platform fees</li>
            </ul>
          </section>

          <section>
            <h2>10. Account Suspension & Termination</h2>
            <h3>10.1 Grounds for Suspension</h3>
            <p>ReBuy may suspend your account for:</p>
            <ul>
              <li>Violation of these Seller Terms</li>
              <li>Fraudulent activity or suspicious behavior</li>
              <li>Poor seller performance or customer complaints</li>
              <li>Failure to fulfill orders</li>
              <li>Listing prohibited items</li>
            </ul>

            <h3>10.2 Account Termination</h3>
            <p>
              ReBuy reserves the right to permanently terminate seller accounts for 
              serious or repeated violations. Terminated sellers forfeit pending payouts.
            </p>
          </section>

          <section>
            <h2>11. Intellectual Property</h2>
            <p>
              You retain ownership of your product images and descriptions. By listing on ReBuy, 
              you grant ReBuy a non-exclusive license to display your content on the platform.
            </p>
          </section>

          <section>
            <h2>12. Liability & Indemnification</h2>
            <h3>12.1 Seller Liability</h3>
            <p>
              You are responsible for the accuracy of your listings and the quality of your products. 
              ReBuy is not liable for disputes between sellers and customers.
            </p>

            <h3>12.2 Indemnification</h3>
            <p>
              You agree to indemnify ReBuy against any claims, damages, or losses arising from 
              your use of the platform or violation of these terms.
            </p>
          </section>

          <section>
            <h2>13. Communication</h2>
            <p>
              You agree to receive communications from ReBuy regarding:
            </p>
            <ul>
              <li>Order notifications and updates</li>
              <li>Customer inquiries and messages</li>
              <li>Policy changes and platform updates</li>
              <li>Marketing and promotional materials (opt-out available)</li>
            </ul>
          </section>

          <section>
            <h2>14. Data Privacy</h2>
            <p>
              Your personal information is handled in accordance with ReBuy's Privacy Policy. 
              We collect and use seller data to facilitate transactions and improve platform services.
            </p>
          </section>

          <section>
            <h2>15. Governing Law</h2>
            <p>
              These Seller Terms are governed by the laws of Nepal. Any disputes shall be 
              resolved in accordance with Nepali law and jurisdiction.
            </p>
          </section>

          <section>
            <h2>16. Changes to Terms</h2>
            <p>
              ReBuy reserves the right to modify these Seller Terms at any time. 
              Continued use of the platform after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2>17. Contact Information</h2>
            <p>
              For questions about these Seller Terms, contact us at:
            </p>
            <ul>
              <li>Email: sellers@rebuy.com.np</li>
              <li>Phone: +977-1-XXXXXXX</li>
              <li>Address: Kathmandu, Nepal</li>
            </ul>
          </section>

          <div className="acceptance-notice">
            <p>
              <strong>By registering as a seller on ReBuy, you acknowledge that you have read, 
              understood, and agree to be bound by these Seller Terms & Conditions.</strong>
            </p>
          </div>
        </div>

        <div className="terms-footer">
          <Link to="/seller" className="back-button">Back to Become a Seller</Link>
        </div>
      </div>
    </div>
  );
}

export default SellerTerms;
