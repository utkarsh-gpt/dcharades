export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  teamId?: string; // For team-based games
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  genresGuessed: string[]; // Unique genres for final scoring
}

export interface GameSettings {
  rounds: number;
  timeLimit: number; // in seconds, 0 for unlimited
  movieCategories: ('hollywood' | 'bollywood')[];
  gameType: 'charades' | 'blockbuster'; // New field for game type
}

export interface BlockbusterGameSettings extends GameSettings {
  gameType: 'blockbuster';
  maxPlayersPerTeam: number;
  headToHeadTime: number; // 45 seconds for head-to-head
  movieRoundTime: number; // 60 seconds for movie rounds
}

// Head-to-Head Card Interface
export interface HeadToHeadCard {
  id: string;
  category: string;
  description: string;
  examples: string[];
}

// Movie Card Interface
export interface MovieCard {
  id: string;
  title: string;
  genre: string;
  category: 'hollywood' | 'bollywood';
  difficulty: 'easy' | 'medium' | 'hard';
}

// Movie Assignment Interface
export interface MovieAssignment {
  oneWord: MovieCard;
  dialogue: MovieCard;
  actOut: MovieCard;
}

// Round State for Movie Round
export interface RoundState {
  currentPlayerIndex: number;
  playersOrder: string[];
  revealedMovies: { movieId: string; playerId: string; category: string; timestamp: number }[];
  guessedMovies: { movieId: string; playerId: string; category: string; timestamp: number }[];
  isFirstMovieRevealed: boolean;
  currentPlayerScore: number;
  movieRoundTimer: any;
}

// Head-to-Head State
export interface HeadToHeadState {
  isActive: boolean;
  card: HeadToHeadCard | null;
  currentPlayers: { teamA: Player | null; teamB: Player | null };
  timeRemaining: number;
  submissions: { playerId: string; movie: string; timestamp: number }[];
  winner: string | null; // Player ID who won
  isReady: boolean;
  countdownActive: boolean;
  countdownTime: number;
}

// Blockbuster Game State
export interface BlockbusterGameState {
  id: string;
  teams: Team[];
  settings: BlockbusterGameSettings;
  currentPhase: 'lobby' | 'head-to-head' | 'movie-selection' | 'movie-round' | 'game-over';
  headToHead: HeadToHeadState;
  movieCards: MovieCard[];
  currentPlayerAssignments: { [playerId: string]: MovieAssignment };
  currentRoundPlayer: string | null;
  currentField: 'oneWord' | 'dialogue' | 'actOut' | null;
  timeRemaining: number;
  isActive: boolean;
  isGameStarted: boolean;
  winner: Team | null;
  roundState?: RoundState;
  roundHistory: {
    round: number;
    headToHeadWinner: string;
    playerTurns: {
      playerId: string;
      moviesGuessed: string[];
      timeUsed: number;
    }[];
  }[];
}

export interface GameState {
  id: string;
  players: Player[];
  settings: GameSettings;
  currentRound: number;
  currentActorId: string | null;
  currentGuesser: string | null;
  currentMovie: string | null;
  timeRemaining: number;
  isActive: boolean;
  isGameStarted: boolean;
  isRoundActive: boolean;
  winner: string | null;
}

export interface GameEvent {
  type: 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'SETTINGS_UPDATED' | 'GAME_STARTED' | 'ROUND_STARTED' | 'ROUND_ENDED' | 'GAME_ENDED' | 'TIMER_UPDATE' | 'MOVIE_GUESSED' | 'PLAYER_READY' | 
        'TEAM_CREATED' | 'TEAM_JOINED' | 'HEAD_TO_HEAD_STARTED' | 'HEAD_TO_HEAD_SUBMISSION' | 'HEAD_TO_HEAD_ENDED' | 'MOVIE_SELECTION_STARTED' | 'MOVIES_SELECTED' | 'MOVIE_ROUND_STARTED' | 'MOVIE_ROUND_ENDED';
  payload: any;
  timestamp: number;
}

export interface CreateGameRequest {
  playerName: string;
  settings: GameSettings;
}

export interface JoinGameRequest {
  gameId: string;
  playerName: string;
  teamId?: string; // For team-based games
}

export interface CreateTeamRequest {
  gameId: string;
  teamName: string;
  playerId: string;
}

export interface JoinTeamRequest {
  gameId: string;
  teamId: string;
  playerId: string;
}

export interface HeadToHeadSubmissionRequest {
  gameId: string;
  playerId: string;
  movieTitle: string;
}

export interface MovieSelectionRequest {
  gameId: string;
  playerId: string;
  selectedMovies: {
    oneWord: string;
    dialogue: string;
    actOut: string;
  };
}

export interface TimerState {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  rounds: 5,
  timeLimit: 300, // 5 minutes
  movieCategories: ['hollywood', 'bollywood'],
  gameType: 'charades',
};

export const DEFAULT_BLOCKBUSTER_SETTINGS: BlockbusterGameSettings = {
  rounds: 3, // Number of head-to-head rounds
  timeLimit: 0, // No overall time limit
  movieCategories: ['bollywood'], // Focus on Bollywood
  gameType: 'blockbuster',
  maxPlayersPerTeam: 6,
  headToHeadTime: 45, // 45 seconds for head-to-head
  movieRoundTime: 60, // 60 seconds for movie rounds
};

export const TIME_LIMIT_OPTIONS = [
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 },
  { label: '10 minutes', value: 600 },
  { label: 'Unlimited', value: 0 },
];

export const ROUND_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1} round${i > 0 ? 's' : ''}`,
  value: i + 1,
})); 