import { 
  Celebrity, 
  Movie, 
  Connection, 
  GamePath, 
  FilmiRishtaPlayer, 
  GameChallenge, 
  FilmiRishtaGameState, 
  FilmiRishtaGameSettings,
  HintData,
  DEFAULT_FILMI_RISHTA_SETTINGS 
} from './types';

export class FilmiRishtaGameLogic {
  
  // Initialize a new game
  public static initializeGame(
    gameId: string,
    players: FilmiRishtaPlayer[],
    settings: FilmiRishtaGameSettings = DEFAULT_FILMI_RISHTA_SETTINGS
  ): FilmiRishtaGameState {
    return {
      id: gameId,
      players: players.map(player => ({
        ...player,
        score: 0,
        currentPath: null,
        isReady: false,
        timeRemaining: settings.timeLimit,
        hintsUsed: 0,
        isActive: false,
      })),
      settings,
      currentPhase: 'lobby',
      currentChallenge: null,
      currentPlayerId: null,
      timeRemaining: settings.timeLimit,
      isActive: false,
      isGameStarted: false,
      winner: null,
      leaderboard: [],
      gameHistory: [],
    };
  }

  // Start a new challenge
  public static startChallenge(
    gameState: FilmiRishtaGameState,
    challenge: GameChallenge,
    playerId: string
  ): FilmiRishtaGameState {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found');

    const newPath: GamePath = {
      connections: [],
      totalSteps: 0,
      startCelebrity: challenge.startCelebrity,
      endCelebrity: challenge.endCelebrity,
      currentCelebrity: challenge.startCelebrity,
      isComplete: false,
    };

    return {
      ...gameState,
      currentChallenge: challenge,
      currentPlayerId: playerId,
      currentPhase: 'playing',
      timeRemaining: gameState.settings.timeLimit,
      isActive: true,
      players: gameState.players.map(p => 
        p.id === playerId 
          ? { ...p, currentPath: newPath, isActive: true, timeRemaining: gameState.settings.timeLimit }
          : { ...p, isActive: false }
      ),
    };
  }

  // Step 1: Validate and add a movie connected to the current celebrity
  public static async validateAndAddMovie(
    gameState: FilmiRishtaGameState,
    playerId: string,
    movieId: string
  ): Promise<{ success: boolean; error?: string; movie?: Movie }> {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.currentPath) {
      return { success: false, error: 'Player or path not found' };
    }

