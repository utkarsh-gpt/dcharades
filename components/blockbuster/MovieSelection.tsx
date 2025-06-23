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
  const [draggedMovie, setDraggedMovie] = useState<MovieCard | null>(null);

  // Initialize available movies based on head-to-head winner
  useEffect(() => {
    const headToHeadWinner = gameState.headToHead.winner;
    const isWinner = headToHeadWinner === currentPlayer.id;
    
    // Check if current player already has assignments
    const currentAssignment = gameState.currentPlayerAssignments[currentPlayer.id];
    if (currentAssignment) {
      // Player has already made selections, show them
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
        if (winnerAssignment) {
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

  const handleDragStart = (e: React.DragEvent, movie: MovieCard, source: string) => {
    setDraggedMovie(movie);
    e.dataTransfer.setData('text/plain', JSON.stringify({ movie, source }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSlot: 'available' | 'oneWord' | 'dialogue' | 'actOut') => {
    e.preventDefault();
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { movie, source } = data;
    
    if (source === targetSlot) return; // No change needed
    
    const newMovieSlots = { ...movieSlots };
    
    // Remove from source
    if (source === 'available') {
      newMovieSlots.available = newMovieSlots.available.filter(m => m.id !== movie.id);
    } else if (source === 'oneWord') {
      newMovieSlots.oneWord = null;
    } else if (source === 'dialogue') {
      newMovieSlots.dialogue = null;
    } else if (source === 'actOut') {
      newMovieSlots.actOut = null;
    }
    
    // Add to target
    if (targetSlot === 'available') {
      newMovieSlots.available.push(movie);
    } else if (targetSlot === 'oneWord') {
      // If slot is occupied, move existing movie back to available
      if (newMovieSlots.oneWord) {
        newMovieSlots.available.push(newMovieSlots.oneWord);
      }
      newMovieSlots.oneWord = movie;
    } else if (targetSlot === 'dialogue') {
      if (newMovieSlots.dialogue) {
        newMovieSlots.available.push(newMovieSlots.dialogue);
      }
      newMovieSlots.dialogue = movie;
    } else if (targetSlot === 'actOut') {
      if (newMovieSlots.actOut) {
        newMovieSlots.available.push(newMovieSlots.actOut);
      }
      newMovieSlots.actOut = movie;
    }
    
    setMovieSlots(newMovieSlots);
    setDraggedMovie(null);
  };

  const handleSubmitSelection = () => {
    if (!movieSlots.oneWord || !movieSlots.dialogue || !movieSlots.actOut) {
      alert('Please assign a movie to each category!');
      return;
    }

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

  const MovieCard = ({ movie, source, isDraggedOver = false }: { 
    movie: MovieCard; 
    source: string; 
    isDraggedOver?: boolean;
  }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, movie, source)}
      className={`p-3 rounded-lg border cursor-move transition-all hover:shadow-md ${
        isDraggedOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
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

  const DropZone = ({ 
    slotId, 
    title, 
    icon, 
    movie, 
    color 
  }: { 
    slotId: 'available' | 'oneWord' | 'dialogue' | 'actOut';
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
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, slotId)}
        className={`min-h-[200px] p-4 rounded-lg border-2 border-dashed transition-colors ${color}`}
      >
        {movie ? (
          <MovieCard movie={movie} source={slotId} />
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-16">
            Drop a movie here
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
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
          Drag movies into the categories: One Word, Dialogue, and Act It Out
        </p>
        

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
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'available')}
              className="min-h-[400px] p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
            >
              <div className="space-y-3">
                {movieSlots.available.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} source="available" />
                ))}
              </div>
            </div>
          </div>

          {/* Category Slots */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DropZone
                slotId="oneWord"
                title="One Word"
                icon="🎯"
                movie={movieSlots.oneWord}
                color="border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
              />
              
              <DropZone
                slotId="dialogue"
                title="Dialogue"
                icon="💬"
                movie={movieSlots.dialogue}
                color="border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
              />
              
              <DropZone
                slotId="actOut"
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