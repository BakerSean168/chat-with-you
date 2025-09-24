import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { conversationId, userId } = query;

    // 验证必需参数
    if (!conversationId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required parameters: conversationId, userId",
      });
    }

    // 获取对话信息
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId as string },
      include: {
        character: true,
        messages: {
          orderBy: { timestamp: "asc" },
          take: 100, // 限制消息数量，避免过载
        },
      },
    });

    if (!conversation) {
      throw createError({
        statusCode: 404,
        statusMessage: "Conversation not found",
      });
    }

    // 验证用户权限
    if (conversation.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Access denied",
      });
    }

    return {
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
        character: {
          id: conversation.character.id,
          name: conversation.character.name,
          avatar: conversation.character.avatar,
          background: conversation.character.background,
          personality: conversation.character.personality,
          speakingStyle: conversation.character.speakingStyle,
          quotes: conversation.character.quotes,
          category: conversation.character.category,
        },
        messages: conversation.messages.map((message) => ({
          id: message.id,
          content: message.content,
          type: message.type,
          timestamp: message.timestamp,
        })),
      },
    };
  } catch (error: any) {
    console.error("Get conversation error:", error);

    if (error.statusCode) {
      throw error; // 重新抛出已知错误
    }

    // 处理未知错误
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while fetching conversation",
    });
  }
});
