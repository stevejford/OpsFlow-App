import React from 'react';
import { Metadata } from 'next';
import LicenseTrackingClient from './LicenseTrackingClient';
import { db } from '@/lib/db/neon-operations';
import { query } from '@/lib/db/neon-db';
import { AlertLicense } from '@/components/licenses/LicenseAlerts';

export const metadata: Metadata = {
  title: 'License Tracking - OpsFlow',
  description: 'Monitor and manage all employee licenses and certifications with automated expiry alerts.',
};

async function getLicensesData() {
  console.log('Starting getLicensesData function');
  try {
    // Fetch all employees first
    const employees = await db.employees.getAll();
    console.log(`Found ${employees.length} employees:`, employees.map(e => `${e.id}: ${e.first_name} ${e.last_name}`));
    
    // Create a map of employee IDs to employee data for quick lookup
    const employeeMap = new Map();
    employees.forEach(employee => {
      employeeMap.set(employee.id, employee);
    });
    console.log('Employee map keys:', Array.from(employeeMap.keys()));
    
    // Since license_types table doesn't exist yet, we'll use a hard-coded list for now
    const defaultLicenseTypes = [
      { id: 'lt1', name: 'CDL License' },
      { id: 'lt2', name: 'Safety Certification' },
      { id: 'lt3', name: 'Equipment License' },
      { id: 'lt4', name: 'Professional License' },
      { id: 'lt5', name: 'General License' }
    ];
    console.log('Using default license types:', defaultLicenseTypes);
    
    const licenseTypeMap = new Map();
    defaultLicenseTypes.forEach(lt => {
      licenseTypeMap.set(lt.id, lt.name);
    });
    console.log('License type map keys:', Array.from(licenseTypeMap.keys()));
    
    // Check if licenses table exists
    try {
      // Try a simpler query first to see if we have any licenses at all
      const licenseCount = await query('SELECT COUNT(*) as count FROM licenses');
      console.log('Total licenses in database:', licenseCount.rows[0].count);
    } catch (error) {
      console.error('Error checking licenses table, it might not exist:', error);
      console.log('Creating licenses table...');
      
      // Create licenses table if it doesn't exist
      await query(`
        CREATE TABLE IF NOT EXISTS licenses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          employee_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          license_number VARCHAR(255),
          issue_date DATE,
          expiry_date DATE,
          status VARCHAR(50) DEFAULT 'active',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )
      `);
      
      // Add a sample license for testing
      if (employees.length > 0) {
        console.log('Adding sample license for testing...');
        const firstEmployee = employees[0];
        await query(`
          INSERT INTO licenses (employee_id, name, license_number, issue_date, expiry_date, status, notes)
          VALUES ($1, 'Sample License', 'LIC-001', NOW(), (NOW() + INTERVAL '1 year'), 'active', 'Sample license created for testing')
        `, [firstEmployee.id]);
      }
    }
    
    // Use a simpler JOIN query without license_types
    let queryText = `
      SELECT 
        l.id, 
        l.employee_id, 
        l.name as license_name,
        l.license_number,
        l.issue_date, 
        l.expiry_date, 
        l.status,
        l.notes,
        e.first_name,
        e.last_name,
        e.position
      FROM licenses l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.expiry_date ASC
    `;
    
    console.log('Executing query:', queryText);
    const { rows } = await query(queryText);
    
    // Debug: Check if we're getting any licenses
    console.log(`Raw license data: Found ${rows.length} licenses`);
    if (rows.length > 0) {
      console.log('First license:', rows[0]);
    } else {
      console.log('No licenses found in the JOIN query');
    }

    // Process the data for the client component
    const processedLicenses = rows.map(license => {
      // We already have all the data we need from the JOIN query
      const expiryDate = new Date(license.expiry_date);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Determine license status based on expiry date
      let status: 'Active' | 'Expiring Soon' | 'Expired';
      if (diffDays < 0) {
        status = 'Expired';
      } else if (diffDays <= 30) {
        status = 'Expiring Soon';
      } else {
        status = 'Active';
      }

      // Parse additional data from notes field if available
      let additionalData: { issuing_authority?: string; document_url?: string } = {};
      if (license.notes) {
        try {
          additionalData = JSON.parse(license.notes);
        } catch (e) {
          console.warn('Could not parse license notes:', e);
        }
      }

      // Generate employee name from first and last name
      const employeeName = `${license.first_name} ${license.last_name}`;
      
      // Generate initials from employee name
      const nameParts = employeeName.split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0].substring(0, 2);

      // Assign a color based on the first letter of the name (for avatar)
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'gray'];
      const colorIndex = employeeName.charCodeAt(0) % colors.length;
      
      return {
        id: license.id,
        employeeId: license.employee_id,
        employeeName: employeeName,
        employeeRole: license.position || 'Employee',
        employeeInitials: initials,
        employeeColor: colors[colorIndex],
        licenseType: 'General License', // Hardcoding license type for now
        licenseTypeId: 'lt5', // Using a default license type ID
        name: license.license_name, // Using the aliased name from our query
        licenseNumber: license.license_number || '',
        issuingAuthority: additionalData.issuing_authority || '',
        issueDate: license.issue_date,
        expiryDate: license.expiry_date,
        documentUrl: additionalData.document_url || 'https://utfs.io/f/MaWHogOwAUKHDZCqpVaf2EJgnY0RudUTkKVMSOIxiBealC6s', // Default document URL
        status,
        daysUntilExpiry: diffDays,
      };
    });
    
    // Filter out null values (licenses without employees)
    const validLicenses = processedLicenses.filter(license => license !== null);
    
    // Debug: Check the final processed licenses
    console.log(`Found ${validLicenses.length} valid licenses after processing`);
    
    return validLicenses;
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return [];
  }
}

