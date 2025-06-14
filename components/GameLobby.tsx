'use client';

import { GameState, Player } from '@/lib/types';

interface GameLobbyProps {
  gameState: GameState;
  currentPlayer: Player;
  onStartGame: () => void;
  onPlayerReady: () => void;
  onShowSettings: () => void;
}

export default function GameLobby({
  gameState,
  currentPlayer,
  onStartGame,
  onPlayerReady,
  onShowSettings,
}: GameLobbyProps) {
  const otherPlayer = gameState.players.find(p => p.id !== currentPlayer.id);
  const canStartGame = gameState.players.length === 2 && gameState.players.every(p => p.isReady);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Players Section */}
      <div className="game-card">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Players ({gameState.players.length}/2)
        </h2>
        
        <div className="space-y-3">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                player.isReady
                  ? 'border-game-secondary bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    player.isReady ? 'bg-game-secondary' : 'bg-gray-400'
                  }`}
                />
                <span className="font-medium text-gray-800 dark:text-white">
                  {player.name}
                </span>
                {player.isHost && (
                  <span className="text-xs bg-game-primary text-white px-2 py-1 rounded">
                    HOST
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {player.isReady ? '✅ Ready' : '⏳ Not Ready'}
              </span>
            </div>
          ))}
          
          {gameState.players.length < 2 && (
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <div className="text-gray-400 mb-2">👤</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Waiting for another player...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Share the game ID: <span className="font-mono font-bold">{gameState.id}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ready Button */}
        <div className="mt-6">
          <button
            onClick={onPlayerReady}
            disabled={currentPlayer.isReady}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              currentPlayer.isReady
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'btn-secondary'
            }`}
          >
            {currentPlayer.isReady ? '✅ Ready!' : 'Ready to Play'}
          </button>
        </div>
      </div>

      {/* Game Settings Section */}
      <div className="game-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Game Settings
          </h2>
          {currentPlayer.isHost && (
            <button
              onClick={onShowSettings}
              className="text-sm text-game-primary hover:text-indigo-600 font-medium"
              disabled={gameState.isGameStarted}
            >
              Edit Settings
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Rounds:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {gameState.settings.rounds}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Time Limit:</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {gameState.settings.timeLimit === 0
                ? 'Unlimited'
                : `${Math.floor(gameState.settings.timeLimit / 60)} minutes`}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Categories:</span>
            <span className="font-medium text-gray-800 dark:text-white capitalize">
              {gameState.settings.movieCategories.join(', ')}
            </span>
          </div>
        </div>

        {/* Start Game Button */}
        {currentPlayer.isHost && (
          <div className="mt-6">
            <button
              onClick={onStartGame}
              disabled={!canStartGame}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                canStartGame
                  ? 'btn-primary'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              {!canStartGame
                ? gameState.players.length < 2
                  ? 'Waiting for Players'
                  : 'Waiting for All Players to be Ready'
                : 'Start Game!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 