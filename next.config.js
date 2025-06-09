/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Tailwind can generate large CSS files; optimize them in production
    optimizeCss: true,
  },
}

module.exports = nextConfig
