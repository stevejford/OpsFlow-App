import { query, testConnection } from '../src/lib/db/neon-db';

async function checkAndFixDatabase() {
  try {
    console.log('Testing database connection...');
    const connectionTest = await testConnection();
    
    if (!connectionTest) {
      console.error('Failed to connect to the database. Please check your DATABASE_URL environment variable.');
      return;
    }
    
    console.log('Connection successful. Checking tables...');
    
    // Check if employees table exists
    const employeesTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employees'
      );
    `);
    
    console.log('Employees table exists:', employeesTableCheck.rows[0].exists);
    
    // Check if licenses table exists
    const licensesTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'licenses'
      );
    `);
    
    console.log('Licenses table exists:', licensesTableCheck.rows[0].exists);
    
    // Check if inductions table exists
    const inductionsTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inductions'
      );
    `);
    
    console.log('Inductions table exists:', inductionsTableCheck.rows[0].exists);
    
    // Create tables if they don't exist
    if (!employeesTableCheck.rows[0].exists) {
      console.log('Creating employees table...');
      await query(`
        CREATE TABLE employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id VARCHAR(100),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          position VARCHAR(100) NOT NULL,
          department VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Active',
          hire_date DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      console.log('Employees table created successfully.');
    }
    
    if (!licensesTableCheck.rows[0].exists) {
      console.log('Creating licenses table...');
      await query(`
        CREATE TABLE licenses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          license_number VARCHAR(100),
          issue_date DATE NOT NULL,
          expiry_date DATE NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Valid',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        );
      `);
      console.log('Licenses table created successfully.');
    }
    
    if (!inductionsTableCheck.rows[0].exists) {
      console.log('Creating inductions table...');
      await query(`
        CREATE TABLE inductions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          completed_date DATE,
          expiry_date DATE,
          status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
          provider VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        );
      `);
      console.log('Inductions table created successfully.');
    }
    
    // Check table columns
    console.log('Checking table columns...');
    
    const licensesColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'licenses';
    `);
    
    console.log('Licenses table columns:');
    licensesColumns.rows.forEach((column: any) => {
      console.log(`- ${column.column_name}: ${column.data_type}`);
    });
    
    const inductionsColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'inductions';
    `);
    
    console.log('Inductions table columns:');
    inductionsColumns.rows.forEach((column: any) => {
      console.log(`- ${column.column_name}: ${column.data_type}`);
    });
    
    console.log('Database check complete.');
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkAndFixDatabase();
