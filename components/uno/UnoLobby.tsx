'use client';

import { useState } from 'react';
import { UnoGameState, UnoPlayer } from '@/lib/uno/types';

interface UnoLobbyProps {
  gameState: UnoGameState;
  currentPlayer: UnoPlayer | null;
  onStartGame: () => void;
  onPlayerReady: () => void;
  gameId: string;
}

export default function UnoLobby({ 
  gameState, 
  currentPlayer, 
  onStartGame, 
  onPlayerReady, 
  gameId 
}: UnoLobbyProps) {
  const [showGameId, setShowGameId] = useState(false);

  const isHost = currentPlayer?.id === gameState.players[0]?.id;
  const canStartGame = gameState.players.length === 2 && gameState.players.every(p => p.isReady);

  const handleCopyGameId = () => {
    navigator.clipboard.writeText(gameId);
    setShowGameId(true);
    setTimeout(() => setShowGameId(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Players Section */}
        <div className="game-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Players ({gameState.players.length}/2)
            </h2>
            <button
              onClick={handleCopyGameId}
              className="text-sm font-mono bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
            >
              {showGameId ? 'Copied!' : `ID: ${gameId.slice(0, 8)}`}
            </button>
          </div>
          
          <div className="space-y-3">
            {gameState.players.map((player, index) => (
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
                  {index === 0 && (
                    <span className="text-xs bg-game-primary text-white px-2 py-1 rounded">
                      HOST
                    </span>
                  )}
                  {player.id === currentPlayer?.id && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      YOU
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
                  <div className="text-gray-400 mb-2">🃏</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Waiting for another player...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Share the game ID above to invite someone!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ready Button */}
          <div className="mt-6">
            <button
              onClick={onPlayerReady}
              disabled={currentPlayer?.isReady}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                currentPlayer?.isReady
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'btn-secondary'
              }`}
            >
              {currentPlayer?.isReady ? '✅ Ready!' : 'Ready to Play'}
            </button>
          </div>
        </div>

        {/* Game Settings Section */}
        <div className="game-card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Game Settings
          </h2>
          
          <div className="space-y-4">

            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Time per Turn:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {gameState.settings.timePerTurn === 0 ? 'No limit' : `${gameState.settings.timePerTurn}s`}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Unique Cards:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {gameState.settings.includeUniqueCards ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Chat:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {gameState.settings.enableChat ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Start Game Button */}
          {isHost && (
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

      {/* Game Rules */}
      <div className="game-card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          🃏 UNO Rules & Unique Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Basic Rules:</h4>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Match cards by color, number, or symbol</li>
              <li>• First to empty hand wins the round</li>
              <li>• Call "UNO" when you have one card left</li>
              <li>• Score points based on opponent's remaining cards</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Unique 2-Player Cards:</h4>
            <ul className="text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <strong>Duel:</strong> Both reveal next card, higher wins</li>
              <li>• <strong>Mirror:</strong> Opponent draws cards equal to your hand</li>
              <li>• <strong>Swap Hands:</strong> Exchange hands with opponent</li>
              <li>• <strong>Shield:</strong> Block and reflect next action card</li>
              <li>• <strong>Time Bomb:</strong> Opponent has 10 seconds to play</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 