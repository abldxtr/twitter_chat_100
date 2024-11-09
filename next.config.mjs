/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
        // search: "",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // reactStrictMode: false,
};

export default nextConfig;
