// TMDb API Service for fuzzy searching
import { Celebrity, Movie } from './types';
import { getTmdbApiKey, getTmdbBaseUrl } from '../config';

// TMDb API Types
interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
}

interface TMDbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  adult: boolean;
  known_for_department: string;
  known_for: TMDbMovie[];
  popularity: number;
}

interface TMDbMovieSearchResponse {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}

interface TMDbPersonSearchResponse {
  page: number;
  results: TMDbPerson[];
  total_pages: number;
  total_results: number;
}

interface TMDbPersonMovieCredits {
  cast: TMDbMovieCredit[];
  crew: TMDbMovieCredit[];
  id: number;
}

interface TMDbMovieCredit {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  character?: string;
  credit_id: string;
  order?: number;
  department?: string;
  job?: string;
}

interface TMDbMovieCreditsResponse {
  id: number;
  cast: TMDbCastMember[];
  crew: TMDbCrewMember[];
}

interface TMDbCastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

interface TMDbCrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface TMDbSearchResult {
  id: string;
  name: string;
  type: 'actor' | 'movie';
  additionalInfo?: string;
  popularity?: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  celebrityName?: string;
  movieTitle?: string;
}

export class TMDbApi {
  private static readonly BASE_URL = getTmdbBaseUrl();
  private static readonly IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  private static getAuthHeaders() {
    const token = getTmdbApiKey();
    
    return {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    };
  }

  // Search movies using TMDb API
  static async searchMovies(query: string, page: number = 1): Promise<TMDbMovie[]> {
    try {
      const url = `${this.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      const data: TMDbMovieSearchResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }

  // Search people (actors) using TMDb API
  static async searchPeople(query: string, page: number = 1): Promise<TMDbPerson[]> {
    try {
      const url = `${this.BASE_URL}/search/person?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      const data: TMDbPersonSearchResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error searching people:', error);
      throw error;
    }
  }

  // Combined search for both movies and people
  static async searchAll(query: string, limit: number = 10): Promise<TMDbSearchResult[]> {
    try {
      const [movies, people] = await Promise.all([
        this.searchMovies(query),
        this.searchPeople(query)
      ]);

      const results: TMDbSearchResult[] = [];

      // Add movies to results
      movies.forEach(movie => {
        results.push({
          id: movie.id.toString(),
          name: movie.title,
          type: 'movie',
          additionalInfo: movie.poster_path ? `${this.IMAGE_BASE_URL}${movie.poster_path}` : undefined,
          popularity: movie.popularity
        });
      });

      // Add people to results
      people.forEach(person => {
        results.push({
          id: person.id.toString(),
          name: person.name,
          type: 'actor',
          additionalInfo: person.profile_path ? `${this.IMAGE_BASE_URL}${person.profile_path}` : undefined,
          popularity: person.popularity
        });
      });

      // Sort by relevance - exact matches first, then by popularity
      return results.sort((a, b) => {
        // Check for exact matches first
        const aExact = a.name.toLowerCase() === query.toLowerCase();
        const bExact = b.name.toLowerCase() === query.toLowerCase();
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Check for starts with match
        const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Sort by popularity (higher is better)
        return (b.popularity || 0) - (a.popularity || 0);
      }).slice(0, limit);
    } catch (error) {
      console.error('Error in combined search:', error);
      throw error;
    }
  }

  // Search only movies and return in the format expected by the API
  static async searchMoviesOnly(query: string, limit: number = 10): Promise<TMDbSearchResult[]> {
    try {
      const movies = await this.searchMovies(query);
      
      return movies.map(movie => ({
        id: movie.id.toString(),
        name: movie.title,
        type: 'movie' as const,
        additionalInfo: movie.poster_path ? `${this.IMAGE_BASE_URL}${movie.poster_path}` : undefined,
        popularity: movie.popularity
      })).slice(0, limit);
    } catch (error) {
      console.error('Error searching movies only:', error);
      throw error;
    }
  }

  // Search only people and return in the format expected by the API
  static async searchPeopleOnly(query: string, limit: number = 10): Promise<TMDbSearchResult[]> {
    try {
      const people = await this.searchPeople(query);
      
      return people.map(person => ({
        id: person.id.toString(),
        name: person.name,
        type: 'actor' as const,
        additionalInfo: person.profile_path ? `${this.IMAGE_BASE_URL}${person.profile_path}` : undefined,
        popularity: person.popularity
      })).slice(0, limit);
    } catch (error) {
      console.error('Error searching people only:', error);
      throw error;
    }
  }

