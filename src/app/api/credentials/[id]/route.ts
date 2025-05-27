import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Credential } from '@/types/credential';

// Mock data - this would be replaced with actual database calls
// This is imported from the parent route in a real implementation
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Find credential by ID
    const credential = mockCredentials.find(cred => cred.id === id);
    
    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    
    // In a real implementation, we would use Prisma to fetch the credential
    // Example:
    // const credential = await prisma.credential.findUnique({
    //   where: { id }
    // });
    
    // if (!credential) {
    //   return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    // }
    
    // Log access for audit purposes
    console.log(`Credential ${id} accessed at ${new Date().toISOString()}`);
    
    return NextResponse.json(credential);
  } catch (error) {
    console.error('Error fetching credential:', error);
    return NextResponse.json({ error: 'Failed to fetch credential' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Find credential index
    const credentialIndex = mockCredentials.findIndex(cred => cred.id === id);
    
    if (credentialIndex === -1) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.name || !data.username || !data.password || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, username, password, and category are required' },
        { status: 400 }
      );
    }
    
    // Update credential
    const updatedCredential: Credential = {
      ...mockCredentials[credentialIndex],
      name: data.name,
      category: data.category,
      username: data.username,
      password: data.password, // In production, this should be encrypted
      url: data.url,
      notes: data.notes,
      tags: data.tags || [],
      expirationDate: data.expirationDate,
      lastUpdated: new Date().toISOString(),
      status: data.status || 'active',
      strength: calculatePasswordStrength(data.password)
    };
    
    // In a real implementation, we would use Prisma to update the credential
    // Example:
    // const updatedCredential = await prisma.credential.update({
    //   where: { id },
    //   data: {
    //     name: data.name,
    //     category: data.category,
    //     username: data.username,
    //     password: data.password, // Should be encrypted
    //     url: data.url,
    //     notes: data.notes,
    //     tags: data.tags,
    //     expirationDate: data.expirationDate,
    //     lastUpdated: new Date(),
    //     status: data.status || 'active',
    //   }
    // });
    
    // For mock implementation, update array
    mockCredentials[credentialIndex] = updatedCredential;
    
    return NextResponse.json(updatedCredential);
  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Find credential index
    const credentialIndex = mockCredentials.findIndex(cred => cred.id === id);
    
    if (credentialIndex === -1) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }
    
    // In a real implementation, we would use Prisma to delete the credential
    // Example:
    // await prisma.credential.delete({
    //   where: { id }
    // });
    
    // For mock implementation, remove from array
    mockCredentials.splice(credentialIndex, 1);
    
    return NextResponse.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
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
