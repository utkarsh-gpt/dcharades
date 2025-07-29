import { NextRequest, NextResponse } from 'next/server';
import { TMDbApi } from '@/lib/filmi-rishta/tmdb-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Only support new validation format (celebrityName, movieId)
    if (body.celebrityName && body.movieId) {
      // New validation approach: check if movie appears in person's filmography
      const result = await TMDbApi.validateMovieInPersonFilmography(body.celebrityName, body.movieId);

      return NextResponse.json({
        success: true,
        isValid: result.isValid,
        error: result.error,
        celebrityName: result.celebrityName,
        validationMethod: 'filmography'
      });
    } else {
      return NextResponse.json({ 
        error: 'celebrityName and movieId are required' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error validating connection:', error);
    return NextResponse.json(
      { error: 'Failed to validate connection' },
      { status: 500 }
    );
  }
} 