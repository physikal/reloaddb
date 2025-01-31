import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with retries
const createClientWithRetry = (retries = 3, delay = 1000) => {
  let attempt = 0;
  
  const tryConnect = async () => {
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      // Test the connection
      await client.auth.getSession();
      return client;
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      return tryConnect();
    }
  };

  return tryConnect();
};

// Export a promise that resolves to the Supabase client
export const supabasePromise = createClientWithRetry();

// Export the Supabase client for immediate use
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // Check for specific error types
  if (error.code === 'PGRST301') {
    return new Error('Database connection failed. Please try again.');
  }
  if (error.code === 'AUTH_INVALID_TOKEN') {
    return new Error('Your session has expired. Please sign in again.');
  }
  
  return new Error(error.message || 'An unexpected error occurred');
};