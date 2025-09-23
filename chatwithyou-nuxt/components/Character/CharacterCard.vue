<template>
  <div 
    class="character-card p-6 text-center transition-all duration-300 hover:scale-105"
    @click="$emit('select', character)"
  >
    <!-- 头像 -->
    <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
      <img 
        v-if="character.avatar && character.avatar !== ''" 
        :src="character.avatar" 
        :alt="character.name"
        class="w-full h-full object-cover"
      >
      <span v-else>{{ character.name.charAt(0) }}</span>
    </div>
    
    <!-- 角色名称 -->
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      {{ character.name }}
    </h3>
    
    <!-- 角色背景 -->
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
      {{ character.background }}
    </p>
    
    <!-- 角色标签 -->
    <div class="flex flex-wrap justify-center gap-1">
      <span 
        v-for="trait in character.personality?.slice(0, 3)"
        :key="trait"
        class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
      >
        {{ trait }}
      </span>
    </div>
    
    <!-- 分类标识 -->
    <div class="mt-3">
      <span 
        :class="[
          'px-2 py-1 text-xs rounded-full font-medium',
          getCategoryStyle(character.category)
        ]"
      >
        {{ getCategoryName(character.category) }}
      </span>
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
  character: Character
}

defineProps<Props>()

defineEmits<{
  select: [character: Character]
}>()

// 获取分类样式
const getCategoryStyle = (category: string) => {
  const styles = {
    HISTORICAL: 'bg-amber-100 text-amber-800',
    FICTIONAL: 'bg-purple-100 text-purple-800',
    CELEBRITY: 'bg-pink-100 text-pink-800',
    CUSTOM: 'bg-green-100 text-green-800'
  }
  return styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800'
}

// 获取分类名称
const getCategoryName = (category: string) => {
  const names = {
    HISTORICAL: '历史人物',
    FICTIONAL: '虚构角色',
    CELEBRITY: '名人明星',
    CUSTOM: '自定义'
  }
  return names[category as keyof typeof names] || '未知'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>