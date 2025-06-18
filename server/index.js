const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Import head-to-head cards and validation
const path = require('path');
const fs = require('fs');

// Load head-to-head cards from the lib directory
let HEAD_TO_HEAD_CARDS = [];
let validateMovie = () => true;

try {
  // Try to load the JavaScript module
  const cardsPath = path.join(__dirname, '..', 'lib', 'blockbuster-cards.js');
  if (fs.existsSync(cardsPath)) {
    const cards = require(cardsPath);
    HEAD_TO_HEAD_CARDS = cards.HEAD_TO_HEAD_CARDS || [];
    validateMovie = cards.validateMovie || (() => true);
  } else {
    // Fallback: Define some basic head-to-head cards
    HEAD_TO_HEAD_CARDS = [
      {
        id: 'sports-1',
        category: 'Sports Movies',
        description: 'Name Bollywood movies about sports',
        examples: ['Dangal', 'Sultan', 'Mary Kom', 'Bhaag Milkha Bhaag', 'MS Dhoni']
      },
      {
        id: 'romance-1',
        category: 'Romance Movies',
        description: 'Name Bollywood romantic movies',
        examples: ['Dilwale Dulhania Le Jayenge', 'Kuch Kuch Hota Hai', 'Jab We Met', 'Yeh Jawaani Hai Deewani']
      },
      {
        id: 'action-1',
        category: 'Action Movies',
        description: 'Name Bollywood action movies',
        examples: ['War', 'Baaghi', 'Don', 'Dhoom', 'Singham']
      },
      {
        id: 'comedy-1',
        category: 'Comedy Movies',
        description: 'Name Bollywood comedy movies',
        examples: ['3 Idiots', 'Golmaal', 'Housefull', 'Hera Pheri', 'Welcome']
      },
      {
        id: 'shahrukh-1',
        category: 'Shah Rukh Khan Movies',
        description: 'Name movies starring Shah Rukh Khan',
        examples: ['Chennai Express', 'Happy New Year', 'My Name is Khan', 'Om Shanti Om']
      }
    ];
  }
} catch (error) {
  console.warn('Could not load blockbuster cards, using fallback:', error.message);
  // Use fallback cards defined above
}

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

