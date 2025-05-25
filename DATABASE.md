# OpsFlow Database Documentation

## Overview
This document provides a comprehensive guide to the OpsFlow database schema, including table structures, relationships, and available operations. The database is built on PostgreSQL and hosted on Neon's serverless platform.

## Database Connection

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
DB_DEBUG=true  # Optional: Enables query logging when set to 'true'
```

### Connection Setup
```typescript
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
```

## Schema

### 1. Employees Table
Stores core employee information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | VARCHAR(100) | Employee's first name |
| last_name | VARCHAR(100) | Employee's last name |
| email | VARCHAR(255) | Unique email address |
| phone | VARCHAR(50) | Contact number |
| position | VARCHAR(100) | Job position |
| department | VARCHAR(100) | Department name |
| status | VARCHAR(20) | Employment status (Active/Inactive/On Leave/Terminated/Pending) |
| hire_date | DATE | Employment start date |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### 2. Licenses Table
Tracks professional licenses and certifications.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees.id |
| name | VARCHAR(255) | License/certification name |
| license_number | VARCHAR(100) | License number |
| issue_date | DATE | When the license was issued |
| expiry_date | DATE | When the license expires |
| status | VARCHAR(20) | Status (Valid/Expired/Expiring Soon/Renewal Pending) |
| notes | TEXT | Additional information |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### 3. Inductions Table
Tracks training and safety inductions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees.id |
| name | VARCHAR(255) | Induction name |
| completed_date | DATE | When the induction was completed |
| expiry_date | DATE | When the induction expires (if applicable) |
| status | VARCHAR(20) | Status (Completed/Pending/Expired/In Progress) |
| provider | VARCHAR(255) | Training provider |
| notes | TEXT | Additional information |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### 4. Documents Table
Stores employee-related documents.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees.id |
| name | VARCHAR(255) | Document name |
| type | VARCHAR(100) | Document type/category |
| file_url | TEXT | URL to the stored document |
| upload_date | DATE | When the document was uploaded |
| expiry_date | DATE | When the document expires (if applicable) |
| status | VARCHAR(20) | Status (Current/Expired/Pending Review) |
| notes | TEXT | Additional information |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### 5. Emergency Contacts Table
Stores emergency contact information for employees.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees.id |
| name | VARCHAR(255) | Contact's full name |
| relationship | VARCHAR(100) | Relationship to employee |
| phone | VARCHAR(50) | Contact number |
| email | VARCHAR(255) | Email address |
| address | TEXT | Physical address |
| is_primary | BOOLEAN | Whether this is the primary contact |
| notes | TEXT | Additional information |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Database Operations

### Employee Operations
- `create(employee: CreateEmployee): Promise<Employee>` - Create a new employee
- `getAll(): Promise<Employee[]>` - Get all employees
- `getById(id: string): Promise<Employee | null>` - Get employee by ID
- `update(id: string, updates: Partial<UpdateEmployee>): Promise<Employee | null>` - Update employee details
- `delete(id: string): Promise<boolean>` - Delete an employee
- `search(term: string): Promise<Employee[]>` - Search employees by name or email

### License Operations
- `create(license: CreateLicense): Promise<License>` - Add a new license
- `getByEmployeeId(employeeId: string): Promise<License[]>` - Get licenses for an employee
- `getExpiring(days: number): Promise<License[]>` - Get licenses expiring soon

### Induction Operations
- `create(induction: CreateInduction): Promise<Induction>` - Add a new induction
- `getByEmployeeId(employeeId: string): Promise<Induction[]>` - Get inductions for an employee
- `getExpiring(days: number): Promise<Induction[]>` - Get inductions expiring soon

### Document Operations
- `create(document: CreateDocument): Promise<Document>` - Upload a new document
- `getByEmployeeId(employeeId: string): Promise<Document[]>` - Get documents for an employee
- `delete(id: string): Promise<boolean>` - Delete a document

### Emergency Contact Operations
- `create(contact: CreateEmergencyContact): Promise<EmergencyContact>` - Add an emergency contact
- `getByEmployeeId(employeeId: string): Promise<EmergencyContact[]>` - Get emergency contacts for an employee
- `setAsPrimary(id: string, employeeId: string): Promise<EmergencyContact>` - Set a contact as primary
- `delete(id: string): Promise<boolean>` - Delete an emergency contact

## Example Usage

```typescript
import { db } from './lib/db/neon-operations';

