import type { NextConfig } from "next";

function resolveAllowedDevOrigins(): string[] | undefined {
  const authUrl = process.env.AUTH_URL;
  if (!authUrl) {
    return undefined;
  }

  try {
    const { hostname } = new URL(authUrl);
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return undefined;
    }

    return [hostname];
  } catch {
    return undefined;
  }
}

const allowedDevOrigins = resolveAllowedDevOrigins();

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  ...(allowedDevOrigins ? { allowedDevOrigins } : {}),
};

export default nextConfig;
