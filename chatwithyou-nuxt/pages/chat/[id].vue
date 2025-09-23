<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 聊天头部 -->
    <header class="bg-white shadow-sm border-b px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button 
            @click="$router.back()"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {{ character?.name?.charAt(0) || '?' }}
            </div>
            <div>
              <h1 class="font-semibold text-gray-900">{{ character?.name || '加载中...' }}</h1>
              <p class="text-sm text-gray-500">{{ character?.background || '' }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 消息区域 -->
    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
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
      <div 
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex',
          message.type === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div 
          :class="[
            'chat-bubble',
            message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
          ]"
        >
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
      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <textarea
            v-model="inputMessage"
            @keydown.enter.prevent="sendMessage"
            placeholder="输入您的消息..."
            rows="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            :disabled="isLoading"
          />
        </div>
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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

// 页面配置
definePageMeta({
  title: '对话中...'
})

// 获取角色信息
const getCharacter = (id: string) => {
  const characters = [
    {
      id: 'luxun',
      name: '鲁迅',
      background: '中国现代文学奠基人，思想家，革命家',
      personality: '犀利、深刻、讽刺、忧国忧民',
      speaking_style: '文言白话结合，善用比喻和讽刺'
    },
    {
      id: 'confucius',
      name: '孔子',
      background: '春秋时期思想家、教育家',
      personality: '温和、睿智、循循善诱',
      speaking_style: '言简意赅，富含哲理'
    },
    {
      id: 'einstein',
      name: '爱因斯坦',
      background: '理论物理学家',
      personality: '好奇、幽默、富有想象力',
      speaking_style: '深入浅出，善用比喻'
    },
    {
      id: 'sherlock',
      name: '夏洛克·福尔摩斯',
      background: '世界知名侦探',
      personality: '敏锐、理性、自信',
      speaking_style: '逻辑严密，语言精确'
    }
  ]
  
  return characters.find(char => char.id === id)
}

// 初始化
onMounted(() => {
  character.value = getCharacter(characterId)
  if (!character.value) {
    // 角色不存在，跳转回首页
    navigateTo('/')
  }
})

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }

  // 添加用户消息
  messages.value.push(userMessage)
  const messageContent = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 显示正在输入
  isLoading.value = true
  isTyping.value = true

  try {
    // 模拟API调用（后续替换为真实API）
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟AI回复
    const aiResponse = generateMockResponse(messageContent, character.value)
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    }
    
    messages.value.push(aiMessage)
  } catch (error) {
    console.error('发送消息失败:', error)
    // 错误处理
  } finally {
    isLoading.value = false
    isTyping.value = false
  }
}

// 模拟AI回复生成
const generateMockResponse = (message: string, char: any) => {
  const responses = {
    'luxun': [
      '这正如我在《呐喊》中所写，国民的精神何时才能觉醒？',
      '世间本无路，走的人多了，也便成了路。',
      '我以为人类的进步，就是要向着真理前进的。'
    ],
    'confucius': [
      '学而时习之，不亦说乎？',
      '知之为知之，不知为不知，是知也。',
      '君子坦荡荡，小人长戚戚。'
    ],
    'einstein': [
      '想象力比知识更重要，因为知识是有限的。',
      '真理就是在经验面前站得住脚的东西。',
      '我从不想未来，它来得太快。'
    ],
    'sherlock': [
      '当你排除了所有不可能的情况，剩下的无论多么难以置信，都必然是真相。',
      '细节是最重要的，往往真相就隐藏在其中。',
      '观察！这是我的方法。'
    ]
  }
  
  const charResponses = responses[char?.id as keyof typeof responses] || ['抱歉，我需要思考一下。']
  return charResponses[Math.floor(Math.random() * charResponses.length)]
}

// 格式化时间
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>