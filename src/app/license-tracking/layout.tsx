import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'License Tracking - OpsFlow',
  description: 'Monitor and manage all employee licenses and certifications with automated expiry alerts.',
};

export default function LicenseTrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
