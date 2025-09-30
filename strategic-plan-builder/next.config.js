/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external images (for district logos and Supabase)
  images: {
    domains: ['localhost', 'qsftokjevxueboldvmzc.supabase.co'],
  },
  // Optimize for both Docker development and Vercel production
  webpack: (config, { dev, isServer }) => {
    // Docker-specific optimizations (only in development)
    if (dev && process.env.NODE_ENV !== 'production') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize bundle size for production
  experimental: {
    optimizePackageImports: ['@radix-ui/react-tabs', '@radix-ui/react-toast', 'lucide-react']
  },
  // Improve build performance and handle context issues
  swcMinify: true,
  // Ensure proper handling of environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig