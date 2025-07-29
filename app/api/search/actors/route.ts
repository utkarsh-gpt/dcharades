import { NextRequest, NextResponse } from 'next/server';
import { TMDbApi } from '@/lib/filmi-rishta/tmdb-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limitParam = searchParams.get('limit');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const results = await TMDbApi.searchPeopleOnly(query, limit);

    return NextResponse.json({
      success: true,
      actors: results
    });
  } catch (error) {
    console.error('Error searching actors:', error);
    return NextResponse.json(
      { error: 'Failed to search actors' },
      { status: 500 }
    );
  }
} 