import React, { useState } from 'react';
import './Login.css';

export default function CreateAccount({ onCreate, onSwitch, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!username || !password || !confirm) {
      setError('Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    onCreate(username, password);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Create Account</button>
        <button type="button" className="switch-btn" onClick={onSwitch}>
          Back to Login
        </button>
        <button type="button" className="switch-btn" style={{marginTop:'0.5em'}} onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}
