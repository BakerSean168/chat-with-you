<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <!-- 页面头部 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">ChatWithYou</h1>
          </div>
          <nav class="flex items-center space-x-4">
            <NuxtLink 
              to="/" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              首页
            </NuxtLink>
            <NuxtLink 
              to="/history" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              历史记录
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          选择您想要对话的角色
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          与历史名人、文学角色或虚构人物进行深度对话，体验跨越时空的交流魅力
        </p>
      </div>

      <!-- 角色分类标签 -->
      <div class="flex justify-center mb-8">
        <div class="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
          <button 
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:text-blue-600'
            ]"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- 角色网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="character in filteredCharacters"
          :key="character.id"
          @click="startConversation(character)"
          class="character-card p-6 text-center"
        >
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {{ character.name.charAt(0) }}
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ character.name }}
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            {{ character.background }}
          </p>
          <div class="flex flex-wrap justify-center gap-1">
            <span 
              v-for="tag in character.tags"
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div 
        v-if="filteredCharacters.length === 0"
        class="text-center py-12"
      >
        <div class="text-gray-400 text-6xl mb-4">🤖</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          该分类下暂无角色
        </h3>
        <p class="text-gray-600">
          更多精彩角色即将上线，敬请期待！
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// 页面配置
definePageMeta({
  title: 'ChatWithYou - 选择对话角色'
})

// 响应式数据
const selectedCategory = ref('all')

// 角色分类
const categories = [
  { id: 'all', name: '全部' },
  { id: 'historical', name: '历史人物' },
  { id: 'fictional', name: '虚构角色' },
  { id: 'celebrity', name: '名人明星' },
  { id: 'custom', name: '自定义' }
]

// 示例角色数据
const characters = [
  {
    id: 'luxun',
    name: '鲁迅',
    background: '中国现代文学奠基人',
    category: 'historical',
    tags: ['文学家', '思想家', '革命家'],
    avatar: '/avatars/luxun.jpg'
  },
  {
    id: 'confucius',
    name: '孔子',
    background: '春秋时期思想家、教育家',
    category: 'historical',
    tags: ['哲学家', '教育家', '儒学创始人']
  },
  {
    id: 'einstein',
    name: '爱因斯坦',
    background: '理论物理学家',
    category: 'historical',
    tags: ['物理学家', '相对论', '诺贝尔奖']
  },
  {
    id: 'sherlock',
    name: '夏洛克·福尔摩斯',
    background: '世界知名侦探',
    category: 'fictional',
    tags: ['侦探', '推理', '英国']
  }
]

// 计算属性：过滤角色
const filteredCharacters = computed(() => {
  if (selectedCategory.value === 'all') {
    return characters
  }
  return characters.filter(char => char.category === selectedCategory.value)
})

// 方法：开始对话
const startConversation = (character: any) => {
  navigateTo(`/chat/${character.id}`)
}
</script>