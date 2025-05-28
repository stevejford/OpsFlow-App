import { query } from './neon-db';
import { Employee, License, Induction, Document, EmergencyContact, Folder, DocumentFile } from './schema';

export async function initializeDatabase() {
  try {
    // Create employees table
    await query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        position VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'On Leave', 'Terminated', 'Pending')),
        hire_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create licenses table
    await query(`
      CREATE TABLE IF NOT EXISTS licenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        license_number VARCHAR(100),
        issue_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status VARCHAR(20) CHECK (status IN ('Valid', 'Expired', 'Expiring Soon', 'Renewal Pending')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create inductions table
    await query(`
      CREATE TABLE IF NOT EXISTS inductions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        completed_date DATE NOT NULL,
        expiry_date DATE,
        status VARCHAR(20) CHECK (status IN ('Completed', 'Pending', 'Expired', 'In Progress')),
        provider VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

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
      );
    `);

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
      );
    `);

    // Create documents table (for employee-specific documents)
    await query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        file_url TEXT NOT NULL,
        upload_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create emergency_contacts table
    await query(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        address TEXT,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path)');
    await query('CREATE INDEX IF NOT EXISTS idx_document_files_folder_id ON document_files(folder_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_document_files_name ON document_files(name)');

    // Create a function to update the updated_at timestamp
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers to update updated_at on each table
    const tables = ['employees', 'licenses', 'inductions', 'documents', 'emergency_contacts', 'folders', 'document_files'];
    for (const table of tables) {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

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

    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// Test the database connection and initialize schema
export async function setupDatabase() {
  try {
    await query('SELECT 1'); // Test connection
    console.log('Database connection successful');
    
    // Initialize schema
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}
