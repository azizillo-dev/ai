import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite faqat lokal ishlab chiqishda (DATABASE_URL bo'lmaganda) ishlatiladi
  serverExternalPackages: ["@electric-sql/pglite"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
