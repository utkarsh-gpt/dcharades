'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { useSocket } from '@/lib/shared/socket-context';
import { BlockbusterGameState, Player, Team } from '@/lib/shared/types';
import BlockbusterLobby from '@/components/blockbuster/BlockbusterLobby';
import HeadToHeadChallenge from '@/components/blockbuster/HeadToHeadChallenge';
import MovieSelection from '@/components/movies/MovieSelection';
import MovieRoundGameplay from '@/components/movies/MovieRoundGameplay';

export default function BlockbusterGameRoom() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const { socket, connected } = useSocket();
  const [gameState, setGameState] = useState<BlockbusterGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize game connection
  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    const isHost = localStorage.getItem('isHost') === 'true';

    if (!playerName) {
      router.push('/blockbuster');
      return;
    }

    if (socket && connected) {
      // Join or create game
      if (isHost) {
        socket.emit('create-blockbuster-game', {
          gameId,
          playerName,
          settings: {
            rounds: 3,
            timeLimit: 0,
            movieCategories: ['bollywood'],
            gameType: 'blockbuster',
            maxPlayersPerTeam: 6,
            headToHeadTime: 45,
            movieRoundTime: 60,
          }
        });
      } else {
        socket.emit('join-blockbuster-game', {
          gameId,
          playerName,
        });
      }
    }
  }, [socket, connected, gameId, router]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (state: any) => {
      setGameState(state);
      
      const playerName = localStorage.getItem('playerName');
      
      // Find current player - check both teams and the general players array
      let player = null;
      if (state.teams && state.teams.length > 0) {
        const allTeamPlayers = state.teams.flatMap((team: any) => team.players);
        player = allTeamPlayers.find((p: any) => p.name === playerName);
      }
      
      // Fallback to general players array if not found in teams
      if (!player && state.players) {
        player = state.players.find((p: any) => p.name === playerName);
      }
      
      setCurrentPlayer(player || null);
    };

    const handleError = (errorMessage: string) => {
      setError(errorMessage);
    };

    socket.on('blockbuster-game-state', handleGameState);
    socket.on('error', handleError);

    return () => {
      socket.off('blockbuster-game-state', handleGameState);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Handle team creation
  const handleCreateTeam = useCallback((teamName: string) => {
    if (socket && currentPlayer) {
      socket.emit('create-team', {
        gameId,
        teamName,
        playerId: currentPlayer.id,
      });
    }
  }, [socket, gameId, currentPlayer]);

  // Handle joining team
  const handleJoinTeam = useCallback((teamId: string) => {
    if (socket && currentPlayer) {
      socket.emit('join-team', {
        gameId,
        teamId,
        playerId: currentPlayer.id,
      });
    }
  }, [socket, gameId, currentPlayer]);

  // Handle starting game
  const handleStartGame = useCallback(() => {
    if (socket) {
      socket.emit('start-blockbuster-game', { gameId });
    }
  }, [socket, gameId]);

  // Handle head-to-head submission
  const handleHeadToHeadSubmission = useCallback((movieTitle: string) => {
    if (socket && currentPlayer) {
      if (movieTitle === 'head-to-head-ready') {
        socket.emit('head-to-head-ready', {
          gameId,
          playerId: currentPlayer.id,
        });
      } else {
        socket.emit('head-to-head-submission', {
          gameId,
          playerId: currentPlayer.id,
          movieTitle,
        });
      }
    }
  }, [socket, gameId, currentPlayer]);

  // Handle movie selection
  const handleMovieSelection = useCallback((selectedMovies: any) => {
    if (socket && currentPlayer) {
      socket.emit('movie-selection', {
        gameId,
        playerId: currentPlayer.id,
        selectedMovies,
      });
    }
  }, [socket, gameId, currentPlayer]);

  // Handle movie revealed
  const handleMovieRevealed = useCallback((movieId: string, category: 'oneWord' | 'dialogue' | 'actOut') => {
    if (socket && currentPlayer) {
      socket.emit('movie-revealed', {
        gameId,
        movieId,
        category,
      });
    }
  }, [socket, gameId, currentPlayer]);

  // Handle movie guessed
  const handleMovieGuessed = useCallback((movieId: string) => {
    if (socket && currentPlayer) {
      socket.emit('movie-guessed', {
        gameId,
        movieId,
      });
    }
  }, [socket, gameId, currentPlayer]);

  // Handle skip movie
  const handleSkipMovie = useCallback((movieId: string) => {
    if (socket && currentPlayer) {
      socket.emit('skip-movie', {
        gameId,
        movieId,
      });
    }
  }, [socket, gameId, currentPlayer]);

  // Handle player ready
  const handlePlayerReady = useCallback(() => {
    if (socket && currentPlayer) {
      socket.emit('player-ready', {
        gameId,
        playerId: currentPlayer.id,
      });
    }
  }, [socket, gameId, currentPlayer]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/blockbuster')}
            className="btn-primary"
          >
            Back to Blockbuster
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-game-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-game-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game state...</p>
          <p className="text-sm text-gray-500 mt-2">Game ID: {gameId}</p>
        </div>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎬 Blockbuster Game
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Game ID: <span className="font-mono font-bold">{gameId}</span>
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              connected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Phase: {gameState?.currentPhase || 'unknown'}
            </span>
          </div>
        </div>

        {/* Game Content */}
        {currentPlayer ? (
          <>
            {gameState.currentPhase === 'lobby' && (
              <BlockbusterLobby
                gameState={gameState}
                currentPlayer={currentPlayer}
                onCreateTeam={handleCreateTeam}
                onJoinTeam={handleJoinTeam}
                onStartGame={handleStartGame}
                onPlayerReady={handlePlayerReady}
              />
            )}

            {gameState.currentPhase === 'head-to-head' && (
              <HeadToHeadChallenge
                gameState={gameState}
                currentPlayer={currentPlayer}
                onSubmitMovie={handleHeadToHeadSubmission}
              />
            )}

            {gameState.currentPhase === 'movie-selection' && (
              <MovieSelection
                gameState={gameState}
                currentPlayer={currentPlayer}
                onMovieSelection={handleMovieSelection}
              />
            )}

            {gameState.currentPhase === 'movie-round' && (
              <MovieRoundGameplay
                gameState={gameState}
                currentPlayer={currentPlayer}
                isCurrentPlayerTurn={currentPlayer.id === gameState.currentRoundPlayer}
                onMovieRevealed={handleMovieRevealed}
                onMovieGuessed={handleMovieGuessed}
                onSkipMovie={handleSkipMovie}
                onRoundComplete={() => {
                  if (socket && currentPlayer) {
                    socket.emit('round-complete', {
                      gameId,
                    });
                  }
                }}
              />
            )}
          </>
        ) : (
          <div className="game-card text-center">
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Setting up your player...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please wait while we set up your profile in the game.
            </p>
            <div className="text-sm text-gray-500">
              Game Phase: {gameState.currentPhase}
            </div>
          </div>
        )}

        {gameState.currentPhase === 'game-over' && (
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
                {gameState.teams
                  .sort((a, b) => b.genresGuessed.length - a.genresGuessed.length)
                  .map((team, index) => (
                    <div
                      key={team.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {index === 0 && <span className="text-2xl">👑</span>}
                        <span className="font-medium text-gray-800 dark:text-white">
                          {team.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                          {team.genresGuessed.length} genres
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {team.genresGuessed.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => router.push('/blockbuster')}
                className="btn-primary"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 