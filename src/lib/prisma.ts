import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only instantiate the pg connection pool when we're actually creating a
    // new client - otherwise, during dev hot-reload, a fresh Pool would be
    // constructed on every module re-evaluation even though the cached
    // PrismaClient below is reused, silently leaking connections.
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    // log:
    //   process.env.NODE_ENV === "development"
    //     ? ["query", "error", "warn"]
    //     : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
