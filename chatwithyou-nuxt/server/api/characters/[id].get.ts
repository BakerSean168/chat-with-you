import { prisma } from "~/lib/prisma";
import type { ApiResponse, Character } from "~/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<Character>> => {
    try {
      const characterId = getRouterParam(event, "id");

      if (!characterId) {
        throw createError({
          statusCode: 400,
          statusMessage: "Character ID is required",
        });
      }

      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      if (!character) {
        throw createError({
          statusCode: 404,
          statusMessage: "Character not found",
        });
      }

      return {
        success: true,
        data: character as Character,
      };
    } catch (error) {
      console.error("Character detail API error:", error);

      if ((error as { statusCode?: number }).statusCode) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch character",
      });
    }
  }
);
