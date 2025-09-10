# Cyberpunk AI Meme Marketplace

A real-time bidding platform for AI-generated memes with a cyberpunk aesthetic. Users can create accounts, submit AI-generated memes, and participate in live auctions to bid on them.

## Features

- 🎨 Create and submit AI-generated memes
- 💰 Real-time bidding system
- 🏆 Leaderboard to track top bidders
- 🔐 User authentication
- 🎮 Interactive UI with cyberpunk theme
- ⚡ Real-time updates using Socket.IO

## Tech Stack

### Frontend
- React 19
- React Router v6
- Socket.IO Client
- TailwindCSS for styling
- React Testing Library

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- Supabase for database and authentication
- Environment-based configuration

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Supabase account (for authentication and database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MemeHustle
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the backend directory with your Supabase credentials:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   node index.js
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Project Structure

```
MemeHustle/
├── backend/               # Backend server code
│   ├── index.js          # Main server file
│   ├── package.json      # Backend dependencies
│   └── db.json           # Mock database (if used)
└── frontend/             # Frontend React application
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable React components
        ├── App.js        # Main App component
        ├── index.js      # Entry point
        └── router.js     # Application routes
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ and cyberpunk vibes
- Inspired by digital art marketplaces
- Special thanks to all contributors

---

*This is a personal project created for educational purposes.*
