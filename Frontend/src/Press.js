import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFileText, FiDownload, FiMail } from 'react-icons/fi';
import './Press.css';

function Press() {
  const navigate = useNavigate();

  const pressReleases = [
    {
      date: 'March 10, 2026',
      title: 'Rebuy Reaches 100,000 Active Users Milestone',
      excerpt: 'Leading thrift marketplace celebrates major growth in sustainable fashion movement',
      category: 'Company News'
    },
    {
      date: 'February 15, 2026',
      title: 'Rebuy Launches AI-Powered Product Recommendations',
      excerpt: 'New feature helps users discover perfect pre-loved items faster',
      category: 'Product Launch'
    },
    {
      date: 'January 20, 2026',
      title: 'Rebuy Partners with Local Charities for Clothing Donations',
      excerpt: 'Initiative aims to reduce textile waste and support communities',
      category: 'Sustainability'
    },
    {
      date: 'December 5, 2025',
      title: 'Rebuy Expands to Three New Cities',
      excerpt: 'Platform now available in Pokhara, Biratnagar, and Bharatpur',
      category: 'Expansion'
    }
  ];

  return (
    <div className="press-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <FiArrowLeft /> Back to Home
      </button>

      <div className="press-hero">
        <h1>Press & Media</h1>
        <p>Latest news and updates from Rebuy</p>
      </div>

      <div className="press-content">
        <section className="press-kit">
          <h2>Press Kit</h2>
          <div className="kit-grid">
            <div className="kit-card">
              <FiFileText size={40} />
              <h3>Brand Assets</h3>
              <p>Logos, colors, and brand guidelines</p>
              <button className="download-btn">
                <FiDownload /> Download
              </button>
            </div>
            <div className="kit-card">
              <FiFileText size={40} />
              <h3>Company Info</h3>
              <p>About Rebuy, mission, and vision</p>
              <button className="download-btn">
                <FiDownload /> Download
              </button>
            </div>
            <div className="kit-card">
              <FiFileText size={40} />
              <h3>Media Images</h3>
              <p>High-resolution photos and screenshots</p>
              <button className="download-btn">
                <FiDownload /> Download
              </button>
            </div>
          </div>
        </section>

        <section className="press-releases">
          <h2>Press Releases</h2>
          <div className="releases-list">
            {pressReleases.map((release, index) => (
              <div key={index} className="release-card">
                <div className="release-header">
                  <span className="release-category">{release.category}</span>
                  <span className="release-date">{release.date}</span>
                </div>
                <h3>{release.title}</h3>
                <p>{release.excerpt}</p>
                <button className="read-more-btn">Read More</button>
              </div>
            ))}
          </div>
        </section>

        <section className="media-contact">
          <h2>Media Inquiries</h2>
          <div className="contact-box">
            <FiMail size={48} />
            <h3>Get in Touch</h3>
            <p>For press inquiries, interviews, or media partnerships</p>
            <a href="mailto:press@rebuy.com" className="email-link">press@rebuy.com</a>
            <button className="contact-btn" onClick={() => navigate('/contact')}>
              Contact Us
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Press;
