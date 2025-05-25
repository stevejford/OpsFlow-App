import { FC } from 'react';

interface EmployeeProfileData {
  employee: any;
  licenses: any[];
  inductions: any[];
  documents: any[];
  emergencyContact?: any;
}

declare const EmployeeProfileClient: FC<{ data: EmployeeProfileData }>;

export default EmployeeProfileClient;
