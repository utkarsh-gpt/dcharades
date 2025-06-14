'use client';

import { useState, useEffect } from 'react';
import { GameState, Player } from '@/lib/types';
import Timer from './Timer';

interface GamePlayProps {
  gameState: GameState;
  currentPlayer: Player;
  onMovieGuessed: () => void;
  onSkipMovie: () => void;
}

export default function GamePlay({
  gameState,
  currentPlayer,
  onMovieGuessed,
  onSkipMovie,
}: GamePlayProps) {
  const isActor = currentPlayer.id === gameState.currentActorId;
  const otherPlayer = gameState.players.find(p => p.id !== currentPlayer.id);
  const actorPlayer = gameState.players.find(p => p.id === gameState.currentActorId);

  const getRoleText = () => {
    if (isActor) {
      return "🎭 You're acting!";
    }
    return "🤔 You're guessing!";
  };

  const getRoleDescription = () => {
    if (isActor) {
      return `Act out the movie "${gameState.currentMovie}" without speaking!`;
    }
    return `Watch ${actorPlayer?.name} act and guess the movie!`;
  };

  if (gameState.winner) {
    return (
      <div className="text-center max-w-2xl mx-auto">
        <div className="game-card">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Game Over!
          </h2>
          <div className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Final Scores:
          </div>
          <div className="space-y-3 mb-6">
            {gameState.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {index === 0 && <span className="text-2xl">👑</span>}
                    <span className="font-medium text-gray-800 dark:text-white">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-800 dark:text-white">
                    {player.score}
                  </span>
                </div>
              ))}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Status */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Round {gameState.currentRound} of {gameState.settings.rounds}
          </div>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <div className="text-sm font-medium text-gray-800 dark:text-white">
            {getRoleText()}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-8">
        <Timer
          timeRemaining={gameState.timeRemaining}
          totalTime={gameState.settings.timeLimit}
          isActive={gameState.isRoundActive}
        />
      </div>

      {/* Main Game Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movie/Instructions Card */}
        <div className="game-card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {getRoleText()}
          </h3>
          
          {isActor ? (
            <div className="text-center">
              <div className="text-4xl mb-4">🎬</div>
              <div className="text-2xl font-bold text-game-primary mb-4">
                {gameState.currentMovie}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Act out this movie without speaking or writing!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={onMovieGuessed}
                  className="w-full btn-secondary"
                  disabled={!gameState.isRoundActive}
                >
                  ✅ They Guessed It!
                </button>
                <button
                  onClick={onSkipMovie}
                  className="w-full btn-danger"
                  disabled={!gameState.isRoundActive}
                >
                  ⏭️ Skip This Movie
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Watch {actorPlayer?.name} act and guess the movie!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Type your guesses in the chat or call them out loud!
              </p>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="game-card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Scoreboard
          </h3>
          
          <div className="space-y-3">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.id === currentPlayer.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      player.id === gameState.currentActorId
                        ? 'bg-game-primary'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span className="font-medium text-gray-800 dark:text-white">
                    {player.name}
                  </span>
                  {player.id === gameState.currentActorId && (
                    <span className="text-xs bg-game-primary text-white px-2 py-1 rounded">
                      ACTING
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-gray-800 dark:text-white">
                  {player.score}
                </span>
              </div>
            ))}
          </div>
          
          {/* Round Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{gameState.currentRound} / {gameState.settings.rounds}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-game-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(gameState.currentRound / gameState.settings.rounds) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 