// Movie database with genres
const MOVIES = [
  // Hollywood Movies
  { title: "Titanic", category: "hollywood", difficulty: "easy", genre: "Romance" },
  { title: "Avatar", category: "hollywood", difficulty: "easy", genre: "Sci-Fi" },
  { title: "The Lion King", category: "hollywood", difficulty: "easy", genre: "Animation" },
  { title: "Finding Nemo", category: "hollywood", difficulty: "easy", genre: "Animation" },
  { title: "Spider-Man", category: "hollywood", difficulty: "easy", genre: "Action" },
  { title: "Batman", category: "hollywood", difficulty: "easy", genre: "Action" },
  { title: "Superman", category: "hollywood", difficulty: "easy", genre: "Action" },
  { title: "Frozen", category: "hollywood", difficulty: "easy", genre: "Animation" },
  { title: "Shrek", category: "hollywood", difficulty: "easy", genre: "Animation" },
  { title: "Cars", category: "hollywood", difficulty: "easy", genre: "Animation" },
  { title: "The Shawshank Redemption", category: "hollywood", difficulty: "medium", genre: "Drama" },
  { title: "The Godfather", category: "hollywood", difficulty: "medium", genre: "Crime" },
  { title: "Pulp Fiction", category: "hollywood", difficulty: "medium", genre: "Crime" },
  { title: "The Dark Knight", category: "hollywood", difficulty: "medium", genre: "Action" },
  { title: "Forrest Gump", category: "hollywood", difficulty: "medium", genre: "Drama" },
  { title: "Inception", category: "hollywood", difficulty: "medium", genre: "Sci-Fi" },
  { title: "The Matrix", category: "hollywood", difficulty: "medium", genre: "Sci-Fi" },
  { title: "Jurassic Park", category: "hollywood", difficulty: "medium", genre: "Adventure" },
  { title: "Star Wars", category: "hollywood", difficulty: "medium", genre: "Sci-Fi" },
  { title: "The Avengers", category: "hollywood", difficulty: "medium", genre: "Action" },
  
  // Bollywood Movies
  { title: "Sholay", category: "bollywood", difficulty: "easy", genre: "Action" },
  { title: "Dilwale Dulhania Le Jayenge", category: "bollywood", difficulty: "easy", genre: "Romance" },
  { title: "3 Idiots", category: "bollywood", difficulty: "easy", genre: "Comedy" },
  { title: "Dangal", category: "bollywood", difficulty: "easy", genre: "Sports" },
  { title: "Baahubali", category: "bollywood", difficulty: "easy", genre: "Action" },
  { title: "PK", category: "bollywood", difficulty: "easy", genre: "Comedy" },
  { title: "Sultan", category: "bollywood", difficulty: "easy", genre: "Sports" },
  { title: "Singham", category: "bollywood", difficulty: "easy", genre: "Action" },
  { title: "Chennai Express", category: "bollywood", difficulty: "easy", genre: "Comedy" },
  { title: "Krrish", category: "bollywood", difficulty: "easy", genre: "Sci-Fi" },
  { title: "Zindagi Na Milegi Dobara", category: "bollywood", difficulty: "medium", genre: "Drama" },
  { title: "Queen", category: "bollywood", difficulty: "medium", genre: "Comedy" },
  { title: "Pink", category: "bollywood", difficulty: "medium", genre: "Social" },
  { title: "Article 15", category: "bollywood", difficulty: "medium", genre: "Social" },
  { title: "Andhadhun", category: "bollywood", difficulty: "medium", genre: "Thriller" },
  { title: "Lagaan", category: "bollywood", difficulty: "easy", genre: "Historical" },
  { title: "Taare Zameen Par", category: "bollywood", difficulty: "easy", genre: "Drama" },
  { title: "My Name is Khan", category: "bollywood", difficulty: "easy", genre: "Drama" },
  { title: "Yeh Jawaani Hai Deewani", category: "bollywood", difficulty: "easy", genre: "Romance" },
  { title: "Bajrangi Bhaijaan", category: "bollywood", difficulty: "easy", genre: "Drama" },
  { title: "War", category: "bollywood", difficulty: "easy", genre: "Action" },
  { title: "Gully Boy", category: "bollywood", difficulty: "easy", genre: "Drama" },
  { title: "URI", category: "bollywood", difficulty: "easy", genre: "Action" },
  { title: "Stree", category: "bollywood", difficulty: "medium", genre: "Horror-Comedy" },
  { title: "Raazi", category: "bollywood", difficulty: "medium", genre: "Thriller" },
];

const DEFAULT_SETTINGS = {
  rounds: 5,
  timeLimit: 300, // 5 minutes
  movieCategories: ['hollywood', 'bollywood'],
};

// Head-to-Head Helper Functions
function getRandomHeadToHeadCard() {
  if (HEAD_TO_HEAD_CARDS.length === 0) {
    return {
      id: 'fallback',
      category: 'Bollywood Movies',
      description: 'Name any Bollywood movie',
      examples: ['3 Idiots', 'Dangal', 'PK', 'Sultan']
    };
  }
  return HEAD_TO_HEAD_CARDS[Math.floor(Math.random() * HEAD_TO_HEAD_CARDS.length)];
}

function selectPlayersForHeadToHead(game) {
  if (game.teams.length < 2) return { teamA: null, teamB: null };
  
  // For now, select first player from each team
  // Later can implement rotation logic
  const teamA = game.teams[0];
  const teamB = game.teams[1];
  
  const playerA = teamA.players[0];
  const playerB = teamB.players[0];
  
  return { teamA: playerA, teamB: playerB };
}

function startHeadToHeadRound(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  // Select head-to-head card
  const card = getRandomHeadToHeadCard();
  
  // Select players for head-to-head
  const players = selectPlayersForHeadToHead(game);
  
  // Initialize head-to-head state with ready phase
  game.headToHead = {
    isActive: false, // Will become true after countdown
    card: card,
    currentPlayers: players,
    timeRemaining: game.settings.headToHeadTime,
    submissions: [],
    winner: null,
    isReady: false,
    countdownActive: false,
    countdownTime: 0
  };
  
  // Broadcast initial state
  io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
}

