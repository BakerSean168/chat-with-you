import { prisma } from "~/lib/prisma";
import type { ApiResponse, PaginatedResponse, Conversation } from "~/types";
import { ConversationQuerySchema } from "~/schemas";

export default defineEventHandler(
  async (event): Promise<PaginatedResponse<Conversation>> => {
    try {
      const query = getQuery(event);

      // 验证查询参数
      const validatedQuery = ConversationQuerySchema.parse({
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
        userId: query.userId as string,
        characterId: query.characterId as string,
      });

      const { page, limit, userId, characterId } = validatedQuery;

      // 构建查询条件
      const where: any = {};

      if (userId) {
        where.userId = userId;
      }

      if (characterId) {
        where.characterId = characterId;
      }

      // 获取对话列表
      const [total, conversations] = await Promise.all([
        prisma.conversation.count({ where }),
        prisma.conversation.findMany({
          where,
          include: {
            character: true,
            messages: {
              take: 1,
              orderBy: { timestamp: "desc" },
            },
            _count: {
              select: { messages: true },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: "desc" },
        }),
      ]);

      // 转换数据格式
      const formattedConversations = conversations.map((conv) => ({
        id: conv.id,
        userId: conv.userId,
        characterId: conv.characterId,
        character: conv.character,
        title: conv.title,
        lastMessage: conv.messages[0]?.content || null,
        messageCount: conv._count.messages,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: formattedConversations as any,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Conversations API error:", error);

      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch conversations",
      });
    }
  }
);
