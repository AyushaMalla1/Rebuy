import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';
import './About.css';

function About() {
  return (
    <div className="about-page">
      <header className="about-header">
        <Link to="/" className="back-link">
          <FiArrowLeft /> Back to Home
        </Link>
      </header>

      <div className="about-container">
        <section className="about-hero">
          <h1>About Rebuy</h1>
          <p className="tagline">Sustainable Fashion for Everyone</p>
        </section>

        <section className="about-story">
          <h2>Our Story</h2>
          <p>
            Rebuy was founded with a simple mission: to make sustainable fashion accessible to everyone. 
            We believe that quality clothing shouldn't end up in landfills, and that everyone deserves 
            access to affordable, stylish apparel.
          </p>
          <p>
            Our platform connects buyers with sellers of pre-loved clothing, creating a circular economy 
            that benefits both people and the planet. Every item sold on Rebuy gets a second life, 
            reducing waste and promoting sustainable consumption.
          </p>
        </section>

        <section className="about-values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <FiHeart className="value-icon" />
              <h3>Sustainability</h3>
              <p>We're committed to reducing fashion waste and promoting circular economy practices.</p>
            </div>
            <div className="value-card">
              <FiUsers className="value-icon" />
              <h3>Community</h3>
              <p>Building a community of conscious consumers who value quality over quantity.</p>
            </div>
            <div className="value-card">
              <FiTrendingUp className="value-icon" />
              <h3>Accessibility</h3>
              <p>Making quality fashion affordable and accessible to everyone.</p>
            </div>
            <div className="value-card">
              <FiAward className="value-icon" />
              <h3>Quality</h3>
              <p>Every item is carefully inspected to ensure it meets our quality standards.</p>
            </div>
          </div>
        </section>

        <section className="about-stats">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>10,000+</h3>
              <p>Items Sold</p>
            </div>
            <div className="stat-card">
              <h3>5,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-card">
              <h3>500+</h3>
              <p>Trusted Sellers</p>
            </div>
            <div className="stat-card">
              <h3>50 Tons</h3>
              <p>Waste Reduced</p>
            </div>
          </div>
        </section>

        <section className="about-mission">
          <h2>Our Mission</h2>
          <p>
            To revolutionize the fashion industry by creating a sustainable marketplace where 
            pre-loved clothing finds new homes. We envision a world where buying second-hand 
            is the first choice, not the last resort.
          </p>
        </section>

        <section className="about-cta">
          <h2>Join Our Community</h2>
          <p>Start your sustainable fashion journey today</p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-btn primary">Start Shopping</Link>
            <Link to="/seller" className="cta-btn secondary">Become a Seller</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
