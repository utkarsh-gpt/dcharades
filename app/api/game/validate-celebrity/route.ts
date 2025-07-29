import { NextRequest, NextResponse } from 'next/server';
import { FilmiRishtaGameLogic } from '@/lib/filmi-rishta/game-logic';

export async function POST(request: NextRequest) {
  try {
    const { gameId, playerId, celebrityName, previousMovieId } = await request.json();

    if (!gameId || !playerId || !celebrityName || !previousMovieId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // For now, we'll return a mock game state
    // In a real implementation, you'd fetch the actual game state from your database
    const mockGameState = {
      id: gameId,
      players: [{
        id: playerId,
        name: 'Player',
        score: 0,
        currentPath: {
          connections: [],
          totalSteps: 0,
          startCelebrity: { id: '1', name: 'Amitabh Bachchan', isActive: true },
          endCelebrity: { id: '2', name: 'Shah Rukh Khan', isActive: true },
          currentCelebrity: { id: '1', name: 'Amitabh Bachchan', isActive: true },
          isComplete: false,
        },
        isReady: false,
        timeRemaining: 300,
        hintsUsed: 0,
        isActive: true,
      }],
      settings: {
        gameMode: 'solo' as const,
        timeLimit: 300,
        maxHints: 3,
        difficulty: 'medium' as const,
        enableSkip: false,
        pointsPerConnection: 10,
        hintPenalty: 5,
        timeBonusMultiplier: 1.5,
      },
      currentPhase: 'playing' as const,
      currentChallenge: null,
      currentPlayerId: playerId,
      timeRemaining: 300,
      isActive: true,
      isGameStarted: true,
      winner: null,
      leaderboard: [],
      gameHistory: [],
    };

    const result = await FilmiRishtaGameLogic.validateAndAddCelebrity(
      mockGameState,
      playerId,
      celebrityName,
      previousMovieId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating celebrity:', error);
    return NextResponse.json(
      { error: 'Failed to validate celebrity' },
      { status: 500 }
    );
  }
} 