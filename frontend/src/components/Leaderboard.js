import React, { useEffect, useState, useRef } from 'react';
import './Leaderboard.cyberpunk.css';

const Leaderboard = ({ open, onClose }) => {
  const [topMemes, setTopMemes] = useState([]);
  const prevUpvotes = useRef({});
  const prevRanks = useRef({});
  const [flashMap, setFlashMap] = useState({});
  const [rankChange, setRankChange] = useState({});

  useEffect(() => {
    if (!open) return;
    const fetchLeaderboard = async () => {
      const res = await fetch('http://localhost:5000/leaderboard?top=10');
      const data = await res.json();
      setTopMemes(data);
    };
    fetchLeaderboard();
    // Poll every 3s for updates
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, [open]);

  // Animate upvote changes and rank changes
  useEffect(() => {
    const newFlashMap = {};
    const newRankChange = {};
    const idToRank = {};
    topMemes.forEach((meme, idx) => {
      idToRank[meme.id] = idx;
      // Upvote flash
      if (prevUpvotes.current[meme.id] !== undefined && prevUpvotes.current[meme.id] !== meme.upvotes) {
        newFlashMap[meme.id] = true;
        setTimeout(() => setFlashMap(fm => ({ ...fm, [meme.id]: false })), 500);
      }
      // Rank change
      const prevRank = prevRanks.current[meme.id];
      if (prevRank !== undefined && prevRank !== idx) {
        newRankChange[meme.id] = prevRank > idx ? 'up' : 'down';
        setTimeout(() => setRankChange(rc => ({ ...rc, [meme.id]: undefined })), 1200);
      }
    });
    setFlashMap(newFlashMap);
    setRankChange(newRankChange);
    // Update prev refs
    topMemes.forEach((meme, idx) => {
      prevUpvotes.current[meme.id] = meme.upvotes;
      prevRanks.current[meme.id] = idx;
    });
  }, [topMemes]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="leaderboard-modal-cyberpunk">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2 className="text-2xl text-neon-green glitch mb-4 text-center">🔥 Meme Leaderboard 🔥</h2>
        <ol className="space-y-2">
          {topMemes.map((meme, i) => (
            <li
              key={meme.id}
              className={`flex items-center gap-4 neon-border p-2 rounded transition-all duration-300 ${
                rankChange[meme.id] === 'up'
                  ? 'leaderboard-up'
                  : rankChange[meme.id] === 'down'
                  ? 'leaderboard-down'
                  : ''
              }`}
            >
              <span className="text-neon-green text-xl font-mono">#{i + 1}</span>
              <img src={meme.image_url} alt={meme.title} className="w-12 h-12 object-cover rounded neon-shadow" />
              <div className="flex-1">
                <div className="text-neon-green font-bold glitch">{meme.title}</div>
                <div className="text-xs text-gray-400">
                  Upvotes: <span className={`text-neon-green font-mono${flashMap[meme.id] ? ' neon-flash' : ''}`}>{meme.upvotes}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Leaderboard;
