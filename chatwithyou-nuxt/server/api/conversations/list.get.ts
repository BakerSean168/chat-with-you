import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId, page = 1, limit = 20 } = query;

    // 验证必需参数
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required parameter: userId",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 获取用户的对话列表
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: userId as string },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              avatar: true,
              category: true,
            },
          },
          messages: {
            select: {
              content: true,
              timestamp: true,
              type: true,
            },
            orderBy: { timestamp: "desc" },
            take: 1, // 只获取最后一条消息
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.conversation.count({
        where: { userId: userId as string },
      }),
    ]);

    // 统计每个对话的消息数量
    const conversationIds = conversations.map((c) => c.id);
    const messageCounts = await prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: conversationIds },
      },
      _count: {
        id: true,
      },
    });

    const messageCountMap = Object.fromEntries(
      messageCounts.map((item) => [item.conversationId, item._count.id])
    );

    // 格式化响应数据
    const formattedConversations = conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.title || `与${conversation.character.name}的对话`,
      character: conversation.character,
      lastMessage: conversation.messages[0]?.content || "暂无消息",
      lastMessageTime:
        conversation.messages[0]?.timestamp || conversation.createdAt,
      messageCount: messageCountMap[conversation.id] || 0,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }));

    return {
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    };
  } catch (error: any) {
    console.error("Get conversations error:", error);

    if (error.statusCode) {
      throw error; // 重新抛出已知错误
    }

    // 处理未知错误
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while fetching conversations",
    });
  }
});
