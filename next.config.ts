import type { NextConfig } from "next";

// Статический экспорт для GitHub Pages.
// basePath = имя репозитория (поменяй, если репо назовёшь иначе).
const repo = "unit-economics-course";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? `/${repo}` : "",
  images: { unoptimized: true },
};

export default nextConfig;
