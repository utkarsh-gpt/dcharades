'use client';

import { useState, useEffect } from 'react';
import { BlockbusterGameState, Player, MovieCard } from '@/lib/types';
import Timer from './Timer';

interface MovieRoundGameplayProps {
  gameState: BlockbusterGameState;
  currentPlayer: Player;
  isCurrentPlayerTurn: boolean;
  onMovieRevealed: (movieId: string, category: 'oneWord' | 'dialogue' | 'actOut') => void;
  onMovieGuessed: (movieId: string) => void;
  onSkipMovie: (movieId: string) => void;
  onRoundComplete: () => void;
}

export default function MovieRoundGameplay({
  gameState,
  currentPlayer,
  isCurrentPlayerTurn,
  onMovieRevealed,
  onMovieGuessed,
  onSkipMovie,
  onRoundComplete,
}: MovieRoundGameplayProps) {

  // Get current player's team
  const playerTeam = gameState.teams.find(team => 
    team.players.some(p => p.id === currentPlayer.id)
  );
  const opponentTeam = gameState.teams.find(team => 
    team.id !== playerTeam?.id
  );

  // Get movie assignments for both teams
  const currentRoundPlayer = gameState.currentRoundPlayer;
  const currentRoundPlayerTeam = gameState.teams.find(team =>
    team.players.some(p => p.id === currentRoundPlayer)
  );
  
  // Get assignments for the current round player (the one whose turn it is)
  const currentRoundPlayerAssignments = gameState.currentPlayerAssignments[currentRoundPlayer || ''];
  
  // Get assignments for the other player (the opponent)
  const otherPlayerId = gameState.roundState?.playersOrder?.find(id => id !== currentRoundPlayer);
  const otherPlayerAssignments = gameState.currentPlayerAssignments[otherPlayerId || ''];



  const handleMovieReveal = (movieId: string, category: 'oneWord' | 'dialogue' | 'actOut') => {
    if (!isCurrentPlayerTurn) return;
    
    // Check if movie is already revealed
    const isRevealed = gameState.roundState?.revealedMovies?.some(m => m.movieId === movieId);
    if (isRevealed) return;

    onMovieRevealed(movieId, category);
  };

  const handleMovieGuess = (movieId: string) => {
    if (!isCurrentPlayerTurn) return;
    
    // Check if movie is revealed and not already guessed
    const isRevealed = gameState.roundState?.revealedMovies?.some(m => m.movieId === movieId);
    const isGuessed = gameState.roundState?.guessedMovies?.some(m => m.movieId === movieId);
    
    if (!isRevealed || isGuessed) return;

    onMovieGuessed(movieId);
  };

  const handleSkip = (movieId: string) => {
    if (!isCurrentPlayerTurn) return;
    onSkipMovie(movieId);
  };

  const getMovieByCategory = (assignments: any, category: 'oneWord' | 'dialogue' | 'actOut'): MovieCard | null => {
    if (!assignments) return null;
    return assignments[category] || null;
  };

  const isMovieRevealed = (movieId: string) => {
    return gameState.roundState?.revealedMovies?.some(movie => movie.movieId === movieId) || false;
  };

  const isMovieGuessed = (movieId: string) => {
    return gameState.roundState?.guessedMovies?.some(movie => movie.movieId === movieId) || false;
  };

  const isMovieUsedByOtherPlayer = (movieId: string) => {
    return gameState.roundState?.revealedMovies?.some(movie => 
      movie.movieId === movieId && movie.playerId !== currentRoundPlayer
    ) || false;
  };

  const areAllOwnMoviesGuessed = () => {
    // Get all the current player's movies
    const currentPlayerMovies = [
      getMovieByCategory(currentRoundPlayerAssignments, 'oneWord'),
      getMovieByCategory(currentRoundPlayerAssignments, 'dialogue'),
      getMovieByCategory(currentRoundPlayerAssignments, 'actOut'),
    ].filter(movie => movie !== null);

    // Check if all of them have been guessed
    return currentPlayerMovies.every(movie => 
      movie && isMovieGuessed(movie.id)
    );
  };

  const MovieButton = ({ 
    movie, 
    category, 
    isCurrentPlayerTeam, 
    categoryLabel,
    icon,
    color
  }: {
    movie: MovieCard | null;
    category: 'oneWord' | 'dialogue' | 'actOut';
    isCurrentPlayerTeam: boolean;
    categoryLabel: string;
    icon: string;
    color: string;
  }) => {
    if (!movie) return null;

    const isRevealed = isMovieRevealed(movie.id);
    const isGuessed = isMovieGuessed(movie.id);
    const isUsedByOther = isMovieUsedByOtherPlayer(movie.id);
    
    // For opponent's movies, check if all own movies are guessed first
    const canRevealOpponentMovie = isCurrentPlayerTeam || areAllOwnMoviesGuessed();
    const canReveal = isCurrentPlayerTurn && !isRevealed && !isUsedByOther && canRevealOpponentMovie;
    const canInteract = isCurrentPlayerTurn && isRevealed && !isGuessed;

    return (
      <div className="flex flex-col space-y-2">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">
          {icon} {categoryLabel}
        </div>
        <button
          onClick={() => canReveal && handleMovieReveal(movie.id, category)}
          disabled={!canReveal}
          className={`p-6 rounded-lg border-2 transition-all min-h-[120px] ${
            isGuessed
              ? 'bg-green-100 dark:bg-green-900/20 border-green-400 text-green-800 dark:text-green-200'
              : isUsedByOther
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-400 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : isRevealed
              ? `${color} border-2 border-dashed`
              : canReveal
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {isRevealed ? (
            <div className="text-center">
              <div className="font-semibold text-gray-800 dark:text-white mb-2">
                {movie.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {movie.genre}
              </div>
              {isGuessed && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✅ Guessed!
                </div>
              )}
              {isUsedByOther && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  🚫 Used by opponent
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {canReveal 
                ? 'Click to reveal' 
                : isUsedByOther 
                ? 'Used by opponent'
                : !isCurrentPlayerTeam && !areAllOwnMoviesGuessed()
                ? 'Guess all your movies first'
                : 'Waiting...'}
            </div>
          )}
        </button>
        
        {canInteract && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleMovieGuess(movie.id)}
              className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              ✅ Guessed
            </button>
            <button
              onClick={() => handleSkip(movie.id)}
              className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              ⏭️ Skip
            </button>
          </div>
        )}
      </div>
    );
  };

  const getCurrentPlayerName = () => {
    const allPlayers = gameState.teams.flatMap(team => team.players);
    const currentPlayer = allPlayers.find(p => p.id === currentRoundPlayer);
    return currentPlayer?.name || 'Unknown';
  };

  const getCurrentPlayerScore = () => {
    return gameState.roundState?.currentPlayerScore || 0;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🎬 Movie Round
        </h2>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {isCurrentPlayerTurn ? "🎭 Your Turn" : `⏳ ${getCurrentPlayerName()}'s Turn`}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Score: {getCurrentPlayerScore()}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-8">
        <Timer
          timeRemaining={gameState.timeRemaining}
          totalTime={gameState.settings.movieRoundTime}
          isActive={gameState.isActive}
        />
      </div>

      {/* Instructions */}
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          {isCurrentPlayerTurn 
            ? "Click buttons to reveal movies and give clues to your team! You must guess all your own movies before attempting opponent's movies."
            : `Watch ${getCurrentPlayerName()} play. Movies they use will be unavailable for your turn.`
          }
        </p>
        {isCurrentPlayerTurn && !areAllOwnMoviesGuessed() && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            💡 Focus on your own movies first - opponent's movies are locked until you guess all yours!
          </p>
        )}
        {isCurrentPlayerTurn && areAllOwnMoviesGuessed() && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            🎉 All your movies guessed! You can now attempt opponent's movies for bonus points.
          </p>
        )}
      </div>

      {/* 3x2 Movie Grid */}
      <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Current Round Player's Column */}
        <div>
          <h3 className="text-xl font-bold text-center mb-6 text-blue-600 dark:text-blue-400">
            👤 {getCurrentPlayerName()}'s Movies
          </h3>
          <div className="space-y-4">
            <MovieButton
              movie={getMovieByCategory(currentRoundPlayerAssignments, 'oneWord')}
              category="oneWord"
              isCurrentPlayerTeam={true}
              categoryLabel="One Word"
              icon="🎯"
              color="bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
            />
            <MovieButton
              movie={getMovieByCategory(currentRoundPlayerAssignments, 'dialogue')}
              category="dialogue"
              isCurrentPlayerTeam={true}
              categoryLabel="Dialogue"
              icon="💬"
              color="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600"
            />
            <MovieButton
              movie={getMovieByCategory(currentRoundPlayerAssignments, 'actOut')}
              category="actOut"
              isCurrentPlayerTeam={true}
              categoryLabel="Act It Out"
              icon="🎭"
              color="bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600"
            />
          </div>
        </div>

        {/* Other Player's Column */}
        <div>
          <h3 className="text-xl font-bold text-center mb-6 text-red-600 dark:text-red-400">
            👤 Opponent's Movies
          </h3>
          <div className="space-y-4">
            <MovieButton
              movie={getMovieByCategory(otherPlayerAssignments, 'oneWord')}
              category="oneWord"
              isCurrentPlayerTeam={false}
              categoryLabel="One Word"
              icon="🎯"
              color="bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
            />
            <MovieButton
              movie={getMovieByCategory(otherPlayerAssignments, 'dialogue')}
              category="dialogue"
              isCurrentPlayerTeam={false}
              categoryLabel="Dialogue"
              icon="💬"
              color="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600"
            />
            <MovieButton
              movie={getMovieByCategory(otherPlayerAssignments, 'actOut')}
              category="actOut"
              isCurrentPlayerTeam={false}
              categoryLabel="Act It Out"
              icon="🎭"
              color="bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Player Scores */}
      <div className="mt-8 flex justify-center space-x-8">
        {gameState.teams.map((team) => (
          <div key={team.id} className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {team.name}
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {team.players.reduce((sum, player) => sum + (player.score || 0), 0)}
            </div>
          </div>
        ))}
      </div>

      {/* Game Status */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Round {(gameState.roundState?.currentPlayerIndex ?? 0) + 1} of {gameState.roundState?.playersOrder?.length || 2}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Movies revealed: {gameState.roundState?.revealedMovies?.length || 0} | 
          Movies guessed: {gameState.roundState?.guessedMovies?.length || 0}
        </div>
      </div>

      {/* End Round Button (for current player) */}
      {isCurrentPlayerTurn && (
        <div className="text-center mt-8">
          <button
            onClick={onRoundComplete}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏁 End My Turn
          </button>
        </div>
      )}
    </div>
  );
} 