import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// In development, we'll allow missing environment variables with warnings
const getMissingEnvVarValue = (envVar: string) => {
  console.warn(`⚠️ Missing environment variable: ${envVar}. Using fallback value for development.`);
  
  // Default fallbacks for development
  if (envVar === 'DATABASE_URL') {
    return 'postgresql://placeholder:placeholder@localhost:5432/opsflow_dev';
  }
  
  return 'placeholder-value';
};

// Get environment variable with fallback for development
const getEnvVar = (name: string): string => {
  if (!process.env[name]) {
    if (isDevelopment) {
      return getMissingEnvVarValue(name);
    } else {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
  return process.env[name]!;
};

export const config = {
  database: {
    url: getEnvVar('DATABASE_URL'),
    debug: process.env.DB_DEBUG === 'true',
  },
};