async function getEmployeesData() {
  try {
    // Use the employee operations from neon-operations
    const employees = await db.employees.getAll();
    
    // Transform the data to match the expected format
    return employees.map(employee => ({
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`
    }));
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

async function getLicenseTypesData() {
  try {
    // Use hardcoded license types since the table doesn't exist yet
    return [
      { id: 'lt1', name: 'CDL License' },
      { id: 'lt2', name: 'Safety Certification' },
      { id: 'lt3', name: 'Equipment License' },
      { id: 'lt4', name: 'Professional License' },
      { id: 'lt5', name: 'General License' }
    ];
  } catch (error) {
    console.error('Error with license types:', error);
    return [];
  }
}

export default async function LicenseTrackingPage() {
  console.log('Starting LicenseTrackingPage function');
  
  const licensesData = await getLicensesData();
  console.log(`License data returned from getLicensesData: ${licensesData.length} items`);
  
  const employeesData = await getEmployeesData();
  console.log(`Employee data returned from getEmployeesData: ${employeesData.length} items`);
  
  const licenseTypesData = await getLicenseTypesData();
  console.log(`License type data returned from getLicenseTypesData: ${licenseTypesData.length} items`);
  
  // Transform license data to match the expected interface
  const formattedLicenses = licensesData.map(license => ({
    id: license.id,
    employeeName: license.employeeName,
    employeeRole: license.employeeRole,
    employeeInitials: license.employeeInitials,
    employeeColor: license.employeeColor,
    licenseType: license.licenseType,
    licenseDescription: license.name || '',
    issueDate: license.issueDate,
    expiryDate: license.expiryDate,
    status: license.status,
    daysUntilExpiry: license.daysUntilExpiry,
    documentUrl: license.documentUrl
  }));
  
  // Calculate statistics
  const totalLicenses = formattedLicenses.length;
  const activeLicenses = formattedLicenses.filter(license => license.status === 'Active').length;
  const expiringSoon = formattedLicenses.filter(license => license.status === 'Expiring Soon').length;
  const expired = formattedLicenses.filter(license => license.status === 'Expired').length;
  
  // Get critical licenses (expired or expiring soon)
  const criticalLicenses = formattedLicenses
    .filter(license => license.status === 'Expired' || license.status === 'Expiring Soon')
    .sort((a, b) => (a.daysUntilExpiry || 0) - (b.daysUntilExpiry || 0))
    .slice(0, 5) // Get top 5 most critical
    .map(license => ({
      id: license.id,
      employeeName: license.employeeName,
      licenseType: license.licenseType,
      licenseName: license.licenseDescription, // Add licenseName property
      expiryDate: license.expiryDate,
      status: license.status,
      daysUntilExpiry: license.daysUntilExpiry,
      isExpired: license.status === 'Expired' // Add isExpired property
    })) as AlertLicense[]; // Cast to AlertLicense[] type
  
  // Additional debugging
  console.log(`Found ${formattedLicenses.length} formatted licenses in total`);
  console.log('First license example:', formattedLicenses.length > 0 ? formattedLicenses[0] : 'No licenses found');
  
  return (
    <div className="p-6">
      
      <LicenseTrackingClient 
        licenses={formattedLicenses}
        employees={employeesData}
        licenseTypes={licenseTypesData}
        stats={{
          totalLicenses,
          activeLicenses,
          expiringSoon,
          expired
        }}
        criticalLicenses={criticalLicenses}
      />
    </div>
  );
}
