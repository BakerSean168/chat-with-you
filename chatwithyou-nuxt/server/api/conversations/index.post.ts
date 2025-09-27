import { prisma } from "~/lib/prisma";
import { requireAuth } from "~/server/utils/auth";
import type { ApiResponse, Conversation } from "~/types";

export default defineEventHandler(async (event) => {
  try {
    console.log("Creating conversation...");

    // 验证用户认证
    const user = await requireAuth(event);
    console.log("Authenticated user:", user.id);

    const body = await readBody(event);
    console.log("Request body:", body);

    const { characterId, title } = body;

    // 验证角色是否存在
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      console.log("Character not found:", characterId);
      throw createError({
        statusCode: 404,
        statusMessage: "Character not found",
      });
    }

    console.log("Found character:", character.name);

    // 创建对话，使用认证用户的ID
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        characterId,
        title: title || `与${character.name}的对话`,
      },
    });

    console.log("Created conversation:", conversation.id);

    return {
      success: true,
      data: {
        id: conversation.id,
        title: conversation.title,
        characterId: conversation.characterId,
        userId: conversation.userId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    };
  } catch (error: any) {
    console.error("Create conversation API error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create conversation",
      data: { error: error.message },
    });
  }
});
