import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import after loading environment variables
import { db } from '../src/lib/db/neon-operations';
import { testConnection } from '../src/lib/db/neon-db';

async function main() {
  console.log('🚀 Testing Emergency Contact Operations...');
  
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
      first_name: 'Emergency',
      last_name: 'Contact',
      email: `emergency.contact.${Date.now()}@example.com`,
      phone: '555-123-4567',
      position: 'Test Position',
      department: 'HR',
      status: 'Active' as const,
      hire_date: new Date('2023-01-01')
    });
    console.log('✅ Created test employee:', testEmployee.id);

    // Test creating an emergency contact
    console.log('\n🔄 Testing emergency contact creation...');
    const newContact = await db.emergencyContacts.create({
      employee_id: testEmployee.id,
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '555-987-6543',
      email: 'jane.smith@example.com',
      address: '123 Main St, Anytown, USA',
      is_primary: true
    });
    console.log('✅ Created emergency contact:', newContact);

    // Test getting emergency contacts by employee ID
    console.log('\n🔄 Testing get emergency contacts by employee ID...');
    const employeeContacts = await db.emergencyContacts.getByEmployeeId(testEmployee.id);
    console.log(`✅ Found ${employeeContacts.length} emergency contacts for employee`);

    // Test getting primary emergency contact
    console.log('\n🔄 Testing get primary emergency contact...');
    const primaryContact = await db.emergencyContacts.getPrimaryContact(testEmployee.id);
    console.log('✅ Primary emergency contact:', primaryContact?.name);

    // Test updating an emergency contact
    console.log('\n🔄 Testing emergency contact update...');
    const updatedContact = await db.emergencyContacts.update(newContact.id, {
      phone: '555-555-5555',
      is_primary: true // Should stay primary
    });
    console.log('✅ Updated emergency contact phone number:', updatedContact?.phone);

    // Test creating a second contact
    console.log('\n🔄 Testing primary contact change...');
    const secondContact = await db.emergencyContacts.create({
      employee_id: testEmployee.id,
      name: 'John Smith',
      relationship: 'Sibling',
      phone: '555-111-2222',
      is_primary: false
    });
    
    // Make the second contact primary
    console.log('Setting second contact as primary...');
    await db.emergencyContacts.update(secondContact.id, { is_primary: true });
    
    // Verify primary contact changed
    const newPrimaryContact = await db.emergencyContacts.getPrimaryContact(testEmployee.id);
    console.log(`✅ New primary contact: ${newPrimaryContact?.name} (${newPrimaryContact?.relationship})`);
    
    // Test that we can't unset the only primary contact
    console.log('\n🔄 Testing primary contact validation...');
    try {
      await db.emergencyContacts.update(secondContact.id, { is_primary: false });
      console.error('❌ Should not be able to unset the only primary contact');
    } catch (error) {
      console.log('✅ Correctly prevented unsetting the only primary contact');
    }

    // Test deleting an emergency contact
    console.log('\n🔄 Testing emergency contact deletion...');
    const isDeleted = await db.emergencyContacts.delete(newContact.id);
    console.log(`✅ Contact ${isDeleted ? 'deleted' : 'not found'}`);

    // Clean up test data
    console.log('\n🔄 Cleaning up test data...');
    await db.emergencyContacts.delete(secondContact.id);
    await db.employees.delete(testEmployee.id);
    console.log('✅ Cleanup complete');
    
    console.log('\n✨ All emergency contact operations tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
