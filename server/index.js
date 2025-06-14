const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Game state management
const games = new Map();
const playerSockets = new Map();

// Movie database
const MOVIES = [
  // Hollywood Movies
  { title: "Titanic", category: "hollywood", difficulty: "easy" },
  { title: "Avatar", category: "hollywood", difficulty: "easy" },
  { title: "The Lion King", category: "hollywood", difficulty: "easy" },
  { title: "Finding Nemo", category: "hollywood", difficulty: "easy" },
  { title: "Spider-Man", category: "hollywood", difficulty: "easy" },
  { title: "Batman", category: "hollywood", difficulty: "easy" },
  { title: "Superman", category: "hollywood", difficulty: "easy" },
  { title: "Frozen", category: "hollywood", difficulty: "easy" },
  { title: "Shrek", category: "hollywood", difficulty: "easy" },
  { title: "Cars", category: "hollywood", difficulty: "easy" },
  { title: "The Shawshank Redemption", category: "hollywood", difficulty: "medium" },
  { title: "The Godfather", category: "hollywood", difficulty: "medium" },
  { title: "Pulp Fiction", category: "hollywood", difficulty: "medium" },
  { title: "The Dark Knight", category: "hollywood", difficulty: "medium" },
  { title: "Forrest Gump", category: "hollywood", difficulty: "medium" },
  { title: "Inception", category: "hollywood", difficulty: "medium" },
  { title: "The Matrix", category: "hollywood", difficulty: "medium" },
  { title: "Jurassic Park", category: "hollywood", difficulty: "medium" },
  { title: "Star Wars", category: "hollywood", difficulty: "medium" },
  { title: "The Avengers", category: "hollywood", difficulty: "medium" },
  
  // Bollywood Movies
  { title: "Sholay", category: "bollywood", difficulty: "easy" },
  { title: "Dilwale Dulhania Le Jayenge", category: "bollywood", difficulty: "easy" },
  { title: "3 Idiots", category: "bollywood", difficulty: "easy" },
  { title: "Dangal", category: "bollywood", difficulty: "easy" },
  { title: "Baahubali", category: "bollywood", difficulty: "easy" },
  { title: "PK", category: "bollywood", difficulty: "easy" },
  { title: "Sultan", category: "bollywood", difficulty: "easy" },
  { title: "Singham", category: "bollywood", difficulty: "easy" },
  { title: "Chennai Express", category: "bollywood", difficulty: "easy" },
  { title: "Krrish", category: "bollywood", difficulty: "easy" },
  { title: "Zindagi Na Milegi Dobara", category: "bollywood", difficulty: "medium" },
  { title: "Queen", category: "bollywood", difficulty: "medium" },
  { title: "Pink", category: "bollywood", difficulty: "medium" },
  { title: "Article 15", category: "bollywood", difficulty: "medium" },
  { title: "Andhadhun", category: "bollywood", difficulty: "medium" },
];

const DEFAULT_SETTINGS = {
  rounds: 5,
  timeLimit: 300, // 5 minutes
  movieCategories: ['hollywood', 'bollywood'],
};

function createGame(gameId, hostPlayer) {
  const game = {
    id: gameId,
    players: [hostPlayer],
    settings: { ...DEFAULT_SETTINGS },
    currentRound: 0,
    currentActorId: null,
    currentGuesser: null,
    currentMovie: null,
    timeRemaining: 0,
    isActive: false,
    isGameStarted: false,
    isRoundActive: false,
    winner: null,
    roundTimer: null,
  };
  
  games.set(gameId, game);
  return game;
}

function getRandomMovie(categories) {
  const filteredMovies = MOVIES.filter(movie => categories.includes(movie.category));
  if (filteredMovies.length === 0) return MOVIES[0]; // Fallback
  return filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
}

function startNewRound(gameId) {
  const game = games.get(gameId);
  if (!game || game.currentRound >= game.settings.rounds) return;

  game.currentRound++;
  
  // Switch roles (actor becomes guesser and vice versa)
  if (game.currentActorId) {
    const currentActorIndex = game.players.findIndex(p => p.id === game.currentActorId);
    const nextActorIndex = (currentActorIndex + 1) % game.players.length;
    game.currentActorId = game.players[nextActorIndex].id;
  } else {
    // First round - randomly select actor
    game.currentActorId = game.players[Math.floor(Math.random() * game.players.length)].id;
  }
  
  game.currentGuesser = game.players.find(p => p.id !== game.currentActorId)?.id || null;
  
  // Get random movie
  const movie = getRandomMovie(game.settings.movieCategories);
  game.currentMovie = movie.title;
  
  // Set timer
  game.timeRemaining = game.settings.timeLimit;
  game.isRoundActive = true;
  
  // Start countdown timer
  if (game.settings.timeLimit > 0) {
    game.roundTimer = setInterval(() => {
      game.timeRemaining--;
      io.to(gameId).emit('game-state', game);
      
      if (game.timeRemaining <= 0) {
        endRound(gameId, false);
      }
    }, 1000);
  }
  
  io.to(gameId).emit('game-state', game);
  io.to(gameId).emit('round-started', {
    round: game.currentRound,
    actorId: game.currentActorId,
    movie: movie.title,
  });
}

