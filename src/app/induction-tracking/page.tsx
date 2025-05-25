import React from 'react';
import InductionTrackingClient from './InductionTrackingClient';
import { getInductionTypes } from '@/lib/data/inductionTypes';
import { getEmployees } from '@/lib/data/employees';
import { db } from '@/lib/db/operations';
import { mapDbInductionsToUiInductions } from '@/lib/mappers/inductionMapper';
import { Induction, InductionStatus, AlertInduction } from '@/lib/data/inductions';

export const metadata = {
  title: 'Induction Tracking - OpsFlow',
  description: 'Monitor employee onboarding progress and ensure all required training modules are completed on schedule.',
};

export default async function InductionTrackingPage() {
  // Fetch data from database
  const dbInductions = await db.inductions.getAll();
  const employees = await getEmployees();
  const inductionTypes = await getInductionTypes();
  const overdueDbInductions = await db.inductions.getOverdue();
  
  // Create employee map for mapping
  const employeeMap = new Map<string, { name: string, position: string }>();
  employees.forEach(employee => {
    employeeMap.set(employee.id, {
      name: employee.name,
      position: employee.position
    });
  });
  
  // Map database inductions to UI format
  const inductions = mapDbInductionsToUiInductions(dbInductions, employeeMap);
  
  // Map overdue inductions to alert format
  const criticalInductions: AlertInduction[] = overdueDbInductions.map(induction => ({
    id: induction.id,
    employeeId: induction.employee_id,
    employeeName: `${induction.first_name} ${induction.last_name}`,
    type: induction.name,
    dueDate: new Date(induction.expiry_date).toISOString().split('T')[0],
    daysOverdue: parseInt(induction.days_overdue) || 0
  }));
  
  // Calculate stats
  const totalInductions = inductions.length;
  const completedInductions = inductions.filter(induction => induction.status === 'completed').length;
  const inProgressInductions = inductions.filter(induction => induction.status === 'in-progress').length;
  const scheduledInductions = inductions.filter(induction => induction.status === 'scheduled').length;
  const overdueInductions = inductions.filter(induction => induction.status === 'overdue').length;
  
  const stats = {
    totalInductions,
    completedInductions,
    inProgressInductions,
    scheduledInductions,
    overdueInductions
  };

  return (
    <InductionTrackingClient 
      inductions={inductions}
      employees={employees}
      inductionTypes={inductionTypes}
      stats={stats}
      criticalInductions={criticalInductions}
    />
  );
}
