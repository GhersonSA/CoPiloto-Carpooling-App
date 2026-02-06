import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/**" },
      { protocol: "https", hostname: "mexico.unir.net", pathname: "/**" },
      { protocol: "https", hostname: "img.freepik.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com", pathname: "/**" },
      { protocol: "https", hostname: "www.enjoyzaragoza.es", pathname: "/**" },
      { protocol: "https", hostname: "www.que.es", pathname: "/**" },
      { protocol: "https", hostname: "www.facebook.com", pathname: "/**" },
      { protocol: "https", hostname: "st4.depositphotos.com", pathname: "/**" },
    ],
  },
  // NOTA: No usamos rewrites para /api/* porque necesitamos que los proxies
  // de Next.js (en src/app/api/) manejen las cookies correctamente.
  // Los endpoints de NextAuth se manejan automáticamente por next-auth.
};

export default nextConfig;
