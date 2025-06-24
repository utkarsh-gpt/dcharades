const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Import database functions
const {
  initializeDatabase,
  getRandomMovies,
  getRandomHeadToHeadCard: getRandomHeadToHeadCardFromDB,
  findMovieByTitle,
  getMoviesByGenre,
  getAllMovies
} = require('./db');

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || [
      "http://localhost:3000", 
      "https://*.vercel.app",
      "https://*.render.com",
      "https://*.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Game state management
const games = new Map();
const playerSockets = new Map();

const DEFAULT_SETTINGS = {
  rounds: 5,
  timeLimit: 300, // 5 minutes
  movieCategories: ['hollywood', 'bollywood'],
};

// UNO Game Logic
const DEFAULT_UNO_SETTINGS = {
  gameType: 'uno',
  timePerTurn: 0, // No time limit
  includeUniqueCards: true,
  enableChat: true,
};

// UNO Card Generation
function createUnoCard(type, color, value, uniqueType = null) {
    return {
    id: uuidv4(),
    type,
    color,
    value,
    uniqueType,
  };
}

function generateUnoDeck(includeUniqueCards = true) {
  const deck = [];
  const colors = ['red', 'blue', 'green', 'yellow'];

  // Number cards (0-9)
  colors.forEach(color => {
    // One 0 card per color
    deck.push(createUnoCard('number', color, 0));
    
    // Two of each number 1-9 per color
    for (let value = 1; value <= 9; value++) {
      deck.push(createUnoCard('number', color, value));
      deck.push(createUnoCard('number', color, value));
    }
  });

  // Action cards (2 of each per color)
  colors.forEach(color => {
    ['skip', 'reverse', 'draw-two'].forEach(type => {
      deck.push(createUnoCard(type, color, null));
      deck.push(createUnoCard(type, color, null));
    });
  });

  // Wild cards (4 of each)
  for (let i = 0; i < 4; i++) {
    deck.push(createUnoCard('wild', null, null));
    deck.push(createUnoCard('wild-draw-four', null, null));
  }

  // Unique cards for 2-player gameplay
  if (includeUniqueCards) {
    const uniqueTypes = ['duel', 'mirror', 'swap-hands', 'peek-pick', 'double-down', 'revenge', 'shield', 'time-bomb', 'lucky-draw', 'final-stand'];
    uniqueTypes.forEach(uniqueType => {
      deck.push(createUnoCard('unique', null, null, uniqueType));
      deck.push(createUnoCard('unique', null, null, uniqueType));
    });
  }

  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Database-powered movie functions
async function getRandomMovieCards(count = 6, filters = {}) {
  try {
    const movies = await getRandomMovies(count, filters);
    return movies.map(movie => ({
      id: movie.id.toString(),
      title: movie.title,
      genre: movie.genre,
      category: movie.category,
      difficulty: movie.difficulty
    }));
  } catch (error) {
    return [];
  }
}

async function getRandomHeadToHeadCard() {
  try {
    const card = await getRandomHeadToHeadCardFromDB();
    return card ? {
      id: card.id,
      category: card.category,
      description: card.description,
      examples: []
    } : null;
  } catch (error) {
    return null;
  }
}

// Blockbuster Game Functions
function createGame(gameId, hostPlayer) {
  const game = {
    id: gameId,
    teams: [],
    settings: {
      rounds: 3,
      timeLimit: 0,
      movieCategories: ['bollywood'],
      gameType: 'blockbuster',
      maxPlayersPerTeam: 6,
      headToHeadTime: 45,
      movieRoundTime: 60,
    },
    currentPhase: 'lobby',
    headToHead: {
      isActive: false,
      card: null,
      currentPlayers: { teamA: null, teamB: null },
      timeRemaining: 0,
      submissions: [],
      winner: null,
      isReady: false,
      countdownActive: false,
      countdownTime: 0,
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
    headToHeadTimer: null,
    countdownTimer: null,
  };

  return game;
}

function selectPlayersForHeadToHead(game) {
  if (game.teams.length < 2) return null;
  
  // Get random player from each team
  const teamA = game.teams[0];
  const teamB = game.teams[1];
  
  if (teamA.players.length === 0 || teamB.players.length === 0) return null;
  
  const playerA = teamA.players[Math.floor(Math.random() * teamA.players.length)];
  const playerB = teamB.players[Math.floor(Math.random() * teamB.players.length)];
  
  return { teamA: playerA, teamB: playerB };
}

async function startHeadToHeadRound(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  // Select head-to-head card from database
  const card = await getRandomHeadToHeadCard();
  if (!card) {
    return;
  }
  
  // Select players for head-to-head
  const players = selectPlayersForHeadToHead(game);
  if (!players) {
    return;
  }
  
  game.headToHead = {
    isActive: false,
    card: card,
    currentPlayers: players,
    timeRemaining: game.settings.headToHeadTime,
    submissions: [],
    winner: null,
    isReady: false,
    countdownActive: false,
    countdownTime: 0,
  };
  
  io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
}

function startHeadToHeadCountdown(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  game.headToHead.countdownActive = true;
  game.headToHead.countdownTime = 3;
  game.headToHead.isReady = true; // Hide ready button during countdown
  
  const countdown = setInterval(() => {
      game.headToHead.countdownTime--;
      
      if (game.headToHead.countdownTime <= 0) {
      clearInterval(countdown);
        game.headToHead.countdownActive = false;
        game.headToHead.isActive = true;
        game.headToHead.isReady = true;
        
      // Start the actual head-to-head timer
        startHeadToHeadTimer(gameId);
      }
    
    io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
  }, 1000);
  
  game.countdownTimer = countdown;
}

function startHeadToHeadTimer(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  const timer = setInterval(() => {
      game.headToHead.timeRemaining--;
      
      if (game.headToHead.timeRemaining <= 0) {
      clearInterval(timer);
        endHeadToHeadRound(gameId);
      }
    
  io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
  }, 1000);
  
  game.headToHeadTimer = timer;
}

async function endHeadToHeadRound(gameId) {
  const game = games.get(gameId);
  if (!game) return;
  
  game.headToHead.isActive = false;
  
  // Clear timers
  if (game.headToHeadTimer) {
    clearInterval(game.headToHeadTimer);
    game.headToHeadTimer = null;
  }
  
  if (game.countdownTimer) {
    clearInterval(game.countdownTimer);
    game.countdownTimer = null;
  }
  
  // Determine winner (player with most submissions)
  const submissions = game.headToHead.submissions;
  const playerACounts = submissions.filter(s => s.playerId === game.headToHead.currentPlayers.teamA?.id).length;
  const playerBCounts = submissions.filter(s => s.playerId === game.headToHead.currentPlayers.teamB?.id).length;
  
  let winner;
  if (playerACounts > playerBCounts) {
    winner = game.headToHead.currentPlayers.teamA?.id;
  } else if (playerBCounts > playerACounts) {
    winner = game.headToHead.currentPlayers.teamB?.id;
  } else {
    // Tie - random winner
    winner = Math.random() < 0.5 ? game.headToHead.currentPlayers.teamA?.id : game.headToHead.currentPlayers.teamB?.id;
  }
  
  game.headToHead.winner = winner;
  
  // Move to movie selection phase
  game.currentPhase = 'movie-selection';
  
  // Generate random movie cards from database
  try {
    const movieCards = await getRandomMovieCards(6, { category: 'bollywood' });
    game.movieCards = movieCards;
  } catch (error) {
    game.movieCards = [];
  }
  
  io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
}

function getGameStateForClient(game) {
  // Remove sensitive server data from game state
  const clientGame = { ...game };
  
  // Remove server-only timers
  delete clientGame.headToHeadTimer;
  delete clientGame.countdownTimer;
  delete clientGame.roundTimer;
  
  return clientGame;
}

// UNO Game Management Functions
function createUnoGame(gameId, hostPlayer, settings = DEFAULT_UNO_SETTINGS) {
  const deck = generateUnoDeck(settings.includeUniqueCards);
  
  // Create players with initial hands
  const players = [
    {
      ...hostPlayer,
      hand: [],
      score: 0,
      hasCalledUno: false,
      shieldActive: false,
      lastActionCard: null,
    }
  ];

  const game = {
    id: gameId,
    players,
    settings: { ...settings },
    currentPhase: 'lobby',
    currentPlayerIndex: 0,
    direction: 1,
    drawPile: deck.slice(14), // Reserve 14 cards for initial deal
    discardPile: [deck[13]], // First card starts discard pile
    currentColor: deck[13].color,
    skipNext: false,
    drawCount: 0,
    isActive: false,
    isGameStarted: false,
    winner: null,
    roundWinner: null,
    timeRemaining: 0,
    specialEffectActive: {
      type: null,
      playerId: null,
      timeRemaining: 0,
    },
    gameHistory: [],
    turnTimer: null,
    specialEffectTimer: null,
  };

  return game;
}

function dealUnoCards(game) {
  // Deal 7 cards to each player
  game.players.forEach(player => {
    player.hand = [];
    for (let i = 0; i < 7; i++) {
      if (game.drawPile.length > 0) {
        player.hand.push(game.drawPile.pop());
      }
    }
  });

  // Ensure first card is not a special card
  while (game.discardPile[0].type === 'wild' || game.discardPile[0].type === 'wild-draw-four' || game.discardPile[0].type === 'unique') {
    game.drawPile.push(game.discardPile[0]);
    game.drawPile = shuffleDeck(game.drawPile);
    game.discardPile[0] = game.drawPile.pop();
  }

  game.currentColor = game.discardPile[0].color;
}

function canPlayUnoCard(card, topCard, currentColor, game = null) {
  // Special stacking rules: if there are accumulated draw cards, only allow stacking
  if (game && game.drawCount > 0) {
    const isTopCardDrawCard = topCard && (topCard.type === 'draw-two' || topCard.type === 'wild-draw-four');
    if (isTopCardDrawCard) {
      // Only allow draw cards to be played for stacking
      return card.type === 'draw-two' || card.type === 'wild-draw-four';
    }
  }

  // Wild cards can always be played (unless we're in stacking mode)
  if (card.type === 'wild' || card.type === 'wild-draw-four') {
    return true;
  }

  // Unique cards can generally be played (with some exceptions)
  if (card.type === 'unique') {
    return canPlayUniqueCard(card, topCard, currentColor);
  }

  // Standard cards: match color, number, or symbol
  if (card.color === currentColor || card.color === topCard.color) {
    return true;
  }

  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
    return true;
  }

  if (card.type === topCard.type && card.type !== 'number') {
    return true;
  }

  return false;
}

function canPlayUniqueCard(card, topCard, currentColor) {
  switch (card.uniqueType) {
    case 'revenge':
      // Can only be played after opponent used an action card
      return true; // Validation will be done in game state
    
    case 'final-stand':
      // Can only be played when player has 3 or fewer cards
      return true; // Validation will be done in game state
    
    default:
      // Most unique cards can be played anytime
      return true;
  }
}

function drawUnoCards(game, player, count) {
  const drawnCards = [];
  
  for (let i = 0; i < count; i++) {
    if (game.drawPile.length === 0) {
      reshuffleDiscardPile(game);
    }
    
    if (game.drawPile.length > 0) {
      const card = game.drawPile.pop();
      player.hand.push(card);
      drawnCards.push(card);
    }
  }
  
  return drawnCards;
}

function reshuffleDiscardPile(game) {
  if (game.discardPile.length <= 1) return;
  
  const topCard = game.discardPile[0];
  const cardsToShuffle = game.discardPile.slice(1);
  
  game.drawPile = [...shuffleDeck(cardsToShuffle), ...game.drawPile];
  game.discardPile = [topCard];
}

function advanceUnoTurn(game) {
  // Handle skip effect
  if (game.skipNext) {
    game.skipNext = false;
    // In 2-player game, skip means the same player goes again
    return;
  }

  // Advance to next player first
  game.currentPlayerIndex = (game.currentPlayerIndex + game.direction + game.players.length) % game.players.length;
  
  // Handle draw effects - check if new current player can stack
  if (game.drawCount > 0) {
    const currentPlayer = game.players[game.currentPlayerIndex];
    const topCard = game.discardPile[0];
    
    // Check if current player can stack draw cards
    const canStack = topCard && (topCard.type === 'draw-two' || topCard.type === 'wild-draw-four') &&
                     currentPlayer.hand.some(card => card.type === 'draw-two' || card.type === 'wild-draw-four');
    
    if (!canStack) {
      // Check if player has shield active
      if (currentPlayer.shieldActive) {
        currentPlayer.shieldActive = false;
      } else {
        // Player must draw all accumulated cards
        drawUnoCards(game, currentPlayer, game.drawCount);
      }
      
      // Reset draw count and skip this player's turn
      game.drawCount = 0;
      
      // Skip the current player's turn by advancing again
      game.currentPlayerIndex = (game.currentPlayerIndex + game.direction + game.players.length) % game.players.length;
    }
  }
}

function applyUnoCardEffect(game, playedCard, playerId, additionalData = {}) {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  const currentPlayer = game.players[playerIndex];
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const opponent = game.players[opponentIndex];

  // Remove card from player's hand
  currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== playedCard.id);

  // Add to discard pile
  game.discardPile.unshift(playedCard);

  // Apply card effects
  switch (playedCard.type) {
    case 'number':
      game.currentColor = playedCard.color;
      advanceUnoTurn(game);
      break;

    case 'skip':
      game.currentColor = playedCard.color;
      game.skipNext = true;
      currentPlayer.lastActionCard = playedCard;
      advanceUnoTurn(game);
      break;

    case 'reverse':
      game.currentColor = playedCard.color;
      // In 2-player, reverse acts as skip
      game.skipNext = true;
      currentPlayer.lastActionCard = playedCard;
      advanceUnoTurn(game);
      break;

    case 'draw-two':
      game.currentColor = playedCard.color;
      game.drawCount += 2;
      currentPlayer.lastActionCard = playedCard;
      advanceUnoTurn(game);
      break;

    case 'wild':
      game.currentColor = additionalData.chosenColor || 'red';
      advanceUnoTurn(game);
      break;

    case 'wild-draw-four':
      game.currentColor = additionalData.chosenColor || 'red';
      game.drawCount += 4;
      currentPlayer.lastActionCard = playedCard;
      advanceUnoTurn(game);
      break;

    case 'unique':
      applyUniqueCardEffect(game, playedCard, playerId, additionalData);
      break;
  }

  // Check for round end
  if (currentPlayer.hand.length === 0) {
    endUnoRound(game, playerId);
  }
}

function applyUniqueCardEffect(game, card, playerId, additionalData) {
  const currentPlayerIndex = game.players.findIndex(p => p.id === playerId);
  const opponentIndex = currentPlayerIndex === 0 ? 1 : 0;
  const currentPlayer = game.players[currentPlayerIndex];
  const opponent = game.players[opponentIndex];

  switch (card.uniqueType) {
    case 'duel':
      handleDuelCard(game, currentPlayer, opponent);
      break;

    case 'mirror':
      const cardsToDraw = currentPlayer.hand.length;
      drawUnoCards(game, opponent, cardsToDraw);
      advanceUnoTurn(game);
      break;

    case 'swap-hands':
      const tempHand = [...currentPlayer.hand];
      currentPlayer.hand = [...opponent.hand];
      opponent.hand = tempHand;
      advanceUnoTurn(game);
      break;

    case 'peek-pick':
      game.specialEffectActive = {
        type: 'peek-pick',
        playerId: playerId,
        timeRemaining: 30,
      };
      startSpecialEffectTimer(game.id);
      break;

    case 'double-down':
      if (additionalData.additionalCardId) {
        const additionalCard = currentPlayer.hand.find(c => c.id === additionalData.additionalCardId);
        if (additionalCard && additionalCard.type === 'number' && card.type === 'number') {
          currentPlayer.hand = currentPlayer.hand.filter(c => c.id !== additionalCard.id);
          game.discardPile.unshift(additionalCard);
          drawUnoCards(game, opponent, 4);
        }
      }
      advanceUnoTurn(game);
      break;

    case 'revenge':
      if (opponent.lastActionCard) {
        applyUnoCardEffect(game, opponent.lastActionCard, opponent.id);
      }
      advanceUnoTurn(game);
      break;

    case 'shield':
      currentPlayer.shieldActive = true;
      advanceUnoTurn(game);
      break;

    case 'time-bomb':
      game.specialEffectActive = {
        type: 'time-bomb',
        playerId: opponent.id,
        timeRemaining: 10,
      };
      startSpecialEffectTimer(game.id);
      break;

    case 'lucky-draw':
      const luckyCards = drawUnoCards(game, currentPlayer, 3);
      // Player can play immediately if they have a valid card
      advanceUnoTurn(game);
      break;

    case 'final-stand':
      if (currentPlayer.hand.length <= 3) {
        drawUnoCards(game, opponent, 5);
        currentPlayer.shieldActive = true;
      }
      advanceUnoTurn(game);
      break;

    default:
      advanceUnoTurn(game);
  }
}

function handleDuelCard(game, player1, player2) {
  const card1 = player1.hand.find(c => c.type === 'number');
  const card2 = player2.hand.find(c => c.type === 'number');

  if (!card1 && !card2) {
    // Both draw 2 cards
    drawUnoCards(game, player1, 2);
    drawUnoCards(game, player2, 2);
  } else if (!card1) {
    // Player 1 draws 3 cards
    drawUnoCards(game, player1, 3);
  } else if (!card2) {
    // Player 2 draws 3 cards
    drawUnoCards(game, player2, 3);
      } else {
    // Compare card values
    if (card1.value > card2.value) {
      drawUnoCards(game, player2, 3);
    } else if (card2.value > card1.value) {
      drawUnoCards(game, player1, 3);
    } else {
      // Tie - both draw 2
      drawUnoCards(game, player1, 2);
      drawUnoCards(game, player2, 2);
    }
  }

  advanceUnoTurn(game);
}

function endUnoRound(game, winnerId) {
  const winner = game.players.find(p => p.id === winnerId);
  const loser = game.players.find(p => p.id !== winnerId);

  // Calculate points
  const points = calculateUnoPoints(loser.hand);
  winner.score += points;

  // Record round history
  game.gameHistory.push({
    roundNumber: game.gameHistory.length + 1,
    winner: winnerId,
    playerScores: game.players.map(p => ({
      playerId: p.id,
      score: p.score,
      cardsRemaining: p.hand.length,
    })),
    cardsPlayed: [], // Could track this if needed
  });

  game.currentPhase = 'round-ended';
  game.roundWinner = winner;

  // Check for game end (first to 500 points)
  if (winner.score >= 500) {
    game.currentPhase = 'game-over';
    game.winner = winner;
  }
}

function calculateUnoPoints(hand) {
  return hand.reduce((total, card) => {
    switch (card.type) {
      case 'number':
        return total + (card.value || 0);
      case 'skip':
      case 'reverse':
      case 'draw-two':
        return total + 20;
      case 'wild':
      case 'wild-draw-four':
        return total + 50;
      case 'unique':
        return total + 30;
      default:
        return total;
    }
  }, 0);
}

function startUnoTurnTimer(gameId) {
  const game = games.get(gameId);
  if (!game || !game.isActive || game.settings.timePerTurn === 0) return;

  game.timeRemaining = game.settings.timePerTurn;

  if (game.turnTimer) {
    clearInterval(game.turnTimer);
  }

  game.turnTimer = setInterval(() => {
    game.timeRemaining--;

    if (game.timeRemaining <= 0) {
      // Time's up - player draws a card and turn advances
      const currentPlayer = game.players[game.currentPlayerIndex];
      drawUnoCards(game, currentPlayer, 1);
      advanceUnoTurn(game);
      
      if (game.isActive) {
        startUnoTurnTimer(gameId);
      }
    }

    // Emit game state update
    io.to(gameId).emit('unoGameState', getUnoGameStateForClient(game));
  }, 1000);
}

function startSpecialEffectTimer(gameId) {
  const game = games.get(gameId);
  if (!game || !game.specialEffectActive.type) return;

  if (game.specialEffectTimer) {
    clearInterval(game.specialEffectTimer);
  }

  game.specialEffectTimer = setInterval(() => {
    game.specialEffectActive.timeRemaining--;

    if (game.specialEffectActive.timeRemaining <= 0) {
      // Handle timeout
      if (game.specialEffectActive.type === 'time-bomb') {
        const targetPlayer = game.players.find(p => p.id === game.specialEffectActive.playerId);
        if (targetPlayer) {
          drawUnoCards(game, targetPlayer, 3);
        }
      }

      // Clear special effect
      game.specialEffectActive = {
        type: null,
        playerId: null,
        timeRemaining: 0,
      };

      clearInterval(game.specialEffectTimer);
      game.specialEffectTimer = null;
    }

    // Emit game state update
    io.to(gameId).emit('unoGameState', getUnoGameStateForClient(game));
  }, 1000);
}

function getUnoGameStateForClient(game) {
  return {
    id: game.id,
    players: game.players.map(player => ({
      id: player.id,
      name: player.name,
      handCount: player.hand.length,
      score: player.score,
      isReady: player.isReady,
      isHost: player.isHost,
      hasCalledUno: player.hasCalledUno,
      shieldActive: player.shieldActive,
    })),
    settings: game.settings,
    currentPhase: game.currentPhase,
    currentPlayerIndex: game.currentPlayerIndex,
    currentColor: game.currentColor,
    topCard: game.discardPile[0],
    drawPileCount: game.drawPile.length,
    drawCount: game.drawCount, // Add draw count for stacking logic
    timeRemaining: game.timeRemaining,
    specialEffectActive: game.specialEffectActive,
    winner: game.winner,
    roundWinner: game.roundWinner,
    isActive: game.isActive,
    isGameStarted: game.isGameStarted,
  };
}

// Socket event handlers
io.on('connection', (socket) => {

  // Blockbuster Game Handlers
  socket.on('create-blockbuster-game', ({ gameId, playerName, settings }) => {
    try {
      // Check if game already exists
      const existingGame = games.get(gameId);
      if (existingGame) {
        // If it's the same player trying to recreate, allow rejoining
        const existingHost = existingGame.players.find(p => p.isHost);
        if (existingHost && existingHost.id === socket.id) {
        socket.join(gameId);
          socket.emit('blockbuster-game-state', getGameStateForClient(existingGame));
        return;
      } else {
          socket.emit('error', `Game ID "${gameId}" already exists. Please choose a different game ID.`);
        return;
        }
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
      const blockbusterGame = createGame(gameId, hostPlayer);
      blockbusterGame.settings = { ...blockbusterGame.settings, ...settings };
      
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
      // Handle error
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
      // Handle error
    }
  });

  socket.on('player-ready', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Toggle ready status
    player.isReady = !player.isReady;

    // Support Blockbuster teams
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
      socket.emit('error', 'Failed to start game');
    }
  });

  socket.on('head-to-head-submission', ({ gameId, playerId, movieTitle }) => {
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

      // Handle special ready signal
      if (movieTitle === 'head-to-head-ready') {
      // Start the countdown
      startHeadToHeadCountdown(gameId);
        return;
      }

      // For regular turns, check if head-to-head is active
      if (!game.headToHead.isActive) {
        socket.emit('error', 'Head-to-head round is not active yet');
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
        movie: movieTitle === 'turn-completed' ? 'turn-completed' : movieTitle,
        timestamp: Date.now()
      };
      
      game.headToHead.submissions.push(submission);
      
      // Add 2 seconds to timer (but don't exceed original time)
      const maxTime = game.settings.headToHeadTime;
      game.headToHead.timeRemaining = Math.min(game.headToHead.timeRemaining + 2, maxTime);

      // Broadcast the updated game state
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
      

    } catch (error) {
      socket.emit('error', 'Failed to complete submission');
    }
  });

  // UNO Game Socket Events
  socket.on('create-uno-game', ({ gameId, playerName, settings }) => {
    try {
      // Check if game already exists
      if (games.has(gameId)) {
        socket.emit('error', 'Game ID already exists');
        return;
      }
      
      // Create new UNO game
      const hostPlayer = {
        id: socket.id,
        name: playerName,
        isHost: true,
        isReady: true, // Auto-ready
      };
      
      const game = createUnoGame(gameId, hostPlayer, settings);
      games.set(gameId, game);
      
      // Join socket room
      socket.join(gameId);
      playerSockets.set(socket.id, { gameId, playerName });
      
      // Emit game state with individual hands
      const gameStateForPlayer = {
        ...getUnoGameStateForClient(game),
        playerHand: hostPlayer.hand || [],
      };
      io.to(socket.id).emit('unoGameState', gameStateForPlayer);
      
    } catch (error) {
      socket.emit('error', 'Failed to create game');
    }
  });

  socket.on('join-uno-game', ({ gameId, playerName }) => {
    try {
      const game = games.get(gameId);
      
      if (!game) {
        socket.emit('error', 'Game not found');
        return;
      }
      
      // Clean up any stale players (players who have disconnected)
      const connectedSockets = io.sockets.adapter.rooms.get(gameId);
      if (connectedSockets) {
        game.players = game.players.filter(p => connectedSockets.has(p.id));
      }
      
      // Join existing game
      if (game.players.length >= 2) {
        socket.emit('error', 'Game is full');
        return;
      }
      
      if (game.isGameStarted) {
        socket.emit('error', 'Game already started');
        return;
      }
      
      // Check if player already exists
      const existingPlayer = game.players.find(p => p.id === socket.id);
      if (!existingPlayer) {
        const newPlayer = {
          id: socket.id,
          name: playerName,
          isHost: false,
          isReady: true, // Auto-ready
          hand: [],
          score: 0,
          hasCalledUno: false,
          shieldActive: false,
          lastActionCard: null,
        };
        
        game.players.push(newPlayer);
      }
      
      // Join socket room
      socket.join(gameId);
      playerSockets.set(socket.id, { gameId, playerName });
      
      // Auto-start game when 2 players join
      if (game.players.length === 2 && !game.isGameStarted) {
        // Initialize game
        dealUnoCards(game);
        game.currentPhase = 'playing';
        game.isGameStarted = true;
        game.isActive = true;
        game.currentPlayerIndex = 0;
        
        // Start turn timer if enabled
        if (game.settings.timePerTurn > 0) {
          startUnoTurnTimer(gameId);
        }
      }
      
      // Emit game state with individual hands
      game.players.forEach(player => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: player.hand,
        };
        io.to(player.id).emit('unoGameState', gameStateForPlayer);
      });
      
    } catch (error) {
      socket.emit('error', 'Failed to join game');
    }
  });

  socket.on('uno-player-ready', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', 'Game not found');
        return;
      }

      const player = game.players.find(p => p.id === socket.id);
      if (!player) {
        socket.emit('error', 'Player not found');
        return;
      }

      // Toggle ready status
      player.isReady = !player.isReady;
      
      // Emit updated game state
      io.to(gameId).emit('unoGameState', getUnoGameStateForClient(game));
      
    } catch (error) {
      socket.emit('error', 'Failed to update ready status');
    }
  });

  socket.on('start-uno-game', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', 'Game not found');
        return;
      }

      const player = game.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) {
        socket.emit('error', 'Only host can start the game');
        return;
      }
      
      if (game.players.length < 2) {
        socket.emit('error', 'Need 2 players to start');
        return;
      }

      if (!game.players.every(p => p.isReady)) {
        socket.emit('error', 'All players must be ready');
        return;
      }
      
      // Initialize game
      dealUnoCards(game);
      game.currentPhase = 'playing';
      game.isGameStarted = true;
      game.isActive = true;
      game.currentPlayerIndex = 0;
      
      // Start turn timer
      startUnoTurnTimer(gameId);
      
      // Emit game state with individual hands
      game.players.forEach(player => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: player.hand,
        };
        io.to(player.id).emit('unoGameState', gameStateForPlayer);
      });
      
    } catch (error) {
      socket.emit('error', 'Failed to start game');
    }
  });

  socket.on('play-uno-card', ({ gameId, cardId, chosenColor, additionalData }) => {
    try {
      const game = games.get(gameId);
      if (!game || !game.isActive) {
        socket.emit('error', 'Game not active');
        return;
      }
      
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex === -1) {
        return;
      }
      
      if (playerIndex !== game.currentPlayerIndex) {
        return;
      }
      
      const player = game.players[playerIndex];
      const card = player.hand.find(c => c.id === cardId);
      if (!card) {
        return;
      }
      
      // Validate card can be played
      const topCard = game.discardPile[0];
      if (!canPlayUnoCard(card, topCard, game.currentColor, game)) {
        return;
      }
      
      // Special validations for unique cards
      if (card.type === 'unique') {
        if (card.uniqueType === 'final-stand' && player.hand.length > 3) {
          return;
        }
        
        if (card.uniqueType === 'revenge' && !game.players.find(p => p.id !== socket.id)?.lastActionCard) {
          return;
        }
      }
      
      // Apply card effect
      applyUnoCardEffect(game, card, socket.id, { chosenColor, ...additionalData });
      
      // Reset UNO call status if player has more than 1 card
      if (player.hand.length > 1) {
        player.hasCalledUno = false;
      }
      
      // Start new turn timer if game is still active
      if (game.isActive && game.currentPhase === 'playing' && game.settings.timePerTurn > 0) {
        startUnoTurnTimer(gameId);
      }
      
      // Emit updated game state with individual hands
      game.players.forEach(gamePlayer => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: gamePlayer.hand || [],
        };
        io.to(gamePlayer.id).emit('unoGameState', gameStateForPlayer);
      });
      
    } catch (error) {
      socket.emit('error', 'Failed to play card');
    }
  });

  socket.on('draw-uno-card', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game || !game.isActive) {
        socket.emit('error', 'Game not active');
        return;
      }
      
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex === -1) {
        return;
      }
      
      if (playerIndex !== game.currentPlayerIndex) {
        return;
      }
      
      const player = game.players[playerIndex];
      
      // Draw cards (including any draw penalties)
      const cardsToDraw = Math.max(1, game.drawCount);
      drawUnoCards(game, player, cardsToDraw);
      game.drawCount = 0;
      
      // Advance turn
      advanceUnoTurn(game);
      
      // Start new turn timer
      if (game.isActive && game.currentPhase === 'playing' && game.settings.timePerTurn > 0) {
        startUnoTurnTimer(gameId);
      }
      
      // Emit updated game state
      game.players.forEach(gamePlayer => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: gamePlayer.hand || [],
        };
        io.to(gamePlayer.id).emit('unoGameState', gameStateForPlayer);
      });
      
    } catch (error) {
      socket.emit('error', 'Failed to draw card');
    }
  });

  socket.on('call-uno', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game || !game.isActive) {
        socket.emit('error', 'Game not active');
        return;
      }

            const player = game.players.find(p => p.id === socket.id);
      if (!player) {
        return;
      }
      
      if (player.hand.length !== 1) {
        return;
      }

      player.hasCalledUno = true;
      
      // Broadcast UNO call
      io.to(gameId).emit('uno-called', { 
        playerId: socket.id, 
        playerName: player.name 
      });
      
      // Emit updated game state
      game.players.forEach(gamePlayer => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: gamePlayer.hand || [],
        };
        io.to(gamePlayer.id).emit('unoGameState', gameStateForPlayer);
      });
      
    } catch (error) {
      socket.emit('error', 'Failed to call UNO');
    }
  });

  socket.on('peek-pick-card', ({ gameId, targetCardId }) => {
    try {
      const game = games.get(gameId);
      if (!game || game.specialEffectActive.type !== 'peek-pick') {
        socket.emit('error', 'Peek-pick not active');
        return;
      }

      if (game.specialEffectActive.playerId !== socket.id) {
        socket.emit('error', 'Not your peek-pick turn');
        return;
      }
      
      const targetPlayer = game.players.find(p => p.id !== socket.id);
      const cardToRemove = targetPlayer.hand.find(c => c.id === targetCardId);
      
      if (cardToRemove) {
        // Remove card from opponent's hand
        targetPlayer.hand = targetPlayer.hand.filter(c => c.id !== targetCardId);
        
        // Add to discard pile
        game.discardPile.unshift(cardToRemove);
        game.currentColor = cardToRemove.color || game.currentColor;
      }
      
      // Clear special effect
      game.specialEffectActive = {
        type: null,
        playerId: null,
        timeRemaining: 0,
      };
      
      if (game.specialEffectTimer) {
        clearInterval(game.specialEffectTimer);
        game.specialEffectTimer = null;
      }
      
      // Advance turn
      advanceUnoTurn(game);
      
      // Start turn timer
      if (game.isActive && game.currentPhase === 'playing' && game.settings.timePerTurn > 0) {
        startUnoTurnTimer(gameId);
      }
      
      // Emit updated game state
      game.players.forEach(gamePlayer => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: gamePlayer.hand || [],
        };
        io.to(gamePlayer.id).emit('unoGameState', gameStateForPlayer);
      });

    } catch (error) {
      socket.emit('error', 'Failed to handle peek-pick');
    }
  });

  socket.on('next-uno-round', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game || game.currentPhase !== 'round-ended') {
        socket.emit('error', 'Cannot start next round');
        return;
      }
      
      const player = game.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) {
        socket.emit('error', 'Only host can start next round');
        return;
      }
      
      // Reset for next round
      const deck = generateUnoDeck(game.settings.includeUniqueCards);
      game.drawPile = deck.slice(14);
      game.discardPile = [deck[13]];
      game.currentColor = deck[13].color;
      game.currentPhase = 'playing';
      game.currentPlayerIndex = 0;
      game.skipNext = false;
      game.drawCount = 0;
      game.isActive = true;
      game.roundWinner = null;
      
      // Reset player states
      game.players.forEach(p => {
        p.hasCalledUno = false;
        p.shieldActive = false;
        p.lastActionCard = null;
      });
      
      // Deal new cards
      dealUnoCards(game);
      
      // Start turn timer
      if (game.settings.timePerTurn > 0) {
        startUnoTurnTimer(gameId);
      }
      
      // Emit game state
      game.players.forEach(gamePlayer => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: gamePlayer.hand || [],
        };
        io.to(gamePlayer.id).emit('unoGameState', gameStateForPlayer);
      });
      
    } catch (error) {
      socket.emit('error', 'Failed to start next round');
    }
  });

  socket.on('block-uno', ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game || !game.isActive) {
        socket.emit('error', 'Game not active');
        return;
      }

      const blockingPlayer = game.players.find(p => p.id === socket.id);
      if (!blockingPlayer) {
        return;
      }
      
      // Find the opponent who might have called UNO
      const opponent = game.players.find(p => p.id !== socket.id);
      if (!opponent) {
        return;
      }
      
      // Check if opponent has exactly 1 card and hasn't called UNO
      if (opponent.hand.length === 1 && !opponent.hasCalledUno) {
        // Block successful - opponent draws 2 cards as penalty
        drawUnoCards(game, opponent, 2);
        
        // Broadcast block event
        io.to(gameId).emit('uno-blocked', { 
          blockingPlayerId: socket.id, 
          blockingPlayerName: blockingPlayer.name,
          blockedPlayerId: opponent.id,
          blockedPlayerName: opponent.name
        });
        

      } else {
        // Block failed - blocking player draws 2 cards as penalty
        drawUnoCards(game, blockingPlayer, 2);
        
        // Broadcast failed block event
        io.to(gameId).emit('uno-block-failed', { 
          blockingPlayerId: socket.id, 
          blockingPlayerName: blockingPlayer.name
        });
        

      }
      
      // Emit updated game state
      game.players.forEach(gamePlayer => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: gamePlayer.hand || [],
        };
        io.to(gamePlayer.id).emit('unoGameState', gameStateForPlayer);
      });
      
    } catch (error) {
      socket.emit('error', 'Failed to block UNO');
    }
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
  
  // Reset game state if it's a UNO game
  if (game.settings && game.settings.gameType === 'uno') {
    game.isGameStarted = false;
    game.isActive = false;
    game.currentPhase = 'lobby';
    if (game.turnTimer) {
      clearInterval(game.turnTimer);
      game.turnTimer = null;
    }
    if (game.specialEffectTimer) {
      clearInterval(game.specialEffectTimer);
      game.specialEffectTimer = null;
    }
  }
  
  if (game.players.length === 0) {
    // Delete empty game - clean up all timers
    if (game.roundTimer) {
      clearInterval(game.roundTimer);
    }
    if (game.headToHeadTimer) {
      clearInterval(game.headToHeadTimer);
    }
    if (game.countdownTimer) {
      clearInterval(game.countdownTimer);
    }
    // UNO timers already cleaned up above
    games.delete(gameId);
  } else {
    // Update host if needed
    if (player.isHost && game.players.length > 0) {
      game.players[0].isHost = true;
    }
    
    // Emit appropriate events based on game type
    io.to(gameId).emit('player-left', socketId);
    
    if (game.settings && game.settings.gameType === 'uno') {
      // For UNO games, emit UNO-specific state
      game.players.forEach(gamePlayer => {
        const gameStateForPlayer = {
          ...getUnoGameStateForClient(game),
          playerHand: gamePlayer.hand || [],
        };
        io.to(gamePlayer.id).emit('unoGameState', gameStateForPlayer);
      });
    } else if (Array.isArray(game.teams)) {
      // For Blockbuster games
      io.to(gameId).emit('blockbuster-game-state', getGameStateForClient(game));
    } else {
      // For other games
      io.to(gameId).emit('game-state', getGameStateForClient(game));
    }
  }
}

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    // Listen on all interfaces (0.0.0.0) for cloud deployment
    server.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 