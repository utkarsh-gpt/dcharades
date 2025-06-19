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
  
  // Bollywood Movies - Easy (50)
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
  { title: "Dhoom", category: "bollywood", difficulty: "easy" },
  { title: "Golmaal", category: "bollywood", difficulty: "easy" },
  { title: "Housefull", category: "bollywood", difficulty: "easy" },
  { title: "Race", category: "bollywood", difficulty: "easy" },
  { title: "Don", category: "bollywood", difficulty: "easy" },
  { title: "Bodyguard", category: "bollywood", difficulty: "easy" },
  { title: "Dabangg", category: "bollywood", difficulty: "easy" },
  { title: "Ready", category: "bollywood", difficulty: "easy" },
  { title: "Wanted", category: "bollywood", difficulty: "easy" },
  { title: "Kick", category: "bollywood", difficulty: "easy" },
  { title: "Tiger Shroff", category: "bollywood", difficulty: "easy" },
  { title: "Happy New Year", category: "bollywood", difficulty: "easy" },
  { title: "Om Shanti Om", category: "bollywood", difficulty: "easy" },
  { title: "Kabhi Khushi Kabhie Gham", category: "bollywood", difficulty: "easy" },
  { title: "Kuch Kuch Hota Hai", category: "bollywood", difficulty: "easy" },
  { title: "Hum Aapke Hain Koun", category: "bollywood", difficulty: "easy" },
  { title: "Raja Hindustani", category: "bollywood", difficulty: "easy" },
  { title: "Baazigar", category: "bollywood", difficulty: "easy" },
  { title: "Darr", category: "bollywood", difficulty: "easy" },
  { title: "Dil To Pagal Hai", category: "bollywood", difficulty: "easy" },
  { title: "Kaho Naa Pyaar Hai", category: "bollywood", difficulty: "easy" },
  { title: "Lagaan", category: "bollywood", difficulty: "easy" },
  { title: "Munna Bhai MBBS", category: "bollywood", difficulty: "easy" },
  { title: "Lage Raho Munna Bhai", category: "bollywood", difficulty: "easy" },
  { title: "Taare Zameen Par", category: "bollywood", difficulty: "easy" },
  { title: "My Name is Khan", category: "bollywood", difficulty: "easy" },
  { title: "Zindagi Na Milegi Dobara", category: "bollywood", difficulty: "easy" },
  { title: "Yeh Jawaani Hai Deewani", category: "bollywood", difficulty: "easy" },
  { title: "Student of the Year", category: "bollywood", difficulty: "easy" },
  { title: "Padmaavat", category: "bollywood", difficulty: "easy" },
  { title: "Bajrangi Bhaijaan", category: "bollywood", difficulty: "easy" },
  { title: "Prem Ratan Dhan Payo", category: "bollywood", difficulty: "easy" },
  { title: "War", category: "bollywood", difficulty: "easy" },
  { title: "Gully Boy", category: "bollywood", difficulty: "easy" },
  { title: "Kabir Singh", category: "bollywood", difficulty: "easy" },
  { title: "URI", category: "bollywood", difficulty: "easy" },
  { title: "Toilet Ek Prem Katha", category: "bollywood", difficulty: "easy" },
  { title: "Jolly LLB", category: "bollywood", difficulty: "easy" },
  { title: "Tanu Weds Manu", category: "bollywood", difficulty: "easy" },
  { title: "Band Baaja Baaraat", category: "bollywood", difficulty: "easy" },

  // Bollywood Movies - Medium (50)
  { title: "Queen", category: "bollywood", difficulty: "medium" },
  { title: "Pink", category: "bollywood", difficulty: "medium" },
  { title: "Article 15", category: "bollywood", difficulty: "medium" },
  { title: "Andhadhun", category: "bollywood", difficulty: "medium" },
  { title: "Tumhari Sulu", category: "bollywood", difficulty: "medium" },
  { title: "Hindi Medium", category: "bollywood", difficulty: "medium" },
  { title: "Bareilly Ki Barfi", category: "bollywood", difficulty: "medium" },
  { title: "Stree", category: "bollywood", difficulty: "medium" },
  { title: "Badhaai Ho", category: "bollywood", difficulty: "medium" },
  { title: "Shubh Mangal Saavdhan", category: "bollywood", difficulty: "medium" },
  { title: "Raazi", category: "bollywood", difficulty: "medium" },
  { title: "Mulk", category: "bollywood", difficulty: "medium" },
  { title: "Piku", category: "bollywood", difficulty: "medium" },
  { title: "October", category: "bollywood", difficulty: "medium" },
  { title: "Kahaani", category: "bollywood", difficulty: "medium" },
  { title: "Vicky Donor", category: "bollywood", difficulty: "medium" },
  { title: "Madras Cafe", category: "bollywood", difficulty: "medium" },
  { title: "Bala", category: "bollywood", difficulty: "medium" },
  { title: "Dream Girl", category: "bollywood", difficulty: "medium" },
  { title: "Badrinath Ki Dulhania", category: "bollywood", difficulty: "medium" },
  { title: "Shubh Mangal Zyada Saavdhan", category: "bollywood", difficulty: "medium" },
  { title: "Chhichhore", category: "bollywood", difficulty: "medium" },
  { title: "Super 30", category: "bollywood", difficulty: "medium" },
  { title: "Mission Mangal", category: "bollywood", difficulty: "medium" },
  { title: "Kesari", category: "bollywood", difficulty: "medium" },
  { title: "Batla House", category: "bollywood", difficulty: "medium" },
  { title: "Saand Ki Aankh", category: "bollywood", difficulty: "medium" },
  { title: "Thappad", category: "bollywood", difficulty: "medium" },
  { title: "Chhapaak", category: "bollywood", difficulty: "medium" },
  { title: "Gunjan Saxena", category: "bollywood", difficulty: "medium" },
  { title: "Shakuntala Devi", category: "bollywood", difficulty: "medium" },
  { title: "Ludo", category: "bollywood", difficulty: "medium" },
  { title: "Dil Bechara", category: "bollywood", difficulty: "medium" },
  { title: "Soorarai Pottru", category: "bollywood", difficulty: "medium" },
  { title: "Scam 1992", category: "bollywood", difficulty: "medium" },
  { title: "Arjun Reddy", category: "bollywood", difficulty: "medium" },
  { title: "Udta Punjab", category: "bollywood", difficulty: "medium" },
  { title: "Kapoor & Sons", category: "bollywood", difficulty: "medium" },
  { title: "Dear Zindagi", category: "bollywood", difficulty: "medium" },
  { title: "Ae Dil Hai Mushkil", category: "bollywood", difficulty: "medium" },
  { title: "Tamasha", category: "bollywood", difficulty: "medium" },
  { title: "Rockstar", category: "bollywood", difficulty: "medium" },
  { title: "Highway", category: "bollywood", difficulty: "medium" },
  { title: "Haider", category: "bollywood", difficulty: "medium" },
  { title: "Mardaani", category: "bollywood", difficulty: "medium" },
  { title: "Mary Kom", category: "bollywood", difficulty: "medium" },
  { title: "Paan Singh Tomar", category: "bollywood", difficulty: "medium" },
  { title: "Ishqiya", category: "bollywood", difficulty: "medium" },
  { title: "Dedh Ishqiya", category: "bollywood", difficulty: "medium" },
  { title: "Lootera", category: "bollywood", difficulty: "medium" },

  // Bollywood Movies - Hard (50)
  { title: "Masaan", category: "bollywood", difficulty: "hard" },
  { title: "Court", category: "bollywood", difficulty: "hard" },
  { title: "Ship of Theseus", category: "bollywood", difficulty: "hard" },
  { title: "The Lunchbox", category: "bollywood", difficulty: "hard" },
  { title: "Aligarh", category: "bollywood", difficulty: "hard" },
  { title: "Neerja", category: "bollywood", difficulty: "hard" },
  { title: "Talvar", category: "bollywood", difficulty: "hard" },
  { title: "Newton", category: "bollywood", difficulty: "hard" },
  { title: "Trapped", category: "bollywood", difficulty: "hard" },
  { title: "Omerta", category: "bollywood", difficulty: "hard" },
  { title: "Mukkabaaz", category: "bollywood", difficulty: "hard" },
  { title: "Daddy", category: "bollywood", difficulty: "hard" },
  { title: "Shahid", category: "bollywood", difficulty: "hard" },
  { title: "Citylights", category: "bollywood", difficulty: "hard" },
  { title: "Ankhon Dekhi", category: "bollywood", difficulty: "hard" },
  { title: "Titli", category: "bollywood", difficulty: "hard" },
  { title: "Margarita with a Straw", category: "bollywood", difficulty: "hard" },
  { title: "Killa", category: "bollywood", difficulty: "hard" },
  { title: "Chauranga", category: "bollywood", difficulty: "hard" },
  { title: "Sairat", category: "bollywood", difficulty: "hard" },
  { title: "Raman Raghav 2.0", category: "bollywood", difficulty: "hard" },
  { title: "Ugly", category: "bollywood", difficulty: "hard" },
  { title: "Byomkesh Bakshi", category: "bollywood", difficulty: "hard" },
  { title: "Detective Byomkesh Bakshy", category: "bollywood", difficulty: "hard" },
  { title: "Haraamkhor", category: "bollywood", difficulty: "hard" },
  { title: "Lipstick Under My Burkha", category: "bollywood", difficulty: "hard" },
  { title: "Rukh", category: "bollywood", difficulty: "hard" },
  { title: "Kadvi Hawa", category: "bollywood", difficulty: "hard" },
  { title: "Village Rockstars", category: "bollywood", difficulty: "hard" },
  { title: "Sir", category: "bollywood", difficulty: "hard" },
  { title: "Gali Guleiyan", category: "bollywood", difficulty: "hard" },
  { title: "Kaamyaab", category: "bollywood", difficulty: "hard" },
  { title: "Eeb Allay Ooo", category: "bollywood", difficulty: "hard" },
  { title: "Jallikattu", category: "bollywood", difficulty: "hard" },
  { title: "The Disciple", category: "bollywood", difficulty: "hard" },
  { title: "Serious Men", category: "bollywood", difficulty: "hard" },
  { title: "Asuran", category: "bollywood", difficulty: "hard" },
  { title: "Kumbakonam Gopals", category: "bollywood", difficulty: "hard" },
  { title: "Peepli Live", category: "bollywood", difficulty: "hard" },
  { title: "Wasseypur", category: "bollywood", difficulty: "hard" },
  { title: "Gangs of Wasseypur", category: "bollywood", difficulty: "hard" },
  { title: "Dev D", category: "bollywood", difficulty: "hard" },
  { title: "Oye Lucky Lucky Oye", category: "bollywood", difficulty: "hard" },
  { title: "A Wednesday", category: "bollywood", difficulty: "hard" },
  { title: "Special 26", category: "bollywood", difficulty: "hard" },
  { title: "Baby", category: "bollywood", difficulty: "hard" },
  { title: "Airlift", category: "bollywood", difficulty: "hard" },
  { title: "Rustom", category: "bollywood", difficulty: "hard" },
  { title: "Akira", category: "bollywood", difficulty: "hard" },
  { title: "Force", category: "bollywood", difficulty: "hard" },
]
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

