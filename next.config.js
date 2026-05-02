/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  images: {
    unoptimized: true,
  },

  // Optional: enable if you add ISR workers
  // experimental: { ppr: true },
}

module.exports = nextConfig
