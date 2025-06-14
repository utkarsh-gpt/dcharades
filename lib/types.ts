export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
}

export interface GameSettings {
  rounds: number;
  timeLimit: number; // in seconds, 0 for unlimited
  movieCategories: ('hollywood' | 'bollywood')[];
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
  type: 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'SETTINGS_UPDATED' | 'GAME_STARTED' | 'ROUND_STARTED' | 'ROUND_ENDED' | 'GAME_ENDED' | 'TIMER_UPDATE' | 'MOVIE_GUESSED' | 'PLAYER_READY';
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