<template>
  <div 
    :class="[
      'flex mb-4',
      message.type === 'user' ? 'justify-end' : 'justify-start'
    ]"
  >
    <div 
      :class="[
        'max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative',
        message.type === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-white text-gray-900 shadow-sm border'
      ]"
    >
      <!-- 消息内容 -->
      <div class="whitespace-pre-wrap break-words">
        <p class="text-sm">{{ message.content }}</p>
      </div>
      
      <!-- 时间戳 -->
      <div 
        :class="[
          'text-xs mt-2 flex items-center',
          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
        ]"
      >
        <span>{{ formatTime(message.timestamp) }}</span>
        
        <!-- 发送状态（仅用户消息） -->
        <div v-if="message.type === 'user'" class="ml-2 flex items-center">
          <svg 
            v-if="message.status === 'sending'"
            class="w-3 h-3 animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg 
            v-else-if="message.status === 'sent'"
            class="w-3 h-3" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <svg 
            v-else-if="message.status === 'error'"
            class="w-3 h-3 text-red-300" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      <!-- 消息气泡尖角 -->
      <div 
        :class="[
          'absolute top-3 w-0 h-0',
          message.type === 'user' 
            ? 'right-0 transform translate-x-full border-l-8 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent'
            : 'left-0 transform -translate-x-full border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent'
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface Props {
  message: Message
}

defineProps<Props>()

// 格式化时间
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diff / (1000 * 60))
  
  if (diffMinutes < 1) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
</script>