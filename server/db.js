const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize Turso client
const client = createClient({
  url: process.env.DATABASE_URL || 'file:Movies.db', // Fallback to local SQLite
  authToken: process.env.DATABASE_TOKEN,
});

// Database schema and initialization
async function initializeDatabase() {
  try {
    // Create Movies table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Movies (
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
    // Check if Movies table has data
    const movieCount = await client.execute('SELECT COUNT(*) as count FROM movies');
    
    // Movies table is ready - no hardcoded seeding needed
    // Data should be added via database management tools or bulk import

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

// Core game functions only
async function getRandomMovies() {
  try {
    const result = await client.execute('SELECT * FROM movies ORDER BY RANDOM() LIMIT 6');
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

// Filmi Rishta database functions
async function getRandomActors(count = 2) {
  try {
    const result = await client.execute({
      sql: "SELECT * FROM popular_crew ORDER BY RANDOM() LIMIT ?;",
      args: [count]
    });
    return result.rows;
  } catch (error) {
    console.error('Error getting random actors:', error);
    return [];
  }
}

async function getMovieById(movieId) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM bollywood_movies WHERE imdb_id = ?',
      args: [movieId]
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting movie by ID:', error);
    return null;
  }
}

async function getActorById(actorId) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM bollywood_crew WHERE crew_id = ?',
      args: [actorId]
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting actor by ID:', error);
    return null;
  }
}

async function searchMoviesByActor(actorId) {
  try {
    // This is a simplified version - in a real app you'd have a junction table
    // For now, return some sample movies
    const result = await client.execute({
      sql: 'SELECT * FROM bollywood_movies ORDER BY RANDOM() LIMIT 5'
    });
    return result.rows;
  } catch (error) {
    console.error('Error searching movies by actor:', error);
    return [];
  }
}



module.exports = {
  client,
  initializeDatabase,
  getRandomMovies,
  getRandomHeadToHeadCard,
  
  // Filmi Rishta functions
  getRandomActors,
  getMovieById,
  getActorById,
  searchMoviesByActor,
}; 