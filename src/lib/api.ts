import { Employee, License, Induction, Document, EmergencyContact } from './db/schema';

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

const API_BASE_URL = '/api';

// Helper function to handle API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Failed to connect to the server' };
  }
}

// Employee API
export const employeeApi = {
  // Get all employees
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    return fetchApi<Employee[]>('/employees');
  },

  // Get employee by ID
  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    return fetchApi<Employee>(`/employees/${id}`);
  },

  // Create a new employee
  create: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Employee>> => {
    return fetchApi<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  },

  // Update an employee
  update: async (id: string, updates: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    return fetchApi<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an employee
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// License API
export const licenseApi = {
  // Get all licenses for an employee
  getByEmployeeId: async (employeeId: string): Promise<ApiResponse<License[]>> => {
    return fetchApi<License[]>(`/employees/${employeeId}/licenses`);
  },

  // Create a new license
  create: async (employeeId: string, license: Omit<License, 'id' | 'employee_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<License>> => {
    return fetchApi<License>(`/employees/${employeeId}/licenses`, {
      method: 'POST',
      body: JSON.stringify(license),
    });
  },

  // Update a license
  update: async (employeeId: string, licenseId: string, updates: Partial<License>): Promise<ApiResponse<License>> => {
    return fetchApi<License>(`/employees/${employeeId}/licenses/${licenseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a license
  delete: async (employeeId: string, licenseId: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/employees/${employeeId}/licenses/${licenseId}`, {
      method: 'DELETE',
    });
  },
};

// Induction API
export const inductionApi = {
  // Get all inductions for an employee
  getByEmployeeId: async (employeeId: string): Promise<ApiResponse<Induction[]>> => {
    return fetchApi<Induction[]>(`/employees/${employeeId}/inductions`);
  },

  // Create a new induction
  create: async (employeeId: string, induction: Omit<Induction, 'id' | 'employee_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Induction>> => {
    return fetchApi<Induction>(`/employees/${employeeId}/inductions`, {
      method: 'POST',
      body: JSON.stringify(induction),
    });
  },

  // Update an induction
  update: async (employeeId: string, inductionId: string, updates: Partial<Induction>): Promise<ApiResponse<Induction>> => {
    return fetchApi<Induction>(`/employees/${employeeId}/inductions/${inductionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an induction
  delete: async (employeeId: string, inductionId: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/employees/${employeeId}/inductions/${inductionId}`, {
      method: 'DELETE',
    });
  },
};

// Document API
export const documentApi = {
  // Get all documents for an employee
  getByEmployeeId: async (employeeId: string): Promise<ApiResponse<Document[]>> => {
    return fetchApi<Document[]>(`/employees/${employeeId}/documents`);
  },

  // Get documents by type
  getByType: async (employeeId: string, type: string): Promise<ApiResponse<Document[]>> => {
    const result = await fetchApi<Document[]>(`/employees/${employeeId}/documents`);
    if (result.data) {
      return { data: result.data.filter(doc => doc.type === type) };
    }
    return result;
  },

  // Create a new document
  create: async (employeeId: string, document: Omit<Document, 'id' | 'employee_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Document>> => {
    return fetchApi<Document>(`/employees/${employeeId}/documents`, {
      method: 'POST',
      body: JSON.stringify(document),
    });
  },

  // Update a document
  update: async (employeeId: string, documentId: string, updates: Partial<Document>): Promise<ApiResponse<Document>> => {
    return fetchApi<Document>(`/employees/${employeeId}/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a document
  delete: async (employeeId: string, documentId: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/employees/${employeeId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};

// Emergency Contact API
export const emergencyContactApi = {
  // Get all emergency contacts for an employee
  getByEmployeeId: async (employeeId: string): Promise<ApiResponse<EmergencyContact[]>> => {
    return fetchApi<EmergencyContact[]>(`/employees/${employeeId}/emergency-contacts`);
  },

  // Get primary emergency contact
  getPrimary: async (employeeId: string): Promise<ApiResponse<EmergencyContact | null>> => {
    const result = await fetchApi<EmergencyContact[]>(`/employees/${employeeId}/emergency-contacts`);
    if (result.data) {
      const primary = result.data.find(contact => contact.is_primary) || null;
      return { data: primary };
    }
    return result;
  },

  // Create a new emergency contact
  create: async (employeeId: string, contact: Omit<EmergencyContact, 'id' | 'employee_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<EmergencyContact>> => {
    return fetchApi<EmergencyContact>(`/employees/${employeeId}/emergency-contacts`, {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  },

  // Update an emergency contact
  update: async (employeeId: string, contactId: string, updates: Partial<EmergencyContact>): Promise<ApiResponse<EmergencyContact>> => {
    return fetchApi<EmergencyContact>(`/employees/${employeeId}/emergency-contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an emergency contact
  delete: async (employeeId: string, contactId: string): Promise<ApiResponse<void>> => {
    return fetchApi<void>(`/employees/${employeeId}/emergency-contacts/${contactId}`, {
      method: 'DELETE',
    });
  },
};
