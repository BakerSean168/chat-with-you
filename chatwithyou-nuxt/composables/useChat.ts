import type {
  Message,
  Conversation,
  Character,
  CreateMessageRequest,
  ApiResponse,
} from "~/types";
import { MessageType, MessageStatus } from "~/types";

export const useChat = () => {
  // 响应式状态
  const messages = ref<Message[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const currentCharacter = ref<Character | null>(null);
  const isLoading = ref(false);
  const isTyping = ref(false);
  const error = ref<string | null>(null);

  // WebSocket 连接
  const socket = ref<any>(null);

  // 初始化对话
  const initializeChat = async (
    characterId: string,
    conversationId?: string
  ) => {
    try {
      // 获取角色信息
      const { fetchCharacter } = useCharacters();
      const character = await fetchCharacter(characterId);

      if (!character) {
        throw new Error("Character not found");
      }

      currentCharacter.value = character;

      // 如果有对话ID，获取历史消息
      if (conversationId) {
        await loadConversation(conversationId);
      } else {
        // 创建新对话
        await createNewConversation(characterId);
      }

      // 初始化 WebSocket 连接
      initializeWebSocket();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to initialize chat";
      throw err;
    }
  };

  // 创建新对话
  const createNewConversation = async (characterId: string) => {
    try {
      const response = await $fetch<ApiResponse<Conversation>>(
        "/api/conversations",
        {
          method: "POST",
          body: {
            characterId,
            userId: "current-user-id", // TODO: 从认证状态获取
          },
        }
      );

      if (response.success && response.data) {
        currentConversation.value = response.data;
        messages.value = [];
      } else {
        throw new Error(response.error || "Failed to create conversation");
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create conversation";
      throw err;
    }
  };

  // 加载对话历史
  const loadConversation = async (conversationId: string) => {
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
        currentConversation.value = conversationResponse.data;
      }

      if (messagesResponse.success && messagesResponse.data) {
        messages.value = messagesResponse.data;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load conversation";
      throw err;
    }
  };

  // 发送消息
  const sendMessage = async (content: string): Promise<void> => {
    if (!currentConversation.value || !currentCharacter.value) {
      throw new Error("No active conversation");
    }

    if (!content.trim()) {
      return;
    }

    // 创建用户消息
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversation.value.id,
      type: MessageType.USER,
      content: content.trim(),
      timestamp: new Date(),
      status: MessageStatus.SENDING,
    };

    // 立即添加到消息列表
    messages.value.push(userMessage);

    try {
      isLoading.value = true;

      // 发送到服务器
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
        // 更新用户消息状态
        const messageIndex = messages.value.findIndex(
          (m) => m.id === userMessage.id
        );
        if (messageIndex > -1) {
          messages.value[messageIndex] = {
            ...response.data.userMessage,
            status: MessageStatus.SENT,
          };
        }

        // 显示正在输入
        isTyping.value = true;

        // 延迟显示AI回复（模拟思考时间）
        setTimeout(() => {
          if (response.data) {
            messages.value.push(response.data.aiMessage);
          }
          isTyping.value = false;
        }, 1500);
      } else {
        throw new Error(response.error || "Failed to send message");
      }
    } catch (err) {
      // 标记消息发送失败
      const messageIndex = messages.value.findIndex(
        (m) => m.id === userMessage.id
      );
      if (messageIndex > -1) {
        messages.value[messageIndex].status = MessageStatus.ERROR;
      }

      error.value =
        err instanceof Error ? err.message : "Failed to send message";
      throw err;
    } finally {
      isLoading.value = false;
      isTyping.value = false;
    }
  };

  // 重试发送消息
  const retrySendMessage = async (messageId: string) => {
    const message = messages.value.find((m) => m.id === messageId);
    if (message && message.status === MessageStatus.ERROR) {
      await sendMessage(message.content);
      // 移除失败的消息
      const index = messages.value.findIndex((m) => m.id === messageId);
      if (index > -1) {
        messages.value.splice(index, 1);
      }
    }
  };

  // 初始化 WebSocket
  const initializeWebSocket = () => {
    if (process.client && currentConversation.value) {
      // TODO: 实现 WebSocket 连接
      // socket.value = io()
      // socket.value.emit('join', currentConversation.value.id)
    }
  };

  // 清理对话
  const clearChat = () => {
    messages.value = [];
    currentConversation.value = null;
    currentCharacter.value = null;
    error.value = null;

    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  // 删除消息
  const deleteMessage = (messageId: string) => {
    const index = messages.value.findIndex((m) => m.id === messageId);
    if (index > -1) {
      messages.value.splice(index, 1);
    }
  };

  // 获取消息统计
  const getMessageStats = () => {
    const total = messages.value.length;
    const userMessages = messages.value.filter(
      (m) => m.type === MessageType.USER
    ).length;
    const aiMessages = messages.value.filter(
      (m) => m.type === MessageType.AI
    ).length;

    return {
      total,
      userMessages,
      aiMessages,
    };
  };

  // 组件卸载时清理
  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  return {
    // 状态
    messages: readonly(messages),
    currentConversation: readonly(currentConversation),
    currentCharacter: readonly(currentCharacter),
    isLoading: readonly(isLoading),
    isTyping: readonly(isTyping),
    error: readonly(error),

    // 方法
    initializeChat,
    sendMessage,
    retrySendMessage,
    clearChat,
    deleteMessage,
    getMessageStats,
  };
};
