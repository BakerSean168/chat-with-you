<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 聊天头部 -->
    <header class="bg-white shadow-sm border-b px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {{ character?.name?.charAt(0) || '?' }}
            </div>
            <div>
              <h1 class="font-semibold text-gray-900">
                {{ character?.name || '加载中...' }}
              </h1>
              <p class="text-sm text-gray-500">
                <span v-if="character?.background">{{ character.background }}</span>
                <span v-else-if="!error" class="animate-pulse bg-gray-200 h-3 w-20 rounded inline-block"></span>
              </p>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="clearConversation" class="p-2 hover:bg-gray-100 rounded-full transition-colors" title="清空对话">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 消息区域 -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
      <!-- 错误提示 -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
            <button @click="retryLastMessage"
              class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors">
              重试
            </button>
          </div>
        </div>
      </div>

      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0 && !error" class="text-center py-8">
        <div
          class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          {{ character?.name?.charAt(0) || '?' }}
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          开始与{{ character?.name }}对话
        </h3>
        <p class="text-gray-600 max-w-md mx-auto">
          {{ character?.background }}。发送消息开始你们的对话吧！
        </p>
      </div>

      <!-- 消息列表 -->
      <div v-for="message in messages" :key="message.id" :class="[
        'flex',
        message.type === 'user' ? 'justify-end' : 'justify-start'
      ]">
        <div :class="[
          'chat-bubble',
          message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
        ]">
          <p class="text-sm">{{ message.content }}</p>
          <p class="text-xs opacity-70 mt-1">
            {{ formatTime(message.timestamp) }}
          </p>
        </div>
      </div>

      <!-- 正在输入指示器 -->
      <div v-if="isTyping" class="flex justify-start">
        <div class="chat-bubble chat-bubble-ai">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white border-t px-4 py-3">
      <!-- 网络状态提示 -->
      <div v-if="!isOnline" class="mb-3 p-2 bg-orange-50 border-l-4 border-orange-400 rounded text-sm">
        <div class="flex items-center">
          <svg class="w-4 h-4 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
          <span class="text-orange-700">网络连接不可用，请检查网络连接后重试</span>
        </div>
      </div>

      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <textarea v-model="inputMessage" @keydown.enter.prevent="handleEnterKey" placeholder="输入您的消息..." rows="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            :disabled="isLoading || !isOnline" />
        </div>
        <button @click="sendMessage" :disabled="!inputMessage.trim() || isLoading || !isOnline"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :title="!isOnline ? '网络不可用' : isLoading ? '正在发送...' : '发送消息'">
          <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <svg v-else-if="!isOnline" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 获取路由参数
const route = useRoute()
const characterId = route.params.id as string

// 响应式数据
const inputMessage = ref('')
const isLoading = ref(false)
const isTyping = ref(false)
const messages = ref<any[]>([])
const character = ref<any>(null)
const conversationId = ref<string | null>(null)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3
const isOnline = ref(true)

// 页面配置
definePageMeta({
  title: '对话中...',
  middleware: 'auth'
})

// 认证状态
const authStore = useAuthStore()

// 加载角色信息
const loadCharacter = async () => {
  try {
    const response = await $fetch(`/api/characters/${characterId}`)
    if (response.success && response.data) {
      character.value = response.data
    } else {
      throw new Error('Character not found')
    }
  } catch (fetchError: any) {
    console.error('加载角色失败:', fetchError)

    if (fetchError.statusCode === 404) {
      error.value = '角色不存在，正在返回首页...'
      setTimeout(() => navigateTo('/'), 2000)
    } else {
      error.value = '加载角色信息失败，请刷新页面重试。'
    }
  }
}

// 创建或获取对话
const createConversation = async () => {
  try {
    const response = await $fetch('/api/conversations', {
      method: 'POST',
      headers: authStore.token ? {
        Authorization: `Bearer ${authStore.token}`,
      } : {},
      body: {
        characterId: characterId
      },
      timeout: 10000 // 10秒超时
    })

    if ((response as any)?.success && (response as any)?.data) {
      conversationId.value = (response as any).data.id
    }
  } catch (fetchError: any) {
    console.error('创建对话失败:', fetchError)

    // 如果对话创建失败，生成临时ID但显示警告
    conversationId.value = 'temp-' + Date.now()

    if (!error.value) { // 只在没有其他错误时显示对话创建错误
      error.value = '对话创建失败，消息可能无法保存。请刷新页面重试。'
    }
  }
}

// 清空对话
const clearConversation = async () => {
  // 清空本地消息并创建新对话
  messages.value = []
  await createConversation()
}

// 监听网络状态
const handleOnline = () => (isOnline.value = true)
const handleOffline = () => (isOnline.value = false)

// 初始化
onMounted(async () => {
  // 监听网络状态变化
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  isOnline.value = navigator.onLine

  await loadCharacter()
  await createConversation()
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

// 发送消息
const sendMessage = async (retrying = false) => {
  if (!inputMessage.value.trim() || isLoading.value) return

  // 清除之前的错误
  error.value = null

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }

  // 只在非重试时添加用户消息
  if (!retrying) {
    messages.value.push(userMessage)
    lastUserMessage.value = inputMessage.value.trim()
  }

  const messageContent = retrying ? lastUserMessage.value : inputMessage.value.trim()
  if (!retrying) {
    inputMessage.value = ''
  }

  // 显示正在输入
  isLoading.value = true
  isTyping.value = true

  try {
    // 调用真实的 AI 接口
    const response = await $fetch('/api/ai/chat', {
      method: 'POST',
      headers: authStore.token ? {
        Authorization: `Bearer ${authStore.token}`,
      } : {},
      body: {
        characterId: characterId,
        conversationId: conversationId.value,
        message: messageContent
      },
      timeout: 30000 // 30秒超时
    })

    if ((response as any)?.data?.aiMessage?.content) {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: (response as any).data.aiMessage.content,
        timestamp: new Date()
      }
      messages.value.push(aiMessage)
      retryCount.value = 0 // 重置重试计数
    } else {
      throw new Error('Invalid response format')
    }
  } catch (fetchError: any) {
    console.error('发送消息失败:', fetchError)

    // 根据错误类型显示不同的错误信息
    let errorMessage = '抱歉，发生了未知错误，请重试。'

    if (fetchError.statusCode === 503) {
      errorMessage = 'AI服务暂时不可用，请稍后再试。'
    } else if (fetchError.statusCode === 429) {
      errorMessage = '请求过于频繁，请稍后再试。'
    } else if (fetchError.name === 'TimeoutError' || fetchError.message?.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接后重试。'
    } else if (fetchError.statusCode >= 500) {
      errorMessage = '服务器错误，请稍后再试。'
    } else if (!navigator.onLine) {
      errorMessage = '网络连接不可用，请检查网络连接。'
    }

    error.value = errorMessage
    retryCount.value++
  } finally {
    isLoading.value = false
    isTyping.value = false
  }
}

// 重试最后一条消息
const lastUserMessage = ref('')
const retryLastMessage = async () => {
  if (retryCount.value < maxRetries && lastUserMessage.value) {
    await sendMessage(true)
  }
}

// 处理回车键
const handleEnterKey = (event: KeyboardEvent) => {
  if (!event.shiftKey && isOnline.value && !isLoading.value) {
    event.preventDefault()
    sendMessage()
  }
}



// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>