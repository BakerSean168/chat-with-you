<template>
  <div class="space-y-6">
    <!-- 搜索和过滤 -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
      <!-- 搜索框 -->
      <div class="relative flex-1 max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索角色..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
      </div>
      
      <!-- 分类过滤 -->
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
      <CharacterCard
        v-for="character in filteredCharacters"
        :key="character.id"
        :character="character"
        @select="onCharacterSelect"
      />
    </div>

    <!-- 空状态 -->
    <div 
      v-if="filteredCharacters.length === 0"
      class="text-center py-12"
    >
      <div class="text-gray-400 text-6xl mb-4">🤖</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ searchQuery ? '未找到匹配的角色' : '该分类下暂无角色' }}
      </h3>
      <p class="text-gray-600">
        {{ searchQuery ? '试试其他关键词' : '更多精彩角色即将上线，敬请期待！' }}
      </p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="i in 8"
        :key="i"
        class="bg-white rounded-xl shadow-lg p-6 animate-pulse"
      >
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200"></div>
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded mb-3"></div>
        <div class="flex justify-center gap-1">
          <div class="h-6 w-12 bg-gray-200 rounded-full"></div>
          <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
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

interface Props {
  characters: Character[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<{
  select: [character: Character]
}>()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')

// 分类选项
const categories = [
  { id: 'all', name: '全部' },
  { id: 'HISTORICAL', name: '历史人物' },
  { id: 'FICTIONAL', name: '虚构角色' },
  { id: 'CELEBRITY', name: '名人明星' },
  { id: 'CUSTOM', name: '自定义' }
]

// 计算属性：过滤后的角色
const filteredCharacters = computed(() => {
  let filtered = props.characters

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(char => char.category === selectedCategory.value)
  }

  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(char => 
      char.name.toLowerCase().includes(query) ||
      char.background.toLowerCase().includes(query) ||
      char.personality?.some(trait => trait.toLowerCase().includes(query))
    )
  }

  return filtered
})

// 角色选择处理
const onCharacterSelect = (character: Character) => {
  $emit('select', character)
}

// 监听分类变化，重置搜索
watch(selectedCategory, () => {
  searchQuery.value = ''
})
</script>