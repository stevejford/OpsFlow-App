import { NextResponse } from 'next/server';
import { query } from '@/lib/db/neon-db';

export async function POST() {
  try {
    console.log('Starting table creation...');
    
    // Create folders table
    await query(`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
        path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('Folders table created');
    
    // Create document_files table
    await query(`
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
    `);
    
    console.log('Document files table created');
    
    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path)');
    await query('CREATE INDEX IF NOT EXISTS idx_document_files_folder_id ON document_files(folder_id)');
    
    console.log('Indexes created');
    
    // Insert default folders
    await query(`
      INSERT INTO folders (name, description, parent_id, path) 
      SELECT 'HR Policies', 'Human Resources policies and procedures', NULL, '/HR Policies'
      WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'HR Policies' AND parent_id IS NULL)
    `);
    
    await query(`
      INSERT INTO folders (name, description, parent_id, path) 
      SELECT 'Contracts', 'Employee contracts and agreements', NULL, '/Contracts'
      WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'Contracts' AND parent_id IS NULL)
    `);
    
    await query(`
      INSERT INTO folders (name, description, parent_id, path) 
      SELECT 'Training Materials', 'Training documents and resources', NULL, '/Training Materials'
      WHERE NOT EXISTS (SELECT 1 FROM folders WHERE name = 'Training Materials' AND parent_id IS NULL)
    `);
    
    console.log('Default folders inserted');
    
    // Test by selecting folders
    const { rows: folders } = await query('SELECT * FROM folders');
    console.log('Current folders:', folders);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tables created successfully',
      folders: folders
    });
    
  } catch (error) {
    console.error('Error creating tables:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
