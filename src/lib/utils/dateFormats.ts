import { format } from 'date-fns';

/**
 * Formats a date to a consistent string format using UTC methods
 * to avoid timezone discrepancies between server and client
 */
export function formatDate(date: Date | string, formatString: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Use UTC methods to ensure consistent formatting
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  // Return in dd/MM/yyyy format to match server rendering
  return `${day}/${month}/${year}`;
}

/**
 * Calculates days until expiry using UTC methods
 */
export function getDaysUntilExpiry(expiryDate: Date | string): number {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  
  // Use UTC methods for consistent calculation
  const expiryUTC = new Date(Date.UTC(
    expiry.getUTCFullYear(),
    expiry.getUTCMonth(),
    expiry.getUTCDate()
  ));
  
  const nowUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  
  const diffTime = expiryUTC.getTime() - nowUTC.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats expiration date with relative time
 */
export function formatExpirationDate(expiryDate: Date | string): string {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  const formattedDate = formatDate(expiryDate);
  
  if (daysUntil < 0) {
    return `Expired ${Math.abs(daysUntil)} days ago (${formattedDate})`;
  } else {
    return `Expires in ${daysUntil} days (${formattedDate})`;
  }
}

/**
 * Formats date for relative display (e.g., "Expires in X days")
 */
export function formatDateRelative(expiryDate: Date | string): string {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  
  if (daysUntil < 0) {
    return `Expired ${Math.abs(daysUntil)} days ago`;
  } else if (daysUntil === 0) {
    return 'Expires today';
  } else if (daysUntil === 1) {
    return 'Expires tomorrow';
  } else {
    return `Expires in ${daysUntil} days`;
  }
}
