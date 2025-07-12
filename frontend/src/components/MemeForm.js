import React, { useState } from 'react';
import './MemeForm.cyberpunk.css';

const MemeForm = ({ onMemeCreated }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      title,
      image_url: imageUrl,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      owner_id: 1 // hacky default user
    };
    try {
      const res = await fetch('http://localhost:5000/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const meme = await res.json();
      if (onMemeCreated) onMemeCreated(meme);
      setTitle('');
      setImageUrl('');
      setTags('');
    } catch (err) {
      alert('Failed to create meme!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="neon-form centered">
      <h2 className="text-neon-green text-xl mb-4 glitch">Create Meme</h2>
      <input
        className="neon-input w-full"
        type="text"
        placeholder="Title (e.g., Doge HODL)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input
        className="neon-input w-full"
        type="text"
        placeholder="Image URL (or leave blank for default)"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
      />
      <input
        className="neon-input w-full"
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
      />
      <button
        className="cyber-btn glitch"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Meme'}
      </button>
    </form>
  );
};

export default MemeForm;