// Utility function to convert Movie to MovieCard with genre
export function movieToMovieCard(movie: Movie): import('../shared/types').MovieCard {
  // Simple genre assignment based on title/category
  const getGenre = (title: string, category: string): string => {
    if (category === 'hollywood') {
      if (title.includes('Avengers') || title.includes('Spider-Man') || title.includes('Batman') || title.includes('Superman')) return 'Action';
      if (title.includes('Finding Nemo') || title.includes('Frozen') || title.includes('Shrek') || title.includes('Cars')) return 'Animation';
      if (title.includes('Titanic') || title.includes('Forrest Gump')) return 'Romance';
      if (title.includes('The Godfather') || title.includes('Pulp Fiction')) return 'Crime';
      if (title.includes('Inception') || title.includes('The Matrix') || title.includes('Interstellar')) return 'Sci-Fi';
      return 'Drama';
    } else {
      if (title.includes('Sholay') || title.includes('Singham') || title.includes('Dabangg') || title.includes('War')) return 'Action';
      if (title.includes('Dilwale') || title.includes('Kuch Kuch') || title.includes('Dil To Pagal')) return 'Romance';
      if (title.includes('3 Idiots') || title.includes('Golmaal') || title.includes('Housefull')) return 'Comedy';
      if (title.includes('Dangal') || title.includes('Sultan') || title.includes('Bhaag Milkha')) return 'Sports';
      if (title.includes('Lagaan') || title.includes('Mughal')) return 'Historical';
      if (title.includes('Queen') || title.includes('Pink') || title.includes('Article')) return 'Social';
      return 'Drama';
    }
  };

  return {
    id: `movie-${Math.random().toString(36).substr(2, 9)}`,
    title: movie.title,
    genre: getGenre(movie.title, movie.category),
    category: movie.category,
    difficulty: movie.difficulty,
  };
}

