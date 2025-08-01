/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable React Strict Mode if hydration issues persist
  // Note: Only use this as a last resort, as Strict Mode helps catch bugs
  reactStrictMode: false,
  
  experimental: {
    // Tailwind can generate large CSS files; optimize them in production
    // Disabled during development to prevent runtime failures when critters
    // is not installed.
    optimizeCss: false,
  },
  
  images: {
    // Allow SVG images to be processed by Next.js Image component
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig

// IMPORTANT: Only disable reactStrictMode temporarily for debugging.
// Re-enable it once hydration issues are resolved as it helps catch bugs
// in development that might not show up in production.