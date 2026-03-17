import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiHeart, FiTrendingUp, FiUsers } from 'react-icons/fi';
import './Sustainability.css';

function Sustainability() {
  const navigate = useNavigate();

  const initiatives = [
    {
      icon: <FiRefreshCw size={40} />,
      title: 'Circular Fashion',
      description: 'Extending the life of clothing through resale and reuse',
      impact: '50,000+ items saved from landfills'
    },
    {
      icon: <FiHeart size={40} />,
      title: 'Community Donations',
      description: 'Partnering with local charities to donate unsold items',
      impact: '10,000+ items donated to those in need'
    },
    {
      icon: <FiTrendingUp size={40} />,
      title: 'Carbon Reduction',
      description: 'Reducing fashion industry carbon footprint through secondhand',
      impact: '500 tons of CO2 saved annually'
    },
    {
      icon: <FiUsers size={40} />,
      title: 'Education & Awareness',
      description: 'Teaching sustainable fashion practices to our community',
      impact: '25,000+ people reached'
    }
  ];

  return (
    <div className="sustainability-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="sustainability-hero">
        <h1>Our Commitment to Sustainability</h1>
        <p>Building a circular economy for fashion, one item at a time</p>
      </div>

      <div className="sustainability-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p className="mission-text">
            At Rebuy, we believe fashion doesn't have to cost the earth. By creating a thriving marketplace 
            for pre-loved clothing, we're reducing textile waste, lowering carbon emissions, and making 
            sustainable fashion accessible to everyone. Every purchase on our platform is a vote for a 
            more sustainable future.
          </p>
        </section>

        <section className="initiatives-section">
          <h2>Our Initiatives</h2>
          <div className="initiatives-grid">
            {initiatives.map((initiative, index) => (
              <div key={index} className="initiative-card">
                <div className="initiative-icon">{initiative.icon}</div>
                <h3>{initiative.title}</h3>
                <p>{initiative.description}</p>
                <div className="impact-badge">{initiative.impact}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="impact-section">
          <h2>Our Impact in Numbers</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>100,000+</h3>
              <p>Items Resold</p>
            </div>
            <div className="stat-card">
              <h3>500 Tons</h3>
              <p>CO2 Saved</p>
            </div>
            <div className="stat-card">
              <h3>50,000+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-card">
              <h3>10,000+</h3>
              <p>Items Donated</p>
            </div>
          </div>
        </section>

        <section className="join-section">
          <h2>Join the Movement</h2>
          <p>Every item you buy or sell on Rebuy makes a difference. Together, we can transform the fashion industry.</p>
          <button className="cta-btn" onClick={() => navigate('/signup')}>
            Get Started Today
          </button>
        </section>
      </div>
    </div>
  );
}

export default Sustainability;
