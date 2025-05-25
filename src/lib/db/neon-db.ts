import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Create a connection to the database
const sql = neon(process.env.DATABASE_URL);

// Wrapper for executing queries with error handling
export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const start = Date.now();
    const result = await sql(text, params);
    const duration = Date.now() - start;
    
    if (process.env.DB_DEBUG === 'true') {
      console.log('Executed query', { 
        text, 
        duration: `${duration}ms`,
        rows: result.length 
      });
    }
    
    // Convert the result to match the expected format
    return { 
      rows: result as T[], 
      rowCount: result.length 
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as now`;
    console.log('Database connection successful:', result[0].now);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export default {
  query,
  testConnection
};
