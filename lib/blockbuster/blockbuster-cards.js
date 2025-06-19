// CommonJS version of blockbuster-cards for Node.js server

const HEAD_TO_HEAD_CARDS = [
  // Sports Movies
  {
    id: 'sports-1',
    category: 'Sports Movies',
    description: 'Name Bollywood movies about sports',
    examples: []
  },
  
  // Romance Movies
  {
    id: 'romance-1',
    category: 'Romance Movies',
    description: 'Name Bollywood romantic movies',
    examples: []
  },
  
  // Action Movies
  {
    id: 'action-1',
    category: 'Action Movies',
    description: 'Name Bollywood action movies',
    examples: []
  },
  
  // Comedy Movies
  {
    id: 'comedy-1',
    category: 'Comedy Movies',
    description: 'Name Bollywood comedy movies',
    examples: []
  },
  
  // Movies with Specific Actors
  {
    id: 'shahrukh-1',
    category: 'Shah Rukh Khan Movies',
    description: 'Name movies starring Shah Rukh Khan',
    examples: []
  },
  
  {
    id: 'salman-1',
    category: 'Salman Khan Movies',
    description: 'Name movies starring Salman Khan',
    examples: []
  },
  
  {
    id: 'aamir-1',
    category: 'Aamir Khan Movies',
    description: 'Name movies starring Aamir Khan',
    examples: []
  },
  
  {
    id: 'ranbir-1',
    category: 'Ranbir Kapoor Movies',
    description: 'Name movies starring Ranbir Kapoor',
    examples: []
  },
  
  {
    id: 'deepika-1',
    category: 'Deepika Padukone Movies',
    description: 'Name movies starring Deepika Padukone',
    examples: []
  },
  
  {
    id: 'priyanka-1',
    category: 'Priyanka Chopra Movies',
    description: 'Name movies starring Priyanka Chopra',
    examples: []
  },
  
  // Family Movies
  {
    id: 'family-1',
    category: 'Family Movies',
    description: 'Name Bollywood family movies',
    examples: []
  },
  
  // Movies about Breakups
  {
    id: 'breakup-1',
    category: 'Movies with Breakups',
    description: 'Name movies that feature breakups or separations',
    examples: []
  },
  
  // School/College Movies
  {
    id: 'school-1',
    category: 'School/College Movies',
    description: 'Name movies set in school or college',
    examples: []
  },
  
  // Period Movies
  {
    id: 'period-1',
    category: 'Period Movies',
    description: 'Name Bollywood historical or period movies',
    examples: []
  },
  
  // Thriller Movies
  {
    id: 'thriller-1',
    category: 'Thriller Movies',
    description: 'Name Bollywood thriller movies',
    examples: []
  },
  
  // Music/Dance Movies
  {
    id: 'music-1',
    category: 'Music/Dance Movies',
    description: 'Name movies about music or dance',
    examples: []
  },
  
  // Movies with Numbers in Title
  {
    id: 'numbers-1',
    category: 'Movies with Numbers',
    description: 'Name movies that have numbers in their title',
    examples: []
  },
  
  // Movies about Dreams/Aspirations
  {
    id: 'dreams-1',
    category: 'Movies about Dreams',
    description: 'Name movies about following dreams or aspirations',
    examples: []
  },
  
  // Movies with Colors in Title
  {
    id: 'colors-1',
    category: 'Movies with Colors',
    description: 'Name movies that have colors in their title',
    examples: []
  },
  
  // Remake Movies
  {
    id: 'remake-1',
    category: 'Remake Movies',
    description: 'Name Bollywood movies that are remakes',
    examples: []
  }
];

