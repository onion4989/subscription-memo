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

// CSP は frame-ancestors のみ。script-src 等は Next.js のインラインスクリプトと
// 衝突するため、Report-Only で検証してから別途導入する
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

// ローカル開発は HTTP のため本番のみ付与する
const HSTS_HEADER = {
  key: "Strict-Transport-Security",
  value: "max-age=63072000; includeSubDomains; preload",
};

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  ...(allowedDevOrigins ? { allowedDevOrigins } : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers:
          process.env.NODE_ENV === "production"
            ? [...SECURITY_HEADERS, HSTS_HEADER]
            : SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
