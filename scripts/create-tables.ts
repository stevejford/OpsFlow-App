import { query } from '../src/lib/db/neon-db';

async function createTables() {
  console.log('🚀 Creating missing database tables...');
  
  try {
    // Create folders table
    console.log('\n🔄 Creating folders table...');
    await query(`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
        path TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Created folders table');

    // Create general_documents table
    console.log('\n🔄 Creating general_documents table...');
    await query(`
      CREATE TABLE IF NOT EXISTS general_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        size BIGINT,
        url TEXT NOT NULL,
        folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Created general_documents table');

    // Insert root folder if it doesn't exist
    console.log('\n🔄 Creating root folder...');
    await query(`
      INSERT INTO folders (name, parent_id, path, description)
      SELECT 'Root', NULL, '/', 'Root folder for document management'
      WHERE NOT EXISTS (SELECT 1 FROM folders WHERE path = '/');
    `);
    console.log('✅ Created root folder');

    console.log('\n✨ Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables().catch(console.error);
