/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ctx/core", "@ctx/ui"],
  experimental: {
    typedRoutes: false
  }
};

export default nextConfig;
