// Database schema types
export interface Employee {
  id: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated' | 'Pending';
  hire_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface License {
  id: string;
  employee_id: string;
  name: string;
  license_number?: string;
  issue_date: Date;
  expiry_date: Date;
  status: 'Valid' | 'Expired' | 'Expiring Soon' | 'Renewal Pending';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Induction {
  id: string;
  employee_id: string;
  name: string;
  completed_date: Date;
  expiry_date?: Date;
  status: 'Completed' | 'Pending' | 'Expired' | 'In Progress';
  provider?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  employee_id: string;
  name: string;
  type: string;
  file_url: string;
  upload_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmergencyContact {
  id: string;
  employee_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentFile {
  id: string;
  folder_id: string;
  name: string;
  type: string;
  file_url: string;
  size: number;
  upload_date: Date;
  uploaded_by?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Type for creating a new employee (omits auto-generated fields)
export type CreateEmployee = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;

// Type for updating an employee (makes all fields optional and omits some)
export type UpdateEmployee = Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>;
