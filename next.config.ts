import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Beperkt aantal breedtes: houdt het aantal Vercel-transformaties laag.
    deviceSizes: [640, 1080, 1600],
    imageSizes: [96, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  async rewrites() {
    // Sveltia CMS: /admin moet de statische index.html uit public/admin serveren.
    return [
      { source: '/admin', destination: '/admin/index.html' },
      { source: '/admin/', destination: '/admin/index.html' },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/config.yml',
        headers: [
          { key: 'Content-Type', value: 'text/yaml' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ];
  },
};

export default nextConfig;
