import { PrismaClient } from "@prisma/client";

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
    const { userId, characterId, title } = body;

    // 验证必需参数
    if (!userId || !characterId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required parameters: userId, characterId",
      });
    }

    // 验证角色是否存在且活跃
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character || !character.isActive) {
      throw createError({
        statusCode: 404,
        statusMessage: "Character not found or inactive",
      });
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // 生成对话标题
    const conversationTitle = title || `与${character.name}的对话`;

    // 创建新对话
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        characterId,
        title: conversationTitle,
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            avatar: true,
            background: true,
            personality: true,
            speakingStyle: true,
            quotes: true,
            category: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
        character: conversation.character,
      },
    };
  } catch (error: any) {
    console.error("Create conversation error:", error);

    if (error.statusCode) {
      throw error; // 重新抛出已知错误
    }

    // 处理未知错误
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while creating conversation",
    });
  }
});
