'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function FeatherIconsLoader() {
  useEffect(() => {
    // Load feather icons if they're already available
    if (typeof window !== 'undefined' && (window as any).feather) {
      (window as any).feather.replace();
    }
  }, []);

  return (
    <Script
      src="https://unpkg.com/feather-icons"
      onLoad={() => {
        if (typeof window !== 'undefined' && (window as any).feather) {
          (window as any).feather.replace();
        }
      }}
    />
  );
}
