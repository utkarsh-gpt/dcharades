# 🎭 Charades Game - Online Two Player Movie Guessing Game

A fun, interactive online charades game where two players take turns acting out movie titles for each other to guess. Built with Next.js, Socket.IO, and deployed on Vercel.

## 🎮 Game Features

- **Two-Player Online Gameplay**: Real-time multiplayer experience
- **Movie Database**: Includes Hollywood and Bollywood movies
- **Configurable Settings**: 
  - Number of rounds (1-10)
  - Time limits (3min, 5min, 10min, or unlimited)
  - Movie categories (Hollywood, Bollywood, or both)
- **Real-time Timer**: Visual countdown with progress bar
- **Score Tracking**: Points awarded for successful guesses
- **Responsive Design**: Works on desktop and mobile devices

## 🎯 How to Play

1. **Create or Join Game**: One player creates a game and shares the game ID
2. **Configure Settings**: Host can adjust rounds, time limits, and movie categories
3. **Get Ready**: Both players mark themselves as ready
4. **Start Playing**: Players alternate between acting and guessing
5. **Act Out Movies**: Actor sees the movie title and acts it out without speaking
6. **Guess & Score**: Guesser tries to identify the movie within the time limit
7. **Switch Roles**: Roles alternate each round until all rounds are complete

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd charades-game
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

4. Start the Socket.IO server:
```bash
cd server
node index.js
```

5. Start the Next.js development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
charades-game/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── game/
│       └── [gameId]/
│           └── page.tsx   # Game page
├── components/            # React components
│   ├── GameLobby.tsx     # Pre-game lobby
│   ├── GamePlay.tsx      # Main game interface
│   ├── GameSettings.tsx  # Settings modal
│   └── Timer.tsx         # Timer component
├── lib/                  # Utility libraries
│   ├── socket-context.tsx # Socket.IO context
│   ├── types.ts          # TypeScript types
│   └── movies.ts         # Movie database
├── server/               # Socket.IO server
│   └── index.js         # Server implementation
└── README.md
```

## 🎨 Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.IO
- **Deployment**: Vercel
- **State Management**: React Context

## 🎪 Game Mechanics

### Scoring System
- Both actor and guesser get 1 point for a successful guess
- No points awarded for skipped movies or timeouts

### Timer System
- Visual countdown with color coding:
  - Green: >50% time remaining
  - Yellow: 20-50% time remaining  
  - Red: <20% time remaining
- Progress bar shows time remaining
- Timer can be set to unlimited for casual play

### Movie Selection
- Random selection from configured categories
- Balanced mix of easy, medium, and hard movies
- Movies span different genres and eras

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SOCKET_URL`: Your Socket.IO server URL
4. Deploy!

### Socket.IO Server Deployment

The Socket.IO server can be deployed separately to any Node.js hosting service:
- Railway
- Heroku  
- DigitalOcean
- AWS EC2

## 🎯 Future Enhancements

- [ ] Chat functionality during gameplay
- [ ] Custom movie lists
- [ ] Team modes (2v2)
- [ ] Different game modes (categories, difficulty levels)
- [ ] Player statistics and history
- [ ] Spectator mode
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- Movie database curated from popular Hollywood and Bollywood films
- Icons and emojis from various sources
- Inspiration from classic charades game mechanics

---

**Have fun playing! 🎭🎬** 


