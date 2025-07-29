import { createClient } from '@libsql/client';

// Turso database client
const client = createClient({
  url: process.env.DATABASE_URL || '',
  authToken: process.env.DATABASE_TOKEN || '',
});

// Types for database results
export interface BollywoodActor {
  name: string;
  crew_id: string; // IMDB ID
}

export interface BollywoodMovie {
  title: string;
  imdb_id: string;
  poster_path?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: 'actor' | 'movie';
  additionalInfo?: string;
}

// Search actors with fuzzy matching
export async function searchActors(query: string, limit: number = 10): Promise<BollywoodActor[]> {
  try {
    if (!query.trim()) return [];

    // Use LIKE with wildcards for fuzzy search
    const searchQuery = `%${query.toLowerCase()}%`;
    
    const result = await client.execute({
      sql: `
        SELECT name, crew_id 
        FROM bollywood_crew 
        WHERE LOWER(name) LIKE ? 
        ORDER BY 
          CASE 
            WHEN LOWER(name) = LOWER(?) THEN 1
            WHEN LOWER(name) LIKE LOWER(?) THEN 2
            ELSE 3
          END,
          name ASC
        LIMIT ?
      `,
      args: [searchQuery, query, `${query}%`, limit]
    });

    return result.rows.map(row => ({
      name: row.name as string,
      crew_id: row.crew_id as string,
    }));
  } catch (error) {
    console.error('Error searching actors:', error);
    return [];
  }
}

// Search movies with fuzzy matching
export async function searchMovies(query: string, limit: number = 10): Promise<BollywoodMovie[]> {
  try {
    if (!query.trim()) return [];

    // Use LIKE with wildcards for fuzzy search
    const searchQuery = `%${query.toLowerCase()}%`;
    
    const result = await client.execute({
      sql: `
        SELECT title, imdb_id, poster_path 
        FROM bollywood_movies 
        WHERE LOWER(title) LIKE ? 
        ORDER BY 
          CASE 
            WHEN LOWER(title) = LOWER(?) THEN 1
            WHEN LOWER(title) LIKE LOWER(?) THEN 2
            ELSE 3
          END,
          title ASC
        LIMIT ?
      `,
      args: [searchQuery, query, `${query}%`, limit]
    });

    return result.rows.map(row => ({
      title: row.title as string,
      imdb_id: row.imdb_id as string,
      poster_path: row.poster_path as string || undefined,
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

// Combined search function
export async function searchActorsAndMovies(
  query: string, 
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    const [actors, movies] = await Promise.all([
      searchActors(query, Math.ceil(limit / 2)),
      searchMovies(query, Math.ceil(limit / 2))
    ]);

    const results: SearchResult[] = [];

    // Add actors to results
    actors.forEach(actor => {
      results.push({
        id: actor.crew_id,
        name: actor.name,
        type: 'actor',
      });
    });

    // Add movies to results
    movies.forEach(movie => {
      results.push({
        id: movie.imdb_id,
        name: movie.title,
        type: 'movie',
        additionalInfo: movie.poster_path,
      });
    });

    // Sort by relevance (exact matches first, then partial matches)
    return results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
      const bExact = b.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
      
      if (aExact !== bExact) return aExact - bExact;
      
      // Then by type (actors first)
      if (a.type !== b.type) {
        return a.type === 'actor' ? -1 : 1;
      }
      
      return a.name.localeCompare(b.name);
    }).slice(0, limit);
  } catch (error) {
    console.error('Error in combined search:', error);
    return [];
  }
}

// Get actor by IMDB ID
export async function getActorById(crewId: string): Promise<BollywoodActor | null> {
  try {
    const result = await client.execute({
      sql: 'SELECT name, crew_id FROM bollywood_crew WHERE crew_id = ?',
      args: [crewId]
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      name: row.name as string,
      crew_id: row.crew_id as string,
    };
  } catch (error) {
    console.error('Error getting actor by ID:', error);
    return null;
  }
}

// Get movie by IMDB ID
export async function getMovieById(imdbId: string): Promise<BollywoodMovie | null> {
  try {
    const result = await client.execute({
      sql: 'SELECT title, imdb_id, poster_path FROM bollywood_movies WHERE imdb_id = ?',
      args: [imdbId]
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      title: row.title as string,
      imdb_id: row.imdb_id as string,
      poster_path: row.poster_path as string || undefined,
    };
  } catch (error) {
    console.error('Error getting movie by ID:', error);
    return null;
  }
}

// Get random actors for challenge generation
export async function getRandomActors(count: number = 10): Promise<BollywoodActor[]> {
  try {
    const result = await client.execute({
      sql: "SELECT * FROM popular_crew ORDER BY RANDOM() LIMIT 1;",
      args: [count]
    });

    return result.rows.map(row => ({
      name: row.name as string,
      crew_id: row.crew_id as string,
    }));
  } catch (error) {
    console.error('Error getting random actors:', error);
    return [];
  }
}

// Get random movies
export async function getRandomMovies(count: number = 10): Promise<BollywoodMovie[]> {
  try {
    const result = await client.execute({
      sql: 'SELECT title, imdb_id, poster_path FROM bollywood_movies ORDER BY RANDOM() LIMIT ?',
      args: [count]
    });

    return result.rows.map(row => ({
      title: row.title as string,
      imdb_id: row.imdb_id as string,
      poster_path: row.poster_path as string || undefined,
    }));
  } catch (error) {
    console.error('Error getting random movies:', error);
    return [];
  }
}



// Enhanced search with different search strategies
export async function enhancedSearch(
  query: string,
  type: 'actor' | 'movie' | 'both' = 'both',
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    if (type === 'actor') {
      const actors = await searchActors(query, limit);
      return actors.map(actor => ({
        id: actor.crew_id,
        name: actor.name,
        type: 'actor' as const,
      }));
    }

    if (type === 'movie') {
      const movies = await searchMovies(query, limit);
      return movies.map(movie => ({
        id: movie.imdb_id,
        name: movie.title,
        type: 'movie' as const,
        additionalInfo: movie.poster_path,
      }));
    }

    return await searchActorsAndMovies(query, limit);
  } catch (error) {
    console.error('Error in enhanced search:', error);
    return [];
  }
} 