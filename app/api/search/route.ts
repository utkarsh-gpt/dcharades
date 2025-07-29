import { NextRequest, NextResponse } from 'next/server';
import { TMDbApi } from '@/lib/filmi-rishta/tmdb-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const typeParam = searchParams.get('type') as 'actor' | 'movie' | 'both' | null;
    const limitParam = searchParams.get('limit');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const type = typeParam || 'both';
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    let results;
    
    if (type === 'actor') {
      results = await TMDbApi.searchPeopleOnly(query, limit);
    } else if (type === 'movie') {
      results = await TMDbApi.searchMoviesOnly(query, limit);
    } else {
      results = await TMDbApi.searchAll(query, limit);
    }

    return NextResponse.json({
      success: true,
      results: results
    });
  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
} 