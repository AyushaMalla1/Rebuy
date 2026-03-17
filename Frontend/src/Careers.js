import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBriefcase, FiUsers, FiTrendingUp, FiHeart } from 'react-icons/fi';
import './Careers.css';

function Careers() {
  const navigate = useNavigate();

  const positions = [
    {
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Kathmandu, Nepal',
      type: 'Full-time',
      description: 'Build and maintain our e-commerce platform'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      description: 'Lead product strategy and development'
    },
    {
      title: 'Customer Support Specialist',
      department: 'Support',
      location: 'Kathmandu, Nepal',
      type: 'Full-time',
      description: 'Help customers with their inquiries'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Hybrid',
      type: 'Full-time',
      description: 'Drive growth through digital marketing'
    }
  ];

  return (
    <div className="careers-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="careers-hero">
        <h1>Join Our Team</h1>
        <p>Help us build the future of sustainable fashion</p>
      </div>

      <div className="careers-content">
        <section className="why-join">
          <h2>Why Join Rebuy?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <FiBriefcase size={40} />
              <h3>Meaningful Work</h3>
              <p>Make a real impact on sustainable fashion</p>
            </div>
            <div className="benefit-card">
              <FiUsers size={40} />
              <h3>Great Team</h3>
              <p>Work with passionate, talented people</p>
            </div>
            <div className="benefit-card">
              <FiTrendingUp size={40} />
              <h3>Growth</h3>
              <p>Continuous learning and development</p>
            </div>
            <div className="benefit-card">
              <FiHeart size={40} />
              <h3>Benefits</h3>
              <p>Competitive salary and perks</p>
            </div>
          </div>
        </section>

        <section className="open-positions">
          <h2>Open Positions</h2>
          <div className="positions-list">
            {positions.map((position, index) => (
              <div key={index} className="position-card">
                <div className="position-header">
                  <h3>{position.title}</h3>
                  <span className="position-type">{position.type}</span>
                </div>
                <p className="position-description">{position.description}</p>
                <div className="position-meta">
                  <span>{position.department}</span>
                  <span>•</span>
                  <span>{position.location}</span>
                </div>
                <button className="apply-btn" onClick={() => navigate('/contact')}>
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="careers-cta">
          <h2>Don't see a perfect fit?</h2>
          <p>We're always looking for talented people. Send us your resume!</p>
          <button className="contact-btn" onClick={() => navigate('/contact')}>
            Get in Touch
          </button>
        </section>
      </div>
    </div>
  );
}

export default Careers;
