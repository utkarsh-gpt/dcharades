'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_UNO_SETTINGS, UnoGameSettings } from '@/lib/uno/types';

export default function UnoLobby() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [settings, setSettings] = useState<UnoGameSettings>(DEFAULT_UNO_SETTINGS);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsCreating(true);
    try {
      const newGameId = uuidv4();
      
      // Store player info in localStorage for the game
      localStorage.setItem('unoPlayerName', playerName);
      localStorage.setItem('unoGameSettings', JSON.stringify(settings));
      
      // Navigate to the game
      router.push(`/uno-game/${newGameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
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
    try {
      // Store player info in localStorage for the game
      localStorage.setItem('unoPlayerName', playerName);
      
      // Navigate to the game
      router.push(`/uno-game/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please check the game ID and try again.');
    } finally {
      setIsJoining(false);
    }
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
            🃏 UNO Game
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            2-Player UNO with unique strategic cards!
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

          {/* Game Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Game Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time per Turn
                </label>
                <select
                  value={settings.timePerTurn}
                  onChange={(e) => setSettings({...settings, timePerTurn: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-game-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={0}>No limit</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="uniqueCards"
                  checked={settings.includeUniqueCards}
                  onChange={(e) => setSettings({...settings, includeUniqueCards: e.target.checked})}
                  className="h-4 w-4 text-game-primary focus:ring-game-primary border-gray-300 rounded dark:border-gray-600"
                />
                <label htmlFor="uniqueCards" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Include Unique 2-Player Cards
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableChat"
                  checked={settings.enableChat}
                  onChange={(e) => setSettings({...settings, enableChat: e.target.checked})}
                  className="h-4 w-4 text-game-primary focus:ring-game-primary border-gray-300 rounded dark:border-gray-600"
                />
                <label htmlFor="enableChat" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable Chat
                </label>
              </div>
            </div>
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
              {isCreating ? 'Creating...' : 'Create UNO Game'}
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
                onChange={(e) => setGameId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-game-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter game ID"
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
              How to Play UNO
            </summary>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>Basic Rules:</strong> Match cards by color, number, or symbol</p>
              <p><strong>Special Cards:</strong> Skip, Reverse, Draw Two, Wild, and Wild Draw Four</p>
              <p><strong>Unique Cards:</strong> Duel, Mirror, Swap Hands, Shield, Time Bomb, and more!</p>
              <p><strong>UNO Call:</strong> Say "UNO" when you have one card left</p>
              <p><strong>Scoring:</strong> First to empty hand wins round, points awarded for opponent's cards</p>
              <p><strong>Victory:</strong> First player to reach target score wins the game!</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
} 