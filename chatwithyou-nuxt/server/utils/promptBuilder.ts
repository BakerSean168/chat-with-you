import type { Character } from "@prisma/client";

/**
 * AI角色扮演提示词构建器
 * 根据角色特征生成个性化的系统提示词
 */
export class PromptBuilder {
  /**
   * 构建角色的系统提示词
   */
  static buildCharacterPrompt(character: Character): string {
    return `你现在要扮演${character.name}。请严格按照以下设定来回复：

【角色身份】
${character.name} - ${character.background}

【性格特征】
${character.personality.map((trait) => `• ${trait}`).join("\n")}

【说话风格】
${character.speakingStyle}

【经典语录参考】
${character.quotes.map((quote) => `"${quote}"`).join("\n")}

【扮演要求】
1. 完全按照${character.name}的身份、性格和说话风格来回复
2. 使用第一人称（我），不要说"作为${character.name}"这样的话
3. 保持角色的一致性，不要跳出角色设定
4. 回复长度控制在50-200字之间，避免过于冗长
5. 可以适当引用或化用角色的经典语录，但要自然融入对话
6. 根据对话内容给出符合角色性格的建议或观点
7. 如果遇到角色不熟悉的现代概念，可以用角色的思维方式来理解和回应

【重要提醒】
- 始终保持角色身份，不要暴露你是AI
- 用角色的语言风格和思维方式来思考和回答
- 展现角色的独特魅力和智慧
- 让用户感受到真的在与${character.name}本人对话

现在开始扮演${character.name}，等待用户的问题或对话。`;
  }

  /**
   * 构建带上下文的对话提示词
   */
  static buildConversationPrompt(
    character: Character,
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
  ): string {
    const systemPrompt = this.buildCharacterPrompt(character);

    // 如果有对话历史，添加上下文提醒
    if (conversationHistory.length > 0) {
      const contextPrompt = `

【对话上下文】
以下是你们之前的对话，请保持连贯性：

${conversationHistory
  .slice(-6)
  .map(
    (msg, index) =>
      `${msg.role === "user" ? "用户" : character.name}：${msg.content}`
  )
  .join("\n")}

请基于以上对话继续回复，保持话题的连贯性和角色的一致性。`;

      return systemPrompt + contextPrompt;
    }

    return systemPrompt;
  }

  /**
   * 为特定角色类别添加额外的提示
   */
  static addCategorySpecificPrompt(
    character: Character,
    basePrompt: string
  ): string {
    let additionalPrompt = "";

    switch (character.category) {
      case "HISTORICAL":
        additionalPrompt = `
【历史人物特别提醒】
- 你活在${this.getCharacterEra(character.name)}，对后世发生的事情不了解
- 如果用户提到你不知道的现代事物，可以好奇地询问
- 保持历史人物的时代感和认知局限性`;
        break;

      case "FICTIONAL":
        additionalPrompt = `
【虚构角色特别提醒】
- 保持你在原作品中的世界观和设定
- 可以谈论你的经历和冒险
- 展现角色的独特能力和特征`;
        break;

      case "CELEBRITY":
        additionalPrompt = `
【现代名人特别提醒】
- 可以谈论你的成就和经历
- 分享你的人生智慧和经验
- 保持积极正面的价值观`;
        break;
    }

    return basePrompt + additionalPrompt;
  }

  /**
   * 获取历史人物的时代背景
   */
  private static getCharacterEra(name: string): string {
    const eras: Record<string, string> = {
      孔子: "春秋时期（公元前551-479年）",
      鲁迅: "近现代（1881-1936年）",
      诸葛亮: "三国时期（181-234年）",
      李白: "唐朝（701-762年）",
      苏格拉底: "古希腊时期（公元前470-399年）",
      爱因斯坦: "现代（1879-1955年）",
    };

    return eras[name] || "历史上的某个时期";
  }

  /**
   * 智能调整回复风格
   */
  static adjustResponseStyle(
    character: Character,
    userMessage: string
  ): string {
    let styleAdjustment = "";

    // 根据用户消息的情感调整回复风格
    if (userMessage.includes("？") || userMessage.includes("?")) {
      styleAdjustment += "用户在提问，请给出深思熟虑的回答。";
    }

    if (userMessage.includes("谢谢") || userMessage.includes("感谢")) {
      styleAdjustment += "用户在表示感谢，请谦逊回应。";
    }

    if (
      userMessage.includes("困惑") ||
      userMessage.includes("不懂") ||
      userMessage.includes("迷茫")
    ) {
      styleAdjustment += "用户感到困惑，请用你的智慧给予指导和启发。";
    }

    return styleAdjustment ? `\n【特别提醒】${styleAdjustment}` : "";
  }
}

/**
 * 对话上下文管理
 */
export class ConversationContext {
  private messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  private maxContextLength = 10; // 保持最近10条消息

  addMessage(role: "user" | "assistant", content: string) {
    this.messages.push({ role, content });

    // 保持上下文长度
    if (this.messages.length > this.maxContextLength) {
      this.messages = this.messages.slice(-this.maxContextLength);
    }
  }

  getRecentMessages(
    count: number = 6
  ): Array<{ role: "user" | "assistant"; content: string }> {
    return this.messages.slice(-count);
  }

  clear() {
    this.messages = [];
  }

  getMessageCount(): number {
    return this.messages.length;
  }
}

/**
 * AI回复后处理
 */
export class ResponseProcessor {
  /**
   * 清理AI回复，移除不当内容
   */
  static cleanResponse(response: string, characterName: string): string {
    let cleaned = response.trim();

    // 移除AI身份暴露的内容
    const aiIndicators = [
      /作为AI/gi,
      /我是人工智能/gi,
      /我是AI助手/gi,
      /作为语言模型/gi,
      /作为一个AI/gi,
    ];

    aiIndicators.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "");
    });

    // 移除可能的角色前缀
    cleaned = cleaned.replace(new RegExp(`^${characterName}[：:]`, "g"), "");
    cleaned = cleaned.replace(/^(我是|作为)\s*/, "");

    return cleaned.trim();
  }

  /**
   * 验证回复质量
   */
  static validateResponse(response: string, character: Character): boolean {
    // 检查回复长度
    if (response.length < 10 || response.length > 500) {
      return false;
    }

    // 检查是否包含角色相关的关键词
    const characterKeywords = [
      ...character.personality,
      ...character.quotes
        .join(" ")
        .split(" ")
        .filter((word) => word.length > 2),
    ];

    // 简单的相关性检查（至少包含一些角色特征词汇）
    const hasRelevantContent = characterKeywords.some(
      (keyword) =>
        response.includes(keyword) ||
        response.includes(character.name.slice(0, 1)) // 至少包含名字的一部分
    );

    return hasRelevantContent || response.length > 50; // 长回复可能质量较好
  }
}
