// Mock data for employees
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  avatarColor?: string;
  initials?: string;
}

export async function getEmployees(): Promise<Employee[]> {
  return [
    {
      id: '100',
      name: 'Stephen Ford',
      position: 'Operations Manager',
      department: 'Operations',
      avatarColor: 'bg-blue-600',
      initials: 'SF'
    },
    {
      id: '101',
      name: 'Emma Davis',
      position: 'New Hire',
      department: 'Operations',
      avatarColor: 'bg-orange-600',
      initials: 'ED'
    },
    {
      id: '102',
      name: 'Mike Rodriguez',
      position: 'Installation Technician',
      department: 'Installation',
      avatarColor: 'bg-blue-600',
      initials: 'MR'
    },
    {
      id: '103',
      name: 'Jessica Lee',
      position: 'Customer Service Rep',
      department: 'Customer Service',
      avatarColor: 'bg-green-600',
      initials: 'JL'
    },
    {
      id: '104',
      name: 'Robert Kim',
      position: 'New Hire',
      department: 'Installation',
      avatarColor: 'bg-purple-600',
      initials: 'RK'
    },
    {
      id: '105',
      name: 'Alex Thompson',
      position: 'Field Technician',
      department: 'Operations',
      avatarColor: 'bg-yellow-600',
      initials: 'AT'
    }
  ];
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const employees = await getEmployees();
  return employees.find(employee => employee.id === id) || null;
}
