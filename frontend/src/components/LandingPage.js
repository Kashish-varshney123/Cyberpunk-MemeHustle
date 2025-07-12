import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onEnter }) {
  return (
    <div className="landing-bg">
      <div className="landing-hero">
        <h1 className="glitch-title">MemeHustle</h1>
        <h2 className="glitch-sub">Neon Memes. Cyber Bids. Hack the Vibes.</h2>
        <button className="cyber-btn big-btn" onClick={onEnter}>
          <span className="glitch-text">Get Started</span>
        </button>
      </div>
      <div className="landing-features">
        <div className="feature-card">
          <span className="feature-icon">💾</span>
          <h3>Bid &amp; Win</h3>
          <p>Compete in real-time meme auctions.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h3>Cyberpunk Leaderboard</h3>
          <p>Climb the ranks with neon upvotes.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🦾</span>
          <h3>Glitch Effects</h3>
          <p>Experience next-level visuals and UI.</p>
        </div>
      </div>
      <footer className="landing-footer">
        <span>Made with <span className="neon-heart">♥</span> in Night City</span>
      </footer>
    </div>
  );
}
