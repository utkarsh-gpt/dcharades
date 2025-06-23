export interface Movie {
  title: string;
  category: 'hollywood' | 'bollywood';
  difficulty: 'easy' | 'medium' | 'hard';
  genre?: string;
}

// Note: Movie data is now stored in the Turso database
// All movie functions have been moved to the server-side database integration
// Client-side movie access should be implemented via API calls when needed