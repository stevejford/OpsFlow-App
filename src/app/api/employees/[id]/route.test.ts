import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';

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
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock the entire module
jest.mock('@/lib/db/neon-operations', () => ({
  db: {
    employees: mockDbOperations,
  },
}));

// Import after setting up the mock
import { db } from '@/lib/db/neon-operations';

describe('GET /api/employees/[id]', () => {
  it('should return an employee by ID', async () => {
    // Mock data
    const mockEmployee = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    };

    // Mock the database response
    mockDbOperations.getById.mockResolvedValue(mockEmployee);
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/1');
    
    // Call the API with params
    const response = await GET(request, { params: { id: '1' } });
    
    // Assert the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockEmployee);
    expect(mockDbOperations.getById).toHaveBeenCalledWith('1');
  });

  it('should return 404 if employee not found', async () => {
    // Mock the database to return null
    mockDbOperations.getById.mockResolvedValue(null);
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/999');
    
    // Call the API with params
    const response = await GET(request, { params: { id: '999' } });
    
    // Assert the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Employee not found' });
  });
});

describe('PUT /api/employees/[id]', () => {
  it('should update an employee', async () => {
    // Mock data
    const updatedEmployee = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.updated@example.com',
    };
    
    // Mock the database response
    mockDbOperations.update.mockResolvedValue(updatedEmployee);
    
    // Create a mock request with body
    const request = createMockRequest(
      'http://localhost/api/employees/1',
      'PUT',
      updatedEmployee
    );
    
    // Call the API with params
    const response = await PUT(request, { params: { id: '1' } });
    
    // Assert the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(updatedEmployee);
    expect(mockDbOperations.update).toHaveBeenCalledWith('1', updatedEmployee);
  });
  
  it('should return 404 if employee not found', async () => {
    // Mock the database to throw an error
    mockDbOperations.update.mockRejectedValue(new Error('Employee not found'));
    
    // Create a mock request with body
    const request = createMockRequest(
      'http://localhost/api/employees/999',
      'PUT',
      { first_name: 'Nonexistent' }
    );
    
    // Call the API with params
    const response = await PUT(request, { params: { id: '999' } });
    
    // Assert the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Employee not found' });
  });
});

describe('DELETE /api/employees/[id]', () => {
  it('should delete an employee', async () => {
    // Mock the database response
    mockDbOperations.delete.mockResolvedValue(true);
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/1', 'DELETE');
    
    // Call the API with params
    const response = await DELETE(request, { params: { id: '1' } });
    
    // Assert the response
    expect(response.status).toBe(204);
    expect(mockDbOperations.delete).toHaveBeenCalledWith('1');
  });
  
  it('should return 404 if employee not found', async () => {
    // Mock the database to throw an error
    mockDbOperations.delete.mockRejectedValue(new Error('Employee not found'));
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/999', 'DELETE');
    
    // Call the API with params
    const response = await DELETE(request, { params: { id: '999' } });
    
    // Assert the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Employee not found' });
  });
});
