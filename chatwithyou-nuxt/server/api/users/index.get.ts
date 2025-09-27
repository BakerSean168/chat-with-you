import { prisma } from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    console.log("API数据库连接字符串:", process.env.DATABASE_URL);
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error: any) {
    console.error("Get users API error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch users",
      data: { error: error.message },
    });
  }
});
