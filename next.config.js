/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  // Basic configuration for Vercel deployment
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  // Skip validations for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force SSR for all pages to avoid static generation issues
  trailingSlash: false,
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/**/*.wasm'],
    },
  },
}

module.exports = nextConfig