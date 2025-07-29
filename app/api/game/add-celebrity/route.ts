import { NextRequest, NextResponse } from 'next/server';
import { TMDbApi } from '@/lib/filmi-rishta/tmdb-api';

export async function POST(request: NextRequest) {
  try {
    const { gameId, playerId, celebrityName } = await request.json();
    
    if (!gameId || !playerId || !celebrityName) {
      return NextResponse.json({ 
        error: 'gameId, playerId, and celebrityName are required' 
      }, { status: 400 });
    }

    // Here you would normally get the game state from your game server/database
    // For now, we'll just validate the celebrity selection
    
    // This is a placeholder - in a real implementation, you would:
    // 1. Get the current game state
    // 2. Get the currently selected movie
    // 3. Validate the celebrity appears in that movie
    // 4. Complete the connection and update the game state
    
    return NextResponse.json({
      success: true,
      message: 'Celebrity validation endpoint ready',
      celebrityName: celebrityName,
      playerId: playerId,
      gameId: gameId
    });
  } catch (error) {
    console.error('Error adding celebrity:', error);
    return NextResponse.json(
      { error: 'Failed to add celebrity' },
      { status: 500 }
    );
  }
} 