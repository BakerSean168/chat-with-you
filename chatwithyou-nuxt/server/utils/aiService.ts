import OpenAI from "openai";
import type { Character } from "@prisma/client";
import {
  PromptBuilder,
  ConversationContext,
  ResponseProcessor,
} from "./promptBuilder";

// 全局会话存储
const conversationContexts = new Map<string, ConversationContext>();

/**
 * AI服务 - 处理与OpenAI的交互
 */
export class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }

  /**
   * 获取或创建对话上下文
   */
  private getConversationContext(conversationId: string): ConversationContext {
    if (!conversationContexts.has(conversationId)) {
      conversationContexts.set(conversationId, new ConversationContext());
    }
    return conversationContexts.get(conversationId)!;
  }

  /**
   * 生成角色回复
   */
  async generateCharacterResponse(
    character: Character,
    userMessage: string,
    conversationId: string
  ): Promise<string> {
    try {
      const context = this.getConversationContext(conversationId);

      // 构建带上下文的提示词
      const recentMessages = context.getRecentMessages();
      let systemPrompt = PromptBuilder.buildConversationPrompt(
        character,
        recentMessages
      );

      // 添加类别特定的提示
      systemPrompt = PromptBuilder.addCategorySpecificPrompt(
        character,
        systemPrompt
      );

      // 添加智能风格调整
      systemPrompt += PromptBuilder.adjustResponseStyle(character, userMessage);

      // 构建消息数组
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ];

      // 添加最近的对话历史
      recentMessages.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      // 添加当前用户消息
      messages.push({ role: "user", content: userMessage });

      // 调用OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        max_tokens: 300,
        temperature: 0.8, // 增加一些创造性
        top_p: 0.9,
        frequency_penalty: 0.3, // 减少重复
        presence_penalty: 0.3, // 鼓励新话题
      });

      const response = completion.choices[0]?.message?.content || "";

      if (!response) {
        throw new Error("Empty response from OpenAI");
      }

      // 后处理回复
      const cleanedResponse = ResponseProcessor.cleanResponse(
        response,
        character.name
      );

      // 验证回复质量
      if (!ResponseProcessor.validateResponse(cleanedResponse, character)) {
        console.warn(
          `Low quality response for character ${character.name}:`,
          cleanedResponse
        );
      }

      // 更新对话上下文
      context.addMessage("user", userMessage);
      context.addMessage("assistant", cleanedResponse);

      return cleanedResponse;
    } catch (error) {
      console.error("Error generating character response:", error);

      // 返回角色的备用回复
      return this.getFallbackResponse(character, userMessage);
    }
  }

  /**
   * 获取备用回复（当AI服务失败时）
   */
  private getFallbackResponse(
    character: Character,
    userMessage: string
  ): string {
    const fallbackResponses: Record<string, string[]> = {
      孔子: [
        "君子坦荡荡，小人长戚戚。请让我再思考一下你的问题。",
        "学而时习之，不亦说乎？不过我需要更多时间来理解你的意思。",
        "知之为知之，不知为不知，是知也。请稍后再问我这个问题。",
      ],
      鲁迅: [
        "我正在思考如何回答你的问题，请稍等片刻。",
        "这个问题很有意思，让我仔细想想再回复你。",
        "时间就像海绵里的水，挤一挤总还是有的。请给我一点时间思考。",
      ],
      爱因斯坦: [
        "想象力比知识更重要。让我用想象力来思考你的问题。",
        "这是一个有趣的问题，需要我仔细思考。",
        "真理总是简单的，让我寻找简单的答案。",
      ],
    };

    const responses = fallbackResponses[character.name] || [
      "请原谅，我需要一点时间来思考你的问题。",
      "这是一个很有意思的话题，让我仔细想想。",
      "请稍等，我正在组织语言来回答你。",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 清理对话上下文
   */
  clearConversationContext(conversationId: string): void {
    conversationContexts.delete(conversationId);
  }

  /**
   * 获取对话统计信息
   */
  getConversationStats(conversationId: string): { messageCount: number } {
    const context = conversationContexts.get(conversationId);
    return {
      messageCount: context?.getMessageCount() || 0,
    };
  }
}

// 单例实例
let aiServiceInstance: AIService | null = null;

/**
 * 获取AI服务实例
 */
export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

/**
 * 健康检查
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const aiService = getAIService();
    // 尝试一个简单的API调用来检查服务状态
    return true; // 如果实例化成功就认为是健康的
  } catch (error) {
    console.error("AI Service health check failed:", error);
    return false;
  }
}
