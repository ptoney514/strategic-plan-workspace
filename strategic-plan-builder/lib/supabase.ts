import { createClient } from '@supabase/supabase-js';

/**
 * Client-side Supabase client for use in browser/React components
 * This client respects Row Level Security and uses session-based auth
 * 
 * For server-side operations (API routes), use createServerClient() from lib/supabase-server.ts
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Only log on client-side to avoid server-side noise
if (typeof window !== 'undefined') {
  console.log('🌐 Initializing browser Supabase client');
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Browser client for client-side operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  }
});

// DEPRECATED: Use createServerClient() from lib/supabase-server.ts for server-side operations
export const supabaseAdmin = null;

// Helper function to create a client (useful in components)
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    }
  });
}

// Alias for consistency
export { createSupabaseClient as createClient };

// Re-export types from the centralized types file
export type { District, Goal, Metric, MetricType, DataSourceType, DataPoint, GoalWithMetrics } from './types';