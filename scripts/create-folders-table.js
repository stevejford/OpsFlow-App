const { readFileSync } = require('fs');
const { join } = require('path');

// Use dynamic import for ESM modules
(async () => {
  try {
    const { query } = await import('../src/lib/db/neon-db.ts');
    
    console.log('Creating folders table...');
    
    // Read the SQL file
    const sqlFile = join(__dirname, 'create-folders-table.sql');
    const sql = readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await query(statement.trim());
      }
    }
    
    console.log('Folders table created successfully!');
    
    // Test the folders API
    const { db } = await import('../src/lib/db/neon-operations.ts');
    const folders = await db.folders.getAll();
    console.log(`Found ${folders.length} folders:`, folders.map(f => f.name));
    
  } catch (error) {
    console.error('Error creating folders table:', error);
    process.exit(1);
  }
})();
