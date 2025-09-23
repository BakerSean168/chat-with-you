import { defineStore } from "pinia";
import type {
  Message,
  Conversation,
  Character,
  ConversationSummary,
  ApiResponse,
  PaginatedResponse,
} from "~/types";

export const useChatStore = defineStore("chat", () => {
  // 状态
  const conversations = ref<ConversationSummary[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const currentCharacter = ref<Character | null>(null);
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);
  const isTyping = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const hasActiveConversation = computed(() => !!currentConversation.value);
  const messageCount = computed(() => messages.value.length);
  const lastMessage = computed(() => {
    const lastMsg = messages.value[messages.value.length - 1];
    return lastMsg?.content || "";
  });

  // 获取对话列表
  const fetchConversations = async (): Promise<void> => {
    try {
      const response = await $fetch<PaginatedResponse<ConversationSummary>>(
        "/api/conversations"
      );

      if (response.success && response.data) {
        conversations.value = response.data;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch conversations";
    }
  };

  // 设置当前对话
  const setCurrentConversation = (
    conversation: Conversation,
    character: Character
  ) => {
    currentConversation.value = conversation;
    currentCharacter.value = character;
    messages.value = conversation.messages || [];
  };

  // 开始新对话
  const startNewConversation = async (
    characterId: string
  ): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      // 获取角色信息
      const characterResponse = await $fetch<ApiResponse<Character>>(
        `/api/characters/${characterId}`
      );

      if (!characterResponse.success || !characterResponse.data) {
        throw new Error("Character not found");
      }

      const character = characterResponse.data;

      // 创建新对话
      const conversationResponse = await $fetch<ApiResponse<Conversation>>(
        "/api/conversations",
        {
          method: "POST",
          body: {
            characterId,
            userId: "current-user-id", // TODO: 从认证状态获取
          },
        }
      );

      if (conversationResponse.success && conversationResponse.data) {
        const conversation = conversationResponse.data;
        setCurrentConversation(conversation, character);

        // 更新对话列表
        const summary: ConversationSummary = {
          id: conversation.id,
          character: {
            id: character.id,
            name: character.name,
            avatar: character.avatar,
          },
          lastMessage: "",
          messageCount: 0,
          updatedAt: conversation.updatedAt,
        };

        conversations.value.unshift(summary);
        return true;
      } else {
        throw new Error(
          conversationResponse.error || "Failed to create conversation"
        );
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to start conversation";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 发送消息
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!currentConversation.value || !currentCharacter.value) {
      error.value = "No active conversation";
      return false;
    }

    if (!content.trim()) {
      return false;
    }

    const tempId = `temp-${Date.now()}`;

    // 添加用户消息到本地状态
    const userMessage: Message = {
      id: tempId,
      conversationId: currentConversation.value.id,
      type: "USER" as any,
      content: content.trim(),
      timestamp: new Date(),
    };

    messages.value.push(userMessage);
    isLoading.value = true;

    try {
      const response = await $fetch<
        ApiResponse<{ userMessage: Message; aiMessage: Message }>
      >("/api/ai/chat", {
        method: "POST",
        body: {
          message: content,
          conversationId: currentConversation.value.id,
          characterId: currentCharacter.value.id,
        },
      });

      if (response.success && response.data) {
        // 替换临时消息
        const messageIndex = messages.value.findIndex((m) => m.id === tempId);
        if (messageIndex > -1) {
          messages.value[messageIndex] = response.data.userMessage;
        }

        // 显示正在输入
        isTyping.value = true;

        // 延迟显示AI回复
        setTimeout(() => {
          if (response.data) {
            messages.value.push(response.data.aiMessage);
            updateConversationSummary(response.data.aiMessage.content);
          }
          isTyping.value = false;
        }, 1500);

        return true;
      } else {
        throw new Error(response.error || "Failed to send message");
      }
    } catch (err) {
      // 移除失败的消息
      const messageIndex = messages.value.findIndex((m) => m.id === tempId);
      if (messageIndex > -1) {
        messages.value.splice(messageIndex, 1);
      }

      error.value =
        err instanceof Error ? err.message : "Failed to send message";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新对话摘要
  const updateConversationSummary = (lastMessage: string) => {
    if (!currentConversation.value) return;

    const summaryIndex = conversations.value.findIndex(
      (conv) => conv.id === currentConversation.value!.id
    );

    if (summaryIndex > -1) {
      conversations.value[summaryIndex] = {
        ...conversations.value[summaryIndex],
        lastMessage,
        messageCount: messages.value.length,
        updatedAt: new Date(),
      };

      // 移动到列表顶部
      const [updated] = conversations.value.splice(summaryIndex, 1);
      conversations.value.unshift(updated);
    }
  };

  // 加载对话历史
  const loadConversation = async (conversationId: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const [conversationResponse, messagesResponse] = await Promise.all([
        $fetch<ApiResponse<Conversation>>(
          `/api/conversations/${conversationId}`
        ),
        $fetch<ApiResponse<Message[]>>(
          `/api/conversations/${conversationId}/messages`
        ),
      ]);

      if (conversationResponse.success && conversationResponse.data) {
        const conversation = conversationResponse.data;

        // 获取角色信息
        const characterResponse = await $fetch<ApiResponse<Character>>(
          `/api/characters/${conversation.characterId}`
        );

        if (characterResponse.success && characterResponse.data) {
          const character = characterResponse.data;

          currentConversation.value = conversation;
          currentCharacter.value = character;

          if (messagesResponse.success && messagesResponse.data) {
            messages.value = messagesResponse.data;
          }

          return true;
        }
      }

      throw new Error("Failed to load conversation");
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load conversation";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除对话
  const deleteConversation = async (
    conversationId: string
  ): Promise<boolean> => {
    try {
      const response = await $fetch<ApiResponse<void>>(
        `/api/conversations/${conversationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success) {
        // 从列表中移除
        conversations.value = conversations.value.filter(
          (conv) => conv.id !== conversationId
        );

        // 如果删除的是当前对话，清理状态
        if (currentConversation.value?.id === conversationId) {
          clearCurrentConversation();
        }

        return true;
      } else {
        throw new Error(response.error || "Failed to delete conversation");
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete conversation";
      return false;
    }
  };

  // 清理当前对话
  const clearCurrentConversation = () => {
    currentConversation.value = null;
    currentCharacter.value = null;
    messages.value = [];
    isTyping.value = false;
    error.value = null;
  };

  // 清理所有状态
  const clearAll = () => {
    conversations.value = [];
    clearCurrentConversation();
  };

  return {
    // 状态
    conversations: readonly(conversations),
    currentConversation: readonly(currentConversation),
    currentCharacter: readonly(currentCharacter),
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    isTyping: readonly(isTyping),
    error: readonly(error),

    // 计算属性
    hasActiveConversation,
    messageCount,
    lastMessage,

    // 方法
    fetchConversations,
    setCurrentConversation,
    startNewConversation,
    sendMessage,
    loadConversation,
    deleteConversation,
    clearCurrentConversation,
    clearAll,
  };
});
