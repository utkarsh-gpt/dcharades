'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MovieSelection from '@/components/MovieSelection';
import MovieRoundGameplay from '@/components/MovieRoundGameplay';
import { BlockbusterGameState, Player, Team } from '@/lib/types';
import { SAMPLE_MOVIE_CARDS } from '@/lib/movies';

export default function MovieDemoPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'selection' | 'gameplay'>('selection');

  // Mock data
  const mockPlayer: Player = {
    id: 'player-1',
    name: 'John Doe',
    isHost: true,
    isReady: true,
    score: 0,
    teamId: 'team-1',
  };

  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Team Alpha',
      players: [mockPlayer],
      score: 5,
      genresGuessed: ['Comedy', 'Action'],
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      players: [{
        id: 'player-2',
        name: 'Jane Smith',
        isHost: false,
        isReady: true,
        score: 0,
        teamId: 'team-2',
      }],
      score: 3,
      genresGuessed: ['Romance', 'Drama'],
    },
  ];

  const mockGameState: BlockbusterGameState = {
    id: 'game-123',
    teams: mockTeams,
    settings: {
      rounds: 3,
      timeLimit: 0,
      movieCategories: ['bollywood'],
      gameType: 'blockbuster',
      maxPlayersPerTeam: 6,
      headToHeadTime: 45,
      movieRoundTime: 60,
    },
    currentPhase: currentView === 'selection' ? 'movie-selection' : 'movie-round',
    headToHead: {
      isActive: false,
      card: null,
      currentPlayers: { teamA: null, teamB: null },
      timeRemaining: 0,
      submissions: [],
      winner: 'player-1', // Mock that player-1 won the head-to-head
      isReady: false,
      countdownActive: false,
      countdownTime: 0,
    },
    movieCards: SAMPLE_MOVIE_CARDS,
    currentPlayerAssignments: {
      'player-1': {
        oneWord: SAMPLE_MOVIE_CARDS[0],
        dialogue: SAMPLE_MOVIE_CARDS[1],
        actOut: SAMPLE_MOVIE_CARDS[2],
      },
      'player-2': {
        oneWord: SAMPLE_MOVIE_CARDS[3],
        dialogue: SAMPLE_MOVIE_CARDS[4],
        actOut: SAMPLE_MOVIE_CARDS[5],
      },
    },
    currentRoundPlayer: 'player-1',
    currentField: 'oneWord',
    timeRemaining: 60,
    isActive: true,
    isGameStarted: true,
    winner: null,
    roundHistory: [],
  };

  const handleMovieSelection = (selectedMovies: { oneWord: string; dialogue: string; actOut: string }) => {
    alert('Movies selected! In a real game, this would be sent to the server.');
  };

  const handleMovieRevealed = (movieId: string, category: 'oneWord' | 'dialogue' | 'actOut') => {
    // Movie revealed
  };

  const handleMovieGuessed = (movieId: string) => {
    // Movie guessed
  };

  const handleSkipMovie = (movieId: string) => {
    // Movie skipped
  };

  const handleRoundComplete = () => {
    alert('Round completed! In a real game, this would switch to the next player.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Home</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Movie Selection Demo
              </h1>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('selection')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'selection'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Movie Selection
              </button>
              <button
                onClick={() => setCurrentView('gameplay')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'gameplay'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Movie Round
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {currentView === 'selection' ? (
          <MovieSelection
            gameState={mockGameState}
            currentPlayer={mockPlayer}
            onMovieSelection={handleMovieSelection}
          />
        ) : (
          <MovieRoundGameplay
            gameState={mockGameState}
            currentPlayer={mockPlayer}
            isCurrentPlayerTurn={true}
            onMovieRevealed={handleMovieRevealed}
            onMovieGuessed={handleMovieGuessed}
            onSkipMovie={handleSkipMovie}
            onRoundComplete={handleRoundComplete}
          />
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Demo Instructions
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            {currentView === 'selection' ? (
              <>
                <p><strong>Movie Selection Phase:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Drag movies from the "Available Movies" panel into the three category boxes</li>
                  <li>You need to assign one movie to each category: One Word, Dialogue, and Act It Out</li>
                  <li>Once all categories are filled, click "Confirm Selection"</li>
                  <li>In the real game, the winner of head-to-head gets 6 movies and chooses 3</li>
                </ul>
              </>
            ) : (
              <>
                <p><strong>Movie Round Gameplay:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Click buttons to reveal movies and give clues to your team</li>
                  <li>Start with "One Word" category, then "Dialogue", then "Act It Out"</li>
                  <li>You have 60 seconds total for your turn</li>
                  <li>After your 3 movies, you can attempt the opponent's movies</li>
                  <li>Click "Guessed" when your team gets it right, or "Skip" to move on</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 