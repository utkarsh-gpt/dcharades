'use client';

import { FilmiRishtaGameState, FilmiRishtaPlayer } from '@/lib/filmi-rishta/types';

interface FilmiRishtaResultsProps {
  gameState: FilmiRishtaGameState;
  currentPlayer: FilmiRishtaPlayer;
  onNewChallenge: () => void;
  onLeaveGame: () => void;
}

export default function FilmiRishtaResults({
  gameState,
  currentPlayer,
  onNewChallenge,
  onLeaveGame,
}: FilmiRishtaResultsProps) {
  const challenge = gameState.currentChallenge;
  const path = currentPlayer.currentPath;
  const isGameOver = gameState.currentPhase === 'game-over';
  const isHost = gameState.players.find(p => p.id === currentPlayer.id)?.id === gameState.players[0]?.id;

  const getScoreBreakdown = () => {
    if (!path || !challenge) return null;

    const baseScore = path.totalSteps * gameState.settings.pointsPerConnection;
    const efficiencyBonus = Math.max(0, challenge.minimumSteps - path.totalSteps) * 5;
    const hintPenalty = currentPlayer.hintsUsed * gameState.settings.hintPenalty;
    const timeBonus = Math.floor(currentPlayer.timeRemaining / 10) * gameState.settings.timeBonusMultiplier;
    const difficultyMultiplier = challenge.difficulty === 'hard' ? 2 : 
                                challenge.difficulty === 'medium' ? 1.5 : 1;

    return {
      baseScore,
      efficiencyBonus,
      hintPenalty,
      timeBonus,
      difficultyMultiplier,
      totalScore: Math.floor((baseScore + efficiencyBonus + timeBonus - hintPenalty) * difficultyMultiplier),
    };
  };

  const scoreBreakdown = getScoreBreakdown();

  const getPerformanceRating = () => {
    if (!path || !challenge) return '';
    
    const efficiency = path.totalSteps <= challenge.minimumSteps ? 'Perfect' :
                      path.totalSteps <= challenge.minimumSteps + 1 ? 'Excellent' :
                      path.totalSteps <= challenge.minimumSteps + 2 ? 'Good' :
                      path.totalSteps <= challenge.minimumSteps + 3 ? 'Fair' : 'Needs Improvement';
    
    return efficiency;
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Perfect': return 'text-purple-400';
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'Perfect': return '🏆';
      case 'Excellent': return '🎉';
      case 'Good': return '👍';
      case 'Fair': return '👌';
      default: return '📈';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">
          {path?.isComplete ? '🎉' : '⏰'}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {path?.isComplete ? 'Challenge Completed!' : 'Time\'s Up!'}
        </h2>
        <p className="text-gray-300">
          {path?.isComplete ? 'Great job making the connection!' : 'Don\'t worry, you can try again!'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Panel - Challenge Results */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-4">Challenge Results</h3>
          
          {challenge && (
            <div className="space-y-4">
              {/* Challenge Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Challenge:</span>
                  <span className="text-sm text-white capitalize">{challenge.difficulty}</span>
                </div>
                <div className="text-sm">
                  <span className="text-green-300">{challenge.startCelebrity.name}</span>
                  <span className="text-gray-400"> → </span>
                  <span className="text-red-300">{challenge.endCelebrity.name}</span>
                </div>
              </div>

              {/* Performance Rating */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Performance:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getRatingEmoji(getPerformanceRating())}</span>
                    <span className={`text-sm font-semibold ${getRatingColor(getPerformanceRating())}`}>
                      {getPerformanceRating()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Path Details */}
              {path && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Your Steps:</span>
                    <span className="text-white">{path.totalSteps}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Minimum Steps:</span>
                    <span className="text-white">{challenge.minimumSteps}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Hints Used:</span>
                    <span className="text-white">{currentPlayer.hintsUsed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Completion:</span>
                    <span className={`text-white ${path.isComplete ? 'text-green-400' : 'text-red-400'}`}>
                      {path.isComplete ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              )}

              {/* Connection Path */}
              {path && path.connections.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Your Connection Path:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {path.connections.map((connection, index) => (
                      <div key={index} className="text-xs bg-white/10 rounded p-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-300">{connection.from.name}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-yellow-300">{connection.via.title}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-300">{connection.to.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Score & Leaderboard */}
        <div className="space-y-6">
          {/* Score Breakdown */}
          {scoreBreakdown && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Score Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Base Score ({path?.totalSteps} steps):</span>
                  <span className="text-white">+{scoreBreakdown.baseScore}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Efficiency Bonus:</span>
                  <span className="text-green-400">+{scoreBreakdown.efficiencyBonus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Time Bonus:</span>
                  <span className="text-blue-400">+{scoreBreakdown.timeBonus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Hint Penalty:</span>
                  <span className="text-red-400">-{scoreBreakdown.hintPenalty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Difficulty Multiplier:</span>
                  <span className="text-purple-400">×{scoreBreakdown.difficultyMultiplier}</span>
                </div>
                <div className="border-t border-white/20 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total Score:</span>
                    <span className="text-yellow-400">{scoreBreakdown.totalScore}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Leaderboard</h3>
            <div className="space-y-3">
              {gameState.leaderboard.map((entry, index) => (
                <div
                  key={entry.playerId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.playerId === currentPlayer.id
                      ? 'bg-yellow-500/20 border border-yellow-500/50'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </div>
                    <div>
                      <div className="text-white font-medium">{entry.playerName}</div>
                      <div className="text-xs text-gray-400">
                        {entry.challengesCompleted} challenges, avg {entry.averageSteps} steps
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{entry.totalScore}</div>
                    <div className="text-xs text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex space-x-4 justify-center">
        {!isGameOver && (
          <button
            onClick={onNewChallenge}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            New Challenge
          </button>
        )}
        <button
          onClick={onLeaveGame}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isGameOver ? 'Back to Home' : 'Leave Game'}
        </button>
      </div>

      {/* Fun Facts */}
      <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Did You Know?</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div>
            <p className="mb-1">
              <strong className="text-white">🎬 Movie Connections:</strong> The film industry is surprisingly interconnected - most actors can be connected in 6 degrees or less!
            </p>
          </div>
          <div>
            <p className="mb-1">
              <strong className="text-white">🌟 Bollywood Networks:</strong> Some actors have worked in over 100 films, making them super-connectors in the industry.
            </p>
          </div>
          <div>
            <p className="mb-1">
              <strong className="text-white">🎭 Fun Fact:</strong> The "Six Degrees of Kevin Bacon" game inspired connection games like this one!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 