<template>
    <div class="p-8">
        <h1 class="text-2xl font-bold mb-4">七牛云AI测试页面</h1>

        <div class="mb-4">
            <button @click="testQiniuAI" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                :disabled="loading">
                {{ loading ? '测试中...' : '测试七牛云AI' }}
            </button>
        </div>

        <div v-if="result" class="mt-4 p-4 border rounded">
            <h3 class="font-bold mb-2">测试结果:</h3>
            <pre class="whitespace-pre-wrap text-sm bg-gray-100 p-2 rounded">{{ JSON.stringify(result, null, 2) }}</pre>
        </div>

        <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <h3 class="font-bold mb-2 text-red-800">错误:</h3>
            <p class="text-red-700">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const result = ref<any>(null)
const error = ref('')

const testQiniuAI = async () => {
    loading.value = true
    result.value = null
    error.value = ''

    try {
        const response = await $fetch('/api/test/qiniu-ai')
        result.value = response
    } catch (err: any) {
        error.value = err.message || '测试失败'
        console.error('测试失败:', err)
    } finally {
        loading.value = false
    }
}
</script>