    try {
      console.log(`🔍 Validating movie ${movieId} for celebrity: ${player.currentPath.currentCelebrity.name}`);

      // Call the API route instead of directly using TMDb API
      const response = await fetch('/api/filmi-rishta/validate-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          celebrityName: player.currentPath.currentCelebrity.name
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.log(`❌ Movie validation failed: ${result.error}`);
        return { success: false, error: result.error };
      }

      console.log(`✅ Movie validation successful: ${result.movie.title}`);
      return { success: true, movie: result.movie };
    } catch (error) {
      console.error('❌ Error validating movie:', error);
      return { success: false, error: 'Failed to validate movie' };
    }
  }

  // Step 2: Validate and add a celebrity connected to the previous movie
  public static async validateAndAddCelebrity(
    gameState: FilmiRishtaGameState,
    playerId: string,
    celebrityName: string,
    previousMovieId: string
  ): Promise<{ success: boolean; error?: string; celebrity?: Celebrity }> {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.currentPath) {
      return { success: false, error: 'Player or path not found' };
    }

    try {
      console.log(`🔍 Validating celebrity "${celebrityName}" for movie ${previousMovieId}`);

      // Call the API route instead of directly using TMDb API
      const response = await fetch('/api/filmi-rishta/validate-celebrity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          celebrityName,
          movieId: previousMovieId
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.log(`❌ Celebrity validation failed: ${result.error}`);
        return { success: false, error: result.error };
      }

      console.log(`✅ Celebrity validation successful: ${result.celebrity.name}`);
      return { success: true, celebrity: result.celebrity };
    } catch (error) {
      console.error('❌ Error validating celebrity:', error);
      return { success: false, error: 'Failed to validate celebrity' };
    }
  }

  // Add a complete connection (movie + celebrity) to the path
  public static addConnectionToPath(
    gameState: FilmiRishtaGameState,
    playerId: string,
    movie: Movie,
    celebrity: Celebrity
  ): FilmiRishtaGameState {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.currentPath) {
      throw new Error('Player or path not found');
    }

    // Create the connection
    const connection: Connection = {
      from: player.currentPath.currentCelebrity,
      to: celebrity,
      via: movie,
      type: 'co-starred',
    };

    // Update the path
    const updatedPath: GamePath = {
      ...player.currentPath,
      connections: [...player.currentPath.connections, connection],
      totalSteps: player.currentPath.totalSteps + 1,
      currentCelebrity: celebrity,
      isComplete: celebrity.id === player.currentPath.endCelebrity.id,
    };

    // Check if game is complete
    let updatedGameState: FilmiRishtaGameState = { 
      ...gameState,
      currentPhase: updatedPath.isComplete ? 'completed' : 'playing',
    };
    
    let finalScore = player.score;
    if (updatedPath.isComplete) {
      // Calculate final score
      const baseScore = 1000;
      const stepPenalty = updatedPath.totalSteps * 50;
      const timePenalty = Math.max(0, (gameState.settings.timeLimit - player.timeRemaining) * 2);
      finalScore = Math.max(100, baseScore - stepPenalty - timePenalty);
      
      // Mark game as complete
      updatedGameState.isActive = false;
      updatedGameState.winner = { ...player, score: finalScore };
    }

    // Update player
    const updatedPlayers = gameState.players.map(p =>
      p.id === playerId
        ? { ...p, currentPath: updatedPath, score: updatedPath.isComplete ? finalScore : p.score }
        : p
    );

    return {
      ...updatedGameState,
      players: updatedPlayers,
    };
  }

  // Generate a random challenge
  public static async generateChallenge(
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GameChallenge> {
    try {
      // For now, use some popular Bollywood actors as examples
      // In a real implementation, you'd want to have a curated list or algorithm
      const popularActors = [
        'Amitabh Bachchan',
        'Shah Rukh Khan',
        'Aamir Khan',
        'Salman Khan',
        'Deepika Padukone',
        'Priyanka Chopra',
        'Alia Bhatt',
        'Ranbir Kapoor',
        'Hrithik Roshan',
        'Katrina Kaif'
      ];

      // Randomly select two different actors
      const shuffled = [...popularActors].sort(() => 0.5 - Math.random());
      const startCelebrityName = shuffled[0];
      const endCelebrityName = shuffled[1];

      // Get celebrity details using API routes
      const startResponse = await fetch(`/api/search/actors?query=${encodeURIComponent(startCelebrityName)}`);
      const endResponse = await fetch(`/api/search/actors?query=${encodeURIComponent(endCelebrityName)}`);
      
      const startResult = await startResponse.json();
      const endResult = await endResponse.json();

      if (!startResult.success || !endResult.success || !startResult.actors.length || !endResult.actors.length) {
        throw new Error('Failed to fetch celebrity details');
      }

      const startCelebrity = startResult.actors[0];
      const endCelebrity = endResult.actors[0];

      return {
        id: `challenge_${Date.now()}`,
        startCelebrity,
        endCelebrity,
        difficulty,
        minimumSteps: 2, // Default minimum
        category: 'same-era',
      };
    } catch (error) {
      console.error('Error generating challenge:', error);
      throw error;
    }
  }

  // Search movies using TMDb API
  public static async searchMovies(query: string): Promise<Movie[]> {
    try {
      const response = await fetch(`/api/search/movies?query=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        return result.movies;
      } else {
        console.error('Error searching movies:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }

  // Search celebrities using TMDb API
  public static async searchCelebrities(query: string): Promise<Celebrity[]> {
    try {
      const response = await fetch(`/api/search/actors?query=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        return result.actors;
      } else {
        console.error('Error searching celebrities:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Error searching celebrities:', error);
      return [];
    }
  }

  // Check if game is over
  public static isGameOver(gameState: FilmiRishtaGameState): boolean {
    return gameState.currentPhase === 'completed' || 
           gameState.currentPhase === 'game-over' ||
           (gameState.settings.timeLimit > 0 && gameState.timeRemaining <= 0);
  }

  // End the game
  public static endGame(gameState: FilmiRishtaGameState): FilmiRishtaGameState {
    return {
      ...gameState,
      currentPhase: 'game-over',
      isActive: false,
    };
  }

  // Update timer
  public static updateTimer(gameState: FilmiRishtaGameState, elapsedSeconds: number): FilmiRishtaGameState {
    if (gameState.settings.timeLimit <= 0) return gameState;

    const newTimeRemaining = Math.max(0, gameState.timeRemaining - elapsedSeconds);
    
    return {
      ...gameState,
      timeRemaining: newTimeRemaining,
      currentPhase: newTimeRemaining <= 0 ? 'game-over' : gameState.currentPhase,
      isActive: newTimeRemaining > 0,
    };
  }
} 