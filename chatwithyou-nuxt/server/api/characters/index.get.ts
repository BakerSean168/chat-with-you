import { prisma } from "~/lib/prisma";
import type { ApiResponse, PaginatedResponse, Character } from "~/types";
import { CharacterQuerySchema } from "~/schemas";

export default defineEventHandler(
  async (event): Promise<PaginatedResponse<Character>> => {
    try {
      const query = getQuery(event);

      // 验证查询参数
      const validatedQuery = CharacterQuerySchema.parse({
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
        category: query.category as string,
        search: query.search as string,
        isActive: query.isActive ? query.isActive === "true" : undefined,
      });

      const { page, limit, category, search, isActive } = validatedQuery;

      // 构建查询条件
      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { background: { contains: search, mode: "insensitive" } },
          { personality: { hasSome: [search] } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // 获取总数和数据
      const [total, characters] = await Promise.all([
        prisma.character.count({ where }),
        prisma.character.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: "desc" },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: characters as Character[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Characters API error:", error);

      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch characters",
      });
    }
  }
);
