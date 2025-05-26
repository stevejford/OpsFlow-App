// Mock data for induction types
export interface InductionType {
  id: string;
  name: string;
  description?: string;
}

export async function getInductionTypes(): Promise<InductionType[]> {
  return [
    {
      id: '1',
      name: 'Safety Induction',
      description: 'Workplace safety protocols and emergency procedures'
    },
    {
      id: '2',
      name: 'Company Orientation',
      description: 'Introduction to company culture, policies, and procedures'
    },
    {
      id: '3',
      name: 'Technical Training',
      description: 'Technical skills and equipment handling'
    },
    {
      id: '4',
      name: 'Equipment Training',
      description: 'Specific equipment operation and certification'
    },
    {
      id: '5',
      name: 'Compliance Training',
      description: 'Legal and regulatory compliance requirements'
    }
  ];
}

export async function getInductionTypeById(id: string): Promise<InductionType | null> {
  const inductionTypes = await getInductionTypes();
  return inductionTypes.find(type => type.id === id) || null;
}
