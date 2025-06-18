'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function BlockbusterPage() {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsCreating(true);
    const newGameId = uuidv4().substring(0, 8).toUpperCase();
    
    // Store player info in localStorage
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('isHost', 'true');
    localStorage.setItem('gameType', 'blockbuster');
    
    router.push(`/blockbuster-game/${newGameId}`);
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!gameId.trim()) {
      alert('Please enter a game ID');
      return;
    }

    setIsJoining(true);
    
    // Store player info in localStorage
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('isHost', 'false');
    localStorage.setItem('gameType', 'blockbuster');
    
    router.push(`/blockbuster-game/${gameId.toUpperCase()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center space-x-2 text-game-primary hover:text-indigo-600 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Game Hub</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎬 Blockbuster Game
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Team-based Bollywood movie trivia game!
          </p>
        </div>

        {/* Main Card */}
        <div className="game-card">
          {/* Player Name Input */}
          <div className="mb-6">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-game-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          {/* Create Game Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Create New Game
            </h3>
            <button
              onClick={handleCreateGame}
              disabled={isCreating || !playerName.trim()}
              className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Blockbuster Game'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                OR
              </span>
            </div>
          </div>

          {/* Join Game Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Join Existing Game
            </h3>
            <div className="mb-3">
              <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Game ID
              </label>
              <input
                type="text"
                id="gameId"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-game-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter game ID"
                maxLength={8}
              />
            </div>
            <button
              onClick={handleJoinGame}
              disabled={isJoining || !playerName.trim() || !gameId.trim()}
              className="w-full btn-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-8 text-center">
          <details className="text-left">
            <summary className="cursor-pointer text-game-primary font-medium mb-2">
              How to Play Blockbuster
            </summary>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>Setup:</strong> Form two teams with multiple players each</p>
              <p><strong>Head-to-Head:</strong> One player from each team competes in movie naming challenges</p>
              <p><strong>Movie Cards:</strong> Winners get 6 movie cards, select 3 and give 3 to opponents</p>
              <p><strong>Three Fields:</strong> Arrange movies in "One Word", "Dialogue", and "Act Out" fields</p>
              <p><strong>Guessing Round:</strong> 60 seconds to get teammates to guess your movies</p>
              <p><strong>Scoring:</strong> Teams score points based on unique movie genres guessed</p>
              <p><strong>Victory:</strong> Team with most diverse genres wins!</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
} 