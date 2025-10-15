/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // PWA support for casino experience
  reactStrictMode: true,
}

module.exports = nextConfig