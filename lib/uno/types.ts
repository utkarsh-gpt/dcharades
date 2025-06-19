// Uno Card Types
export type UnoColor = 'red' | 'blue' | 'green' | 'yellow';
export type UnoCardType = 'number' | 'skip' | 'reverse' | 'draw-two' | 'wild' | 'wild-draw-four' | 'unique';

// Unique card types for 2-player gameplay
export type UniqueCardType = 
  | 'duel' 
  | 'mirror' 
  | 'swap-hands' 
  | 'peek-pick' 
  | 'double-down' 
  | 'revenge' 
  | 'shield' 
  | 'time-bomb' 
  | 'lucky-draw' 
  | 'final-stand';

export interface UnoCard {
  id: string;
  type: UnoCardType;
  color: UnoColor | null; // null for wild cards
  value: number | null; // 0-9 for number cards, null for action cards
  uniqueType?: UniqueCardType; // Only for unique cards
}

export interface UnoPlayer {
  id: string;
  name: string;
  hand: UnoCard[];
  score: number;
  isReady: boolean;
  isHost: boolean;
  hasCalledUno: boolean;
  shieldActive: boolean; // For shield card protection
  lastActionCard?: UnoCard; // For revenge card tracking
}

export interface UnoGameSettings {
  gameType: 'uno';
  timePerTurn: number; // Time limit per turn in seconds
  includeUniqueCards: boolean;
  enableChat: boolean;
}

export interface UnoGameState {
  id: string;
  players: UnoPlayer[];
  settings: UnoGameSettings;
  currentPhase: 'lobby' | 'playing' | 'round-ended' | 'game-over';
  currentPlayerIndex: number;
  direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
  drawPile: UnoCard[];
  discardPile: UnoCard[];
  currentColor: UnoColor | null; // Current valid color (important for wild cards)
  skipNext: boolean; // If next player should be skipped
  drawCount: number; // Accumulated draw cards (for stacking draw-two and draw-four)
  isActive: boolean;
  isGameStarted: boolean;
  winner: UnoPlayer | null;
  roundWinner: UnoPlayer | null;
  timeRemaining: number;
  specialEffectActive: {
    type: UniqueCardType | null;
    playerId: string | null;
    timeRemaining: number;
  };
  gameHistory: UnoGameRound[];
}

export interface UnoGameRound {
  roundNumber: number;
  winner: string; // Player ID
  playerScores: { playerId: string; score: number; cardsRemaining: number }[];
  cardsPlayed: { playerId: string; card: UnoCard; timestamp: number }[];
}

export interface UnoGameEvent {
  type: 
    | 'PLAYER_JOINED'
    | 'PLAYER_LEFT'
    | 'GAME_STARTED'
    | 'CARD_PLAYED'
    | 'CARD_DRAWN'
    | 'COLOR_CHOSEN'
    | 'UNO_CALLED'
    | 'UNO_PENALTY'
    | 'ROUND_ENDED'
    | 'GAME_ENDED'
    | 'TIMER_UPDATE'
    | 'SPECIAL_EFFECT_ACTIVATED'
    | 'PLAYER_READY'
    | 'CHAT_MESSAGE';
  payload: any;
  timestamp: number;
  playerId?: string;
}

// Action interfaces for client-server communication
export interface PlayCardRequest {
  gameId: string;
  playerId: string;
  cardId: string;
  chosenColor?: UnoColor; // For wild cards
  targetPlayerId?: string; // For peek-pick card
  additionalCards?: string[]; // For double-down card
}

export interface DrawCardRequest {
  gameId: string;
  playerId: string;
}

export interface CallUnoRequest {
  gameId: string;
  playerId: string;
}

export interface ChatMessageRequest {
  gameId: string;
  playerId: string;
  message: string;
}

export interface CreateUnoGameRequest {
  playerName: string;
  settings: UnoGameSettings;
}

export interface JoinUnoGameRequest {
  gameId: string;
  playerName: string;
}

// Default settings
export const DEFAULT_UNO_SETTINGS: UnoGameSettings = {
  gameType: 'uno',
  timePerTurn: 30, // 30 seconds per turn
  includeUniqueCards: true,
  enableChat: true,
};

// Card scoring values
export const UNO_CARD_SCORES: Record<UnoCardType, number> = {
  'number': 0, // Face value (0-9)
  'skip': 20,
  'reverse': 20,
  'draw-two': 20,
  'wild': 50,
  'wild-draw-four': 50,
  'unique': 30, // Unique cards worth 30 points
}; 