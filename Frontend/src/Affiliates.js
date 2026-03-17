import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import './Affiliates.css';

function Affiliates() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <FiDollarSign size={40} />,
      title: 'Earn Commission',
      description: 'Get 10% commission on every sale you refer'
    },
    {
      icon: <FiTrendingUp size={40} />,
      title: 'Performance Bonuses',
      description: 'Extra rewards for top performers'
    },
    {
      icon: <FiUsers size={40} />,
      title: 'Dedicated Support',
      description: 'Personal affiliate manager to help you succeed'
    },
    {
      icon: <FiAward size={40} />,
      title: 'Marketing Materials',
      description: 'Professional banners, links, and content'
    }
  ];

  return (
    <div className="affiliates-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="affiliates-hero">
        <h1>Affiliates Program</h1>
        <p>Partner with Rebuy and earn money promoting sustainable fashion</p>
      </div>

      <div className="affiliates-content">
        <section className="program-overview">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Join our affiliate program for free</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Share</h3>
              <p>Promote Rebuy using your unique link</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Earn</h3>
              <p>Get paid for every sale you generate</p>
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <h2>Program Benefits</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="commission-section">
          <h2>Commission Structure</h2>
          <div className="commission-tiers">
            <div className="tier-card">
              <h3>Starter</h3>
              <div className="tier-rate">10%</div>
              <p>0-50 sales/month</p>
            </div>
            <div className="tier-card featured">
              <div className="popular-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="tier-rate">12%</div>
              <p>51-200 sales/month</p>
            </div>
            <div className="tier-card">
              <h3>Elite</h3>
              <div className="tier-rate">15%</div>
              <p>200+ sales/month</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of affiliates earning with Rebuy</p>
          <button className="join-btn" onClick={() => navigate('/contact')}>
            Apply Now
          </button>
          <p className="terms-note">By applying, you agree to our affiliate terms and conditions</p>
        </section>
      </div>
    </div>
  );
}

export default Affiliates;
