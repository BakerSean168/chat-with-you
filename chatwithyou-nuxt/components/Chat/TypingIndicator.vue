<template>
  <div class="flex justify-start mb-4">
    <div class="bg-white rounded-lg px-4 py-3 shadow-sm border max-w-xs lg:max-w-md">
      <div class="flex items-center space-x-2">
        <!-- 头像 -->
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {{ characterName?.charAt(0) || '?' }}
        </div>
        
        <!-- 动画点点 -->
        <div class="flex space-x-1">
          <div 
            v-for="i in 3"
            :key="i"
            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
          ></div>
        </div>
        
        <!-- 正在输入文本 -->
        <span class="text-sm text-gray-500 ml-2">
          {{ characterName || '对方' }}正在输入...
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  characterName?: string
}

defineProps<Props>()
</script>

<style scoped>
@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>