// Enhanced Movie Cards with genres for Blockbuster
const BLOCKBUSTER_MOVIE_CARDS = [
  // Action Movies
  { id: 'war', title: 'War', genre: 'Action', category: 'bollywood', difficulty: 'easy' },
  { id: 'baaghi', title: 'Baaghi', genre: 'Action', category: 'bollywood', difficulty: 'easy' },
  { id: 'don', title: 'Don', genre: 'Action', category: 'bollywood', difficulty: 'easy' },
  { id: 'dhoom', title: 'Dhoom', genre: 'Action', category: 'bollywood', difficulty: 'easy' },
  { id: 'singham', title: 'Singham', genre: 'Action', category: 'bollywood', difficulty: 'easy' },
  { id: 'tiger-zinda-hai', title: 'Tiger Zinda Hai', genre: 'Action', category: 'bollywood', difficulty: 'medium' },
  { id: 'uri', title: 'URI: The Surgical Strike', genre: 'Action', category: 'bollywood', difficulty: 'medium' },
  { id: 'batla-house', title: 'Batla House', genre: 'Action', category: 'bollywood', difficulty: 'hard' },
  
  // Romance Movies
  { id: 'ddlj', title: 'Dilwale Dulhania Le Jayenge', genre: 'Romance', category: 'bollywood', difficulty: 'easy' },
  { id: 'kkhh', title: 'Kuch Kuch Hota Hai', genre: 'Romance', category: 'bollywood', difficulty: 'easy' },
  { id: 'jab-we-met', title: 'Jab We Met', genre: 'Romance', category: 'bollywood', difficulty: 'easy' },
  { id: 'yjhd', title: 'Yeh Jawaani Hai Deewani', genre: 'Romance', category: 'bollywood', difficulty: 'easy' },
  { id: 'zindagi-na-milegi', title: 'Zindagi Na Milegi Dobara', genre: 'Romance', category: 'bollywood', difficulty: 'medium' },
  { id: 'ae-dil-hai-mushkil', title: 'Ae Dil Hai Mushkil', genre: 'Romance', category: 'bollywood', difficulty: 'medium' },
  { id: 'tamasha', title: 'Tamasha', genre: 'Romance', category: 'bollywood', difficulty: 'hard' },
  
  // Comedy Movies
  { id: '3-idiots', title: '3 Idiots', genre: 'Comedy', category: 'bollywood', difficulty: 'easy' },
  { id: 'golmaal', title: 'Golmaal', genre: 'Comedy', category: 'bollywood', difficulty: 'easy' },
  { id: 'housefull', title: 'Housefull', genre: 'Comedy', category: 'bollywood', difficulty: 'easy' },
  { id: 'hera-pheri', title: 'Hera Pheri', genre: 'Comedy', category: 'bollywood', difficulty: 'easy' },
  { id: 'munna-bhai', title: 'Munna Bhai MBBS', genre: 'Comedy', category: 'bollywood', difficulty: 'medium' },
  { id: 'hindi-medium', title: 'Hindi Medium', genre: 'Comedy', category: 'bollywood', difficulty: 'medium' },
  { id: 'badhaai-ho', title: 'Badhaai Ho', genre: 'Comedy', category: 'bollywood', difficulty: 'hard' },
  
  // Drama Movies
  { id: 'dangal', title: 'Dangal', genre: 'Drama', category: 'bollywood', difficulty: 'easy' },
  { id: 'taare-zameen-par', title: 'Taare Zameen Par', genre: 'Drama', category: 'bollywood', difficulty: 'easy' },
  { id: 'pink', title: 'Pink', genre: 'Drama', category: 'bollywood', difficulty: 'medium' },
  { id: 'article-15', title: 'Article 15', genre: 'Drama', category: 'bollywood', difficulty: 'medium' },
  { id: 'court', title: 'Court', genre: 'Drama', category: 'bollywood', difficulty: 'hard' },
  { id: 'masaan', title: 'Masaan', genre: 'Drama', category: 'bollywood', difficulty: 'hard' },
  
  // Sports Movies
  { id: 'sultan', title: 'Sultan', genre: 'Sports', category: 'bollywood', difficulty: 'easy' },
  { id: 'mary-kom', title: 'Mary Kom', genre: 'Sports', category: 'bollywood', difficulty: 'easy' },
  { id: 'bhaag-milkha', title: 'Bhaag Milkha Bhaag', genre: 'Sports', category: 'bollywood', difficulty: 'medium' },
  { id: 'chak-de', title: 'Chak De! India', genre: 'Sports', category: 'bollywood', difficulty: 'medium' },
  
  // Historical/Period Movies
  { id: 'padmaavat', title: 'Padmaavat', genre: 'Historical', category: 'bollywood', difficulty: 'medium' },
  { id: 'bajirao-mastani', title: 'Bajirao Mastani', genre: 'Historical', category: 'bollywood', difficulty: 'medium' },
  { id: 'jodhaa-akbar', title: 'Jodhaa Akbar', genre: 'Historical', category: 'bollywood', difficulty: 'hard' },
  
  // Horror Movies
  { id: 'stree', title: 'Stree', genre: 'Horror', category: 'bollywood', difficulty: 'easy' },
  { id: 'tumhari-sulu', title: 'Tumhari Sulu', genre: 'Horror', category: 'bollywood', difficulty: 'medium' },
  
  // Family Movies
  { id: 'k3g', title: 'Kabhi Khushi Kabhie Gham', genre: 'Family', category: 'bollywood', difficulty: 'easy' },
  { id: 'hahk', title: 'Hum Aapke Hain Koun..!', genre: 'Family', category: 'bollywood', difficulty: 'easy' },
  { id: 'kapoor-sons', title: 'Kapoor & Sons', genre: 'Family', category: 'bollywood', difficulty: 'medium' },
  
  // Biopic Movies
  { id: 'ms-dhoni', title: 'M.S. Dhoni: The Untold Story', genre: 'Biopic', category: 'bollywood', difficulty: 'medium' },
  { id: 'neerja', title: 'Neerja', genre: 'Biopic', category: 'bollywood', difficulty: 'medium' },
  { id: 'shahid', title: 'Shahid', genre: 'Biopic', category: 'bollywood', difficulty: 'hard' },
];

