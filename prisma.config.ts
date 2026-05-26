import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Prisma CLI 実行時にも Next.js と同じ優先順位で .env* を読み込む
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
