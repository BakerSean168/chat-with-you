import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { category, search, isActive = true } = query;

    // 构建查询条件
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { background: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // 获取角色列表
    const characters = await prisma.character.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar: true,
        background: true,
        personality: true,
        speakingStyle: true,
        quotes: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return {
      success: true,
      data: characters,
    };
  } catch (error: any) {
    console.error("Get characters error:", error);

    // 处理未知错误
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while fetching characters",
    });
  }
});
