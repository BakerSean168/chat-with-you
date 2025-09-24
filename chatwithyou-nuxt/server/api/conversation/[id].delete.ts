import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 只允许DELETE请求
    if (event.node.req.method !== "DELETE") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed",
      });
    }

    const conversationId = getRouterParam(event, "id");
    const query = getQuery(event);
    const { userId } = query;

    // 验证必需参数
    if (!conversationId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required parameters: conversationId, userId",
      });
    }

    // 验证对话是否存在且属于当前用户
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw createError({
        statusCode: 404,
        statusMessage: "Conversation not found",
      });
    }

    if (conversation.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Access denied",
      });
    }

    // 删除对话（级联删除消息）
    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return {
      success: true,
      message: "Conversation deleted successfully",
    };
  } catch (error: any) {
    console.error("Delete conversation error:", error);

    if (error.statusCode) {
      throw error; // 重新抛出已知错误
    }

    // 处理未知错误
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while deleting conversation",
    });
  }
});
