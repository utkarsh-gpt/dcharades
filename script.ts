import { createClient } from '@libsql/client';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

// Create Turso client
const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_TOKEN!,
});

interface CrewMember {
  actorId: string;
  actorName: string;
  ratingSum: string;
}


async function createTables() {
  // Create crew table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS popular_crew (
      crew_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rating FLOAT
    )
  `);
}

async function populateCrewData() {
  try {
    const csvData = readFileSync('data.csv', 'utf-8');
    const records: CrewMember[] = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`Processing ${records.length} crew members...`);

    for (const record of records) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO popular_crew 
              (crew_id, name, rating) 
              VALUES (?, ?, ?)`,
        args: [
          record.actorId,
          record.actorName,
          record.ratingSum,
        ],
      });
    }

    console.log('Crew data populated successfully');
  } catch (error) {
    console.error('Error populating crew data:', error);
  }
}
async function main() {
  try {
    console.log('Starting database population...');
    
    await createTables();
    await populateCrewData();
    
    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error during database population:', error);
  } finally {
    client.close();
  }
}

// Run the script
main();
