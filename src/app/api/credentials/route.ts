import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { Credential } from '@/types/credential';

// Mock data for development - will be replaced with actual database calls
let mockCredentials: Credential[] = [
  {
    id: '1',
    name: 'Company Email',
    category: 'business',
    username: 'admin@opsflow.com',
    password: 'securePassword123!',
    url: 'https://mail.opsflow.com',
    notes: 'Main company email account',
    tags: ['email', 'important'],
    lastUpdated: new Date().toISOString(),
    status: 'active',
    strength: 'strong'
  },
  {
    id: '2',
    name: 'AWS Console',
    category: 'api',
    username: 'opsflow-admin',
    password: 'AWSpassword456!',
    url: 'https://aws.amazon.com/console',
    notes: 'AWS admin console access',
    tags: ['cloud', 'aws'],
    lastUpdated: new Date().toISOString(),
    status: 'active',
    strength: 'medium'
  },
  {
    id: '3',
    name: 'Employee Portal',
    category: 'employee',
    username: 'hr-admin',
    password: 'HRportal789!',
    url: 'https://employees.opsflow.com',
    notes: 'HR admin access to employee portal',
    tags: ['hr', 'employees'],
    lastUpdated: new Date().toISOString(),
    status: 'active',
    strength: 'strong'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Filter credentials based on query parameters
    let filteredCredentials = [...mockCredentials];
    
    if (category) {
      filteredCredentials = filteredCredentials.filter(cred => cred.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCredentials = filteredCredentials.filter(cred => 
        cred.name.toLowerCase().includes(searchLower) || 
        cred.username.toLowerCase().includes(searchLower) ||
        (cred.notes && cred.notes.toLowerCase().includes(searchLower)) ||
        (cred.tags && cred.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    // In a real implementation, we would use Prisma to query the database
    // Example:
    // const credentials = await prisma.credential.findMany({
    //   where: {
    //     ...(category ? { category } : {}),
    //     ...(search ? {
    //       OR: [
    //         { name: { contains: search, mode: 'insensitive' } },
    //         { username: { contains: search, mode: 'insensitive' } },
    //         { notes: { contains: search, mode: 'insensitive' } },
    //       ]
    //     } : {})
    //   },
    //   orderBy: { lastUpdated: 'desc' }
    // });
    
    return NextResponse.json(filteredCredentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.username || !data.password || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, username, password, and category are required' },
        { status: 400 }
      );
    }
    
    // Create new credential
    const newCredential: Credential = {
      id: uuidv4(),
      name: data.name,
      category: data.category,
      username: data.username,
      password: data.password, // In production, this should be encrypted
      url: data.url,
      notes: data.notes,
      tags: data.tags || [],
      expirationDate: data.expirationDate,
      lastUpdated: new Date().toISOString(),
      createdBy: 'current-user-id', // In production, get from auth context
      status: data.status || 'active',
      strength: calculatePasswordStrength(data.password)
    };
    
    // In a real implementation, we would use Prisma to create the credential
    // Example:
    // const credential = await prisma.credential.create({
    //   data: {
    //     name: data.name,
    //     category: data.category,
    //     username: data.username,
    //     password: data.password, // Should be encrypted
    //     url: data.url,
    //     notes: data.notes,
    //     tags: data.tags,
    //     expirationDate: data.expirationDate,
    //     status: data.status || 'active',
    //     createdBy: 'current-user-id', // From auth context
    //   }
    // });
    
    // For mock implementation, add to array
    mockCredentials.push(newCredential);
    
    return NextResponse.json(newCredential, { status: 201 });
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}

// Helper function to calculate password strength
function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars, isLongEnough].filter(Boolean).length;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}
