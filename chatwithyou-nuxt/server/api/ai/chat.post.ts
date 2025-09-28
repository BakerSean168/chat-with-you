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

      const runtimeConfig = useRuntimeConfig();
      let aiResponse = "抱歉，我现在无法回应。";

      try {
        // 优先尝试七牛云AI
        aiResponse = await callQiniuAI(
          systemPrompt,
          messageHistory,
          message,
          runtimeConfig
        );
      } catch (qiniuError) {
        console.warn("七牛云AI调用失败，尝试OpenAI:", qiniuError);

        // 如果七牛云失败，尝试OpenAI作为备用
        try {
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

          aiResponse =
            completion.choices[0]?.message?.content || "抱歉，我现在无法回应。";
        } catch (openaiError) {
          console.error("OpenAI调用也失败了:", openaiError);
          throw new Error("AI服务暂时不可用");
        }
      }

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
    } catch (error: any) {
      console.error("AI chat API error:", error);

      // 如果是OpenAI API错误，返回更友好的错误信息
      if (error?.code === "insufficient_quota") {
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

// 调用七牛云AI
async function callQiniuAI(
  systemPrompt: string,
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>,
  message: string,
  config: any
): Promise<string> {
  const baseUrl = config.qiniuBaseUrl || config.qiniuBackupUrl;

  if (!baseUrl || !config.qiniuApiKey) {
    throw new Error("七牛云AI配置不完整");
  }

  // 构建消息数组
  const messages = [
    { role: "system", content: systemPrompt },
    ...messageHistory,
    { role: "user", content: message },
  ];

  // 根据您测试成功的API格式构建请求体，保持简单
  const requestBody = {
    messages: messages,
    model: config.qiniuModelId || "deepseek-v3", // 使用您测试成功的模型
    stream: false, // 不使用流式响应
  };

  try {
    console.log("七牛云AI请求:", {
      url: `${baseUrl}/chat/completions`,
      model: requestBody.model,
      messageCount: messages.length,
    });

    const response = (await $fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.qiniuApiKey}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
      timeout: 30000, // 30秒超时
    })) as any;

    console.log("七牛云AI响应:", response);

    // 检查响应格式
    if (response?.choices?.[0]?.message?.content) {
      const content = response.choices[0].message.content;
      console.log("七牛云AI返回内容长度:", content.length);
      return content;
    }

    // 检查是否有错误信息
    if (response?.error) {
      throw new Error(
        `七牛云AI API错误: ${
          response.error.message || JSON.stringify(response.error)
        }`
      );
    }

    throw new Error("七牛云AI返回格式异常: " + JSON.stringify(response));
  } catch (error: any) {
    console.error("七牛云AI调用错误:", error);

    // 详细错误日志
    if (error.data) {
      console.error("错误详情:", error.data);
    }

    // 处理不同类型的错误
    if (error.status === 401 || error.statusCode === 401) {
      throw new Error("七牛云AI API密钥无效");
    } else if (error.status === 429 || error.statusCode === 429) {
      throw new Error("七牛云AI API调用频率超限");
    } else if ((error.status || error.statusCode) >= 500) {
      throw new Error("七牛云AI服务器错误");
    }

    throw error;
  }
}
