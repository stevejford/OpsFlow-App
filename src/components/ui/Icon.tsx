"use client";

import { useEffect, useState } from 'react';

type IconProps = {
  name: string;
  className?: string;
};

// This component will only render the Font Awesome icon on the client side
// preventing hydration errors between server and client rendering
export default function Icon({ name, className = "" }: IconProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Return empty span with same dimensions during server-side rendering
  if (!isMounted) {
    return <span className={className}></span>;
  }
  
  // Only render the actual icon on the client side
  return <i className={`${name} ${className}`}></i>;
}
