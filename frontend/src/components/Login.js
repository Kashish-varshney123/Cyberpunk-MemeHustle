import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin, onSwitch, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    setError('');
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        {error && <div className="error">{error}</div>}
        <button type="submit">Login</button>
        <button type="button" className="switch-btn" onClick={onSwitch}>
          Create Account
        </button>
        <button type="button" className="switch-btn" style={{marginTop:'0.5em'}} onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}
