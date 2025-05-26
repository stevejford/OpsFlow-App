"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import InductionCreateClient from './InductionCreateClient';

interface InductionFormWrapperProps {
  employeeId: string;
}

export default function InductionFormWrapper({ 
  employeeId
}: InductionFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Format the data for the API
      const apiData = {
        company: formData.company,
        subject: formData.subject,
        portal_url: formData.portalUrl,
        due_date: new Date(formData.dueDate).toISOString(),
        username: formData.username,
        password: formData.password,
        notes: formData.notes,
        document_url: formData.documentUrl
      };
      
      // Call the API to create the induction
      const response = await fetch(`/api/employees/${employeeId}/inductions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create induction');
      }
      
      toast.success("Induction created successfully");
      
      // Add a small delay to ensure the API has time to process before redirecting
      setTimeout(() => {
        router.push(`/employees/${employeeId}`);
        router.refresh(); // Force a refresh to show the new induction
      }, 500);
    } catch (error) {
      console.error("Error creating induction:", error);
      toast.error(`Error creating induction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InductionCreateClient
      employeeId={employeeId}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
