"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InventoryPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/inventory/search');
  }, [router]);
  
  return null;
}
