<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <!-- 页面头部 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-gray-900">
              ChatWithYou
            </NuxtLink>
          </div>
          <nav class="flex items-center space-x-4">
            <NuxtLink 
              to="/" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              首页
            </NuxtLink>
            <span class="text-blue-600 font-medium px-3 py-2 rounded-md text-sm">
              历史记录
            </span>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          对话历史记录
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          查看您与各个角色的精彩对话历史
        </p>
      </div>

      <!-- 对话历史列表 -->
      <div class="space-y-4">
        <div 
          v-for="conversation in conversations"
          :key="conversation.id"
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer"
          @click="openConversation(conversation)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                {{ conversation.character.name.charAt(0) }}
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  与{{ conversation.character.name }}的对话
                </h3>
                <p class="text-sm text-gray-600">
                  {{ conversation.lastMessage }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDate(conversation.updatedAt) }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {{ conversation.messageCount }} 条消息
              </span>
              <button 
                @click.stop="deleteConversation(conversation.id)"
                class="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="conversations.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">💬</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          暂无对话记录
        </h3>
        <p class="text-gray-600 mb-6">
          开始您的第一次AI角色对话吧！
        </p>
        <NuxtLink 
          to="/"
          class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          选择角色开始对话
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// 页面配置
definePageMeta({
  title: 'ChatWithYou - 对话历史'
})

// 模拟对话历史数据
const conversations = ref([
  {
    id: '1',
    character: {
      id: 'luxun',
      name: '鲁迅',
      avatar: '/avatars/luxun.jpg'
    },
    lastMessage: '这正如我在《呐喊》中所写，国民的精神何时才能觉醒？',
    messageCount: 15,
    updatedAt: new Date('2024-01-20T10:30:00')
  },
  {
    id: '2',
    character: {
      id: 'confucius',
      name: '孔子',
      avatar: '/avatars/confucius.jpg'
    },
    lastMessage: '学而时习之，不亦说乎？',
    messageCount: 8,
    updatedAt: new Date('2024-01-19T15:45:00')
  },
  {
    id: '3',
    character: {
      id: 'einstein',
      name: '爱因斯坦',
      avatar: '/avatars/einstein.jpg'
    },
    lastMessage: '想象力比知识更重要，因为知识是有限的。',
    messageCount: 23,
    updatedAt: new Date('2024-01-18T09:15:00')
  }
])

// 方法：打开对话
const openConversation = (conversation: any) => {
  navigateTo(`/chat/${conversation.character.id}`)
}

// 方法：删除对话
const deleteConversation = (conversationId: string) => {
  if (confirm('确定要删除这个对话记录吗？')) {
    const index = conversations.value.findIndex(conv => conv.id === conversationId)
    if (index > -1) {
      conversations.value.splice(index, 1)
    }
  }
}

// 方法：格式化日期
const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffDays === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>