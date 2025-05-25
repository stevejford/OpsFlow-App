import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Add type definitions for Jest
declare const jest: any;
declare const describe: any;
declare const it: any;
declare const expect: any;

// Helper to create a mock request
const createMockRequest = (url: string, method: string = 'GET', body?: any) => {
  return {
    url,
    method,
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === 'content-type') return 'application/json';
        return null;
      },
    },
    json: () => Promise.resolve(body || {}),
  } as unknown as NextRequest;
};

// Mock the database operations
const mockDbOperations = {
  getAll: jest.fn(),
  create: jest.fn(),
};

// Mock the entire module
jest.mock('@/lib/db/neon-operations', () => ({
  db: {
    employees: mockDbOperations,
  },
}));

// Import after setting up the mock
import { db } from '@/lib/db/neon-operations';

describe('GET /api/employees', () => {
  it('should return a list of employees', async () => {
    // Mock data
    const mockEmployeeList = [
      { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
    ];
    
    // Mock the database response
    mockDbOperations.getAll.mockResolvedValue(mockEmployeeList);
    
    // Setup test
    const request = createMockRequest('http://localhost/api/employees');
    
    // Execute
    const response = await GET(request);
    
    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockEmployeeList);
    expect(mockDbOperations.getAll).toHaveBeenCalledTimes(1);
  });
  
  it('should handle errors when fetching employees', async () => {
    // Mock the database to throw an error
    mockDbOperations.getAll.mockRejectedValue(new Error('Database error'));
    
    const request = new NextRequest('http://localhost/api/employees');
    const response = await GET(request);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch employees' });
  });
});

describe('POST /api/employees', () => {
  it('should create a new employee', async () => {
    const newEmployee = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      position: 'Developer',
      department: 'Engineering',
      status: 'Active',
      hire_date: '2023-01-01',
    };
    
    const createdEmployee = { id: '1', ...newEmployee, created_at: new Date(), updated_at: new Date() };
    
    // Mock the database response
    mockDbOperations.create.mockResolvedValue(createdEmployee);
    
    // Create a mock request with JSON body
    const request = createMockRequest(
      'http://localhost/api/employees',
      'POST',
      {
        first_name: 'New',
        last_name: 'Employee',
        email: 'new@example.com',
      }
    );
    
    // Call the API
    const response = await POST(request);
    const data = await response.json();
    
    // Assert the response
    expect(response.status).toBe(201);
    expect(data).toEqual(createdEmployee);
    expect(db.employees.create).toHaveBeenCalledWith(newEmployee);
  });
  
  it('should validate required fields', async () => {
    const invalidEmployee = {
      // Missing required fields
      first_name: 'John',
      // last_name is missing
      email: 'john.doe@example.com',
    };
    
    const request = new NextRequest('http://localhost/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidEmployee),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toContain('First name, last name, and email are required');
  });
});