function startHeadToHeadCountdown(gameId) {
  const game = games.get(gameId);
  if (!game || !game.headToHead) return;
  
  game.headToHead.isReady = true;
  game.headToHead.countdownActive = true;
  game.headToHead.countdownTime = 3;
  
  // Clear any existing countdown timer
  if (game.countdownTimer) {
    clearInterval(game.countdownTimer);
  }
  
  // Broadcast countdown start
  io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
  
  // Start countdown timer
  game.countdownTimer = setInterval(() => {
    if (game.headToHead.countdownTime > 0) {
      game.headToHead.countdownTime--;
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
      
      if (game.headToHead.countdownTime <= 0) {
        // Countdown finished, start the actual round
        clearInterval(game.countdownTimer);
        game.countdownTimer = null;
        
        game.headToHead.countdownActive = false;
        game.headToHead.isActive = true;
        
        // Start the main timer
        startHeadToHeadTimer(gameId);
      }
    }
  }, 1000);
}

function startHeadToHeadTimer(gameId) {
  const game = games.get(gameId);
  if (!game || !game.headToHead.isActive) return;
  
  // Clear any existing timer
  if (game.headToHeadTimer) {
    clearInterval(game.headToHeadTimer);
  }
  
  // Start countdown timer
  game.headToHeadTimer = setInterval(() => {
    if (game.headToHead.timeRemaining > 0) {
      game.headToHead.timeRemaining--;
      
      // Broadcast timer update
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
      
      if (game.headToHead.timeRemaining <= 0) {
        endHeadToHeadRound(gameId);
      }
    }
  }, 1000);
}

function endHeadToHeadRound(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  // Clear the timer
  if (game.headToHeadTimer) {
    clearInterval(game.headToHeadTimer);
    game.headToHeadTimer = null;
  }
  
  // Determine winner (last player to submit)
  let winner = null;
  if (game.headToHead.submissions.length > 0) {
    const lastSubmission = game.headToHead.submissions[game.headToHead.submissions.length - 1];
    winner = lastSubmission.playerId;
    game.headToHead.winner = winner;
  }
  
  // Mark head-to-head as inactive
  game.headToHead.isActive = false;
  
  // Move to movie selection phase
  game.currentPhase = 'movie-selection';
  
  // Generate 6 random movie cards for selection
  game.movieCards = generateRandomMovieCards(6, game.settings.movieCategories);
  
  // Initialize player assignments
  if (!game.currentPlayerAssignments) {
    game.currentPlayerAssignments = {};
  }
  
  // Broadcast final state
  io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
}

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

// Generate movie cards for blockbuster game
function generateRandomMovieCards(count = 6, categories = ['bollywood']) {
  const filteredMovies = MOVIES.filter(movie => categories.includes(movie.category));
  
  if (filteredMovies.length === 0) {
    // Fallback to all movies if no movies match the category
    const fallbackMovies = MOVIES.slice(0, count);
    return fallbackMovies.map((movie, i) => ({
      id: `movie-${Date.now()}-${i}`,
      title: movie.title,
      genre: movie.genre || 'Unknown',
      category: movie.category,
      difficulty: movie.difficulty,
    }));
  }
  
  const selectedMovies = [];
  const moviePool = [...filteredMovies]; // Copy to avoid modifying original
  
  for (let i = 0; i < count && moviePool.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * moviePool.length);
    const movie = moviePool.splice(randomIndex, 1)[0];
    
    // Convert to MovieCard format
    selectedMovies.push({
      id: `movie-${Date.now()}-${i}`,
      title: movie.title,
      genre: movie.genre,
      category: movie.category,
      difficulty: movie.difficulty,
    });
  }
  
  return selectedMovies;
}