// Function to get random movie cards for game
export function getRandomMovieCards(count: number = 6): import('../shared/types').MovieCard[] {
  const randomMovies = [];
  const moviesCopy = [...MOVIES];
  
  for (let i = 0; i < count && moviesCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * moviesCopy.length);
    const movie = moviesCopy.splice(randomIndex, 1)[0];
    randomMovies.push(movieToMovieCard(movie));
  }
  
  return randomMovies;
}

// Sample movie cards for testing (can be removed if not needed)
export const SAMPLE_MOVIE_CARDS: import('../shared/types').MovieCard[] = [
  {
    id: 'movie-1',
    title: '3 Idiots',
    genre: 'Comedy',
    category: 'bollywood',
    difficulty: 'easy',
  },
  {
    id: 'movie-2',
    title: 'Sholay',
    genre: 'Action',
    category: 'bollywood',
    difficulty: 'easy',
  },
  {
    id: 'movie-3',
    title: 'Dilwale Dulhania Le Jayenge',
    genre: 'Romance',
    category: 'bollywood',
    difficulty: 'easy',
  },
  {
    id: 'movie-4',
    title: 'Dangal',
    genre: 'Sports',
    category: 'bollywood',
    difficulty: 'easy',
  },
  {
    id: 'movie-5',
    title: 'Queen',
    genre: 'Comedy',
    category: 'bollywood',
    difficulty: 'medium',
  },
  {
    id: 'movie-6',
    title: 'Andhadhun',
    genre: 'Thriller',
    category: 'bollywood',
    difficulty: 'medium',
  },
]; 