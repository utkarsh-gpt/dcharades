'use client';

import { useState } from 'react';
import { FilmiRishtaGameState, FilmiRishtaPlayer, FilmiRishtaGameSettings } from '@/lib/filmi-rishta/types';

interface FilmiRishtaLobbyProps {
  gameState: FilmiRishtaGameState;
  currentPlayer: FilmiRishtaPlayer;
  onStartGame: () => void;
  onPlayerReady: () => void;
  onUpdateSettings: (settings: Partial<FilmiRishtaGameSettings>) => void;
  onLeaveGame: () => void;
}

export default function FilmiRishtaLobby({
  gameState,
  currentPlayer,
  onStartGame,
  onPlayerReady,
  onUpdateSettings,
  onLeaveGame,
}: FilmiRishtaLobbyProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<Partial<FilmiRishtaGameSettings>>(gameState.settings);

  const isHost = gameState.players.find(p => p.id === currentPlayer.id)?.id === gameState.players[0]?.id;
  const allPlayersReady = gameState.players.every(p => p.isReady);
  const canStartGame = allPlayersReady && gameState.players.length >= 1;

  const handleSettingsChange = (key: keyof FilmiRishtaGameSettings, value: any) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    onUpdateSettings(tempSettings);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'Unlimited';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Players Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Players</h3>
            <div className="space-y-3">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.isReady 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      player.isReady ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-white font-medium">{player.name}</span>
                    {player.id === currentPlayer.id && (
                      <span className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    Score: {player.score}
                  </div>
                </div>
              ))}
            </div>

            {/* Ready Button */}
            <div className="mt-6">
              <button
                onClick={onPlayerReady}
                disabled={currentPlayer.isReady}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  currentPlayer.isReady
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {currentPlayer.isReady ? '✓ Ready' : 'Ready Up'}
              </button>
            </div>
          </div>

          {/* Game Settings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Game Settings</h3>
              {isHost && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showSettings ? 'Hide' : 'Edit'}
                </button>
              )}
            </div>

            {showSettings && isHost ? (
              <div className="space-y-4">
                {/* Game Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Game Mode
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSettingsChange('gameMode', 'solo')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                        tempSettings.gameMode === 'solo'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      Solo
                    </button>
                    <button
                      onClick={() => handleSettingsChange('gameMode', 'versus')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                        tempSettings.gameMode === 'versus'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      Versus
                    </button>
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Limit: {formatTime(tempSettings.timeLimit || 0)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="60"
                    value={tempSettings.timeLimit || 0}
                    onChange={(e) => handleSettingsChange('timeLimit', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>No Limit</span>
                    <span>10 min</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={tempSettings.difficulty || 'medium'}
                    onChange={(e) => handleSettingsChange('difficulty', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Max Hints */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Hints: {tempSettings.maxHints || 3}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={tempSettings.maxHints || 3}
                    onChange={(e) => handleSettingsChange('maxHints', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Save Settings */}
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Save Settings
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Mode:</span>
                  <span className="text-white capitalize">{gameState.settings.gameMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Time Limit:</span>
                  <span className="text-white">{formatTime(gameState.settings.timeLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Difficulty:</span>
                  <span className="text-white capitalize">{gameState.settings.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Max Hints:</span>
                  <span className="text-white">{gameState.settings.maxHints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Points per Connection:</span>
                  <span className="text-white">{gameState.settings.pointsPerConnection}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-4">
          {isHost && (
            <button
              onClick={onStartGame}
              disabled={!canStartGame}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                canStartGame
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {canStartGame ? 'Start Game' : 'Waiting for Players...'}
            </button>
          )}
          <button
            onClick={onLeaveGame}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>

      {/* Game Instructions */}
      <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">How to Play</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="mb-2">
              <strong className="text-white">🎯 Goal:</strong> Connect the starting celebrity to the target celebrity through movies and collaborations.
            </p>
            <p className="mb-2">
              <strong className="text-white">🔗 Connections:</strong> Celebrity → Movie → Celebrity → Movie...
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong className="text-white">🏆 Scoring:</strong> Earn points for each connection, get bonuses for efficiency and speed.
            </p>
            <p className="mb-2">
              <strong className="text-white">💡 Hints:</strong> Use hints if you're stuck, but they cost points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 