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
  getByEmployeeId: jest.fn(),
  create: jest.fn(),
};

// Mock the entire module
jest.mock('@/lib/db/neon-operations', () => ({
  db: {
    licenses: mockDbOperations,
  },
}));

// Import after setting up the mock
import { db } from '@/lib/db/neon-operations';

describe('GET /api/employees/[id]/licenses', () => {
  it('should return all licenses for an employee', async () => {
    // Mock data
    const mockLicenses = [
      { id: '1', employee_id: '1', type: 'Driver\'s License', number: 'DL12345' },
      { id: '2', employee_id: '1', type: 'Forklift Certification', number: 'FL45678' },
    ];
    
    // Mock the database response
    mockDbOperations.getByEmployeeId.mockResolvedValue(mockLicenses);
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/1/licenses');
    
    // Call the API with params
    const response = await GET(request, { params: { id: '1' } });
    
    // Assert the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockLicenses);
    expect(mockDbOperations.getByEmployeeId).toHaveBeenCalledWith('1');
  });
  
  it('should return 404 if employee has no licenses', async () => {
    // Mock the database to return an empty array
    mockDbOperations.getByEmployeeId.mockResolvedValue([]);
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/999/licenses');
    
    // Call the API with params
    const response = await GET(request, { params: { id: '999' } });
    
    // Assert the response
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'No licenses found for this employee' });
  });
  
  it('should handle errors when fetching licenses', async () => {
    // Mock the database to throw an error
    mockDbOperations.getByEmployeeId.mockRejectedValue(new Error('Database error'));
    
    // Create a mock request
    const request = createMockRequest('http://localhost/api/employees/1/licenses');
    
    // Call the API with params
    const response = await GET(request, { params: { id: '1' } });
    
    // Assert the response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch licenses');
  });
});

describe('POST /api/employees/[id]/licenses', () => {
  it('should create a new license for an employee', async () => {
    // Mock data
    const newLicense = {
      type: 'First Aid Certification',
      number: 'FA789',
      name: 'First Aid Certification',
      license_number: 'FA789',
      issue_date: '2023-03-01',
      expiry_date: '2025-03-01',
      status: 'Active',
    };
    
    const createdLicense = { id: '3', employee_id: '1', ...newLicense };
    
    // Mock the database response
    mockDbOperations.create.mockResolvedValue(createdLicense);
    
    // Create a mock request with body
    const request = createMockRequest(
      'http://localhost/api/employees/1/licenses',
      'POST',
      newLicense
    );
    
    // Call the API with params
    const response = await POST(request, { params: { id: '1' } });
    
    // Assert the response
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toEqual(createdLicense);
    expect(mockDbOperations.create).toHaveBeenCalledWith(expect.objectContaining({
      employee_id: '1',
      ...newLicense,
    }));
  });
  
  it('should validate license data', async () => {
    // Invalid license data (missing required fields)
    const invalidLicense = {};
    
    // Create a mock request with invalid data
    const request = createMockRequest(
      'http://localhost/api/employees/1/licenses',
      'POST',
      invalidLicense
    );
    
    // Call the API with params
    const response = await POST(request, { params: { id: '1' } });
    
    // Assert the response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });
});
