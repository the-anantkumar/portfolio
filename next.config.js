/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Tailwind can generate large CSS files; optimize them in production
    // Disabled during development to prevent runtime failures when critters
    // is not installed.
    optimizeCss: false,
  },
}

module.exports = nextConfig