function getGameStateForClient(game) {
  // Return clean game state without timer references to prevent circular reference
  const cleanGame = {
    id: game.id,
    players: game.players,
    settings: game.settings,
    currentRound: game.currentRound,
    currentActorId: game.currentActorId,
    currentGuesser: game.currentGuesser,
    currentMovie: game.currentMovie,
    timeRemaining: game.timeRemaining,
    isActive: game.isActive,
    isGameStarted: game.isGameStarted,
    isRoundActive: game.isRoundActive,
    winner: game.winner,
  };

  // Add blockbuster-specific fields if they exist
  if (game.teams) {
    cleanGame.teams = game.teams;
    cleanGame.currentPhase = game.currentPhase;
    cleanGame.movieCards = game.movieCards || [];
    cleanGame.currentPlayerAssignments = game.currentPlayerAssignments || {};
    cleanGame.currentRoundPlayer = game.currentRoundPlayer;
    cleanGame.currentField = game.currentField;
    cleanGame.roundHistory = game.roundHistory || [];
    
    // Clean roundState without timer references to prevent circular reference
    if (game.roundState) {
      cleanGame.roundState = {
        currentPlayerIndex: game.roundState.currentPlayerIndex,
        playersOrder: game.roundState.playersOrder,
        revealedMovies: game.roundState.revealedMovies,
        guessedMovies: game.roundState.guessedMovies,
        isFirstMovieRevealed: game.roundState.isFirstMovieRevealed,
        currentPlayerScore: game.roundState.currentPlayerScore
        // Exclude movieRoundTimer to prevent circular reference
      };
    }
    
    // Clean head-to-head state without timer references
    if (game.headToHead) {
      cleanGame.headToHead = {
        isActive: game.headToHead.isActive,
        card: game.headToHead.card,
        currentPlayers: game.headToHead.currentPlayers,
        timeRemaining: game.headToHead.timeRemaining,
        submissions: game.headToHead.submissions,
        winner: game.headToHead.winner,
        isReady: game.headToHead.isReady || false,
        countdownActive: game.headToHead.countdownActive || false,
        countdownTime: game.headToHead.countdownTime || 0
      };
    }
  }

  return cleanGame;
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
    if (game.players.length > 0) {
      const randomIndex = Math.floor(Math.random() * game.players.length);
      game.currentActorId = game.players[randomIndex].id;
    }
  }
  
  game.currentGuesser = game.players.find(p => p.id !== game.currentActorId)?.id || null;
  
  // Get random movie
  const movie = getRandomMovie(game.settings.movieCategories);
  game.currentMovie = movie.title;
  
  // Set timer
  game.timeRemaining = game.settings.timeLimit;
  game.isRoundActive = true;
  
  // Clear any existing timer first
  if (game.roundTimer) {
    clearInterval(game.roundTimer);
    game.roundTimer = null;
  }
  
  // Start countdown timer
  if (game.settings.timeLimit > 0) {
    game.roundTimer = setInterval(() => {
      if (game.timeRemaining > 0) {
        game.timeRemaining--;
        io.to(gameId).emit('game-state', getGameStateForClient(game));
        
        if (game.timeRemaining <= 0) {
          endRound(gameId, false);
        }
      }
    }, 1000);
  }
  
  // Emit game state first (exclude timer to prevent circular reference)
  io.to(gameId).emit('game-state', getGameStateForClient(game));
  
  // Then emit round started event
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
  
  // Clear the timer
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
  
  // Emit game state update (exclude timer to prevent circular reference)
  io.to(gameId).emit('game-state', getGameStateForClient(game));
  
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
}

function endGame(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  // Clear any active timers
  if (game.roundTimer) {
    clearInterval(game.roundTimer);
    game.roundTimer = null;
  }
  
  if (game.roundState?.movieRoundTimer) {
    clearInterval(game.roundState.movieRoundTimer);
    game.roundState.movieRoundTimer = null;
  }

  game.isActive = false;
  
  // Determine winner
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
  game.winner = sortedPlayers[0].id;
  
  io.to(gameId).emit('game-ended', {
    winner: game.winner,
    finalScores: sortedPlayers.map(p => ({ id: p.id, name: p.name, score: p.score })),
  });
  
  io.to(gameId).emit('game-state', getGameStateForClient(game));
}

// Movie round timer function
function startMovieRoundTimer(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  // Clear any existing timer
  if (game.roundState.movieRoundTimer) {
    clearInterval(game.roundState.movieRoundTimer);
  }

  game.roundState.movieRoundTimer = setInterval(() => {
    if (game.timeRemaining > 0) {
      game.timeRemaining--;
      
      // Broadcast timer update
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
      
      if (game.timeRemaining <= 0) {
        endMovieRoundTurn(gameId);
      }
    }
  }, 1000);
}

