<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <!-- 页面头部 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">ChatWithYou</h1>
            <span class="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              仿真电话亭
            </span>
          </div>
          <nav class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              首页
            </NuxtLink>
            <NuxtLink to="/history" class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
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

      <!-- 加载状态 -->
      <div v-if="pending" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">正在加载角色...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="refresh()" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          重新加载
        </button>
      </div>

      <!-- 角色内容 -->
      <div v-else>
        <!-- 角色分类标签 -->
        <div class="flex justify-center mb-8">
          <div class="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm">
            <button v-for="category in categories" :key="category.id" @click="selectedCategory = category.id" :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:text-blue-600'
            ]">
              {{ category.name }}
              <span class="ml-1 text-xs opacity-75">
                ({{ getCategoryCount(category.id) }})
              </span>
            </button>
          </div>
        </div>

        <!-- 角色网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="character in filteredCharacters" :key="character.id" @click="startConversation(character)"
            class="character-card group cursor-pointer bg-white rounded-lg p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div
              class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
              {{ character.name.charAt(0) }}
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ character.name }}
            </h3>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">
              {{ character.background }}
            </p>
            <div class="flex flex-wrap justify-center gap-1 mb-3">
              <span v-for="tag in character.tags?.slice(0, 3)" :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {{ tag }}
              </span>
            </div>
            <div class="text-xs text-gray-500">
              {{ character.category }} · {{ character.era }}
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredCharacters.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🤖</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            该分类下暂无角色
          </h3>
          <p class="text-gray-600">
            更多精彩角色即将上线，敬请期待！
          </p>
        </div>
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
  { id: 'celebrity', name: '现代名人' },
  { id: 'custom', name: '自定义' }
]

// 从API获取角色数据
const { data: characters, pending, error, refresh } = await useFetch('/api/characters', {
  transform: (data: any) => data.data || []
})

// 计算属性：过滤角色
const filteredCharacters = computed(() => {
  if (!characters.value) return []

  if (selectedCategory.value === 'all') {
    return characters.value
  }
  return characters.value.filter((char: any) => char.category === selectedCategory.value)
})

// 计算每个分类的数量
const getCategoryCount = (categoryId: string) => {
  if (!characters.value) return 0

  if (categoryId === 'all') {
    return characters.value.length
  }
  return characters.value.filter((char: any) => char.category === categoryId).length
}

// 方法：开始对话
const startConversation = (character: any) => {
  navigateTo(`/chat/${character.id}`)
}
</script>

<style scoped>
.character-card {
  transition: all 0.3s ease;
}

.character-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>