export interface Movie {
  title: string;
  category: 'hollywood' | 'bollywood';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const MOVIES: Movie[] = [
  // Hollywood Movies - Easy
  { title: "Titanic", category: "hollywood", difficulty: "easy" },
  { title: "Avatar", category: "hollywood", difficulty: "easy" },
  { title: "The Lion King", category: "hollywood", difficulty: "easy" },
  { title: "Finding Nemo", category: "hollywood", difficulty: "easy" },
  { title: "Spider-Man", category: "hollywood", difficulty: "easy" },
  { title: "Batman", category: "hollywood", difficulty: "easy" },
  { title: "Superman", category: "hollywood", difficulty: "easy" },
  { title: "Frozen", category: "hollywood", difficulty: "easy" },
  { title: "Shrek", category: "hollywood", difficulty: "easy" },
  { title: "Cars", category: "hollywood", difficulty: "easy" },
  
  // Hollywood Movies - Medium
  { title: "The Shawshank Redemption", category: "hollywood", difficulty: "medium" },
  { title: "The Godfather", category: "hollywood", difficulty: "medium" },
  { title: "Pulp Fiction", category: "hollywood", difficulty: "medium" },
  { title: "The Dark Knight", category: "hollywood", difficulty: "medium" },
  { title: "Forrest Gump", category: "hollywood", difficulty: "medium" },
  { title: "Inception", category: "hollywood", difficulty: "medium" },
  { title: "The Matrix", category: "hollywood", difficulty: "medium" },
  { title: "Jurassic Park", category: "hollywood", difficulty: "medium" },
  { title: "Star Wars", category: "hollywood", difficulty: "medium" },
  { title: "The Avengers", category: "hollywood", difficulty: "medium" },
  
  // Hollywood Movies - Hard
  { title: "The Prestige", category: "hollywood", difficulty: "hard" },
  { title: "Memento", category: "hollywood", difficulty: "hard" },
  { title: "Shutter Island", category: "hollywood", difficulty: "hard" },
  { title: "Interstellar", category: "hollywood", difficulty: "hard" },
  { title: "The Departed", category: "hollywood", difficulty: "hard" },
  { title: "No Country for Old Men", category: "hollywood", difficulty: "hard" },
  { title: "There Will Be Blood", category: "hollywood", difficulty: "hard" },
  { title: "The Social Network", category: "hollywood", difficulty: "hard" },
  { title: "Whiplash", category: "hollywood", difficulty: "hard" },
  { title: "Parasite", category: "hollywood", difficulty: "hard" },
  
  // Bollywood Movies - Easy
  { title: "Sholay", category: "bollywood", difficulty: "easy" },
  { title: "Dilwale Dulhania Le Jayenge", category: "bollywood", difficulty: "easy" },
  { title: "3 Idiots", category: "bollywood", difficulty: "easy" },
  { title: "Dangal", category: "bollywood", difficulty: "easy" },
  { title: "Baahubali", category: "bollywood", difficulty: "easy" },
  { title: "PK", category: "bollywood", difficulty: "easy" },
  { title: "Sultan", category: "bollywood", difficulty: "easy" },
  { title: "Singham", category: "bollywood", difficulty: "easy" },
  { title: "Chennai Express", category: "bollywood", difficulty: "easy" },
  { title: "Krrish", category: "bollywood", difficulty: "easy" },
  
  // Bollywood Movies - Medium
  { title: "Zindagi Na Milegi Dobara", category: "bollywood", difficulty: "medium" },
  { title: "Queen", category: "bollywood", difficulty: "medium" },
  { title: "Pink", category: "bollywood", difficulty: "medium" },
  { title: "Article 15", category: "bollywood", difficulty: "medium" },
  { title: "Andhadhun", category: "bollywood", difficulty: "medium" },
  { title: "Tumhari Sulu", category: "bollywood", difficulty: "medium" },
  { title: "Hindi Medium", category: "bollywood", difficulty: "medium" },
  { title: "Bareilly Ki Barfi", category: "bollywood", difficulty: "medium" },
  { title: "Stree", category: "bollywood", difficulty: "medium" },
  { title: "Badhaai Ho", category: "bollywood", difficulty: "medium" },
  
  // Bollywood Movies - Hard
  { title: "Tumhari Sulu", category: "bollywood", difficulty: "hard" },
  { title: "Masaan", category: "bollywood", difficulty: "hard" },
  { title: "Court", category: "bollywood", difficulty: "hard" },
  { title: "Ship of Theseus", category: "bollywood", difficulty: "hard" },
  { title: "The Lunchbox", category: "bollywood", difficulty: "hard" },
  { title: "Kapoor & Sons", category: "bollywood", difficulty: "hard" },
  { title: "Aligarh", category: "bollywood", difficulty: "hard" },
  { title: "Neerja", category: "bollywood", difficulty: "hard" },
  { title: "Talvar", category: "bollywood", difficulty: "hard" },
  { title: "October", category: "bollywood", difficulty: "hard" },
];

export function getRandomMovie(): Movie {
  const randomIndex = Math.floor(Math.random() * MOVIES.length);
  return MOVIES[randomIndex];
}

export function getMoviesByCategory(category: 'hollywood' | 'bollywood'): Movie[] {
  return MOVIES.filter(movie => movie.category === category);
}

export function getMoviesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Movie[] {
  return MOVIES.filter(movie => movie.difficulty === difficulty);
} 