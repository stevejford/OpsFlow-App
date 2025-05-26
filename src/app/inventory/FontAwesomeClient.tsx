"use client";

import { useEffect } from 'react';

export default function FontAwesomeClient() {
  useEffect(() => {
    // Load Font Awesome script on the client side only
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return null;
}
