// Simple script to test database connection and employee data retrieval
// Use dynamic import for ESM modules
(async () => {
  try {
    const { db } = await import('../src/lib/db/operations.js');
    await testDatabaseConnection(db);
  } catch (error) {
    console.error('Error importing database operations:', error);
  }
})();

async function testDatabaseConnection(db) {
  try {
    console.log('Testing database connection...');
    
    // Test getting all employees
    console.log('Fetching all employees...');
    const employees = await db.employees.getAll();
    console.log(`Successfully fetched ${employees.length} employees`);
    
    if (employees.length > 0) {
      // Test getting a specific employee
      const testEmployeeId = employees[0].id;
      console.log(`Testing getById with employee ID: ${testEmployeeId}`);
      const employee = await db.employees.getById(testEmployeeId);
      
      if (employee) {
        console.log('Successfully fetched employee by ID:');
        console.log(JSON.stringify(employee, null, 2));
        
        // Test getting employee-related data
        console.log(`Fetching licenses for employee ${testEmployeeId}...`);
        const licenses = await db.licenses.getByEmployeeId(testEmployeeId);
        console.log(`Found ${licenses.length} licenses`);
        
        console.log(`Fetching inductions for employee ${testEmployeeId}...`);
        const inductions = await db.inductions.getByEmployeeId(testEmployeeId);
        console.log(`Found ${inductions.length} inductions`);
        
        console.log(`Fetching documents for employee ${testEmployeeId}...`);
        const documents = await db.documents.getByEmployeeId(testEmployeeId);
        console.log(`Found ${documents.length} documents`);
        
        console.log(`Fetching emergency contacts for employee ${testEmployeeId}...`);
        const emergencyContacts = await db.emergencyContacts.getByEmployeeId(testEmployeeId);
        console.log(`Found ${emergencyContacts.length} emergency contacts`);
      } else {
        console.error(`Failed to fetch employee with ID: ${testEmployeeId}`);
      }
    }
    
    console.log('Database connection test completed successfully');
  } catch (error) {
    console.error('Error testing database connection:', error);
  }
}
