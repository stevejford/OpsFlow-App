import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import after loading environment variables
import { db } from '../src/lib/db/neon-operations';
import { testConnection } from '../src/lib/db/neon-db';

async function main() {
  console.log('🚀 Testing License Operations...');
  
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
      first_name: 'License',
      last_name: 'Test',
      email: `license.test.${Date.now()}@example.com`,
      phone: '555-987-6543',
      position: 'Test Position',
      department: 'QA',
      status: 'Active' as const,
      hire_date: new Date('2023-01-01')
    });
    console.log('✅ Created test employee:', testEmployee.id);

    // Test creating a license
    console.log('\n🔄 Testing license creation...');
    const newLicense = await db.licenses.create({
      employee_id: testEmployee.id,
      name: 'Professional Engineer',
      license_number: `PE-${Date.now()}`,
      issue_date: new Date('2023-01-01'),
      expiry_date: new Date('2025-12-31'),
      status: 'Valid' as const,
      notes: 'Test license'
    });
    console.log('✅ Created license:', newLicense);

    // Test getting licenses by employee ID
    console.log('\n🔄 Testing get licenses by employee ID...');
    const employeeLicenses = await db.licenses.getByEmployeeId(testEmployee.id);
    console.log(`✅ Found ${employeeLicenses.length} licenses for employee`);

    // Test updating a license
    console.log('\n🔄 Testing license update...');
    const updatedLicense = await db.licenses.update(newLicense.id, {
      status: 'Expiring Soon',
      notes: 'Needs renewal'
    });
    console.log('✅ Updated license:', updatedLicense);

    // Test getting expiring licenses
    console.log('\n🔄 Testing get expiring licenses...');
    const expiringLicenses = await db.licenses.getExpiring(365); // Next 365 days
    console.log(`✅ Found ${expiringLicenses.length} expiring licenses`);

    // Test deleting a license
    console.log('\n🔄 Testing license deletion...');
    const isDeleted = await db.licenses.delete(newLicense.id);
    console.log(`✅ License ${isDeleted ? 'deleted' : 'not found'}`);

    // Clean up test employee
    console.log('\n🔄 Cleaning up test data...');
    await db.employees.delete(testEmployee.id);
    console.log('✅ Cleanup complete');
    
    console.log('\n✨ All license operations tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