// End current player's turn and switch to next player
function endMovieRoundTurn(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  // Clear the timer
  if (game.roundState.movieRoundTimer) {
    clearInterval(game.roundState.movieRoundTimer);
    game.roundState.movieRoundTimer = null;
  }
  
  // Record current player's score
  const currentPlayer = game.players.find(p => p.id === game.currentRoundPlayer);
  if (currentPlayer) {
    currentPlayer.score += game.roundState.currentPlayerScore;
  }

  // Move to next player
  game.roundState.currentPlayerIndex++;
  
  if (game.roundState.currentPlayerIndex >= game.roundState.playersOrder.length) {
    // All players have played, end game
    game.currentPhase = 'game-over';
    game.isActive = false;

  } else {
    // Switch to next player
    game.currentRoundPlayer = game.roundState.playersOrder[game.roundState.currentPlayerIndex];
    game.timeRemaining = game.settings.movieRoundTime;
    game.isActive = false; // Timer starts when first movie is revealed
    game.roundState.currentPlayerScore = 0;
    game.roundState.isFirstMovieRevealed = false;
    
    const nextPlayer = game.players.find(p => p.id === game.currentRoundPlayer);

  }
  
  // Broadcast updated state
  io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
}

io.on('connection', (socket) => {

  socket.on('join-game', ({ gameId, playerName, isHost }) => {
    try {
      let game = games.get(gameId);
      
      // Check if player is already in this game
      if (game && game.players.find(p => p.id === socket.id)) {
        socket.join(gameId);
        socket.emit('game-state', getGameStateForClient(game));
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
      socket.emit('game-state', getGameStateForClient(game));
      socket.to(gameId).emit('player-joined', game.players.find(p => p.id === socket.id));
      
    } catch (error) {
      socket.emit('error', 'Failed to join game');
    }
  });

  socket.on('update-settings', ({ gameId, settings }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) return;
    
    game.settings = { ...game.settings, ...settings };
    io.to(gameId).emit('game-state', getGameStateForClient(game));
  });

  socket.on('player-ready', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Toggle ready status
    player.isReady = !player.isReady;

    // =============================
    // Support Blockbuster teams
    // If the game includes teams (Blockbuster variant), propagate the ready
    // state to the corresponding player objects inside each team.
    // =============================
    if (Array.isArray(game.teams)) {
      game.teams.forEach(team => {
        const teamPlayer = team.players.find(p => p.id === player.id);
        if (teamPlayer) {
          teamPlayer.isReady = player.isReady;
        }
      });
    }

    // Emit the correct state event depending on the game type
    if (Array.isArray(game.teams)) {
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
    } else {
      io.to(gameId).emit('game-state', getGameStateForClient(game));
    }
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
    
    // Initialize game state
    game.isGameStarted = true;
    game.isActive = true;
    game.currentRound = 0;
    game.currentActorId = null;
    game.currentGuesser = null;
    game.currentMovie = null;
    game.timeRemaining = 0;
    game.isRoundActive = false;
    
    // Reset player scores
    game.players.forEach(player => {
      player.score = 0;
    });
    
    io.to(gameId).emit('game-started');
    io.to(gameId).emit('game-state', getGameStateForClient(game));
    
    // Start first round
    setTimeout(() => {
      startNewRound(gameId);
    }, 1000);
  });

  // Movie revealed handler for movie round
  socket.on('movie-revealed', ({ gameId, movieId, category }) => {
    const game = games.get(gameId);
    if (!game || game.currentPhase !== 'movie-round') {
      socket.emit('error', 'Movie round is not active');
      return;
    }

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.id !== game.currentRoundPlayer) {
      socket.emit('error', 'Not your turn');
      return;
    }

    // Check if movie was already revealed
    if (game.roundState.revealedMovies.some(m => m.movieId === movieId)) {
      socket.emit('error', 'Movie already revealed');
      return;
    }

    // Add to revealed movies
    game.roundState.revealedMovies.push({
      movieId,
      playerId: player.id,
      category,
      timestamp: Date.now(),
    });

    // Start timer if this is the first movie revealed
    if (!game.roundState.isFirstMovieRevealed) {
      game.roundState.isFirstMovieRevealed = true;
      game.isActive = true;
      startMovieRoundTimer(gameId);
    }

    io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
  });

  // Movie guessed handler for movie round
  socket.on('movie-guessed', ({ gameId, movieId }) => {
    const game = games.get(gameId);
    if (!game || game.currentPhase !== 'movie-round') {
      socket.emit('error', 'Movie round is not active');
      return;
    }

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.id !== game.currentRoundPlayer) {
      socket.emit('error', 'Not your turn');
      return;
    }

    // Check if movie was revealed
    const revealedMovie = game.roundState.revealedMovies.find(m => m.movieId === movieId);
    if (!revealedMovie) {
      socket.emit('error', 'Movie not revealed yet');
      return;
    }

    // Check if already guessed
    if (game.roundState.guessedMovies.some(m => m.movieId === movieId)) {
      socket.emit('error', 'Movie already guessed');
      return;
    }

    // Add to guessed movies
    game.roundState.guessedMovies.push({
      movieId,
      playerId: player.id,
      category: revealedMovie.category,
      timestamp: Date.now(),
    });

    game.roundState.currentPlayerScore++;

    io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
  });

  // Skip movie handler for movie round  
  socket.on('skip-movie', ({ gameId, movieId }) => {
    const game = games.get(gameId);
    if (!game || game.currentPhase !== 'movie-round') {
      socket.emit('error', 'Movie round is not active');
      return;
    }

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.id !== game.currentRoundPlayer) {
      socket.emit('error', 'Not your turn');
      return;
    }

    io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
  });

  // Round complete handler
  socket.on('round-complete', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game || game.currentPhase !== 'movie-round') {
      socket.emit('error', 'Movie round is not active');
      return;
    }

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.id !== game.currentRoundPlayer) {
      socket.emit('error', 'Not your turn');
      return;
    }

    endMovieRoundTurn(gameId);
  });

  // Removed play-again handler - players now redirect to lobby page instead

  // Blockbuster Game Handlers
  socket.on('create-blockbuster-game', ({ gameId, playerName, settings }) => {
    try {
  
      
      // Check if game already exists
      if (games.get(gameId)) {
        socket.emit('error', 'Game ID already exists');
        return;
      }
      
      const hostPlayer = {
        id: socket.id,
        name: playerName,
        isHost: true,
        isReady: true, // Auto-ready the host
        score: 0,
        teamId: null,
      };
      
      // Create Blockbuster game state
      const blockbusterGame = {
        id: gameId,
        teams: [],
        settings: settings,
        currentPhase: 'lobby',
        headToHead: {
          isActive: false,
          card: null,
          currentPlayers: { teamA: null, teamB: null },
          timeRemaining: 0,
          submissions: [],
          winner: null,
        },
        movieCards: [],
        currentPlayerAssignments: {},
        currentRoundPlayer: null,
        currentField: null,
        timeRemaining: 0,
        isActive: false,
        isGameStarted: false,
        winner: null,
        roundHistory: [],
        // Add compatibility fields for existing functions
        players: [hostPlayer],
        currentRound: 0,
        currentActorId: null,
        currentGuesser: null,
        currentMovie: null,
        isRoundActive: false,
        roundTimer: null,
      };
      
      games.set(gameId, blockbusterGame);
      playerSockets.set(socket.id, { gameId, playerId: socket.id });
      
      socket.join(gameId);
      socket.emit('blockbuster-game-state', getGameStateForClient(blockbusterGame));
      
    } catch (error) {
      socket.emit('error', 'Failed to create game');
    }
  });

  socket.on('join-blockbuster-game', ({ gameId, playerName }) => {
    try {
  
      
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', 'Game not found');
        return;
      }
      
      // Check if player is already in this game
      if (game.players && game.players.find(p => p.id === socket.id)) {
        socket.join(gameId);
        socket.emit('blockbuster-game-state', getGameStateForClient(game));
        return;
      }
      
      const player = {
        id: socket.id,
        name: playerName,
        isHost: false,
        isReady: false,
        score: 0,
        teamId: null,
      };
      
      if (!game.players) game.players = [];
      game.players.push(player);
      playerSockets.set(socket.id, { gameId, playerId: socket.id });
      
      socket.join(gameId);
      socket.emit('blockbuster-game-state', getGameStateForClient(game));
      socket.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
      

          } catch (error) {
        socket.emit('error', 'Failed to join game');
      }
  });

  socket.on('create-team', ({ gameId, teamName, playerId }) => {
    try {
      const game = games.get(gameId);
      if (!game) return;
      
      const player = game.players.find(p => p.id === socket.id);
      if (!player) return;
      
      // Check if player is already on a team
      if (game.teams.find(team => team.players.some(p => p.id === player.id))) {
        socket.emit('error', 'You are already on a team');
        return;
      }
      
      const teamId = `team-${Date.now()}`;
      const newTeam = {
        id: teamId,
        name: teamName,
        players: [player],
        score: 0,
        genresGuessed: [],
      };
      
      player.teamId = teamId;
      game.teams.push(newTeam);
      
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));

    } catch (error) {
      console.error('Error creating team:', error);
    }
  });

  socket.on('join-team', ({ gameId, teamId, playerId }) => {
    try {
      const game = games.get(gameId);
      if (!game) return;
      
      const player = game.players.find(p => p.id === socket.id);
      const team = game.teams.find(t => t.id === teamId);
      
      if (!player || !team) return;
      
      // Check if player is already on a team
      const currentTeam = game.teams.find(t => t.players.some(p => p.id === player.id));
      if (currentTeam) {
        socket.emit('error', 'You are already on a team');
        return;
      }
      
      // Check team capacity
      if (team.players.length >= game.settings.maxPlayersPerTeam) {
        socket.emit('error', 'Team is full');
        return;
      }
      
      player.teamId = teamId;
      team.players.push(player);
      
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));

    } catch (error) {
      console.error('Error joining team:', error);
    }
  });

  socket.on('start-blockbuster-game', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game) return;
      
      const player = game.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) return;
      
      // Validate game can start
      if (game.teams.length < 2) {
        socket.emit('error', 'Need at least 2 teams to start');
        return;
      }
      
      if (!game.teams.every(team => team.players.length > 0)) {
        socket.emit('error', 'All teams must have at least one player');
        return;
      }
      
      // Check if all players are ready
      const allPlayers = game.teams.flatMap(team => team.players);
      if (!allPlayers.every(p => p.isReady)) {
        socket.emit('error', 'All players must be ready to start');
        return;
      }
      
      // Start the game
      game.isGameStarted = true;
      game.currentPhase = 'head-to-head';
      
      // Start the first head-to-head round
      startHeadToHeadRound(gameId);
      
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
  
    } catch (error) {
      console.error('Error starting Blockbuster game:', error);
    }
  });

  // Head-to-Head ready handler
  socket.on('head-to-head-ready', ({ gameId, playerId }) => {
    try {
      const game = games.get(gameId);
      if (!game || game.currentPhase !== 'head-to-head') {
        socket.emit('error', 'Head-to-head round is not available');
        return;
      }

      const player = game.players.find(p => p.id === socket.id);
      if (!player || player.id !== playerId) {
        socket.emit('error', 'Invalid player');
        return;
      }

      // Check if player is participating in this head-to-head
      const isParticipating = game.headToHead.currentPlayers.teamA?.id === playerId || 
                              game.headToHead.currentPlayers.teamB?.id === playerId;
      
      if (!isParticipating) {
        socket.emit('error', 'You are not participating in this head-to-head');
        return;
      }

      // Start the countdown
      startHeadToHeadCountdown(gameId);
      

    } catch (error) {
      console.error('Error handling head-to-head ready:', error);
      socket.emit('error', 'Failed to start countdown');
    }
  });

  // Movie selection handler
  socket.on('movie-selection', ({ gameId, playerId, selectedMovies }) => {
    try {
      const game = games.get(gameId);
      if (!game || game.currentPhase !== 'movie-selection') {
        socket.emit('error', 'Movie selection is not active');
        return;
      }

      const player = game.players.find(p => p.id === socket.id);
      if (!player || player.id !== playerId) {
        socket.emit('error', 'Invalid player');
        return;
      }

      // Validate movie selection
      if (!selectedMovies || !selectedMovies.oneWord || !selectedMovies.dialogue || !selectedMovies.actOut) {
        socket.emit('error', 'Please select movies for all categories');
        return;
      }

      // Find the movie cards based on IDs
      const oneWordMovie = game.movieCards.find(m => m.id === selectedMovies.oneWord);
      const dialogueMovie = game.movieCards.find(m => m.id === selectedMovies.dialogue);
      const actOutMovie = game.movieCards.find(m => m.id === selectedMovies.actOut);

      if (!oneWordMovie || !dialogueMovie || !actOutMovie) {
        socket.emit('error', 'Invalid movie selection');
        return;
      }

      // Store player's movie assignments
      game.currentPlayerAssignments[playerId] = {
        oneWord: oneWordMovie,
        dialogue: dialogueMovie,
        actOut: actOutMovie,
      };



      // Check if both head-to-head players have made their selections
      const headToHeadWinner = game.headToHead.winner;
      const loserTeam = game.teams.find(team => 
        !team.players.some(p => p.id === headToHeadWinner)
      );
      const loserPlayer = loserTeam?.players[0]; // For now, use first player of losing team

      const winnerHasSelected = game.currentPlayerAssignments[headToHeadWinner];
      const loserHasSelected = loserPlayer ? game.currentPlayerAssignments[loserPlayer.id] : false;

      if (winnerHasSelected && loserHasSelected) {
        // Both players have selected, move to movie round
        game.currentPhase = 'movie-round';
        game.currentRoundPlayer = headToHeadWinner; // Winner goes first
        game.timeRemaining = game.settings.movieRoundTime;
        game.isActive = false; // Timer starts when first movie is revealed
        
        // Initialize movie round state
        game.roundState = {
          currentPlayerIndex: 0, // 0 = first player (winner), 1 = second player (loser) 
          playersOrder: [headToHeadWinner, loserPlayer?.id].filter(Boolean),
          revealedMovies: [], // { movieId, playerId, category, timestamp }
          guessedMovies: [], // { movieId, playerId, category, timestamp }
          isFirstMovieRevealed: false,
          currentPlayerScore: 0,
          movieRoundTimer: null,
        };


      }

      // Broadcast updated game state
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
    } catch (error) {
      console.error('Error handling movie selection:', error);
      socket.emit('error', 'Failed to select movies');
    }
  });

  // Head-to-Head submission handler (simplified button press)
  socket.on('head-to-head-submission', ({ gameId, playerId, movieTitle }) => {
    try {
      const game = games.get(gameId);
      if (!game || game.currentPhase !== 'head-to-head' || !game.headToHead.isActive) {
        socket.emit('error', 'Head-to-head round is not active');
        return;
      }

      const player = game.players.find(p => p.id === socket.id);
      if (!player || player.id !== playerId) {
        socket.emit('error', 'Invalid player');
        return;
      }

      // Check if player is participating in this head-to-head
      const isParticipating = game.headToHead.currentPlayers.teamA?.id === playerId || 
                              game.headToHead.currentPlayers.teamB?.id === playerId;
      
      if (!isParticipating) {
        socket.emit('error', 'You are not participating in this head-to-head');
        return;
      }

      // Check if it's the player's turn (alternating turns)
      const lastSubmission = game.headToHead.submissions[game.headToHead.submissions.length - 1];
      const isPlayerTurn = !lastSubmission || lastSubmission.playerId !== playerId;
      
      if (!isPlayerTurn) {
        socket.emit('error', 'Wait for your turn');
        return;
      }

      // Add turn record (no movie validation needed)
      const submission = {
        playerId,
        movie: 'turn-completed', // Placeholder since we're not tracking actual movies
        timestamp: Date.now()
      };
      
      game.headToHead.submissions.push(submission);
      
      // Add 2 seconds to timer (but don't exceed original time)
      const maxTime = game.settings.headToHeadTime;
      game.headToHead.timeRemaining = Math.min(game.headToHead.timeRemaining + 2, maxTime);

      // Broadcast the updated game state
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
      

    } catch (error) {
      console.error('Error handling head-to-head turn:', error);
      socket.emit('error', 'Failed to complete turn');
    }
  });

  socket.on('leave-game', ({ gameId }) => {
    handlePlayerLeave(socket.id, gameId);
  });

  socket.on('disconnect', () => {
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
    if (game.headToHeadTimer) {
      clearInterval(game.headToHeadTimer);
    }
    if (game.countdownTimer) {
      clearInterval(game.countdownTimer);
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
    io.to(gameId).emit('game-state', getGameStateForClient(game));
  }
  

}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Server startup complete. Games map initialized.`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
    server.listen(PORT + 1, () => {
      console.log(`Socket.IO server running on port ${PORT + 1}`);
      console.log(`Server startup complete. Games map initialized.`);
    });
  } else {
    console.error('Server error:', err);
  }
}); 