  // Get movie details by ID
  static async getMovieDetails(movieId: string): Promise<TMDbMovie | null> {
    try {
      const url = `${this.BASE_URL}/movie/${movieId}?language=en-US`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting movie details:', error);
      return null;
    }
  }

  // Get person details by ID
  static async getPersonDetails(personId: string): Promise<TMDbPerson | null> {
    try {
      const url = `${this.BASE_URL}/person/${personId}?language=en-US`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting person details:', error);
      return null;
    }
  }

  // Get movie credits (cast and crew)
  static async getMovieCredits(movieId: string): Promise<TMDbMovieCreditsResponse | null> {
    try {
      const url = `${this.BASE_URL}/movie/${movieId}/credits?language=en-US`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting movie credits:', error);
      return null;
    }
  }



  // Get all cast members from a movie
  static async getMovieCast(movieId: string): Promise<TMDbCastMember[]> {
    try {
      const credits = await this.getMovieCredits(movieId);
      return credits?.cast || [];
    } catch (error) {
      console.error('Error getting movie cast:', error);
      return [];
    }
  }

  // Get all crew members from a movie
  static async getMovieCrew(movieId: string): Promise<TMDbCrewMember[]> {
    try {
      const credits = await this.getMovieCredits(movieId);
      return credits?.crew || [];
    } catch (error) {
      console.error('Error getting movie crew:', error);
      return [];
    }
  }

  // Search for a person by name and get their ID
  static async searchPersonByName(name: string): Promise<TMDbPerson | null> {
    try {
      const url = `${this.BASE_URL}/search/person?query=${encodeURIComponent(name)}&include_adult=false&language=en-US&page=1`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      const data: TMDbPersonSearchResponse = await response.json();
      return data.results.length > 0 ? data.results[0] : null;
    } catch (error) {
      console.error('Error searching person by name:', error);
      return null;
    }
  }

  // Get person's movie credits
  static async getPersonMovieCredits(personId: string): Promise<TMDbPersonMovieCredits | null> {
    try {
      const url = `${this.BASE_URL}/person/${personId}/movie_credits`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting person movie credits:', error);
      return null;
    }
  }

  // Validate if a movie appears in a person's filmography
  static async validateMovieInPersonFilmography(personName: string, movieId: string): Promise<ValidationResult> {
    try {
      // First, search for the person by name
      const person = await this.searchPersonByName(personName);
      
      if (!person) {
        return {
          isValid: false,
          error: `Person "${personName}" not found`,
        };
      }

      // Get the person's movie credits
      const movieCredits = await this.getPersonMovieCredits(person.id.toString());
      
      if (!movieCredits) {
        return {
          isValid: false,
          error: `Movie credits not found for ${person.name}`,
        };
      }

      // Check if the movie appears in cast or crew
      const appearedInCast = movieCredits.cast.some(movie => 
        movie.id.toString() === movieId
      );

      const appearedInCrew = movieCredits.crew.some(movie => 
        movie.id.toString() === movieId
      );

      const isValid = appearedInCast || appearedInCrew;

      if (!isValid) {
        return {
          isValid: false,
          error: `${person.name} did not appear in this movie`,
          celebrityName: person.name,
        };
      }

      return {
        isValid: true,
        celebrityName: person.name,
      };
    } catch (error) {
      console.error('Error validating movie in person filmography:', error);
      return {
        isValid: false,
        error: 'Validation failed due to API error'
      };
    }
  }

  // Convert TMDb movie to our Movie format
  static convertToMovie(tmdbMovie: TMDbMovie): Movie {
    const year = tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : 0;
    return {
      id: tmdbMovie.id.toString(),
      title: tmdbMovie.title,
      year: year && !isNaN(year) ? year : 0,
      poster: tmdbMovie.poster_path ? `${this.IMAGE_BASE_URL}${tmdbMovie.poster_path}` : undefined,
      genre: [], // Would need additional API call for genre names
      language: tmdbMovie.original_language,
      director: undefined, // Would need additional API call
      productionHouse: undefined, // Would need additional API call
      cast: [] // Would need additional API call
    };
  }

  // Convert TMDb person to our Celebrity format
  static convertToCelebrity(tmdbPerson: TMDbPerson): Celebrity {
    return {
      id: tmdbPerson.id.toString(),
      name: tmdbPerson.name,
      popularName: undefined,
      photo: tmdbPerson.profile_path ? `${this.IMAGE_BASE_URL}${tmdbPerson.profile_path}` : undefined,
      birthYear: undefined, // Would need additional API call
      isActive: true // Assume active unless we have death information
    };
  }
} 