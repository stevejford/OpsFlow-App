import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import after loading environment variables
import { db } from '../src/lib/db/neon-operations';
import { testConnection } from '../src/lib/db/neon-db';

async function main() {
  console.log('🚀 Testing Neon database operations...');
  
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to the database');
      process.exit(1);
    }
    
    // Test creating an employee
    console.log('\n🔄 Testing employee creation...');
    const newEmployee = {
      first_name: 'John',
      last_name: 'Doe',
      email: `john.doe.${Date.now()}@example.com`,
      phone: '555-123-4567',
      position: 'Software Engineer',
      department: 'Engineering',
      status: 'Active' as const,  // Type assertion to ensure it's one of the allowed values
      hire_date: new Date('2023-01-15')  // Use Date object instead of string
    } as const;  // 'as const' makes all properties readonly and narrows their types
    
    const createdEmployee = await db.employees.create(newEmployee);
    console.log('✅ Created employee:', createdEmployee);
    
    // Test getting employee by ID
    console.log('\n🔄 Testing get employee by ID...');
    const foundEmployee = await db.employees.getById(createdEmployee.id);
    console.log('✅ Found employee:', foundEmployee);
    
    // Test updating employee
    console.log('\n🔄 Testing employee update...');
    const updatedEmployee = await db.employees.update(createdEmployee.id, {
      position: 'Senior Software Engineer',
      department: 'Engineering Leadership'
    });
    console.log('✅ Updated employee:', updatedEmployee);
    
    // Test searching employees
    console.log('\n🔄 Testing employee search...');
    const searchResults = await db.employees.search('Doe');
    console.log('✅ Search results:', searchResults);
    
    // Test getting all employees
    console.log('\n🔄 Testing get all employees...');
    const allEmployees = await db.employees.getAll();
    console.log(`✅ Found ${allEmployees.length} employees`);
    
    // Test deleting employee
    console.log('\n🔄 Testing employee deletion...');
    const isDeleted = await db.employees.delete(createdEmployee.id);
    console.log(`✅ Employee ${isDeleted ? 'deleted' : 'not found'}`);
    
    console.log('\n✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
