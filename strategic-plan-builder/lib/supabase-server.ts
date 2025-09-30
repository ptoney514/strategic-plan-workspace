import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Creates a Supabase client for server-side operations (API routes, server components)
 * This factory ensures each request gets a fresh client instance to avoid connection pooling issues
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const requestId = crypto.randomUUID();
  
  console.log(`🔄 Creating server client [${requestId}] - Mode: ${isDevelopment ? 'Development' : 'Production'}`);
  
  // In development, use service role key for simplicity and consistency
  if (isDevelopment && supabaseServiceKey) {
    console.log(`🔑 Using service role client (bypasses RLS) [${requestId}]`);
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-request-id': requestId
        },
        fetch: (url, options = {}) => {
          console.log(`🌐 Supabase API Call [${requestId}]: ${url}`);
          return fetch(url, options);
        }
      }
    });
  }
  
  // In production or if service key not available, use anon key
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  console.log(`👤 Using anon client (respects RLS) [${requestId}]`);
  
  // In production, we would integrate with auth here
  // For now, using anon key with proper RLS policies
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-request-id': requestId
      },
      fetch: (url, options = {}) => {
        console.log(`🌐 Supabase API Call [${requestId}]: ${url}`);
        return fetch(url, options);
      }
    }
  });
}

/**
 * Creates a Supabase client for direct database operations (used by db-service)
 * Always uses service role in development for consistency
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!supabaseServiceKey) {
    console.warn('⚠️ Service role key not available, falling back to server client');
    return createServerClient();
  }
  
  const requestId = crypto.randomUUID();
  console.log(`🔧 Creating service client [${requestId}]`);
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-request-id': requestId
      },
      fetch: (url, options = {}) => {
        console.log(`🔑 Service API Call [${requestId}]: ${url}`);
        return fetch(url, options);
      }
    }
  });
}