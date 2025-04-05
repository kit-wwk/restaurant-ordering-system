/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: [
      "api.dicebear.com", // For avatar generation
      "localhost",
      "example.com", // Replace with your actual domain when in production
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Remove console logs in production for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Configure experimental features as needed
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // Ensure trailing slashes for better SEO
  trailingSlash: true,
  // Increase timeout for API requests
  api: {
    responseLimit: "8mb",
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

module.exports = nextConfig;
