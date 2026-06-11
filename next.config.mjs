/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  output: 'export',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'production.azaria-ai-frontend.pages.dev' },
    ],
  },
};

export default nextConfig;
