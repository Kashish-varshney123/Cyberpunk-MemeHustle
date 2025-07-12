import React, { useEffect, useState, useRef } from 'react';
import BidInput from './BidInput';

// Terminal typewriter intro effect
export const TerminalIntro = ({ text }) => {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <div className="terminal-type">
      {display}
      <span className="blinking-cursor">|</span>
    </div>
  );
};

const MemeGallery = ({ memes, bids = {}, onBid, onVote }) => {
  const [bidHistory, setBidHistory] = useState({});
  const [flashBid, setFlashBid] = useState({});
  const [notification, setNotification] = useState(null);
  const [voteNotification, setVoteNotification] = useState(null);
  const [voteFlashMap, setVoteFlashMap] = useState({});
  // Store caption, vibe, and loading state per meme
  const [captionVibeMap, setCaptionVibeMap] = useState({});
  const prevUpvotes = useRef({});

  // Animate upvote flashes
  useEffect(() => {
    const newFlashMap = {};
    memes.forEach(meme => {
      if (
        prevUpvotes.current[meme.id] !== undefined &&
        prevUpvotes.current[meme.id] !== meme.upvotes
      ) {
        newFlashMap[meme.id] = true;
        setTimeout(() => setVoteFlashMap(fm => ({ ...fm, [meme.id]: false })), 400);
      }
      prevUpvotes.current[meme.id] = meme.upvotes;
    });
    setVoteFlashMap(newFlashMap);
  }, [memes]);

  // Fetch bid history for all memes
  useEffect(() => {
    (async () => {
      const history = {};
      for (const meme of memes) {
        if (!meme.id) continue;
        const res = await fetch(`http://localhost:5000/memes/${meme.id}/bids`);
        const data = await res.json();
        history[meme.id] = data;
      }
      setBidHistory(history);
    })();
  }, [memes]);

  // Update bid history in real-time when new bids arrive
  useEffect(() => {
    // Upvote notification
    const handleVoteUpdate = (e) => {
      const { meme_id, upvotes } = e.detail;
      // Find meme title
      const memeTitle = (memes.find(m => m.id === meme_id) || {}).title || 'Meme';
      setVoteNotification(`${memeTitle} upvotes now at ${upvotes}!`);
      setTimeout(() => setVoteNotification(null), 1200);
    };
    window.addEventListener('voteUpdate', handleVoteUpdate);
    return () => window.removeEventListener('voteUpdate', handleVoteUpdate);
  }, [memes]);

  useEffect(() => {
    const handleBidUpdate = (e) => {
      const { meme_id, user_id, credits } = e.detail;
      setBidHistory(prev => {
        const prevArr = prev[meme_id] || [];
        return {
          ...prev,
          [meme_id]: [{ user_id, credits }, ...prevArr].slice(0, 10)
        };
      });
      // Flash on new highest bid
      setFlashBid(fb => ({ ...fb, [meme_id]: true }));
      setNotification({ user_id, credits });
      setTimeout(() => setFlashBid(fb => ({ ...fb, [meme_id]: false })), 500);
      setTimeout(() => setNotification(null), 1200);
    };
    window.addEventListener('bidUpdate', handleBidUpdate);
    return () => window.removeEventListener('bidUpdate', handleBidUpdate);
  }, []);

  return (
    <>

      {notification && (
        <div className="bid-notification">
          <span className="glitch">{notification.user_id}</span> placed a bid of <span className="font-bold">{notification.credits}</span> credits!
        </div>
      )}
      {voteNotification && (
        <div className="bid-notification">
          {voteNotification}
        </div>
      )}
      <div className="cyberpunk-meme-grid">
      {memes.map((meme, i) => {
        const bidInfo = bids[meme.id] || {};
        const captionVibe = captionVibeMap[meme.id] || { caption: meme.caption || '', vibe: meme.vibe || '', loading: false };
        const isLoading = captionVibe.loading;
        const caption = captionVibe.caption;
        const vibe = captionVibe.vibe;

        const handleRegenerate = async () => {
          setCaptionVibeMap(map => ({
            ...map,
            [meme.id]: { ...captionVibe, loading: true }
          }));
          try {
            await fetch(`http://localhost:5000/memes/${meme.id}/caption`, { method: 'POST' });
            // Fetch the latest meme data after regeneration
            const res2 = await fetch(`http://localhost:5000/memes/${meme.id}`);
            const updatedMeme = await res2.json();
            setCaptionVibeMap(map => ({
              ...map,
              [meme.id]: { caption: updatedMeme.caption, vibe: updatedMeme.vibe, loading: false }
            }));
          } catch {
            setCaptionVibeMap(map => ({
              ...map,
              [meme.id]: { caption: 'Failed to generate!', vibe: 'Failed to generate!', loading: false }
            }));
          }
        };

        const history = bidHistory[meme.id] || [];
        return (
          <div key={meme.id || i} className="meme-card-cyberpunk">
            <img
              src={meme.image_url}
              alt={meme.title}
              className="rounded-lg mb-3 shadow-lg"
              style={{ maxHeight: 200 }}
            />
            <h3 className="glitch text-2xl mb-1">{meme.title}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {meme.tags && meme.tags.map((tag, idx) => (
                <span key={idx} className="tag-chip">{`#${tag}`}</span>
              ))}
            </div>
            {/* AI Caption & Vibe */}
            <div className="w-full mb-2">
              <div className="text-xs text-neon-green font-mono mb-1">Caption:</div>
              <div className="glitch mb-1">{caption}</div>
              <div className="text-xs text-neon-green font-mono mb-1">Vibe:</div>
              <div className="glitch mb-1">{vibe}</div>
              <button
                className={`cyber-btn px-2 py-1 mt-1 ${isLoading ? 'opacity-50' : ''}`}
                style={{fontSize: '0.85em'}}
                disabled={isLoading}
                onClick={handleRegenerate}
              >
                {isLoading ? 'Regenerating...' : 'Regenerate Caption/Vibe'}
              </button>
              <button
                className="cyber-btn px-2 py-1 mt-1 ml-2 bg-neon-red text-black font-bold"
                style={{fontSize: '0.85em', background: '#ff0055', color: '#000', border: '2px solid #ff0055', boxShadow: '0 0 8px #ff0055'}}
                onClick={async () => {
                  if (!window.confirm('Delete this meme?')) return;
                  await fetch(`http://localhost:5000/memes/${meme.id}`, { method: 'DELETE' });
                  // Remove meme from UI
                  if (typeof window !== 'undefined') window.location.reload();
                }}
              >
                Delete
              </button>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <button className="cyber-btn px-2 py-1" onClick={() => onVote(meme.id, 'up')}>▲</button>
              <span className={`text-neon-green text-lg font-mono${voteFlashMap[meme.id] ? ' neon-flash' : ''}`}>{meme.upvotes || 0}</span>
              <button className="cyber-btn px-2 py-1" onClick={() => onVote(meme.id, 'down')}>▼</button>
            </div>
            <div className="mt-2 mb-1">
              <span className="text-neon-green text-xs font-mono">
                Highest Bid: <span className={`font-bold${flashBid[meme.id] ? ' neon-flash' : ''}`}>{bidInfo.credits || 0}</span> credits
                {bidInfo.user_id && (
                  <span> by <span className="glitch">{bidInfo.user_id}</span></span>
                )}
              </span>
            </div>
            {/* Bid History */}
            <div className="w-full max-h-24 overflow-y-auto bg-black bg-opacity-70 neon-border rounded mb-2 p-2" style={{fontSize: '0.9em'}}>
              <div className="text-neon-green text-xs mb-1 glitch font-mono">Bid History</div>
              {history.length === 0 && <div className="text-gray-400 text-xs">No bids yet.</div>}
              {history.map((bid, idx) => (
                <div key={idx} className="text-neon-green font-mono glitch">
                  {bid.user_id}: <span className="font-bold">{bid.credits}</span> credits
                </div>
              ))}
            </div>
            <BidInput memeId={meme.id} onBid={amount => onBid(meme.id, amount)} />
          </div>
        );
      })}
    </div>
    </>
  );
};

export default MemeGallery;
