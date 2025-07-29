import { NextRequest, NextResponse } from 'next/server';
import { TMDbApi } from '@/lib/filmi-rishta/tmdb-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'movie';
    const testId = searchParams.get('id') || '550'; // Fight Club as default test

    console.log(`🧪 Testing TMDb API - Type: ${testType}, ID: ${testId}`);

    // Check if API key is configured
    const apiKey = process.env.TMB_READ_ONLY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'TMDb API key not configured',
        message: 'Please set TMB_READ_ONLY environment variable'
      }, { status: 500 });
    }

    console.log('✅ TMDb API key is configured');

    let result;
    if (testType === 'movie') {
      // Test movie details
      result = await TMDbApi.getMovieDetails(testId);
      if (result) {
        return NextResponse.json({
          success: true,
          type: 'movie',
          data: {
            id: result.id,
            title: result.title,
            year: result.release_date ? result.release_date.split('-')[0] : 'Unknown'
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Movie not found',
          message: `Movie ID ${testId} not found in TMDb`
        }, { status: 404 });
      }
    } else if (testType === 'person') {
      // Test person details
      result = await TMDbApi.getPersonDetails(testId);
      if (result) {
        return NextResponse.json({
          success: true,
          type: 'person',
          data: {
            id: result.id,
            name: result.name
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Person not found',
          message: `Person ID ${testId} not found in TMDb`
        }, { status: 404 });
      }
    } else if (testType === 'search') {
      // Test search functionality
      const query = searchParams.get('query') || 'Sholay';
      const movies = await TMDbApi.searchMovies(query, 1);
      const people = await TMDbApi.searchPeople(query, 1);
      
      return NextResponse.json({
        success: true,
        type: 'search',
        data: {
          query,
          moviesFound: movies.length,
          peopleFound: people.length,
          firstMovie: movies[0] ? movies[0].title : null,
          firstPerson: people[0] ? people[0].name : null
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid test type',
      message: 'Use type=movie, type=person, or type=search'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ TMDb API test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'API test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 