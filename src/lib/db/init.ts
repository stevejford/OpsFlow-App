import { query } from './index';
import { Employee, License, Induction, Document, EmergencyContact } from './schema';

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

    // Create documents table
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
    const tables = ['employees', 'licenses', 'inductions', 'documents', 'emergency_contacts'];
    for (const table of tables) {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }

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
