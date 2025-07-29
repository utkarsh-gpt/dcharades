'use client';

import { useState } from 'react';
import { FilmiRishtaGameState, FilmiRishtaPlayer, Movie, Celebrity } from '@/lib/filmi-rishta/types';
import { FilmiRishtaGameLogic } from '@/lib/filmi-rishta/game-logic';
import Timer from '@/components/shared/Timer';
import SearchComponent from './SearchComponent';
import React from 'react'; // Added for useEffect

interface FilmiRishtaGameplayProps {
  gameState: FilmiRishtaGameState;
  currentPlayer: FilmiRishtaPlayer;
  onMovieValidated: (movie: Movie) => void;
  onCelebrityValidated: (celebrity: Celebrity) => void;
  onRequestHint: (hintType: string) => void;
  onSkipChallenge: () => void;
  onLeaveGame: () => void;
  onNewChallenge: () => void;
}

export default function FilmiRishtaGameplay({
  gameState,
  currentPlayer,
  onMovieValidated,
  onCelebrityValidated,
  onRequestHint,
  onSkipChallenge,
  onLeaveGame,
  onNewChallenge,
}: FilmiRishtaGameplayProps) {
  const [currentStep, setCurrentStep] = useState<'movie' | 'celebrity'>('movie');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [movieInput, setMovieInput] = useState('');
  const [celebrityInput, setCelebrityInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [endCelebrityId, setEndCelebrityId] = useState<string | null>(null);

  const handleTryAgain = () => {
    setGameEnded(false);
    setSelectedMovie(null);
    setSelectedCelebrity(null);
    setMovieInput('');
    setCelebrityInput('');
    setCurrentStep('movie');
    setValidationError(null);
    setEndCelebrityId(null);
    onNewChallenge(); // Start a new challenge
  };

  // Search for the end celebrity ID to ensure proper comparison
  const searchEndCelebrityId = async (celebrityName: string) => {
    try {
      const response = await fetch(`/api/search/actors?query=${encodeURIComponent(celebrityName)}`);
      const result = await response.json();
      
      if (result.success && result.actors.length > 0) {
        const searchedId = result.actors[0].id;
        setEndCelebrityId(searchedId);
        return searchedId;
      }
    } catch (error) {
      console.error('Error searching for end celebrity ID:', error);
    }
    return null;
  };

  const challenge = gameState.currentChallenge;
  const path = currentPlayer.currentPath;
  const isMyTurn = currentPlayer.id === gameState.currentPlayerId;

  // Search for end celebrity ID when component mounts or end celebrity changes
  React.useEffect(() => {
    if (path?.endCelebrity?.name && !endCelebrityId) {
      searchEndCelebrityId(path.endCelebrity.name);
    }
  }, [path?.endCelebrity?.name, endCelebrityId]);

  if (!challenge || !path) {
    return (
      <div className="text-center text-white">
        <p>Loading challenge...</p>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-3xl font-bold text-green-300 mb-4">Game Over!</h2>
        <p className="text-lg text-white mb-2">
          You connected <span className="font-semibold">{challenge.startCelebrity.name}</span> to <span className="font-semibold">{challenge.endCelebrity.name}</span> in <span className="font-bold text-yellow-300">{path.totalSteps}</span> steps!
        </p>
        <button
          onClick={handleTryAgain}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handleMovieSelect = async (movieId: string, movieTitle: string) => {
    if (!isMyTurn || isValidating) return;

    // Store the selected movie for validation
    setSelectedMovie({
      id: movieId,
      title: movieTitle,
      year: 0,
      genre: [],
      language: 'en',
      cast: []
    });
  };

  const handleMovieGuess = async () => {
    if (!selectedMovie || !isMyTurn || isValidating) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await FilmiRishtaGameLogic.validateAndAddMovie(
        gameState,
        currentPlayer.id,
        selectedMovie.id
      );

      if (result.success && result.movie) {
        setSelectedMovie(result.movie);
        setCurrentStep('celebrity');
        onMovieValidated(result.movie);
      } else {
        setValidationError(result.error || 'Failed to validate movie');
      }
    } catch (error) {
      setValidationError('An error occurred while validating the movie');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCelebritySelect = async (celebrityId: string, celebrityName: string) => {
    if (!isMyTurn || isValidating || !selectedMovie) return;

    // Store the selected celebrity for validation
    setSelectedCelebrity({
      id: celebrityId,
      name: celebrityName,
      isActive: true
    });
  };

  const handleCelebrityGuess = async () => {
    if (!selectedCelebrity || !selectedMovie || !isMyTurn || isValidating) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await FilmiRishtaGameLogic.validateAndAddCelebrity(
        gameState,
        currentPlayer.id,
        selectedCelebrity.name,
        selectedMovie.id
      );

      if (result.success && result.celebrity) {
        const isEndCelebrity = endCelebrityId && result.celebrity.id === endCelebrityId;
        
        if (isEndCelebrity) {
          setValidationError(
            `🎉 Congratulations! You've successfully connected to ${path.endCelebrity.name}!`
          );
          setGameEnded(true);
          onCelebrityValidated(result.celebrity);
          return;
        }
        
        onCelebrityValidated(result.celebrity);
        
        // Reset for next step and continue alternating
        setSelectedMovie(null);
        setSelectedCelebrity(null);
        setMovieInput('');
        setCelebrityInput('');
        setCurrentStep('movie');
      } else {
        setValidationError(result.error || 'Failed to validate celebrity');
      }
    } catch (error) {
      setValidationError('An error occurred while validating the celebrity');
    } finally {
      setIsValidating(false);
    }
  };

  const handleBackToMovieSelection = () => {
    setSelectedMovie(null);
    setCelebrityInput('');
    setCurrentStep('movie');
    setValidationError(null);
  };

  const handleHintRequest = (hintType: string) => {
    onRequestHint(hintType);
    setShowHints(false);
  };

  const canUseHints = currentPlayer.hintsUsed < gameState.settings.maxHints;

  // Determine if we're in the final step (trying to reach end celebrity)
  const isFinalStep = path.currentCelebrity.id === path.endCelebrity.id;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Challenge Info */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Challenge</h3>
            
            {/* Start & End Celebrities */}
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="text-sm text-green-200 mb-1">Start</div>
                <div className="text-lg font-semibold text-white">
                  {challenge.startCelebrity.name}
                </div>
                {challenge.startCelebrity.photo && (
                  <img 
                    src={challenge.startCelebrity.photo} 
                    alt={challenge.startCelebrity.name}
                    className="w-16 h-16 rounded-full object-cover mt-2"
                  />
                )}
              </div>

              <div className="text-center text-gray-400">
                <div className="text-2xl">⬇️</div>
                <div className="text-sm">Connect through movies</div>
              </div>

              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="text-sm text-red-200 mb-1">Target</div>
                <div className="text-lg font-semibold text-white">
                  {challenge.endCelebrity.name}
                </div>
                {challenge.endCelebrity.photo && (
                  <img 
                    src={challenge.endCelebrity.photo} 
                    alt={challenge.endCelebrity.name}
                    className="w-16 h-16 rounded-full object-cover mt-2"
                  />
                )}
              </div>
            </div>

            {/* Challenge Info */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Difficulty:</span>
                <span className="text-white capitalize">{challenge.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Min Steps:</span>
                <span className="text-white">{challenge.minimumSteps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Your Steps:</span>
                <span className="text-white">{path.totalSteps}</span>
              </div>
            </div>

            {/* Timer */}
            {gameState.settings.timeLimit > 0 && (
              <div className="mt-6">
                <Timer 
                  timeRemaining={gameState.timeRemaining}
                  totalTime={gameState.settings.timeLimit}
                  isActive={gameState.isActive}
                />
              </div>
            )}
          </div>

          {/* Player Stats */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Your Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Score:</span>
                <span className="text-white">{currentPlayer.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Hints Used:</span>
                <span className="text-white">{currentPlayer.hintsUsed}/{gameState.settings.maxHints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Current Celebrity:</span>
                <span className="text-white">{path.currentCelebrity.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Game Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {currentStep === 'movie' ? 'Select Movie' : 'Select Celebrity'}
              </h3>
              <div className="text-sm text-gray-300">
                From: <span className="text-white">{path.currentCelebrity.name}</span>
                {isFinalStep && (
                  <span className="ml-2 text-yellow-300">(Final Step!)</span>
                )}
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 'movie' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {path.connections.length + 1}
                </div>
                <div className="w-16 h-0.5 bg-gray-600"></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 'celebrity' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {path.connections.length + 2}
                </div>
              </div>
            </div>

            {/* Connection Path Display */}
            {path.connections.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Your Path</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {path.connections.map((connection, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-blue-300">{connection.from.name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-yellow-300">{connection.via.title}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-300">{connection.to.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Error or Success Message */}
            {validationError && (
              <div className={`mb-4 p-3 ${
                validationError.includes('Congratulations')
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-red-500/20 border border-red-500/50'
              } rounded-lg`}>
                <p className={`text-sm ${
                  validationError.includes('Congratulations')
                    ? 'text-green-200'
                    : 'text-red-200'
                }`}>{validationError}</p>
              </div>
            )}

            {/* Current Step Interface */}
            <div className="space-y-4">
              {currentStep === 'movie' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Step {path.connections.length + 1}: Select a Movie
                  </label>
                  <p className="text-sm text-gray-400 mb-3">
                    Choose a movie featuring {path.currentCelebrity.name}
                    {isFinalStep && (
                      <span className="text-yellow-300"> (to reach {path.endCelebrity.name})</span>
                    )}
                  </p>
                  <SearchComponent
                    onSelect={(result) => handleMovieSelect(result.id, result.name)}
                    placeholder={`Search for a movie featuring ${path.currentCelebrity.name}`}
                    searchType="movie"
                    disabled={!isMyTurn || isValidating}
                    value={movieInput}
                    onChange={setMovieInput}
                  />
                  
                  {/* Selected Movie Display */}
                  {selectedMovie && (
                    <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        {selectedMovie.poster && (
                          <img 
                            src={selectedMovie.poster} 
                            alt={selectedMovie.title}
                            className="w-32 h-48 object-cover rounded-lg shadow-lg"
                          />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-blue-200">Selected Movie:</p>
                          <p className="text-xl text-white">{selectedMovie.title}</p>
                          {selectedMovie.year && (
                            <p className="text-sm text-blue-300 mt-1">({selectedMovie.year})</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Guess Button */}
                  {selectedMovie && (
                    <button
                      onClick={handleMovieGuess}
                      disabled={!isMyTurn || isValidating}
                      className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isValidating ? 'Validating...' : 'Guess Movie'}
                    </button>
                  )}
                  
                  {isValidating && (
                    <div className="mt-2 text-blue-300 text-sm">
                      Validating movie...
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'celebrity' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Step {path.connections.length + 2}: Select a Celebrity
                  </label>
                  <p className="text-sm text-gray-400 mb-3">
                    Choose a celebrity who appeared in the selected movie
                    {isFinalStep && (
                      <span className="text-yellow-300"> (aiming for {path.endCelebrity.name})</span>
                    )}
                  </p>
                  {selectedMovie && (
                    <div className="mb-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        {selectedMovie.poster && (
                          <img 
                            src={selectedMovie.poster} 
                            alt={selectedMovie.title}
                            className="w-32 h-48 object-cover rounded-lg shadow-lg"
                          />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-blue-200">Selected Movie:</p>
                          <p className="text-xl text-white">{selectedMovie.title}</p>
                          {selectedMovie.year && (
                            <p className="text-sm text-blue-300 mt-1">({selectedMovie.year})</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <SearchComponent
                    onSelect={(result) => handleCelebritySelect(result.id, result.name)}
                    placeholder="Search for a celebrity in this movie"
                    searchType="actor"
                    disabled={!isMyTurn || isValidating}
                    value={celebrityInput}
                    onChange={setCelebrityInput}
                  />
                  
                  {/* Selected Celebrity Display */}
                  {selectedCelebrity && (
                    <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        {selectedCelebrity.photo && (
                          <img 
                            src={selectedCelebrity.photo} 
                            alt={selectedCelebrity.name}
                            className="w-32 h-48 object-cover rounded-lg shadow-lg"
                          />
                        )}
                        <div>
                          <p className="text-lg font-semibold text-green-200">Selected Celebrity:</p>
                          <p className="text-xl text-white">{selectedCelebrity.name}</p>
                          {selectedCelebrity.popularName && (
                            <p className="text-sm text-green-300 mt-1">({selectedCelebrity.popularName})</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Guess Button */}
                  {selectedCelebrity && (
                    <button
                      onClick={handleCelebrityGuess}
                      disabled={!isMyTurn || isValidating}
                      className="w-full mt-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isValidating ? 'Validating...' : 'Guess Celebrity'}
                    </button>
                  )}
                  
                  {isValidating && (
                    <div className="mt-2 text-blue-300 text-sm">
                      Validating celebrity...
                    </div>
                  )}
                  
                  <button
                    onClick={handleBackToMovieSelection}
                    className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Back to Movie Selection
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-3">
                {canUseHints && (
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Hints ({gameState.settings.maxHints - currentPlayer.hintsUsed})
                  </button>
                )}
                {gameState.settings.enableSkip && (
                  <button
                    onClick={onSkipChallenge}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Skip Challenge
                  </button>
                )}
              </div>
              
              <button
                onClick={onLeaveGame}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Game
              </button>
            </div>

            {/* Hints Panel */}
            {showHints && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-200 mb-3">Available Hints</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleHintRequest('movie-genre')}
                    className="block w-full text-left px-3 py-2 bg-yellow-600/50 text-white rounded hover:bg-yellow-600/70 transition-colors"
                  >
                    Movie Genre Hint
                  </button>
                  <button
                    onClick={() => handleHintRequest('movie-year')}
                    className="block w-full text-left px-3 py-2 bg-yellow-600/50 text-white rounded hover:bg-yellow-600/70 transition-colors"
                  >
                    Movie Year Hint
                  </button>
                  <button
                    onClick={() => handleHintRequest('common-costar')}
                    className="block w-full text-left px-3 py-2 bg-yellow-600/50 text-white rounded hover:bg-yellow-600/70 transition-colors"
                  >
                    Common Co-star Hint
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 