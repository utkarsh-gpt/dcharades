import { NextRequest, NextResponse } from 'next/server';
import { TMDbApi } from '@/lib/filmi-rishta/tmdb-api';

export async function POST(request: NextRequest) {
  try {
    const { celebrityName, movieId } = await request.json();

    if (!celebrityName) {
      return NextResponse.json({
        success: false,
        error: 'Celebrity name is required'
      }, { status: 400 });
    }

    console.log(`🔍 Validating celebrity "${celebrityName}" for movie ${movieId}`);

    // Search for the celebrity
    const celebrityDetails = await TMDbApi.searchPersonByName(celebrityName);
    if (!celebrityDetails) {
      console.log(`❌ Celebrity "${celebrityName}" not found in TMDb`);
      return NextResponse.json({
        success: false,
        error: 'Celebrity not found'
      }, { status: 404 });
    }

    console.log(`✅ Celebrity found: ${celebrityDetails.name}`);

    // If movie ID is provided, validate that celebrity is in the cast
    if (movieId) {
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
          error: `${celebrityName} is not credited in the selected movie`
        }, { status: 400 });
      }
    }

    // Convert to Celebrity format
    const celebrity = {
      id: celebrityDetails.id.toString(),
      name: celebrityDetails.name,
      photo: celebrityDetails.profile_path ? `https://image.tmdb.org/t/p/w500${celebrityDetails.profile_path}` : undefined,
      isActive: true,
    };

    console.log(`✅ Celebrity validation successful: ${celebrity.name}`);
    return NextResponse.json({
      success: true,
      celebrity
    });

  } catch (error) {
    console.error('❌ Error validating celebrity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate celebrity'
    }, { status: 500 });
  }
} 