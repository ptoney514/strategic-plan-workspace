/**
 * Environment variable validation
 * Ensures all required environment variables are present at runtime
 */

interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

export function validateEnvironmentVariables(): EnvValidationResult {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const optionalButRecommended = [
    'SUPABASE_SERVICE_ROLE_KEY' // Recommended for server-side operations
  ];

  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Check optional but recommended variables
  optionalButRecommended.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`${varName} is not set. Some features may be limited.`);
    }
  });

  // Validate Supabase URL format if present
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL should start with https://');
  }

  // Validate Supabase anon key format if present
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey && anonKey.length < 40) {
    warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings
  };
}

/**
 * Throws an error if required environment variables are missing
 * Use this in server-side code to fail fast
 */
export function assertEnvironmentVariables(): void {
  const result = validateEnvironmentVariables();
  
  if (!result.isValid) {
    throw new Error(
      `Missing required environment variables: ${result.missingVars.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }

  // Log warnings in development
  if (process.env.NODE_ENV === 'development' && result.warnings.length > 0) {
    console.warn('⚠️ Environment variable warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
}

/**
 * Get validated environment variables with type safety
 */
export function getEnvConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Required Supabase environment variables are not configured');
  }

  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      serviceKey: supabaseServiceKey // May be undefined
    },
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  };
}