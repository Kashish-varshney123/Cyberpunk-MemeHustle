import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
app.use(cors());
app.use(express.json());

// File DB helpers
const dbPath = path.join(__dirname, 'db.json');
function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}
function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Gemini API integration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const geminiCache = {};
const staticCaptions = [
  "To the MOON!",
  "Brrr goes stonks",
  "YOLO to the moon!",
  "Doge hacks the matrix",
  "Neon Crypto Chaos",
  "Retro Stonks Vibes"
];
function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function geminiGenerate(prompt, type = 'caption') {
  const cacheKey = `${type}:${prompt}`;
  if (geminiCache[cacheKey]) return geminiCache[cacheKey];
  if (!GEMINI_API_KEY) {
    // Fallback to static
    return getRandom(staticCaptions);
  }
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 40 }
      })
    });
    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text && !/^Failed to generate!?$/i.test(text)) {
      geminiCache[cacheKey] = text;
      return text;
    }
    // Always fallback to random static
    return getRandom(staticCaptions);
  } catch (e) {
    return getRandom(staticCaptions);
  }
}

// GET /leaderboard endpoint
app.get('/leaderboard', (req, res) => {
  const db = loadDB();
  const top = parseInt(req.query.top, 10) || 10;
  const memes = db.memes || [];
  // Sort memes by upvotes descending
  const sorted = memes.slice().sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  res.json(sorted.slice(0, top));
});

// POST /memes endpoint
app.post('/memes', async (req, res) => {
  const db = loadDB();
  const { title, image_url, tags, owner_id } = req.body;
  const id = nanoid();
  let caption = await geminiGenerate(`Generate a funny caption for a meme with tags: ${(tags||[]).join(', ')}.`, 'caption');
  let vibe = await geminiGenerate(`Describe the vibe of a meme with tags: ${(tags||[]).join(', ')}.`, 'vibe');
  if (!caption) caption = getRandom(staticCaptions);
  if (!vibe) vibe = getRandom(staticCaptions);
  const meme = {
    id,
    title,
    image_url,
    tags: tags || [],
    upvotes: 0,
    owner_id,
    caption,
    vibe
  };
  db.memes.push(meme);
  saveDB(db);
  res.json(meme);
});

// POST /memes/:id/vote endpoint
app.post('/memes/:id/vote', (req, res) => {
  const meme_id = req.params.id;
  const { type } = req.body;
  let delta = 0;
  if (type === 'up') delta = 1;
  if (type === 'down') delta = -1;
  const db = loadDB();
  const meme = db.memes.find(m => m.id === meme_id);
  if (!meme) return res.status(404).json({ error: 'Meme not found' });
  meme.upvotes = (meme.upvotes || 0) + delta;
  if (meme.upvotes < 0) meme.upvotes = 0;
  saveDB(db);
  io.emit('voteUpdate', { meme_id, upvotes: meme.upvotes });
  res.json({ meme_id, upvotes: meme.upvotes });
});

// GET /leaderboard?top=10
app.get('/leaderboard', (req, res) => {
  const top = Number(req.query.top) || 10;
  const db = loadDB();
  const sorted = [...db.memes].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  res.json(sorted.slice(0, top));
});

// GET /memes/:id/bids endpoint
app.get('/memes/:id/bids', (req, res) => {
  const meme_id = req.params.id;
  const db = loadDB();
  const bids = db.bids[meme_id] || [];
  res.json(bids);
});

// POST /memes/:id/bid endpoint
app.post('/memes/:id/bid', (req, res) => {
  const meme_id = req.params.id;
  const { user_id, credits } = req.body;
  const db = loadDB();
  if (!db.bids[meme_id]) db.bids[meme_id] = [];
  db.bids[meme_id].unshift({ user_id, credits });
  db.bids[meme_id] = db.bids[meme_id].slice(0, 10); // keep last 10 bids
  saveDB(db);
  io.emit('bidUpdate', { meme_id, user_id, credits });
  res.status(201).json({ meme_id, user_id, credits });
});

// Get single meme by id
app.get('/memes/:id', (req, res) => {
  const db = loadDB();
  const meme = db.memes.find(m => m.id === req.params.id);
  if (!meme) return res.status(404).json({ error: 'Meme not found' });
  res.json(meme);
});

// Delete meme by id
app.delete('/memes/:id', (req, res) => {
  const meme_id = req.params.id;
  const db = loadDB();
  const memeIdx = db.memes.findIndex(m => m.id === meme_id);
  if (memeIdx === -1) return res.status(404).json({ error: 'Meme not found' });
  db.memes.splice(memeIdx, 1);
  // Remove bids for this meme
  if (db.bids && db.bids[meme_id]) delete db.bids[meme_id];
  saveDB(db);
  res.json({ success: true });
});

// POST /memes/:id/caption - regenerate caption/vibe
app.post('/memes/:id/caption', async (req, res) => {
  const meme_id = req.params.id;
  const db = loadDB();
  const meme = db.memes.find(m => m.id === meme_id);
  if (!meme) return res.status(404).json({ error: 'Meme not found' });
  let caption = await geminiGenerate(`Generate a funny caption for a meme with tags: ${meme.tags.join(', ')}.`, 'caption');
  let vibe = await geminiGenerate(`Describe the vibe of a meme with tags: ${meme.tags.join(', ')}.`, 'vibe');
  if (!caption) caption = getRandom(staticCaptions);
  if (!vibe) vibe = getRandom(staticCaptions);
  meme.caption = caption;
  meme.vibe = vibe;
  saveDB(db);
  res.json({ caption, vibe });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend + Socket.IO running on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
