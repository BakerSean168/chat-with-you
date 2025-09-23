import { prisma } from "~/lib/prisma";
import type { ApiResponse, Conversation } from "~/types";
import { CreateConversationSchema } from "~/schemas";

export default defineEventHandler(
  async (event): Promise<ApiResponse<Conversation>> => {
    try {
      const body = await readBody(event);

      // 验证请求体
      const validatedData = CreateConversationSchema.parse(body);
      const { userId, characterId, title } = validatedData;

      // 验证角色是否存在
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      if (!character) {
        throw createError({
          statusCode: 404,
          statusMessage: "Character not found",
        });
      }

      // 创建对话
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          characterId,
          title: title || `与${character.name}的对话`,
        },
        include: {
          character: true,
        },
      });

      return {
        success: true,
        data: conversation as Conversation,
      };
    } catch (error) {
      console.error("Create conversation API error:", error);

      if (error.statusCode) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create conversation",
      });
    }
  }
);
