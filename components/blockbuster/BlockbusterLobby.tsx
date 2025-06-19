'use client';

import { useState } from 'react';
import { BlockbusterGameState, Player, Team } from '@/lib/shared/types';

interface BlockbusterLobbyProps {
  gameState: BlockbusterGameState;
  currentPlayer: Player;
  onCreateTeam: (teamName: string) => void;
  onJoinTeam: (teamId: string) => void;
  onStartGame: () => void;
  onPlayerReady: () => void;
}

export default function BlockbusterLobby({
  gameState,
  currentPlayer,
  onCreateTeam,
  onJoinTeam,
  onStartGame,
  onPlayerReady,
}: BlockbusterLobbyProps) {
  const [teamName, setTeamName] = useState('');
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const currentTeam = gameState.teams.find(team => 
    team.players.some(p => p.id === currentPlayer.id)
  );

  const canStartGame = gameState.teams.length >= 2 && 
    gameState.teams.every(team => team.players.length > 0) &&
    gameState.teams.flatMap(team => team.players).every(p => p.isReady);

  const handleCreateTeam = () => {
    if (teamName.trim()) {
      onCreateTeam(teamName.trim());
      setTeamName('');
      setShowCreateTeam(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Teams Section */}
        <div className="game-card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Teams ({gameState.teams.length}/2)
          </h2>
          
          <div className="space-y-4">
            {gameState.teams.map((team) => (
              <div
                key={team.id}
                className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {team.name}
                  </h3>
                  {!currentTeam && (
                    <button
                      onClick={() => onJoinTeam(team.id)}
                      className="btn-secondary text-sm"
                      disabled={team.players.length >= gameState.settings.maxPlayersPerTeam}
                    >
                      Join Team
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        player.id === currentPlayer.id
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <span className="text-gray-800 dark:text-white font-medium">
                        {player.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        {player.isHost && (
                          <span className="text-xs bg-game-primary text-white px-2 py-1 rounded">
                            HOST
                          </span>
                        )}
                        <span className={`text-sm ${
                          player.isReady ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {player.isReady ? '✅ Ready' : '⏳ Not Ready'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {team.players.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No players yet</p>
                  )}
                </div>
              </div>
            ))}
            
            {gameState.teams.length < 2 && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <p className="text-gray-500 mb-2">Need more teams</p>
                {!currentTeam ? (
                  <div>
                    {!showCreateTeam ? (
                      <button
                        onClick={() => setShowCreateTeam(true)}
                        className="btn-primary"
                      >
                        Create Team
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="Team name"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          maxLength={20}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCreateTeam}
                            disabled={!teamName.trim()}
                            className="btn-primary flex-1"
                          >
                            Create
                          </button>
                          <button
                            onClick={() => {
                              setShowCreateTeam(false);
                              setTeamName('');
                            }}
                            className="btn-secondary flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Waiting for another team...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Game Info Section */}
        <div className="game-card">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Game Settings
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Rounds:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {gameState.settings.rounds}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Head-to-Head Time:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {gameState.settings.headToHeadTime}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Movie Round Time:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {gameState.settings.movieRoundTime}s
              </span>
            </div>
          </div>

          {/* Ready Button */}
          {currentTeam && !currentPlayer.isHost && (
            <div className="mb-4">
              <button
                onClick={onPlayerReady}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  currentPlayer.isReady
                    ? 'bg-green-600 text-white'
                    : 'btn-secondary'
                }`}
              >
                {currentPlayer.isReady ? '✅ Ready!' : 'Mark as Ready'}
              </button>
            </div>
          )}

          {/* Start Game Button */}
          {currentPlayer.isHost && (
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
                ? gameState.teams.length < 2
                  ? 'Need at least 2 teams'
                  : 'Waiting for all players to be ready'
                : 'Start Blockbuster Game!'}
            </button>
          )}
        </div>
      </div>

      {/* How to Play */}
      <div className="game-card">
        <details>
          <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white mb-2">
            📖 How to Play Blockbuster
          </summary>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mt-4">
            <div>
              <strong>1. Head-to-Head Round:</strong>
              <p>One player from each team competes in a movie naming challenge based on a random category. Players take turns naming movies that fit the category within 45 seconds. Each valid movie adds 2 seconds to the timer. Last player to name a valid movie wins!</p>
            </div>
            <div>
              <strong>2. Movie Card Selection:</strong>
              <p>Winner gets 6 movie cards, selects 3 to keep, and gives the remaining 3 to the losing player.</p>
            </div>
            <div>
              <strong>3. Movie Round Setup:</strong>
              <p>Each player arranges their 3 movies into three fields: "One Word" (give one-word clues), "Quote It/Dialogue" (recite movie dialogues), and "Act It Out" (act without speaking).</p>
            </div>
            <div>
              <strong>4. Guessing Rounds:</strong>
              <p>Players take turns with 60 seconds each. Start with "One Word", then "Quote It/Dialogue", then "Act It Out". If time remains, attempt opponent's movies!</p>
            </div>
            <div>
              <strong>5. Scoring:</strong>
              <p>Teams earn points based on unique movie genres guessed. The team with the most diverse collection of genres wins!</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
} 