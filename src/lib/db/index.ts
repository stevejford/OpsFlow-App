import { Pool } from '@neondatabase/serverless';
import { config } from '../config';

// Track database connection status
let isConnected = false;
let connectionError: Error | null = null;

// Create a single connection pool for the application
export let pool: Pool;

try {
  pool = new Pool({
    connectionString: config.database.url,
    ssl: { rejectUnauthorized: false } // Required for Neon
  });
  console.log('Database pool initialized');
} catch (error) {
  console.error('Failed to initialize database pool:', error);
  connectionError = error as Error;
  // Create a dummy pool to prevent application crashes
  pool = {} as Pool;
}

// Test the database connection
export async function testConnection() {
  if (connectionError) {
    console.error('Database connection error (cached):', connectionError);
    return false;
  }
  
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT NOW()');
      console.log('Database connection successful:', rows[0].now);
      isConnected = true;
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      connectionError = error as Error;
      isConnected = false;
      return false;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to connect to database:', error);
    connectionError = error as Error;
    isConnected = false;
    return false;
  }
}

// Query function for executing SQL statements
export async function query(text: string, params?: any[]) {
  // If we already know the database is not connected, fail fast
  if (connectionError) {
    console.error('Database query skipped due to connection error:', connectionError.message);
    return { rows: [], rowCount: 0 };
  }
  
  const start = Date.now();
  let client;
  
  try {
    client = await pool.connect();
  } catch (error) {
    console.error('Failed to connect to database for query:', error);
    connectionError = error as Error;
    isConnected = false;
    return { rows: [], rowCount: 0 };
  }
  
  try {
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.DB_DEBUG === 'true' || config.database.debug) {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    // Don't throw the error, just return empty results
    return { rows: [], rowCount: 0 };
  } finally {
    client?.release();
  }
}

export default {
  query,
  testConnection,
  pool
};
