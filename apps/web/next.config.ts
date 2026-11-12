import type { NextConfig } from 'next';

// Backend address. Defaults to localhost:4000
const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  // Everything that reaches /api on the web is forwarded to the API
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