function endRound(gameId, wasGuessed = false) {
  const game = games.get(gameId);
  if (!game) return;

  game.isRoundActive = false;
  
  if (game.roundTimer) {
    clearInterval(game.roundTimer);
    game.roundTimer = null;
  }
  
  // Award points if guessed correctly
  if (wasGuessed) {
    const actor = game.players.find(p => p.id === game.currentActorId);
    const guesser = game.players.find(p => p.id === game.currentGuesser);
    
    if (actor) actor.score++;
    if (guesser) guesser.score++;
  }
  
  io.to(gameId).emit('round-ended', {
    wasGuessed,
    scores: game.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
  });
  
  // Check if game is over
  if (game.currentRound >= game.settings.rounds) {
    endGame(gameId);
  } else {
    // Start next round after delay
    setTimeout(() => {
      startNewRound(gameId);
    }, 3000);
  }
  
  io.to(gameId).emit('game-state', game);
}

function endGame(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  game.isActive = false;
  
  // Determine winner
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
  game.winner = sortedPlayers[0].id;
  
  io.to(gameId).emit('game-ended', {
    winner: game.winner,
    finalScores: sortedPlayers.map(p => ({ id: p.id, name: p.name, score: p.score })),
  });
  
  io.to(gameId).emit('game-state', game);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', ({ gameId, playerName, isHost }) => {
    try {
      let game = games.get(gameId);
      
      // Check if player is already in this game
      if (game && game.players.find(p => p.id === socket.id)) {
        socket.join(gameId);
        socket.emit('game-state', game);
        return;
      }
      
      if (!game) {
        if (!isHost) {
          socket.emit('error', 'Game not found');
          return;
        }
        
        // Create new game
        const hostPlayer = {
          id: socket.id,
          name: playerName,
          isHost: true,
          isReady: false,
          score: 0,
        };
        
        game = createGame(gameId, hostPlayer);
        playerSockets.set(socket.id, { gameId, playerId: socket.id });
      } else {
        // Join existing game
        if (game.players.length >= 2) {
          socket.emit('error', 'Game is full');
          return;
        }
        
        const player = {
          id: socket.id,
          name: playerName,
          isHost: false,
          isReady: false,
          score: 0,
        };
        
        game.players.push(player);
        playerSockets.set(socket.id, { gameId, playerId: socket.id });
      }
      
      socket.join(gameId);
      socket.emit('game-state', game);
      socket.to(gameId).emit('player-joined', game.players.find(p => p.id === socket.id));
      
      console.log(`Player ${playerName} joined game ${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', 'Failed to join game');
    }
  });

  socket.on('update-settings', ({ gameId, settings }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) return;
    
    game.settings = { ...game.settings, ...settings };
    io.to(gameId).emit('game-state', game);
  });

  socket.on('player-ready', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;
    
    player.isReady = !player.isReady;
    io.to(gameId).emit('game-state', game);
  });

  socket.on('start-game', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) return;
    
    if (game.players.length !== 2 || !game.players.every(p => p.isReady)) {
      socket.emit('error', 'All players must be ready');
      return;
    }
    
    game.isGameStarted = true;
    game.isActive = true;
    
    io.to(gameId).emit('game-started');
    io.to(gameId).emit('game-state', game);
    
    // Start first round
    setTimeout(() => {
      startNewRound(gameId);
    }, 1000);
  });

  socket.on('movie-guessed', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game || !game.isRoundActive) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.id !== game.currentActorId) return;
    
    endRound(gameId, true);
  });

  socket.on('skip-movie', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game || !game.isRoundActive) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.id !== game.currentActorId) return;
    
    // Get a new movie instead of ending the round
    const movie = getRandomMovie(game.settings.movieCategories);
    game.currentMovie = movie.title;
    
    io.to(gameId).emit('game-state', game);
    io.to(gameId).emit('movie-skipped', {
      newMovie: movie.title,
    });
  });

  socket.on('play-again', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    // Reset game state to lobby
    game.currentRound = 0;
    game.currentActorId = null;
    game.currentGuesser = null;
    game.currentMovie = null;
    game.timeRemaining = 0;
    game.isActive = false;
    game.isGameStarted = false;
    game.isRoundActive = false;
    game.winner = null;
    
    // Clear any active timers
    if (game.roundTimer) {
      clearInterval(game.roundTimer);
      game.roundTimer = null;
    }
    
    // Reset scores and auto-ready players
    game.players.forEach(player => {
      player.score = 0;
      player.isReady = true; // Auto-ready players
    });
    
    io.to(gameId).emit('game-state', game);
    io.to(gameId).emit('play-again-reset');
  });

  socket.on('leave-game', ({ gameId }) => {
    handlePlayerLeave(socket.id, gameId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const playerInfo = playerSockets.get(socket.id);
    if (playerInfo) {
      handlePlayerLeave(socket.id, playerInfo.gameId);
    }
  });
});

function handlePlayerLeave(socketId, gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  const playerIndex = game.players.findIndex(p => p.id === socketId);
  if (playerIndex === -1) return;
  
  const player = game.players[playerIndex];
  game.players.splice(playerIndex, 1);
  
  playerSockets.delete(socketId);
  
  if (game.players.length === 0) {
    // Delete empty game
    if (game.roundTimer) {
      clearInterval(game.roundTimer);
    }
    games.delete(gameId);
  } else {
    // Update host if needed
    if (player.isHost && game.players.length > 0) {
      game.players[0].isHost = true;
    }
    
    // End game if in progress
    if (game.isGameStarted && game.isActive) {
      endGame(gameId);
    }
    
    io.to(gameId).emit('player-left', socketId);
    io.to(gameId).emit('game-state', game);
  }
  
  console.log(`Player ${player.name} left game ${gameId}`);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 