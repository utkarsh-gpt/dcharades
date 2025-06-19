'use client';

import { BlockbusterGameState, Player } from '@/lib/shared/types';

interface BlockbusterGamePlayProps {
  gameState: BlockbusterGameState;
  currentPlayer: Player;
  onMovieGuessed: (movieId: string) => void;
  onSkipMovie: () => void;
}

export default function BlockbusterGamePlay({
  gameState,
  currentPlayer,
  onMovieGuessed,
  onSkipMovie,
}: BlockbusterGamePlayProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="game-card text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🎮 Movie Round
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Movie guessing round implementation coming soon!
        </p>
        <div className="text-lg text-gray-800 dark:text-white">
          Current Phase: {gameState.currentPhase}
        </div>
      </div>
    </div>
  );
} 