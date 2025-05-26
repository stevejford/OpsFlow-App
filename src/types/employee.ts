// Employee types that match the expected props from child components

export interface EmployeeBasicInfo {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobilePhone: string;
  position: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated' | 'Pending';
  startDate: string;
  hire_date?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  manager: string;
  annualReviewDate: string;
  initials: string;
  [key: string]: any;
}

export interface License {
  id: string;
  name: string;
  status: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  document: string;
  [key: string]: any;
}

export interface Induction {
  id: string;
  name: string;
  status: string;
  company: string;
  platform: string;
  username: string;
  password: string;
  expiryDate: string;
  [key: string]: any;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  [key: string]: any;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  [key: string]: any;
}
