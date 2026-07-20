/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Treat these as server external packages so Next.js server-side bundler doesn't try to bundle JSDOM/dompurify sub-dependencies.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom", "bullmq"],
  transpilePackages: ["@yourcompany/global-backend-next"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Allows SDK usage from anywhere
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ];
  },
  webpack: (config, { isServer, nextRuntime }) => {
    if (!isServer || nextRuntime !== "nodejs") {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        dns: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("jsdom", "isomorphic-dompurify");
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
