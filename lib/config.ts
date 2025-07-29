// Centralized configuration utility
// This file ensures environment variables are accessible throughout the project

// Load environment variables from .env files
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

export interface AppConfig {
  tmdb: {
    apiKey: string;
    baseUrl: string;
  };
  app: {
    name: string;
    version: string;
  };
}

// Validate required environment variables
function validateConfig(): AppConfig {
  const tmdbApiKey = process.env.TMB_READ_ONLY;
  
  if (!tmdbApiKey) {
    throw new Error('TMB_READ_ONLY environment variable is required but not set');
  }

  return {
    tmdb: {
      apiKey: tmdbApiKey,
      baseUrl: 'https://api.themoviedb.org/3'
    },
    app: {
      name: 'LDR DCharades',
      version: '1.0.0'
    }
  };
}

// Export the validated configuration
export const appConfig = validateConfig();

// Export individual config sections for convenience
export const tmdbConfig = appConfig.tmdb;
export const appInfo = appConfig.app;

// Helper function to get TMDb API key
export function getTmdbApiKey(): string {
  return appConfig.tmdb.apiKey;
}

// Helper function to get TMDb base URL
export function getTmdbBaseUrl(): string {
  return appConfig.tmdb.baseUrl;
}

// Debug function to check environment variables
export function debugEnvironment(): void {
  console.log('🔍 Environment Debug Info:');
  console.log(`   TMB_READ_ONLY exists: ${!!process.env.TMB_READ_ONLY}`);
  console.log(`   TMB_READ_ONLY length: ${process.env.TMB_READ_ONLY?.length || 0}`);
  console.log(`   TMB_READ_ONLY starts with: ${process.env.TMB_READ_ONLY?.substring(0, 20)}...`);
  console.log(`   Current working directory: ${process.cwd()}`);
  console.log(`   Node environment: ${process.env.NODE_ENV}`);
} 