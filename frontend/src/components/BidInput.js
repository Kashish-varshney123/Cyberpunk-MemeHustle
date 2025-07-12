import React, { useState } from 'react';

const BidInput = ({ memeId, onBid }) => {
  const [credits, setCredits] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!credits) return;
    setLoading(true);
    await onBid(Number(credits));
    setCredits('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleBid} className="flex flex-row items-center gap-2 mt-2">
      <input
        className="neon-input w-20 text-center"
        type="number"
        min="1"
        step="1"
        placeholder="Credits"
        value={credits}
        onChange={e => setCredits(e.target.value)}
        style={{fontSize: '1rem'}}
      />
      <button type="submit" className="cyber-btn px-3 py-1" disabled={loading}>
        {loading ? 'Bidding...' : 'Bid'}
      </button>
    </form>
  );
};

export default BidInput;
