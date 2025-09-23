<template>
  <div class="bg-white border-t px-4 py-3">
    <div class="flex items-end space-x-3">
      <!-- 附件按钮（可选） -->
      <button 
        v-if="showAttachButton"
        class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
        @click="onAttachClick"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      
      <!-- 输入框 -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="inputMessage"
          @keydown="onKeydown"
          @input="onInput"
          :placeholder="placeholder"
          :disabled="disabled"
          rows="1"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 max-h-32"
          style="height: auto; min-height: 40px;"
        />
        
        <!-- 字符计数 -->
        <div 
          v-if="showCharCount && maxLength"
          class="absolute right-2 bottom-1 text-xs text-gray-400"
        >
          {{ inputMessage.length }}/{{ maxLength }}
        </div>
      </div>
      
      <!-- 发送按钮 -->
      <button
        @click="onSend"
        :disabled="!canSend"
        :class="[
          'px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200',
          canSend
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
    
    <!-- 提示信息 -->
    <div v-if="hint" class="mt-2 text-xs text-gray-500 px-3">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  maxLength?: number
  showCharCount?: boolean
  showAttachButton?: boolean
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '输入您的消息...',
  disabled: false,
  loading: false,
  maxLength: 1000,
  showCharCount: false,
  showAttachButton: false
})

const emit = defineEmits<{
  send: [message: string]
  attach: []
}>()

// 响应式数据
const inputMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

// 计算属性
const canSend = computed(() => {
  const message = inputMessage.value.trim()
  return message.length > 0 && 
         !props.disabled && 
         !props.loading &&
         (!props.maxLength || message.length <= props.maxLength)
})

// 方法：发送消息
const onSend = () => {
  if (!canSend.value) return
  
  const message = inputMessage.value.trim()
  emit('send', message)
  inputMessage.value = ''
  
  // 重置输入框高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

// 方法：处理键盘事件
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    onSend()
  }
}

// 方法：处理输入事件（自动调整高度）
const onInput = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

// 方法：附件点击
const onAttachClick = () => {
  emit('attach')
}

// 暴露方法给父组件
defineExpose({
  focus: () => textareaRef.value?.focus(),
  clear: () => {
    inputMessage.value = ''
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
})
</script>