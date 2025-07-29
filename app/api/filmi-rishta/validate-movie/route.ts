import { NextRequest, NextResponse } from 'next/server';
import { TMDbApi } from '@/lib/filmi-rishta/tmdb-api';

export async function POST(request: NextRequest) {
  try {
    const { movieId, celebrityName } = await request.json();

    if (!movieId) {
      return NextResponse.json({
        success: false,
        error: 'Movie ID is required'
      }, { status: 400 });
    }

    console.log(`🔍 Validating movie ${movieId} for celebrity: ${celebrityName}`);

    // Get movie details from TMDb API
    const movieDetails = await TMDbApi.getMovieDetails(movieId);
    if (!movieDetails) {
      console.log(`❌ Movie ${movieId} not found in TMDb`);
      return NextResponse.json({
        success: false,
        error: `Movie ID ${movieId} not found in TMDb. This could be due to an invalid ID or API issues.`
      }, { status: 404 });
    }

    console.log(`✅ Movie found: ${movieDetails.title}`);

    // If celebrity name is provided, validate that they're in the cast
    if (celebrityName) {
      const movieCredits = await TMDbApi.getMovieCredits(movieId);
      if (!movieCredits) {
        console.log(`❌ Could not fetch credits for movie ${movieId}`);
        return NextResponse.json({
          success: false,
          error: 'Could not fetch movie credits'
        }, { status: 500 });
      }

      console.log(`✅ Movie credits fetched. Cast size: ${movieCredits.cast.length}`);

      // Check if celebrity appears in the movie cast
      const isInCast = movieCredits.cast.some(castMember => {
        const castName = castMember.name.toLowerCase();
        const searchName = celebrityName.toLowerCase();
        return castName.includes(searchName) || 
               searchName.includes(castName) ||
               castName === searchName;
      });

      if (!isInCast) {
        console.log(`❌ No match found for "${celebrityName}" in movie cast`);
        return NextResponse.json({
          success: false,
          error: `${celebrityName} is not credited in this movie`
        }, { status: 400 });
      }
    }

    // Convert to Movie format
    const movie = {
      id: movieDetails.id.toString(),
      title: movieDetails.title,
      year: movieDetails.release_date ? parseInt(movieDetails.release_date.split('-')[0]) : 0,
      poster: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : undefined,
      genre: [],
      language: movieDetails.original_language || 'en',
      cast: celebrityName ? [celebrityName] : [],
    };

    console.log(`✅ Movie validation successful: ${movie.title}`);
    return NextResponse.json({
      success: true,
      movie
    });

  } catch (error) {
    console.error('❌ Error validating movie:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate movie'
    }, { status: 500 });
  }
} 