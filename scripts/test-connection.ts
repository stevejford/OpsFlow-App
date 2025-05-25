import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import the test connection function after loading env vars
import { testConnection } from '../src/lib/db/config';

async function main() {
  console.log('🚀 Testing database connection to Neon...');
  const connected = await testConnection();
  
  if (connected) {
    console.log('✅ Successfully connected to the database!');
  } else {
    console.error('❌ Failed to connect to the database');
    process.exit(1);
  }
}

main().catch(console.error);
