// Types for Filmi Rishta Game

export interface Celebrity {
  id: string;
  name: string;
  popularName?: string; // Alternative name they're known by
  photo?: string; // URL to celebrity photo
  birthYear?: number;
  isActive?: boolean; // Still active in industry
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  poster?: string; // URL to movie poster
  genre: string[];
  language: string; // 'hindi', 'english', 'tamil', etc.
  director?: string;
  productionHouse?: string;
  cast: string[]; // Array of celebrity IDs
}

export interface Connection {
  from: Celebrity;
  to: Celebrity;
  via: Movie; // The movie that connects them
  type: 'co-starred' | 'director-actor' | 'production';
}

export interface GamePath {
  connections: Connection[];
  totalSteps: number;
  startCelebrity: Celebrity;
  endCelebrity: Celebrity;
  currentCelebrity: Celebrity;
  isComplete: boolean;
}

export interface FilmiRishtaPlayer {
  id: string;
  name: string;
  score: number;
  currentPath: GamePath | null;
  isReady: boolean;
  timeRemaining: number;
  hintsUsed: number;
  isActive: boolean; // If it's their turn
}

export interface GameChallenge {
  id: string;
  startCelebrity: Celebrity;
  endCelebrity: Celebrity;
  difficulty: 'easy' | 'medium' | 'hard';
  minimumSteps: number; // Shortest known path
  category?: string; // 'same-era', 'cross-genre', 'family-connections', etc.
}

export interface FilmiRishtaGameSettings {
  gameMode: 'solo' | 'versus';
  timeLimit: number; // in seconds, 0 for unlimited
  maxHints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  enableSkip: boolean;
  pointsPerConnection: number;
  hintPenalty: number;
  timeBonusMultiplier: number;
}

export interface FilmiRishtaGameState {
  id: string;
  players: FilmiRishtaPlayer[];
  settings: FilmiRishtaGameSettings;
  currentPhase: 'lobby' | 'playing' | 'awaiting-celebrity' | 'hint' | 'completed' | 'game-over';
  currentChallenge: GameChallenge | null;
  currentPlayerId: string | null;
  currentSelectedMovie?: Movie | null; // Movie selected in current step, waiting for celebrity
  timeRemaining: number;
  isActive: boolean;
  isGameStarted: boolean;
  winner: FilmiRishtaPlayer | null;
  leaderboard: {
    playerId: string;
    playerName: string;
    totalScore: number;
    challengesCompleted: number;
    averageSteps: number;
  }[];
  gameHistory: {
    challengeId: string;
    playerId: string;
    path: GamePath;
    score: number;
    completedAt: Date;
  }[];
}

export interface HintData {
  type: 'movie-genre' | 'movie-year' | 'common-costar' | 'direct-connection';
  hint: string;
  cost: number; // Points deducted
}



// Default settings for the game
export const DEFAULT_FILMI_RISHTA_SETTINGS: FilmiRishtaGameSettings = {
  gameMode: 'solo',
  timeLimit: 300, // 5 minutes
  maxHints: 3,
  difficulty: 'medium',
  enableSkip: false,
  pointsPerConnection: 10,
  hintPenalty: 5,
  timeBonusMultiplier: 1.5,
}; 