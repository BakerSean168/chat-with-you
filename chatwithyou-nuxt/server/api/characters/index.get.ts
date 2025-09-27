import { prisma } from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    console.log("Characters API called");

    const query = getQuery(event);
    const { category, search, isActive } = query;

    // 构建查询条件
    const where: any = {};

    // 默认只显示激活的角色，除非明确指定 isActive=false
    if (isActive === "false") {
      where.isActive = false;
    } else {
      where.isActive = true;
    }

    if (category && category !== "all") {
      where.category = category;
      console.log("Filtering by category:", category);
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { background: { contains: search as string, mode: "insensitive" } },
      ];
    }

    console.log("Query conditions:", where);

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

    console.log(`Found ${characters.length} characters`);

    return {
      success: true,
      data: characters,
    };
  } catch (error: any) {
    console.error("Get characters error:", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while fetching characters",
    });
  }
});
