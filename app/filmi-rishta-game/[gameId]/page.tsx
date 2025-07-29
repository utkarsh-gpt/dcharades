'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/lib/shared/socket-context';
import { FilmiRishtaGameState, FilmiRishtaPlayer, Movie, Celebrity } from '@/lib/filmi-rishta/types';
import FilmiRishtaLobby from '@/components/filmi-rishta/FilmiRishtaLobby';
import FilmiRishtaGameplay from '@/components/filmi-rishta/FilmiRishtaGameplay';
import FilmiRishtaResults from '@/components/filmi-rishta/FilmiRishtaResults';

export default function FilmiRishtaGameRoom() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const { socket, connected } = useSocket();
  const [gameState, setGameState] = useState<FilmiRishtaGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<FilmiRishtaPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [challengeComplete, setChallengeComplete] = useState<any>(null);
  const [gameComplete, setGameComplete] = useState<any>(null);

  // Initialize game connection
  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    const isHost = localStorage.getItem('isHost') === 'true';
    const gameMode = localStorage.getItem('gameMode') as 'solo' | 'versus' || 'solo';

    if (!playerName) {
      router.push('/filmi-rishta');
      return;
    }

    if (socket && connected) {
      // Join or create game
      if (isHost) {
        socket.emit('create-filmi-rishta-game', {
          gameId,
          playerName,
          gameMode,
        });
      } else {
        socket.emit('join-filmi-rishta-game', {
          gameId,
          playerName,
        });
      }
    }
  }, [socket, connected, gameId, router]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (newGameState: FilmiRishtaGameState) => {
      setGameState(newGameState);
      setIsLoading(false);
      
      // Find current player
      const player = newGameState.players.find(p => p.id === socket.id);
      if (player) {
        setCurrentPlayer(player);
      }
    };

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
      setIsLoading(false);
    };

    const handlePlayerJoined = (player: FilmiRishtaPlayer) => {
      console.log(`Player ${player.name} joined the game`);
    };

    const handlePlayerLeft = (playerId: string) => {
      console.log(`Player ${playerId} left the game`);
    };

    const handleChallengeStarted = (challenge: any) => {
      console.log('New challenge started:', challenge);
    };

    const handleMovieValidated = (result: any) => {
      console.log('Movie validation result:', result);
    };

    const handleCelebrityValidated = (result: any) => {
      console.log('Celebrity validation result:', result);
    };

    const handleHintReceived = (hint: any) => {
      console.log('Hint received:', hint);
    };

    const handleConnectionError = (errorMessage: string) => {
      setConnectionError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setConnectionError(null), 5000);
    };

    const handleChallengeCompleted = (result: any) => {
      console.log('Challenge completed:', result);
      setChallengeComplete(result);
      // Clear after 3 seconds
      setTimeout(() => setChallengeComplete(null), 3000);
    };

    const handleGameCompleted = (result: any) => {
      console.log('Game completed:', result);
      setGameComplete(result);
    };

    // Register event listeners
    socket.on('filmi-rishta-game-state', handleGameState);
    socket.on('error', handleError);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('challenge-started', handleChallengeStarted);
    socket.on('movie-validated', handleMovieValidated);
    socket.on('celebrity-validated', handleCelebrityValidated);
    socket.on('hint-received', handleHintReceived);
    socket.on('connection-error', handleConnectionError);
    socket.on('challenge-completed', handleChallengeCompleted);
    socket.on('game-completed', handleGameCompleted);

    return () => {
      socket.off('filmi-rishta-game-state', handleGameState);
      socket.off('error', handleError);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('challenge-started', handleChallengeStarted);
      socket.off('movie-validated', handleMovieValidated);
      socket.off('celebrity-validated', handleCelebrityValidated);
      socket.off('hint-received', handleHintReceived);
      socket.off('connection-error', handleConnectionError);
      socket.off('challenge-completed', handleChallengeCompleted);
      socket.off('game-completed', handleGameCompleted);
    };
  }, [socket]);

  // Game action handlers
  const handleStartGame = useCallback(() => {
    if (socket && currentPlayer) {
      socket.emit('start-filmi-rishta-game', { gameId });
    }
  }, [socket, currentPlayer, gameId]);

  const handlePlayerReady = useCallback(() => {
    if (socket && currentPlayer) {
      socket.emit('player-ready', { gameId, playerId: currentPlayer.id });
    }
  }, [socket, currentPlayer, gameId]);

  const handleUpdateSettings = useCallback((settings: any) => {
    if (socket && currentPlayer) {
      socket.emit('update-filmi-rishta-settings', { gameId, settings });
    }
  }, [socket, currentPlayer, gameId]);

  const handleMovieValidated = useCallback((movie: Movie) => {
    if (socket && currentPlayer) {
      socket.emit('movie-validated', { 
        gameId, 
        playerId: currentPlayer.id, 
        movie 
      });
    }
  }, [socket, currentPlayer, gameId]);

  const handleCelebrityValidated = useCallback((celebrity: Celebrity) => {
    if (socket && currentPlayer) {
      socket.emit('celebrity-validated', { 
        gameId, 
        playerId: currentPlayer.id, 
        celebrity 
      });
    }
  }, [socket, currentPlayer, gameId]);

  const handleRequestHint = useCallback((hintType: string) => {
    if (socket && currentPlayer) {
      socket.emit('request-hint', { 
        gameId, 
        playerId: currentPlayer.id, 
        hintType 
      });
    }
  }, [socket, currentPlayer, gameId]);

  const handleSkipChallenge = useCallback(() => {
    if (socket && currentPlayer) {
      socket.emit('skip-challenge', { gameId, playerId: currentPlayer.id });
    }
  }, [socket, currentPlayer, gameId]);

  const handleNewChallenge = useCallback(() => {
    if (socket && currentPlayer) {
      socket.emit('new-challenge', { gameId, playerId: currentPlayer.id });
    }
  }, [socket, currentPlayer, gameId]);

  const handleLeaveGame = useCallback(() => {
    if (socket && currentPlayer) {
      socket.emit('leave-filmi-rishta-game', { gameId, playerId: currentPlayer.id });
    }
    router.push('/filmi-rishta');
  }, [socket, currentPlayer, gameId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Game Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/filmi-rishta')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-6xl mb-4">🎬</div>
          <h2 className="text-white text-2xl font-bold mb-4">Joining Game...</h2>
          <p className="text-gray-300">Please wait while we connect you to the game.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🎬 Filmi Rishta
          </h1>
          <p className="text-gray-300">Game ID: {gameId}</p>
        </div>

        {/* Game Content */}
        {currentPlayer && (
          <>
            {gameState.currentPhase === 'lobby' && (
              <FilmiRishtaLobby
                gameState={gameState}
                currentPlayer={currentPlayer}
                onStartGame={handleStartGame}
                onPlayerReady={handlePlayerReady}
                onUpdateSettings={handleUpdateSettings}
                onLeaveGame={handleLeaveGame}
              />
            )}

            {(gameState.currentPhase === 'playing' || gameState.currentPhase === 'hint') && (
              <FilmiRishtaGameplay
                gameState={gameState}
                currentPlayer={currentPlayer}
                onMovieValidated={handleMovieValidated}
                onCelebrityValidated={handleCelebrityValidated}
                onRequestHint={handleRequestHint}
                onSkipChallenge={handleSkipChallenge}
                onLeaveGame={handleLeaveGame}
                onNewChallenge={handleNewChallenge}
              />
            )}

            {(gameState.currentPhase === 'completed' || gameState.currentPhase === 'game-over') && (
              <FilmiRishtaResults
                gameState={gameState}
                currentPlayer={currentPlayer}
                onNewChallenge={handleNewChallenge}
                onLeaveGame={handleLeaveGame}
              />
            )}
          </>
        )}

        {/* Connection Error Toast */}
        {connectionError && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <span className="text-xl">❌</span>
              <div>
                <div className="font-semibold">Connection Failed</div>
                <div className="text-sm">{connectionError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Challenge Complete Toast */}
        {challengeComplete && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎉</span>
              <div>
                <div className="font-semibold">Challenge Complete!</div>
                <div className="text-sm">
                  {challengeComplete.playerName} scored {challengeComplete.score} points!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Complete!</h2>
                <p className="text-lg text-gray-600 mb-4">
                  <strong>{gameComplete.winner.name}</strong> won with {gameComplete.winner.score} points!
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleNewChallenge}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    New Challenge
                  </button>
                  <button
                    onClick={handleLeaveGame}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Leave Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 