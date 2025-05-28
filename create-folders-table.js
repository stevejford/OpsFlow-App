const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function createFoldersTable() {
  try {
    console.log('Creating folders table...');
    
    // Create folders table
    await sql`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
        path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log('Folders table created successfully');
    
    // Create document_files table
    await sql`
      CREATE TABLE IF NOT EXISTS document_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_size BIGINT,
        file_type VARCHAR(100),
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log('Document files table created successfully');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_document_files_folder_id ON document_files(folder_id)`;
    
    console.log('Indexes created successfully');
    
    // Insert default folders
    await sql`
      INSERT INTO folders (name, description, parent_id, path) 
      SELECT 'HR Policies', 'Human Resources policies and procedures', NULL, '/HR Policies'
      WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'HR Policies' AND parent_id IS NULL)
    `;
    
    await sql`
      INSERT INTO folders (name, description, parent_id, path) 
      SELECT 'Contracts', 'Employee contracts and agreements', NULL, '/Contracts'
      WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'Contracts' AND parent_id IS NULL)
    `;
    
    await sql`
      INSERT INTO folders (name, description, parent_id, path) 
      SELECT 'Training Materials', 'Training documents and resources', NULL, '/Training Materials'
      WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'Training Materials' AND parent_id IS NULL)
    `;
    
    console.log('Default folders inserted successfully');
    
    // Test by selecting folders
    const folders = await sql`SELECT * FROM folders`;
    console.log('Current folders:', folders);
    
  } catch (error) {
    console.error('Error creating folders table:', error);
  }
}

createFoldersTable();
