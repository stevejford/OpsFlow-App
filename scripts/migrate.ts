import { setupDatabase } from '../src/lib/db/init';
import { db } from '../src/lib/db/operations';

async function main() {
  console.log('Starting database migration...');
  
  try {
    // Setup database (creates tables if they don't exist)
    await setupDatabase();
    console.log('✅ Database migration completed successfully!');
    
    // Test the connection with a simple query
    const result = await db.employees.getAll();
    console.log(`✅ Successfully connected to database. Found ${result.length} employees.`);
    
  } catch (error) {
    console.error('❌ Error during database migration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
