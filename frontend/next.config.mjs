/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/game/:path*',
        destination: `${backendUrl}/api/game/:path*`,
      },
    ];
  },
};

export default nextConfig;