function getRandomHeadToHeadCard() {
  return HEAD_TO_HEAD_CARDS[Math.floor(Math.random() * HEAD_TO_HEAD_CARDS.length)];
}

function getRandomMovieCards(count = 6) {
  const shuffled = [...BLOCKBUSTER_MOVIE_CARDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getMovieCardsByGenre(genre) {
  return BLOCKBUSTER_MOVIE_CARDS.filter(card => card.genre === genre);
}

function validateMovie(movieTitle, category) {
  const normalizedTitle = movieTitle.toLowerCase().trim();
  
  // Check if movie exists in our database
  const exists = BLOCKBUSTER_MOVIE_CARDS.some(card => 
    card.title.toLowerCase() === normalizedTitle
  );
  
  if (exists) return true;
  
  // Basic category-based validation for common movies
  const categoryMovies = getCategoryMovies(category);
  return categoryMovies.some(movie => 
    movie.toLowerCase().includes(normalizedTitle) || 
    normalizedTitle.includes(movie.toLowerCase())
  );
}

function getCategoryMovies(category) {
  const categories = {
    'sports movies': ['dangal', 'sultan', 'mary kom', 'bhaag milkha bhaag', 'chak de india', 'gold', '83'],
    'romance movies': ['ddlj', 'kuch kuch hota hai', 'jab we met', 'yeh jawaani hai deewani', 'ae dil hai mushkil'],
    'action movies': ['war', 'baaghi', 'don', 'dhoom', 'singham', 'tiger zinda hai', 'uri'],
    'comedy movies': ['3 idiots', 'golmaal', 'housefull', 'hera pheri', 'welcome', 'munna bhai'],
    'shah rukh khan movies': ['chennai express', 'happy new year', 'my name is khan', 'om shanti om', 'ddlj', 'kkhh'],
    'salman khan movies': ['bajrangi bhaijaan', 'sultan', 'tiger zinda hai', 'dabangg', 'kick', 'wanted'],
    'aamir khan movies': ['3 idiots', 'dangal', 'pk', 'taare zameen par', 'lagaan', 'rangeela'],
  };
  
  const categoryKey = category.toLowerCase();
  return categories[categoryKey] || [];
}

module.exports = {
  HEAD_TO_HEAD_CARDS,
  BLOCKBUSTER_MOVIE_CARDS,
  getRandomHeadToHeadCard,
  getRandomMovieCards,
  getMovieCardsByGenre,
  validateMovie,
  getCategoryMovies
}; 