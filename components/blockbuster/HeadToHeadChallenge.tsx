'use client';

import { useState, useEffect } from 'react';
import { BlockbusterGameState, Player } from '@/lib/shared/types';
import Timer from '../shared/Timer';

interface HeadToHeadChallengeProps {
  gameState: BlockbusterGameState;
  currentPlayer: Player;
  onSubmitMovie: (movieTitle: string) => void;
}

export default function HeadToHeadChallenge({
  gameState,
  currentPlayer,
  onSubmitMovie,
}: HeadToHeadChallengeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleButtonPress = async () => {
    if (isSubmitting || !gameState.headToHead.isActive) return;

    setIsSubmitting(true);
    try {
      // Send a dummy movie title since we're just tracking button presses
      await onSubmitMovie('turn-completed');
    } catch (error) {
      console.error('Error submitting turn:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReady = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Use the onSubmitMovie callback with a special value
      await onSubmitMovie('head-to-head-ready');
    } catch (error) {
      console.error('Error starting countdown:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { headToHead } = gameState;
  const isPlayerParticipating = headToHead.currentPlayers.teamA?.id === currentPlayer.id || 
                                 headToHead.currentPlayers.teamB?.id === currentPlayer.id;

  // Get current player's team
  const currentPlayerTeam = gameState.teams.find(team => 
    team.players.some(p => p.id === currentPlayer.id)
  );

  // Determine whose turn it is based on last submission
  const lastSubmission = headToHead.submissions[headToHead.submissions.length - 1];
  const isCurrentPlayerTurn = !lastSubmission || 
    (lastSubmission.playerId !== currentPlayer.id && isPlayerParticipating);

  if (!headToHead.card) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="game-card text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            🎬 Head-to-Head Challenge
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Waiting for head-to-head challenge to begin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Countdown Overlay */}
      {headToHead.countdownActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Get Ready!</h2>
            <div className="text-9xl font-bold text-white animate-pulse">
              {headToHead.countdownTime || 'GO!'}
            </div>
            <p className="text-xl text-white mt-8">
              Head-to-head round starting...
            </p>
          </div>
        </div>
      )}

      {/* Challenge Card */}
      <div className="game-card text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🎬 Head-to-Head Challenge
        </h2>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-6">
          <h3 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-4">
            {headToHead.card.category}
          </h3>
          <p className="text-xl text-purple-700 dark:text-purple-300">
            {headToHead.card.description}
          </p>
        </div>

        {/* Timer - only show when active */}
        {headToHead.isActive && (
          <div className="mb-6">
            <Timer
              timeRemaining={headToHead.timeRemaining}
              totalTime={gameState.settings.headToHeadTime}
              isActive={headToHead.isActive}
            />
          </div>
        )}
      </div>

      {/* Players */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Team A Player */}
        <div className={`game-card ${
          headToHead.currentPlayers.teamA?.id === currentPlayer.id 
            ? 'ring-2 ring-blue-500' : ''
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                Team A
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {headToHead.currentPlayers.teamA?.name || 'Waiting...'}
              </p>
            </div>
            <div className="text-2xl">🔵</div>
          </div>
          {headToHead.currentPlayers.teamA?.id === currentPlayer.id && (
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              You're representing your team!
            </div>
          )}
        </div>

        {/* Team B Player */}
        <div className={`game-card ${
          headToHead.currentPlayers.teamB?.id === currentPlayer.id 
            ? 'ring-2 ring-red-500' : ''
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                Team B
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {headToHead.currentPlayers.teamB?.name || 'Waiting...'}
              </p>
            </div>
            <div className="text-2xl">🔴</div>
          </div>
          {headToHead.currentPlayers.teamB?.id === currentPlayer.id && (
            <div className="text-sm text-red-600 dark:text-red-400 font-medium">
              You're representing your team!
            </div>
          )}
        </div>
      </div>

      {/* Ready Button or Turn Button */}
      {isPlayerParticipating && (
        <div className="game-card text-center">
          {!headToHead.isReady && !headToHead.isActive && (
            <>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Ready to Start?
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Press the button when both players are ready to begin the head-to-head round!
              </p>
              <button
                onClick={handleReady}
                disabled={isSubmitting}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-bold text-xl rounded-lg transition-colors
                         transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? 'Starting...' : '🚀 Ready to Play!'}
              </button>
            </>
          )}

          {headToHead.isActive && (
            <>
              <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {isCurrentPlayerTurn ? "Your Turn!" : "Wait for your turn..."}
              </h4>
              
              {isCurrentPlayerTurn && (
                <div className="space-y-4">
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Say a movie that fits the category, then press the button!
                  </p>
                  <button
                    onClick={handleButtonPress}
                    disabled={isSubmitting || !headToHead.isActive}
                    className="px-8 py-4 bg-game-primary hover:bg-game-primary-dark 
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-bold text-xl rounded-lg transition-colors
                             transform hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? 'Processing...' : '✋ I Said a Movie!'}
                  </button>
                </div>
              )}
              
              {!isCurrentPlayerTurn && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Wait for the other player to say their movie and press the button.
                </p>
              )}
            </>
          )}
        </div>
      )}



      {/* Instructions */}
      <div className="game-card bg-blue-50 dark:bg-blue-900/20">
        <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-3">
          How to Play
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Press "Ready to Play!" when both players are prepared</li>
          <li>• A 3-second countdown will begin the round</li>
          <li>• Players take turns saying movies that fit the category out loud</li>
          <li>• After saying a movie, press the button to add time and switch turns</li>
          <li>• Each turn adds 2 seconds to the timer</li>
          <li>• The round continues until the timer runs out</li>
          <li>• The last player to successfully take a turn wins!</li>
          <li>• Winner gets 6 movie cards for the next phase</li>
        </ul>
      </div>
    </div>
  );
} 