import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

// Create a direct connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

async function testConnection() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful:', rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  } finally {
    client.release();
  }
}

async function initializeSchema() {
  const client = await pool.connect();
  try {
    // Create employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        position VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'On Leave', 'Terminated', 'Pending')),
        hire_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Created employees table');

    // Add more table creation queries here...
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('🚀 Testing database connection...');
  const connected = await testConnection();
  
  if (connected) {
    console.log('🚀 Initializing database schema...');
    await initializeSchema();
    console.log('✅ Database setup completed successfully!');
  }
  
  await pool.end();
}

main().catch(console.error);
