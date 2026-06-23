import path from "node:path";
import { defineConfig } from "prisma/config";

// Docker 起動時用。DATABASE_URL は Dokploy の環境変数から注入される。
export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
