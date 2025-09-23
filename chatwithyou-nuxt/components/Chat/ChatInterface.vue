<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 聊天头部 -->
    <header class="bg-white shadow-sm border-b px-4 py-3 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- 返回按钮 -->
          <button 
            @click="onBack"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <!-- 角色信息 -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
              <img 
                v-if="character?.avatar" 
                :src="character.avatar" 
                :alt="character.name"
                class="w-full h-full object-cover"
              >
              <span v-else>{{ character?.name?.charAt(0) || '?' }}</span>
            </div>
            <div>
              <h1 class="font-semibold text-gray-900">{{ character?.name || '加载中...' }}</h1>
              <p class="text-sm text-gray-500">{{ character?.background || '' }}</p>
            </div>
          </div>
        </div>
        
        <!-- 菜单按钮 -->
        <div class="flex items-center space-x-2">
          <button 
            @click="onMenuClick"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 消息区域 -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin"
    >
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0 && !loading" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
          <img 
            v-if="character?.avatar" 
            :src="character.avatar" 
            :alt="character.name"
            class="w-full h-full object-cover"
          >
          <span v-else>{{ character?.name?.charAt(0) || '?' }}</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          开始与{{ character?.name }}对话
        </h3>
        <p class="text-gray-600 max-w-md mx-auto">
          {{ character?.background }}。发送消息开始你们的对话吧！
        </p>
      </div>

      <!-- 消息列表 -->
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />

      <!-- 正在输入指示器 -->
      <TypingIndicator 
        v-if="isTyping" 
        :character-name="character?.name"
      />
    </div>

    <!-- 输入区域 -->
    <InputArea
      ref="inputRef"
      :loading="isLoading"
      :disabled="!character"
      :placeholder="`与${character?.name || '角色'}对话...`"
      :hint="isLoading ? '正在思考中...' : ''"
      @send="onSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
interface Character {
  id: string
  name: string
  background: string
  personality?: string[]
  category: string
  avatar?: string
}

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface Props {
  character?: Character
  messages: Message[]
  isLoading?: boolean
  isTyping?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isTyping: false
})

const emit = defineEmits<{
  sendMessage: [content: string]
  back: []
  menuClick: []
}>()

// 引用
const messagesContainer = ref<HTMLElement>()
const inputRef = ref()

// 方法：发送消息
const onSendMessage = (content: string) => {
  emit('sendMessage', content)
}

// 方法：返回
const onBack = () => {
  emit('back')
}

// 方法：菜单点击
const onMenuClick = () => {
  emit('menuClick')
}

// 方法：滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  },
  { immediate: true }
)

// 监听正在输入状态变化
watch(
  () => props.isTyping,
  (isTyping) => {
    if (isTyping) {
      scrollToBottom()
    }
  }
)

// 暴露方法
defineExpose({
  scrollToBottom,
  focusInput: () => inputRef.value?.focus()
})
</script>