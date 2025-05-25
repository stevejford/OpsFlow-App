import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Testing connection to Neon database...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }
  
  try {
    // Create a direct connection to Neon
    const sql = neon(DATABASE_URL);
    
    // Test the connection with a simple query
    const result = await sql`SELECT NOW() as now`;
    console.log('✅ Successfully connected to Neon database!');
    console.log('Current database time:', result[0].now);
    
    // Test creating a table
    console.log('\n🚀 Testing table creation...');
    await sql`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created test table');
    
    // Test inserting data
    console.log('\n🚀 Testing data insertion...');
    await sql`
      INSERT INTO test_table (name) VALUES ('test-' || floor(random() * 1000)::int);
    `;
    console.log('✅ Inserted test data');
    
    // Test querying data
    console.log('\n🚀 Testing data query...');
    const rows = await sql`SELECT * FROM test_table`;
    console.log('Retrieved data:', rows);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
