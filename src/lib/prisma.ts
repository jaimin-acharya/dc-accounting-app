import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import fs from "fs";
import os from "os";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  let url = process.env.DATABASE_URL;
  let authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  // On Vercel, if no remote cloud database is set, we copy the bundled seeded template database
  // to the writable temporary directory (/tmp) to avoid read-only SQLite filesystem crashes.
  if (!url && process.env.VERCEL) {
    try {
      const tempDbPath = path.join(os.tmpdir(), "dev.db");
      const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

      if (!fs.existsSync(tempDbPath)) {
        console.log(`[Vercel] Provisioning writable SQLite database from ${sourceDbPath} to ${tempDbPath}`);
        fs.copyFileSync(sourceDbPath, tempDbPath);
        fs.chmodSync(tempDbPath, 0o666);
      }
      url = `file:${tempDbPath}`;
    } catch (err) {
      console.error("[Vercel] Failed to provision temp SQLite database:", err);
    }
  }

  if (!url) {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), "prisma", "dev.db");
    url = `file:${dbPath}`;
  }

  const adapter = new PrismaLibSql({
    url: url,
    authToken: authToken || undefined,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
