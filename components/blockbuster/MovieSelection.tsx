'use client';

import { useState, useEffect } from 'react';
import { BlockbusterGameState, Player, MovieCard } from '@/lib/shared/types';

interface MovieSelectionProps {
  gameState: BlockbusterGameState;
  currentPlayer: Player;
  onMovieSelection: (selectedMovies: { oneWord: string; dialogue: string; actOut: string }) => void;
}

interface MovieSlots {
  available: MovieCard[];
  oneWord: MovieCard | null;
  dialogue: MovieCard | null;
  actOut: MovieCard | null;
}

export default function MovieSelection({
  gameState,
  currentPlayer,
  onMovieSelection,
}: MovieSelectionProps) {
  const [movieSlots, setMovieSlots] = useState<MovieSlots>({
    available: [],
    oneWord: null,
    dialogue: null,
    actOut: null,
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieCard | null>(null);

  // Initialize available movies based on head-to-head winner
  useEffect(() => {
    const headToHeadWinner = gameState.headToHead.winner;
    const isWinner = headToHeadWinner === currentPlayer.id;
    
    // Check if current player already has COMPLETED assignments (all 3 movies assigned)
    const currentAssignment = gameState.currentPlayerAssignments[currentPlayer.id];
    if (currentAssignment && currentAssignment.oneWord && currentAssignment.dialogue && currentAssignment.actOut) {
      // Player has already made complete selections, show them
      setMovieSlots({
        available: [],
        oneWord: currentAssignment.oneWord,
        dialogue: currentAssignment.dialogue,
        actOut: currentAssignment.actOut,
      });
      setHasSubmitted(true);
      return;
    }
    
    // Get available movie cards from the game state
    const availableMovies = gameState.movieCards || [];
    
    if (isWinner) {
      // Winner gets to pick from all 6 cards first
      setMovieSlots({
        available: availableMovies,
        oneWord: null,
        dialogue: null,
        actOut: null,
      });
    } else {
        // Check if winner has already selected movies
        const winnerAssignment = headToHeadWinner ? gameState.currentPlayerAssignments[headToHeadWinner] : null;
        if (winnerAssignment && winnerAssignment.oneWord && winnerAssignment.dialogue && winnerAssignment.actOut) {
        // Winner has selected, get the remaining 3 cards
        const usedMovieIds = [
          winnerAssignment.oneWord.id,
          winnerAssignment.dialogue.id,
          winnerAssignment.actOut.id,
        ];
        const remainingMovies = availableMovies.filter(movie => !usedMovieIds.includes(movie.id));
        
        setMovieSlots({
          available: remainingMovies,
          oneWord: null,
          dialogue: null,
          actOut: null,
        });
      } else {
        // Winner hasn't selected yet, wait
        setMovieSlots({
          available: [],
          oneWord: null,
          dialogue: null,
          actOut: null,
        });
      }
    }
  }, [gameState.movieCards, gameState.headToHead.winner, gameState.currentPlayerAssignments, currentPlayer.id]);

  const handleMovieClick = (movie: MovieCard) => {
    setSelectedMovie(selectedMovie?.id === movie.id ? null : movie);
  };

  const handleCategoryClick = (category: 'oneWord' | 'dialogue' | 'actOut') => {
    if (!selectedMovie) return;
    
    const newMovieSlots = { ...movieSlots };
    
    // Remove selected movie from its current location
    if (movieSlots.available.some(m => m.id === selectedMovie.id)) {
      newMovieSlots.available = newMovieSlots.available.filter(m => m.id !== selectedMovie.id);
    } else if (movieSlots.oneWord?.id === selectedMovie.id) {
      newMovieSlots.oneWord = null;
    } else if (movieSlots.dialogue?.id === selectedMovie.id) {
      newMovieSlots.dialogue = null;
    } else if (movieSlots.actOut?.id === selectedMovie.id) {
      newMovieSlots.actOut = null;
    }
    
    // If target category already has a movie, move it back to available
    if (newMovieSlots[category]) {
      newMovieSlots.available.push(newMovieSlots[category]!);
    }
    
    // Place selected movie in target category
    newMovieSlots[category] = selectedMovie;
    
    setMovieSlots(newMovieSlots);
    setSelectedMovie(null);
  };

  const handleCategorizedMovieDoubleClick = (movie: MovieCard, category: 'oneWord' | 'dialogue' | 'actOut') => {
    const newMovieSlots = { ...movieSlots };
    
    // Remove from category and add back to available
    newMovieSlots[category] = null;
    newMovieSlots.available.push(movie);
    
    setMovieSlots(newMovieSlots);
    setSelectedMovie(null);
  };

  const handleSubmitSelection = () => {
    if (!movieSlots.oneWord || !movieSlots.dialogue || !movieSlots.actOut) {
      alert('Please assign a movie to each category!');
      return;
    }

    // Only send the selection to server when confirmed
    onMovieSelection({
      oneWord: movieSlots.oneWord.id,
      dialogue: movieSlots.dialogue.id,
      actOut: movieSlots.actOut.id,
    });

    setHasSubmitted(true);
  };

  const isSelectionComplete = movieSlots.oneWord && movieSlots.dialogue && movieSlots.actOut;
  const headToHeadWinner = gameState.headToHead.winner;
  const isWinner = headToHeadWinner === currentPlayer.id;

  const MovieCard = ({ 
    movie, 
    isSelected = false, 
    isClickable = true,
    onClick,
    onDoubleClick 
  }: { 
    movie: MovieCard; 
    isSelected?: boolean;
    isClickable?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
  }) => (
    <div
      onClick={isClickable ? onClick : undefined}
      onDoubleClick={onDoubleClick}
      className={`p-3 rounded-lg border transition-all ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${
        isSelected
          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-300'
          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
      }`}
    >
      <div className="text-sm font-medium text-gray-800 dark:text-white">
        {movie.title}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {movie.genre} • {movie.difficulty}
      </div>
    </div>
  );

  const CategoryBox = ({ 
    category,
    title, 
    icon, 
    movie, 
    color 
  }: { 
    category: 'oneWord' | 'dialogue' | 'actOut';
    title: string;
    icon: string;
    movie: MovieCard | null;
    color: string;
  }) => (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
        {icon} {title}
      </h3>
      <div
        onClick={() => handleCategoryClick(category)}
        className={`min-h-[200px] p-4 rounded-lg border-2 transition-all ${
          selectedMovie ? 'cursor-pointer hover:border-blue-400' : 'cursor-default'
        } ${color}`}
      >
        {movie ? (
          <MovieCard 
            movie={movie} 
            isClickable={false}
            onDoubleClick={() => handleCategorizedMovieDoubleClick(movie, category)}
          />
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-16">
            {selectedMovie ? 'Tap to place movie here' : 'Select a movie first'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🎬 Movie Selection
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {isWinner 
            ? "🏆 You won the head-to-head! Select 3 movies for yourself and give 3 to your opponent."
            : "⏳ Waiting for the winner to select movies, then you'll arrange your 3 movies."
          }
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-500 mb-2 space-y-1">
          <p>📱 Tap a movie to select it, then tap a category to move it</p>
          <p>👆 Double-tap a categorized movie to return it to available</p>
        </div>
        {selectedMovie && (
          <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-300 dark:border-blue-600 mt-2">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Selected: {selectedMovie.title}
            </p>
          </div>
        )}
      </div>

      {hasSubmitted ? (
        <div className="text-center">
          <div className="game-card max-w-lg mx-auto">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Selection Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Waiting for other players to complete their selections...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Available Movies */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
              Available Movies
            </h3>
            <div className="min-h-[400px] p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-3">
                {movieSlots.available.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    isSelected={selectedMovie?.id === movie.id}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Category Slots */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CategoryBox
                category="oneWord"
                title="One Word"
                icon="🎯"
                movie={movieSlots.oneWord}
                color="border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
              />
              
              <CategoryBox
                category="dialogue"
                title="Dialogue"
                icon="💬"
                movie={movieSlots.dialogue}
                color="border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
              />
              
              <CategoryBox
                category="actOut"
                title="Act It Out"
                icon="🎭"
                movie={movieSlots.actOut}
                color="border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleSubmitSelection}
                disabled={!isSelectionComplete}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                  isSelectionComplete
                    ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSelectionComplete ? '✅ Confirm Selection' : 'Select Movies for All Categories'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 