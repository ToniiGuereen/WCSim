/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy backend requests if called via /api/backend/
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: 'http://localhost:4101/worldCupCore/:path*',
      },
    ];
  },
};

export default nextConfig;
