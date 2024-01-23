/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ hostname: "5e.tools" }] },
};

module.exports = nextConfig;
