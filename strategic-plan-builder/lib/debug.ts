/**
 * Debug logging utility that can be controlled via environment variables
 * Set NEXT_PUBLIC_DEBUG=true to enable debug logging
 */

const isDebugMode = process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args: any[]) => {
    if (isDebugMode) {
      console.log('[DEBUG]', ...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors
    console.error('[ERROR]', ...args);
  },
  warn: (...args: any[]) => {
    if (isDebugMode) {
      console.warn('[WARN]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (isDebugMode) {
      console.info('[INFO]', ...args);
    }
  }
};