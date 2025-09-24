import { PrismaClient } from "@prisma/client";
import { getAIService } from "~/server/utils/aiService";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 只允许POST请求
    if (event.node.req.method !== "POST") {
      throw createError({
        statusCode: 405,
        statusMessage: "Method not allowed",
      });
    }

    const body = await readBody(event);
    const { conversationId, message, userId } = body;

    // 验证必需参数
    if (!conversationId || !message || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Missing required parameters: conversationId, message, userId",
      });
    }

    // 验证消息长度
    if (message.length > 1000) {
      throw createError({
        statusCode: 400,
        statusMessage: "Message too long (max 1000 characters)",
      });
    }

    // 获取对话信息
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { character: true },
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

    // 保存用户消息
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        content: message,
        type: "USER",
      },
    });

    // 生成AI回复
    const aiService = getAIService();
    const aiResponse = await aiService.generateCharacterResponse(
      conversation.character,
      message,
      conversationId
    );

    // 保存AI回复
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        content: aiResponse,
        type: "AI",
      },
    });

    // 更新对话的最后活动时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      success: true,
      data: {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          type: userMessage.type,
          timestamp: userMessage.timestamp,
        },
        aiMessage: {
          id: aiMessage.id,
          content: aiMessage.content,
          type: aiMessage.type,
          timestamp: aiMessage.timestamp,
        },
        character: {
          name: conversation.character.name,
          avatar: conversation.character.avatar,
        },
      },
    };
  } catch (error: any) {
    console.error("Chat API error:", error);

    if (error.statusCode) {
      throw error; // 重新抛出已知错误
    }

    // 处理未知错误
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while processing chat",
    });
  }
});
