'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket-context';
import { GameState, Player, DEFAULT_SETTINGS, GameSettings } from '@/lib/types';
import { getRandomMovie } from '@/lib/movies';
import GameLobby from '@/components/GameLobby';
import GamePlay from '@/components/GamePlay';
import GameSettingsModal from '@/components/GameSettings';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { socket, connected } = useSocket();
  const gameId = params.gameId as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize player from localStorage
  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    const isHost = localStorage.getItem('isHost') === 'true';

    if (!playerName) {
      router.push('/');
      return;
    }

    if (socket && connected) {
      // Join or create game
      socket.emit('join-game', {
        gameId,
        playerName,
        isHost,
      });
    }
  }, [socket, connected, gameId, router]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (state: GameState) => {
      setGameState(state);
      setIsLoading(false);
      
      // Find current player
      const playerName = localStorage.getItem('playerName');
      const player = state.players.find(p => p.name === playerName);
      setCurrentPlayer(player || null);
    };

    const handleError = (message: string) => {
      setError(message);
      setIsLoading(false);
    };

    const handlePlayerJoined = (player: Player) => {
      console.log('Player joined:', player.name);
    };

    const handlePlayerLeft = (playerId: string) => {
      console.log('Player left:', playerId);
    };

    const handleGameStarted = () => {
      setShowSettings(false);
    };

    socket.on('game-state', handleGameState);
    socket.on('error', handleError);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('game-started', handleGameStarted);

    return () => {
      socket.off('game-state', handleGameState);
      socket.off('error', handleError);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('game-started', handleGameStarted);
    };
  }, [socket]);

  const handleStartGame = useCallback(() => {
    if (socket && currentPlayer?.isHost) {
      socket.emit('start-game', { gameId });
    }
  }, [socket, currentPlayer, gameId]);

  const handleUpdateSettings = useCallback((settings: GameSettings) => {
    if (socket && currentPlayer?.isHost) {
      socket.emit('update-settings', { gameId, settings });
    }
  }, [socket, currentPlayer, gameId]);

  const handlePlayerReady = useCallback(() => {
    if (socket && currentPlayer) {
      socket.emit('player-ready', { gameId, playerId: currentPlayer.id });
    }
  }, [socket, currentPlayer, gameId]);

  const handleMovieGuessed = useCallback(() => {
    if (socket && currentPlayer?.id === gameState?.currentActorId) {
      socket.emit('movie-guessed', { gameId });
    }
  }, [socket, currentPlayer, gameState, gameId]);

  const handleSkipMovie = useCallback(() => {
    if (socket && currentPlayer?.id === gameState?.currentActorId) {
      socket.emit('skip-movie', { gameId });
    }
  }, [socket, currentPlayer, gameState, gameId]);

  const handlePlayAgain = useCallback(() => {
    if (socket) {
      socket.emit('play-again', { gameId });
    }
  }, [socket, gameId]);

  const handleLeaveGame = useCallback(() => {
    if (socket) {
      socket.emit('leave-game', { gameId });
    }
    localStorage.removeItem('playerName');
    localStorage.removeItem('isHost');
    router.push('/');
  }, [socket, gameId, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {connected ? 'Joining game...' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="game-card">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState || !currentPlayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="game-card">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Game Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The game you're looking for doesn't exist or has ended.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Game: {gameId}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {gameState.players.length}/2 players
            </p>
          </div>
          <button
            onClick={handleLeaveGame}
            className="btn-danger"
          >
            Leave Game
          </button>
        </div>

        {/* Game Content */}
        {!gameState.isGameStarted ? (
          <GameLobby
            gameState={gameState}
            currentPlayer={currentPlayer}
            onStartGame={handleStartGame}
            onPlayerReady={handlePlayerReady}
            onShowSettings={() => setShowSettings(true)}
          />
        ) : (
          <GamePlay
            gameState={gameState}
            currentPlayer={currentPlayer}
            onMovieGuessed={handleMovieGuessed}
            onSkipMovie={handleSkipMovie}
            onPlayAgain={handlePlayAgain}
          />
        )}

        {/* Settings Modal */}
        {showSettings && currentPlayer.isHost && (
          <GameSettingsModal
            settings={gameState.settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
} 