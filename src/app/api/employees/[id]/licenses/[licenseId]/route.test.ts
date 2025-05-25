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
  getByEmployeeId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock the entire module
jest.mock('@/lib/db/neon-operations', () => ({
  db: {
    licenses: mockDbOperations,
  },
}));

// Import after setting up the mock
import { db } from '@/lib/db/neon-operations';

describe('GET /api/employees/[id]/licenses/[licenseId]', () => {
  it('should return a specific license', async () => {
    // Mock data
    const mockLicense = {
      id: '1', 
      employee_id: '1', 
      type: 'Driver\'s License', 
      number: 'DL12345', 
      issue_date: '2023-01-01', 
      expiry_date: '2028-01-01', 
      status: 'Active' 
    };
    
    // Mock the database response
    mockDbOperations.getByEmployeeId.mockResolvedValue([mockLicense]);
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/1/licenses/1');
    
    // Call the API with params
    const response = await GET(request, { 
      params: { 
        id: '1', 
        licenseId: '1' 
      } 
    });
    
    // Assert the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockLicense);
    expect(mockDbOperations.getByEmployeeId).toHaveBeenCalledWith('1');
  });
  
  it('should return 404 if license not found', async () => {
    // Mock the database to return an empty array
    mockDbOperations.getByEmployeeId.mockResolvedValue([]);
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/1/licenses/999');
    
    // Call the API with params
    const response = await GET(request, { 
      params: { 
        id: '1', 
        licenseId: '999' 
      } 
    });
    
    // Assert the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'License not found' });
  });
});

describe('PUT /api/employees/[id]/licenses/[licenseId]', () => {
  it('should update a license', async () => {
    // Mock data
    const updates = {
      status: 'Expired',
      notes: 'License has expired',
    };
    
    const updatedLicense = {
      id: '1',
      employee_id: '1',
      type: 'Driver\'s License',
      number: 'DL12345',
      issue_date: '2023-01-01',
      expiry_date: '2024-01-01',
      status: 'Expired',
      notes: 'License has expired',
    };
    
    // Mock the database response
    mockDbOperations.getByEmployeeId.mockResolvedValue([{ id: '1', employee_id: '1' }]);
    mockDbOperations.update.mockResolvedValue(updatedLicense);
    
    // Create a mock request with body
    const request = createMockRequest(
      'http://localhost/api/employees/1/licenses/1',
      'PUT',
      updates
    );
    
    // Call the API with params
    const response = await PUT(request, { 
      params: { 
        id: '1', 
        licenseId: '1' 
      } 
    });
    
    // Assert the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(updatedLicense);
    expect(mockDbOperations.update).toHaveBeenCalledWith('1', '1', updates);
  });
  
  it('should validate update data', async () => {
    // Invalid update data
    const invalidUpdates = {
      status: 'Invalid Status',
    };
    
    // Create a mock request with invalid data
    const request = createMockRequest(
      'http://localhost/api/employees/1/licenses/1',
      'PUT',
      invalidUpdates
    );
    
    // Call the API with params
    const response = await PUT(request, { 
      params: { 
        id: '1', 
        licenseId: '1' 
      } 
    });
    
    // Assert the response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });
  
  it('should return 404 if license not found for employee on update', async () => {
    // Mock the database to return an empty array
    mockDbOperations.getByEmployeeId.mockResolvedValue([]);
    
    // Create a mock request with body
    const request = createMockRequest(
      'http://localhost/api/employees/1/licenses/999',
      'PUT',
      { status: 'Active' }
    );
    
    // Call the API with params
    const response = await PUT(request, { 
      params: { 
        id: '1', 
        licenseId: '999' 
      } 
    });
    
    // Assert the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toContain('License not found for this employee');
  });
});

describe('DELETE /api/employees/[id]/licenses/[licenseId]', () => {
  it('should delete a license', async () => {
    // Mock the database responses
    mockDbOperations.getByEmployeeId.mockResolvedValue([{ id: '1', employee_id: '1' }]);
    mockDbOperations.delete.mockResolvedValue(true);
    
    // Create a mock request
    const request = createMockRequest(
      'http://localhost/api/employees/1/licenses/1',
      'DELETE'
    );
    
    // Call the API with params
    const response = await DELETE(request, { 
      params: { 
        id: '1', 
        licenseId: '1' 
      } 
    });
    
    // Assert the response
    expect(response.status).toBe(204);
    expect(mockDbOperations.delete).toHaveBeenCalledWith('1');
  });
  
  it('should return 404 if license not found for employee on delete', async () => {
    // Mock the database to return an empty array
    mockDbOperations.getByEmployeeId.mockResolvedValue([]);
    
    // Create a mock request
    const request = createMockRequest(
      'http://localhost/api/employees/1/licenses/999',
      'DELETE'
    );
    
    // Call the API with params
    const response = await DELETE(request, { 
      params: { 
        id: '1', 
        licenseId: '999' 
      } 
    });
    
    // Assert the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('License not found for this employee');
  });
});