// Create a new employee
const newEmployee = await db.employees.create({
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@example.com',
  phone: '555-123-4567',
  position: 'Project Manager',
  department: 'Operations',
  status: 'Active',
  hire_date: '2023-01-15'
});

// Get all employees
const allEmployees = await db.employees.getAll();

// Search for employees
const searchResults = await db.employees.search('Smith');

// Update an employee
const updatedEmployee = await db.employees.update(newEmployee.id, {
  position: 'Senior Project Manager',
  department: 'Operations Leadership'
});
```

## Best Practices

1. **Connection Management**:
   - Use connection pooling for better performance
   - Always release connections back to the pool
   - Handle connection errors gracefully

2. **Error Handling**:
   - Wrap database operations in try/catch blocks
   - Log errors with sufficient context
   - Implement retry logic for transient failures

3. **Performance**:
   - Use transactions for multiple related operations
   - Add appropriate indexes for frequently queried columns
   - Limit the number of rows returned when possible

4. **Security**:
   - Use parameterized queries to prevent SQL injection
   - Validate all user inputs
   - Implement proper access controls at the application level

## Troubleshooting

### Common Issues

1. **Connection Failures**:
   - Verify the DATABASE_URL is correct
   - Check network connectivity to the database
   - Ensure the database is running and accessible

2. **Performance Problems**:
   - Check for missing indexes on frequently queried columns
   - Monitor query performance using EXPLAIN ANALYZE
   - Consider denormalizing data for read-heavy operations

3. **Data Consistency**:
   - Use transactions for related operations
   - Implement proper error handling and rollbacks
   - Consider using database constraints for data integrity

## Schema Diagram

```mermaid
erDiagram
    EMPLOYEES ||--o{ LICENSES : has
    EMPLOYEES ||--o{ INDUCTIONS : has
    EMPLOYEES ||--o{ DOCUMENTS : has
    EMPLOYEES ||--o{ EMERGENCY_CONTACTS : has
    
    EMPLOYEES {
        uuid id PK
        string first_name
        string last_name
        string email "UK"
        string phone
        string position
        string department
        string status
        date hire_date
        timestamp created_at
        timestamp updated_at
    }
    
    LICENSES {
        uuid id PK
        uuid employee_id FK
        string name
        string license_number
        date issue_date
        date expiry_date
        string status
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    INDUCTIONS {
        uuid id PK
        uuid employee_id FK
        string name
        date completed_date
        date expiry_date
        string status
        string provider
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    DOCUMENTS {
        uuid id PK
        uuid employee_id FK
        string name
        string type
        text file_url
        date upload_date
        date expiry_date
        string status
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    EMERGENCY_CONTACTS {
        uuid id PK
        uuid employee_id FK
        string name
        string relationship
        string phone
        string email
        text address
        boolean is_primary
        text notes
        timestamp created_at
        timestamp updated_at
    }
```

## Maintenance

### Backup
Regularly back up the database using Neon's backup features or pg_dump.

### Migrations
Use schema migrations for database changes in production. The `scripts/migrate.ts` script provides a basic migration framework.

### Monitoring
Monitor database performance and set up alerts for:
- High query latency
- Connection pool exhaustion
- Storage limits
- Failed queries

## Conclusion
This database schema is designed to support the core functionality of the OpsFlow application, providing a solid foundation for managing employee information, documents, and compliance requirements. The schema is normalized to reduce data redundancy while maintaining good query performance through appropriate indexing and relationships.
