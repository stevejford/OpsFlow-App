import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Create a connection to the database using the DATABASE_URL from environment variables
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql);

// Test the database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as now`;
    console.log('✅ Database connection successful:', result[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}
