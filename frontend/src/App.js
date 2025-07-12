import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MemeForm from './components/MemeForm';
import MemeGallery, { /* for typewriter */ } from './components/MemeGallery';
// Import TerminalIntro for animated header
import { TerminalIntro } from './components/MemeGallery';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import socket from './socket';
import { BOT_NAMES } from './botNames';
import LandingPage from './components/LandingPage';
import './App.css';
import './components/LandingPage.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [user, setUser] = useState(null);
  const [memes, setMemes] = useState([]);
  const [bids, setBids] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [entered, setEntered] = useState(false);

  // Real-time votes effect
  React.useEffect(() => {
    socket.on('voteUpdate', ({ meme_id, upvotes }) => {
      setMemes(prev => prev.map(m => m.id === meme_id ? { ...m, upvotes } : m));
      window.dispatchEvent(new CustomEvent('voteUpdate', { detail: { meme_id, upvotes } }));
    });
    return () => socket.off('voteUpdate');
  }, []);

  // Real-time bids effect
  React.useEffect(() => {
    socket.on('bidUpdate', ({ meme_id, user_id, credits }) => {
      setBids(prev => {
        if (!meme_id) return prev;
        if (!prev[meme_id] || credits > prev[meme_id].credits) {
          return { ...prev, [meme_id]: { user_id, credits } };
        }
        return prev;
      });
      window.dispatchEvent(new CustomEvent('bidUpdate', { detail: { meme_id, user_id, credits } }));
    });
    return () => socket.off('bidUpdate');
  }, []);

  // Digital noise overlay effect
  React.useEffect(() => {
    const canvas = document.getElementById('noise-overlay');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    let frame;
    function drawNoise() {
      const w = canvas.width;
      const h = canvas.height;
      const id = ctx.createImageData(w, h);
      for (let i = 0; i < id.data.length; i += 4) {
        const shade = Math.random() < 0.5 ? 0 : 57 + Math.floor(Math.random() * 198);
        id.data[i] = shade;
        id.data[i + 1] = shade + 20;
        id.data[i + 2] = shade;
        id.data[i + 3] = Math.random() < 0.5 ? 20 : 35;
      }
      ctx.putImageData(id, 0, 0);
      frame = requestAnimationFrame(drawNoise);
    }
    drawNoise();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleMemeCreated = meme => {
    setMemes(prev => [meme, ...prev]);
  };

  const handleVote = async (memeId, type) => {
    await fetch(`http://localhost:5000/memes/${memeId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
  };

  const handleBid = async (memeId, credits, user_id = 'cyberpunk420') => {
    await fetch(`http://localhost:5000/memes/${memeId}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits, user_id })
    });
  };

  // Bidding bot: randomly bids as fake users
  React.useEffect(() => {
    if (!memes.length) return;
    let active = true;
    function randomBid() {
      if (!active || !memes.length) return;
      const meme = memes[Math.floor(Math.random() * memes.length)];
      const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const credits = Math.floor(Math.random() * 1000) + 1;
      handleBid(meme.id, credits, bot);
      const timeout = Math.random() * 4000 + 3000;
      setTimeout(randomBid, timeout);
    }
    randomBid();
    return () => { active = false; };
  }, [memes]);

  const location = useLocation();
  if (!entered) {
    return <LandingPage onEnter={() => setEntered(true)} />;
  }
  return (
    <div className="app-cyberpunk-layout">
      <canvas id="noise-overlay"></canvas>
      <aside className="sidebar-cyberpunk">
        <div className="sidebar-logo">MemeHustle</div>
        <nav className="sidebar-nav">
          <Link to="/home" className={`sidebar-link${location.pathname === '/home' ? ' active' : ''}`}>Home</Link>
          <Link to="/leaderboard" className={`sidebar-link${location.pathname === '/leaderboard' ? ' active' : ''}`}>Leaderboard</Link>
          <button className="sidebar-link" onClick={() => setShowLogin(true)}>Login</button>
        </nav>
      </aside>
      <main className="main-cyberpunk-content">
        <div className="header-bar-cyberpunk">
          <span className="cyberpunk-welcome">&gt; Welcome to MemeHustle. Neon memes. Cyber bids. Hack the vibes.</span>
        </div>
        <Leaderboard open={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
        <MemeForm onMemeCreated={handleMemeCreated} />
        <MemeGallery memes={memes} bids={bids} onBid={handleBid} onVote={handleVote} />
        {showLogin && !user && (
          <Login
            onLogin={(username, password) => { setUser({ username }); setShowLogin(false); }}
            onSwitch={() => { setShowLogin(false); setShowCreate(true); }}
            onCancel={() => setShowLogin(false)}
          />
        )}
        {showCreate && !user && (
          <CreateAccount
            onCreate={(username, password) => { setUser({ username }); setShowCreate(false); }}
            onSwitch={() => { setShowCreate(false); setShowLogin(true); }}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;