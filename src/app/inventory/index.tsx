"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InventoryIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/inventory/search');
  }, [router]);
  
  return null;
}
