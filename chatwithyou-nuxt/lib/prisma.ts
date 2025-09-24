import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 暂时禁用 prisma 连接来调试网络问题
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db" // 使用本地文件数据库避免网络连接问题
    }
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
