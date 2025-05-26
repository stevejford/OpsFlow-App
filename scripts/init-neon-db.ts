import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Starting OpsFlow database initialization...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }
  
  const sql = neon(DATABASE_URL);
  
  try {
    // Create employees table
    console.log('\n🔄 Creating employees table...');
    await sql`
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
    `;
    console.log('✅ Created employees table');

    // Create licenses table
    console.log('\n🔄 Creating licenses table...');
    await sql`
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
    `;
    console.log('✅ Created licenses table');

    // Create inductions table
    console.log('\n🔄 Creating inductions table...');
    await sql`
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
    `;
    console.log('✅ Created inductions table');

    // Create documents table
    console.log('\n🔄 Creating documents table...');
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        file_url TEXT NOT NULL,
        upload_date DATE NOT NULL,
        expiry_date DATE,
        status VARCHAR(20) CHECK (status IN ('Current', 'Expired', 'Pending Review')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created documents table');

    // Create emergency_contacts table
    console.log('\n🔄 Creating emergency_contacts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        address TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT one_primary_per_employee EXCLUDE (employee_id WITH =) WHERE (is_primary)
      );
    `;
    console.log('✅ Created emergency_contacts table');

    console.log('\n✨ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main().catch(console.error);
