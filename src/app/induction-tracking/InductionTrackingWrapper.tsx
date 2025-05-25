'use client';

import InductionTrackingClient from './InductionTrackingClient';
import { Induction, AlertInduction } from '@/lib/data/inductions';
import { Employee } from '@/lib/data/employees';
import { InductionType } from '@/lib/data/inductionTypes';

interface InductionTrackingWrapperProps {
  inductions: Induction[];
  employees: Employee[];
  inductionTypes: InductionType[];
  stats: {
    totalInductions: number;
    completedInductions: number;
    inProgressInductions: number;
    scheduledInductions: number;
    overdueInductions: number;
  };
  criticalInductions: AlertInduction[];
}

export default function InductionTrackingWrapper(props: InductionTrackingWrapperProps) {
  return <InductionTrackingClient {...props} />;
}
