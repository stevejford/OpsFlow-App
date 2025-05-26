import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import after loading environment variables
import { db } from '../src/lib/db/neon-operations';
import { testConnection } from '../src/lib/db/neon-db';

async function main() {
  console.log('🚀 Testing Induction Operations...');
  
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to the database');
      process.exit(1);
    }

    // Create a test employee first
    console.log('\n🔄 Creating test employee...');
    const testEmployee = await db.employees.create({
      first_name: 'Induction',
      last_name: 'Test',
      email: `induction.test.${Date.now()}@example.com`,
      phone: '555-123-4567',
      position: 'Test Position',
      department: 'HR',
      status: 'Active' as const,
      hire_date: new Date('2023-01-01')
    });
    console.log('✅ Created test employee:', testEmployee.id);

    // Test creating an induction
    console.log('\n🔄 Testing induction creation...');
    const newInduction = await db.inductions.create({
      employee_id: testEmployee.id,
      name: 'Workplace Safety',
      completed_date: new Date('2023-06-01'),
      expiry_date: new Date('2024-06-01'),
      status: 'Completed' as const,
      provider: 'Internal HR',
      notes: 'Annual safety training'
    });
    console.log('✅ Created induction:', newInduction);

    // Test getting inductions by employee ID
    console.log('\n🔄 Testing get inductions by employee ID...');
    const employeeInductions = await db.inductions.getByEmployeeId(testEmployee.id);
    console.log(`✅ Found ${employeeInductions.length} inductions for employee`);

    // Test updating an induction
    console.log('\n🔄 Testing induction update...');
    const updatedInduction = await db.inductions.update(newInduction.id, {
      status: 'Expired',
      notes: 'Needs renewal'
    });
    console.log('✅ Updated induction:', updatedInduction);

    // Test getting expiring inductions
    console.log('\n🔄 Testing get expiring inductions...');
    const expiringInductions = await db.inductions.getExpiring(365); // Next 365 days
    console.log(`✅ Found ${expiringInductions.length} expiring inductions`);

    // Test deleting an induction
    console.log('\n🔄 Testing induction deletion...');
    const isDeleted = await db.inductions.delete(newInduction.id);
    console.log(`✅ Induction ${isDeleted ? 'deleted' : 'not found'}`);

    // Clean up test employee
    console.log('\n🔄 Cleaning up test data...');
    await db.employees.delete(testEmployee.id);
    console.log('✅ Cleanup complete');
    
    console.log('\n✨ All induction operations tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
