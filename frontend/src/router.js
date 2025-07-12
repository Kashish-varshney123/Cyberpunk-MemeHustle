import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Leaderboard from './components/Leaderboard';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<App />} />
        <Route path="/leaderboard" element={<Leaderboard open={true} onClose={() => {}} />} />
      </Routes>
    </Router>
  );
}
