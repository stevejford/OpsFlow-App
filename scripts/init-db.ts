import { setupDatabase } from '../src/lib/db/init';
import { db } from '../src/lib/db/operations';

async function main() {
  console.log('Starting database initialization...');
  
  try {
    // Test the database connection and initialize schema
    await setupDatabase();
    console.log('✅ Database setup completed successfully!');
    
    // Test a simple query
    const result = await db.employees.getAll();
    console.log(`Found ${result.length} employees in the database.`);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
