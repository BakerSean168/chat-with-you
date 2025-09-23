import OpenAI from "openai";
import { prisma } from "~/lib/prisma";
import type { ApiResponse, Message } from "~/types";

export default defineEventHandler(
  async (
    event
  ): Promise<ApiResponse<{ userMessage: Message; aiMessage: Message }>> => {
    try {
      const body = await readBody(event);
      const { message, conversationId, characterId } = body;

      if (!message || !conversationId || !characterId) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing required fields",
        });
      }

      // 获取对话和角色信息
      const [conversation, character] = await Promise.all([
        prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            messages: {
              orderBy: { timestamp: "desc" },
              take: 10, // 获取最近10条消息作为上下文
            },
          },
        }),
        prisma.character.findUnique({
          where: { id: characterId },
        }),
      ]);

      if (!conversation || !character) {
        throw createError({
          statusCode: 404,
          statusMessage: "Conversation or character not found",
        });
      }

      // 保存用户消息
      const userMessage = await prisma.message.create({
        data: {
          conversationId,
          type: "USER",
          content: message,
        },
      });

      // 构建AI提示词
      const systemPrompt = buildSystemPrompt(character);
      const messageHistory = buildMessageHistory(conversation.messages);

      // 调用OpenAI API
      const runtimeConfig = useRuntimeConfig();
      const openai = new OpenAI({
        apiKey: runtimeConfig.openaiApiKey,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messageHistory,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse =
        completion.choices[0]?.message?.content || "抱歉，我现在无法回应。";

      // 保存AI消息
      const aiMessage = await prisma.message.create({
        data: {
          conversationId,
          type: "AI",
          content: aiResponse,
        },
      });

      // 更新对话的最后消息
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: aiResponse,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: {
          userMessage: userMessage as Message,
          aiMessage: aiMessage as Message,
        },
      };
    } catch (error) {
      console.error("AI chat API error:", error);

      // 如果是OpenAI API错误，返回更友好的错误信息
      if (error.code === "insufficient_quota") {
        throw createError({
          statusCode: 503,
          statusMessage: "AI服务暂时不可用，请稍后再试",
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: "AI回复失败，请重试",
      });
    }
  }
);

// 构建系统提示词
function buildSystemPrompt(character: any): string {
  return `你是${character.name}。

背景：${character.background}

性格特点：${character.personality.join("、")}

说话风格：${character.speakingStyle}

经典语录：
${character.quotes.map((quote: string) => `- ${quote}`).join("\n")}

请严格按照这个角色的身份、性格和说话风格来回应用户的对话。保持角色的一致性，用第一人称回答。回答要自然、有深度，体现角色的智慧和个性。`;
}

// 构建消息历史
function buildMessageHistory(
  messages: any[]
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .reverse() // 因为查询是倒序的，需要反转
    .map((msg) => ({
      role: msg.type === "USER" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));
}
