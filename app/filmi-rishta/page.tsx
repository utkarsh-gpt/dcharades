'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function FilmiRishtaPage() {
  const router = useRouter();
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameMode, setGameMode] = useState<'solo' | 'versus'>('solo');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newGameId = uuidv4().substring(0, 8);
      
      // Store player info in localStorage
      localStorage.setItem('playerName', playerName.trim());
      localStorage.setItem('isHost', 'true');
      localStorage.setItem('gameMode', gameMode);
      
      // Navigate to game
      router.push(`/filmi-rishta-game/${newGameId}`);
    } catch (err) {
      setError('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!gameId.trim()) {
      setError('Please enter a game ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store player info in localStorage
      localStorage.setItem('playerName', playerName.trim());
      localStorage.setItem('isHost', 'false');
      localStorage.setItem('gameMode', gameMode);
      
      // Navigate to game
      router.push(`/filmi-rishta-game/${gameId.trim()}`);
    } catch (err) {
      setError('Failed to join game. Please check the game ID.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            🎬 Filmi Rishta
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Connect Bollywood celebrities through their movies and collaborations! 
            Create chains of connections to link any two stars in the film industry.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Game Mode
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setGameMode('solo')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    gameMode === 'solo'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  Solo Challenge
                </button>
                <button
                  onClick={() => setGameMode('versus')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    gameMode === 'versus'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  Versus Mode
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleCreateGame}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create New Game'}
              </button>

              {gameMode === 'versus' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-gray-300">
                        Or
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gameId" className="block text-sm font-medium mb-2">
                      Game ID
                    </label>
                    <input
                      id="gameId"
                      type="text"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      placeholder="Enter game ID to join"
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    onClick={handleJoinGame}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Joining...' : 'Join Game'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-yellow-400">🎯 Solo Challenge</h3>
              <p className="text-sm text-gray-300">
                Connect two random celebrities through their movie collaborations. 
                Create the shortest path possible to maximize your score!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-blue-400">⚔️ Versus Mode</h3>
              <p className="text-sm text-gray-300">
                Compete against another player to see who can create connections faster. 
                Race against time and your opponent!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-green-400">🔗 Connection Rules</h3>
              <p className="text-sm text-gray-300">
                Valid connections: Co-starred in movies, director-actor collaborations, 
                and production house associations. Path goes: Celebrity → Movie → Celebrity → Movie...
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-purple-400">🏆 Scoring</h3>
              <p className="text-sm text-gray-300">
                Earn points for each connection, get bonuses for efficiency and speed, 
                but lose points for using hints. Can you find the perfect path?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 