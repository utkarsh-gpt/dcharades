const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize Turso client
const client = createClient({
  url: process.env.DATABASE_URL || 'file:movies.db', // Fallback to local SQLite
  authToken: process.env.DATABASE_TOKEN,
});

// Database schema and initialization
async function initializeDatabase() {
  try {
    // Create movies table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        genre TEXT NOT NULL,
        difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
        category TEXT NOT NULL CHECK (category IN ('bollywood', 'hollywood')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create head_to_head_cards table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS head_to_head_cards (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed with initial data if tables are empty
    await seedInitialData();
    
  } catch (error) {
    throw error;
  }
}

// Seed initial movie data
async function seedInitialData() {
  try {
    // Check if movies table has data
    const movieCount = await client.execute('SELECT COUNT(*) as count FROM movies');
    
    if (movieCount.rows[0].count === 0) {
      
      const initialMovies = [
        // Bollywood Action Movies
        { title: 'War', genre: 'Action', difficulty: 'easy', category: 'bollywood' },
        { title: 'Baaghi', genre: 'Action', difficulty: 'easy', category: 'bollywood' },
        { title: 'Don', genre: 'Action', difficulty: 'easy', category: 'bollywood' },
        { title: 'Dhoom', genre: 'Action', difficulty: 'easy', category: 'bollywood' },
        { title: 'Singham', genre: 'Action', difficulty: 'easy', category: 'bollywood' },
        { title: 'Tiger Zinda Hai', genre: 'Action', difficulty: 'medium', category: 'bollywood' },
        { title: 'URI: The Surgical Strike', genre: 'Action', difficulty: 'medium', category: 'bollywood' },
        { title: 'Batla House', genre: 'Action', difficulty: 'hard', category: 'bollywood' },
        
        // Bollywood Romance Movies
        { title: 'Dilwale Dulhania Le Jayenge', genre: 'Romance', difficulty: 'easy', category: 'bollywood' },
        { title: 'Kuch Kuch Hota Hai', genre: 'Romance', difficulty: 'easy', category: 'bollywood' },
        { title: 'Jab We Met', genre: 'Romance', difficulty: 'easy', category: 'bollywood' },
        { title: 'Yeh Jawaani Hai Deewani', genre: 'Romance', difficulty: 'easy', category: 'bollywood' },
        { title: 'Zindagi Na Milegi Dobara', genre: 'Romance', difficulty: 'medium', category: 'bollywood' },
        { title: 'Ae Dil Hai Mushkil', genre: 'Romance', difficulty: 'medium', category: 'bollywood' },
        { title: 'Tamasha', genre: 'Romance', difficulty: 'hard', category: 'bollywood' },
        
        // Bollywood Comedy Movies
        { title: '3 Idiots', genre: 'Comedy', difficulty: 'easy', category: 'bollywood' },
        { title: 'Golmaal', genre: 'Comedy', difficulty: 'easy', category: 'bollywood' },
        { title: 'Housefull', genre: 'Comedy', difficulty: 'easy', category: 'bollywood' },
        { title: 'Hera Pheri', genre: 'Comedy', difficulty: 'easy', category: 'bollywood' },
        { title: 'Munna Bhai MBBS', genre: 'Comedy', difficulty: 'medium', category: 'bollywood' },
        { title: 'Hindi Medium', genre: 'Comedy', difficulty: 'medium', category: 'bollywood' },
        { title: 'Badhaai Ho', genre: 'Comedy', difficulty: 'hard', category: 'bollywood' },
        
        // Bollywood Drama Movies
        { title: 'Dangal', genre: 'Drama', difficulty: 'easy', category: 'bollywood' },
        { title: 'Taare Zameen Par', genre: 'Drama', difficulty: 'easy', category: 'bollywood' },
        { title: 'Pink', genre: 'Drama', difficulty: 'medium', category: 'bollywood' },
        { title: 'Masaan', genre: 'Drama', difficulty: 'hard', category: 'bollywood' },
        
        // Bollywood Sports Movies
        { title: 'Sultan', genre: 'Sports', difficulty: 'easy', category: 'bollywood' },
        { title: 'Mary Kom', genre: 'Sports', difficulty: 'easy', category: 'bollywood' },
        { title: 'Bhaag Milkha Bhaag', genre: 'Sports', difficulty: 'medium', category: 'bollywood' },
        { title: 'Chak De! India', genre: 'Sports', difficulty: 'medium', category: 'bollywood' },
        
        // Bollywood Historical Movies
        { title: 'Padmaavat', genre: 'Historical', difficulty: 'medium', category: 'bollywood' },
        { title: 'Bajirao Mastani', genre: 'Historical', difficulty: 'medium', category: 'bollywood' },
        { title: 'Jodhaa Akbar', genre: 'Historical', difficulty: 'hard', category: 'bollywood' },
        
        // Bollywood Horror Movies
        { title: 'Stree', genre: 'Horror', difficulty: 'easy', category: 'bollywood' },
        { title: 'Tumhari Sulu', genre: 'Horror', difficulty: 'medium', category: 'bollywood' },
        
        // Bollywood Family Movies
        { title: 'Kabhi Khushi Kabhie Gham', genre: 'Family', difficulty: 'easy', category: 'bollywood' },
        { title: 'Hum Aapke Hain Koun..!', genre: 'Family', difficulty: 'easy', category: 'bollywood' },
        { title: 'Kapoor & Sons', genre: 'Family', difficulty: 'medium', category: 'bollywood' },
        
        // Bollywood Biopic Movies
        { title: 'M.S. Dhoni: The Untold Story', genre: 'Biopic', difficulty: 'medium', category: 'bollywood' },
        { title: 'Neerja', genre: 'Biopic', difficulty: 'medium', category: 'bollywood' },
      ];

      // Insert movies in batch
      for (const movie of initialMovies) {
        await client.execute({
          sql: 'INSERT OR IGNORE INTO movies (title, genre, difficulty, category) VALUES (?, ?, ?, ?)',
          args: [movie.title, movie.genre, movie.difficulty, movie.category]
        });
      }
      

    }

    // Check and seed head-to-head cards
    const cardCount = await client.execute('SELECT COUNT(*) as count FROM head_to_head_cards');
    
    if (cardCount.rows[0].count === 0) {
      
      const headToHeadCards = [
        { id: 'sports-1', category: 'Sports Movies', description: 'Name Bollywood movies about sports' },
        { id: 'romance-1', category: 'Romance Movies', description: 'Name Bollywood romantic movies' },
        { id: 'action-1', category: 'Action Movies', description: 'Name Bollywood action movies' },
        { id: 'comedy-1', category: 'Comedy Movies', description: 'Name Bollywood comedy movies' },
        { id: 'shahrukh-1', category: 'Shah Rukh Khan Movies', description: 'Name movies starring Shah Rukh Khan' },
        { id: 'salman-1', category: 'Salman Khan Movies', description: 'Name movies starring Salman Khan' },
        { id: 'aamir-1', category: 'Aamir Khan Movies', description: 'Name movies starring Aamir Khan' },
        { id: 'ranbir-1', category: 'Ranbir Kapoor Movies', description: 'Name movies starring Ranbir Kapoor' },
        { id: 'deepika-1', category: 'Deepika Padukone Movies', description: 'Name movies starring Deepika Padukone' },
        { id: 'priyanka-1', category: 'Priyanka Chopra Movies', description: 'Name movies starring Priyanka Chopra' },
        { id: 'family-1', category: 'Family Movies', description: 'Name Bollywood family movies' },
        { id: 'breakup-1', category: 'Movies with Breakups', description: 'Name movies that feature breakups or separations' },
        { id: 'school-1', category: 'School/College Movies', description: 'Name movies set in school or college' },
        { id: 'period-1', category: 'Period Movies', description: 'Name Bollywood historical or period movies' },
        { id: 'thriller-1', category: 'Thriller Movies', description: 'Name Bollywood thriller movies' },
        { id: 'music-1', category: 'Music/Dance Movies', description: 'Name movies about music or dance' },
        { id: 'numbers-1', category: 'Movies with Numbers', description: 'Name movies that have numbers in their title' },
        { id: 'dreams-1', category: 'Movies about Dreams', description: 'Name movies about following dreams or aspirations' },
        { id: 'colors-1', category: 'Movies with Colors', description: 'Name movies that have colors in their title' },
        { id: 'remake-1', category: 'Remake Movies', description: 'Name Bollywood movies that are remakes' }
      ];

      for (const card of headToHeadCards) {
        await client.execute({
          sql: 'INSERT OR IGNORE INTO head_to_head_cards (id, category, description) VALUES (?, ?, ?)',
          args: [card.id, card.category, card.description]
        });
      }
      

    }
    
  } catch (error) {
    // Seeding failed, but don't crash
  }
}

// Movie database functions
async function getAllMovies() {
  try {
    const result = await client.execute('SELECT * FROM movies ORDER BY title');
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function getMoviesByGenre(genre) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM movies WHERE genre = ? ORDER BY title',
      args: [genre]
    });
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function getMoviesByCategory(category) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM movies WHERE category = ? ORDER BY title',
      args: [category]
    });
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function getMoviesByDifficulty(difficulty) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM movies WHERE difficulty = ? ORDER BY title',
      args: [difficulty]
    });
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function getRandomMovies(count = 6, filters = {}) {
  try {
    let sql = 'SELECT * FROM movies';
    let args = [];
    let conditions = [];

    // Add filters
    if (filters.genre) {
      conditions.push('genre = ?');
      args.push(filters.genre);
    }
    
    if (filters.category) {
      conditions.push('category = ?');
      args.push(filters.category);
    }
    
    if (filters.difficulty) {
      conditions.push('difficulty = ?');
      args.push(filters.difficulty);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY RANDOM() LIMIT ?';
    args.push(count);

    const result = await client.execute({
      sql,
      args
    });
    
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function addMovie(title, genre, difficulty, category) {
  try {
    await client.execute({
      sql: 'INSERT INTO movies (title, genre, difficulty, category) VALUES (?, ?, ?, ?)',
      args: [title, genre, difficulty, category]
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function findMovieByTitle(title) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM movies WHERE LOWER(title) = LOWER(?)',
      args: [title]
    });
    return result.rows[0] || null;
  } catch (error) {
    return null;
  }
}

// Head-to-head card functions
async function getAllHeadToHeadCards() {
  try {
    const result = await client.execute('SELECT * FROM head_to_head_cards');
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function getRandomHeadToHeadCard() {
  try {
    const result = await client.execute('SELECT * FROM head_to_head_cards ORDER BY RANDOM() LIMIT 1');
    return result.rows[0] || null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  client,
  initializeDatabase,
  getAllMovies,
  getMoviesByGenre,
  getMoviesByCategory,
  getMoviesByDifficulty,
  getRandomMovies,
  addMovie,
  findMovieByTitle,
  getAllHeadToHeadCards,
  getRandomHeadToHeadCard,
}; 