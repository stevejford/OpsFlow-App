import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { CredentialCategory } from '@/types/credential';

// Mock data for development - will be replaced with actual database calls
let mockCategories: CredentialCategory[] = [
  {
    id: '1',
    name: 'Business Login',
    description: 'Credentials for business accounts and memberships'
  },
  {
    id: '2',
    name: 'Website Credential',
    description: 'Credentials for website logins'
  },
  {
    id: '3',
    name: 'Employee Login',
    description: 'Credentials for employee accounts'
  },
  {
    id: '4',
    name: 'API Key',
    description: 'API keys and tokens for software services'
  },
  {
    id: '5',
    name: 'Other',
    description: 'Other credential types'
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, we would use Prisma to fetch categories
    // Example:
    // const categories = await prisma.credentialCategory.findMany({
    //   orderBy: { name: 'asc' }
    // });
    
    return NextResponse.json(mockCategories);
  } catch (error) {
    console.error('Error fetching credential categories:', error);
    return NextResponse.json({ error: 'Failed to fetch credential categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Missing required field: name is required' },
        { status: 400 }
      );
    }
    
    // Check if category with same name already exists
    const existingCategory = mockCategories.find(
      cat => cat.name.toLowerCase() === data.name.toLowerCase()
    );
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create new category
    const newCategory: CredentialCategory = {
      id: uuidv4(),
      name: data.name,
      description: data.description
    };
    
    // In a real implementation, we would use Prisma to create the category
    // Example:
    // const category = await prisma.credentialCategory.create({
    //   data: {
    //     name: data.name,
    //     description: data.description
    //   }
    // });
    
    // For mock implementation, add to array
    mockCategories.push(newCategory);
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating credential category:', error);
    return NextResponse.json({ error: 'Failed to create credential category' }, { status: 500 });
  }
}
