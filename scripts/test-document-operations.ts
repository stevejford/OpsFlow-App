import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import after loading environment variables
import { db } from '../src/lib/db/neon-operations';
import { testConnection } from '../src/lib/db/neon-db';

async function main() {
  console.log('🚀 Testing Document Operations...');
  
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
      first_name: 'Document',
      last_name: 'Test',
      email: `document.test.${Date.now()}@example.com`,
      phone: '555-987-6543',
      position: 'Test Position',
      department: 'IT',
      status: 'Active' as const,
      hire_date: new Date('2023-01-01')
    });
    console.log('✅ Created test employee:', testEmployee.id);

    // Test creating a document
    console.log('\n🔄 Testing document creation...');
    const newDocument = await db.documents.create({
      employee_id: testEmployee.id,
      name: 'Employment Contract',
      type: 'Contract',
      file_url: 'https://example.com/documents/contract.pdf',
      notes: 'Signed employment contract'
    });
    console.log('✅ Created document:', newDocument);

    // Test getting documents by employee ID
    console.log('\n🔄 Testing get documents by employee ID...');
    const employeeDocuments = await db.documents.getByEmployeeId(testEmployee.id);
    console.log(`✅ Found ${employeeDocuments.length} documents for employee`);

    // Test getting documents by type
    console.log('\n🔄 Testing get documents by type...');
    const contractDocuments = await db.documents.getByType('Contract');
    console.log(`✅ Found ${contractDocuments.length} contract documents`);

    // Test updating a document
    console.log('\n🔄 Testing document update...');
    const updatedDocument = await db.documents.update(newDocument.id, {
      name: 'Updated Employment Contract',
      notes: 'Updated contract with new terms'
    });
    console.log('✅ Updated document:', updatedDocument);

    // Test deleting a document
    console.log('\n🔄 Testing document deletion...');
    const isDeleted = await db.documents.delete(newDocument.id);
    console.log(`✅ Document ${isDeleted ? 'deleted' : 'not found'}`);

    // Clean up test employee
    console.log('\n🔄 Cleaning up test data...');
    await db.employees.delete(testEmployee.id);
    console.log('✅ Cleanup complete');
    
    console.log('\n✨ All document operations tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
