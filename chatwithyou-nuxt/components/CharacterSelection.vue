<template>
    <div class="character-selection">
        <!-- 头部 -->
        <div class="selection-header">
            <h1 class="page-title">
                <i class="icon">🎭</i>
                选择聊天角色
            </h1>
            <p class="page-subtitle">与历史人物、虚构角色和名人进行精彩对话</p>
        </div>

        <!-- 搜索和筛选 -->
        <div class="search-filters">
            <div class="search-box">
                <i class="search-icon">🔍</i>
                <input v-model="searchQuery" type="text" placeholder="搜索角色名称..." class="search-input" />
                <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
                    ✕
                </button>
            </div>

            <div class="filter-tabs">
                <button v-for="category in categories" :key="category.value" @click="selectedCategory = category.value"
                    :class="['filter-tab', { active: selectedCategory === category.value }]">
                    <i class="tab-icon">{{ category.icon }}</i>
                    {{ category.label }}
                    <span class="count">({{ getCategoryCount(category.value) }})</span>
                </button>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载角色...</p>
        </div>

        <!-- 角色网格 -->
        <div v-else-if="filteredCharacters.length > 0" class="character-grid">
            <div v-for="character in filteredCharacters" :key="character.id" class="character-card"
                @click="selectCharacter(character)">
                <!-- 角色头像 -->
                <div class="character-avatar">
                    <img :src="character.avatar || '/default-avatar.png'" :alt="character.name" class="avatar-image" />
                    <div class="category-badge">
                        {{ getCategoryLabel(character.category) }}
                    </div>
                </div>

                <!-- 角色信息 -->
                <div class="character-info">
                    <h3 class="character-name">{{ character.name }}</h3>
                    <p class="character-background">{{ character.background }}</p>

                    <!-- 性格标签 -->
                    <div class="personality-tags">
                        <span v-for="trait in character.personality.slice(0, 3)" :key="trait" class="personality-tag">
                            {{ trait }}
                        </span>
                    </div>

                    <!-- 经典语录 -->
                    <div class="quote-preview" v-if="character.quotes.length > 0">
                        <i class="quote-icon">💭</i>
                        <span class="quote-text">"{{ character.quotes[0] }}"</span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="character-actions">
                    <button @click.stop="showCharacterDetail(character)" class="btn-secondary detail-btn">
                        <i class="icon">ℹ️</i>
                        详情
                    </button>
                    <button @click.stop="selectCharacter(character)" class="btn-primary chat-btn">
                        <i class="icon">💬</i>
                        开始对话
                    </button>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>没有找到匹配的角色</h3>
            <p>尝试调整搜索条件或选择其他分类</p>
            <button @click="resetFilters" class="btn-secondary">
                重置筛选
            </button>
        </div>

        <!-- 角色详情弹窗 -->
        <div v-if="detailDialog.show" class="dialog-overlay" @click="hideCharacterDetail">
            <div class="character-detail-dialog" @click.stop>
                <div class="dialog-header">
                    <h3>{{ detailDialog.character?.name }}</h3>
                    <button @click="hideCharacterDetail" class="close-btn">✕</button>
                </div>

                <div class="dialog-body" v-if="detailDialog.character">
                    <div class="detail-avatar">
                        <img :src="detailDialog.character.avatar || '/default-avatar.png'"
                            :alt="detailDialog.character.name" class="avatar-large" />
                        <div class="category-info">
                            {{ getCategoryLabel(detailDialog.character.category) }}
                        </div>
                    </div>

                    <div class="detail-content">
                        <div class="detail-section">
                            <h4>角色背景</h4>
                            <p>{{ detailDialog.character.background }}</p>
                        </div>

                        <div class="detail-section">
                            <h4>性格特征</h4>
                            <div class="personality-grid">
                                <span v-for="trait in detailDialog.character.personality" :key="trait"
                                    class="personality-tag">
                                    {{ trait }}
                                </span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>说话风格</h4>
                            <p class="speaking-style">{{ detailDialog.character.speakingStyle }}</p>
                        </div>

                        <div class="detail-section">
                            <h4>经典语录</h4>
                            <div class="quotes-list">
                                <blockquote v-for="quote in detailDialog.character.quotes" :key="quote"
                                    class="quote-item">
                                    "{{ quote }}"
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dialog-actions">
                    <button @click="hideCharacterDetail" class="btn-secondary">
                        关闭
                    </button>
                    <button @click="selectCharacter(detailDialog.character!)" class="btn-primary">
                        <i class="icon">💬</i>
                        开始对话
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Character, CharacterCategory, ApiResponse } from '~/types';

const emit = defineEmits<{
    characterSelected: [character: Character];
}>();

// 响应式数据
const characters = ref<Character[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref<CharacterCategory | 'ALL'>('ALL');

const detailDialog = ref({
    show: false,
    character: null as Character | null
});

// 分类配置
const categories = [
    { value: 'ALL' as const, label: '全部', icon: '🎭' },
    { value: 'HISTORICAL' as const, label: '历史人物', icon: '📚' },
    { value: 'FICTIONAL' as const, label: '虚构角色', icon: '🎪' },
    { value: 'CELEBRITY' as const, label: '现代名人', icon: '⭐' },
    { value: 'CUSTOM' as const, label: '自定义', icon: '✨' }
];

// 计算属性
const filteredCharacters = computed(() => {
    let filtered = characters.value;

    // 按分类筛选
    if (selectedCategory.value !== 'ALL') {
        filtered = filtered.filter(char => char.category === selectedCategory.value);
    }

    // 按搜索关键词筛选
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(char =>
            char.name.toLowerCase().includes(query) ||
            char.background.toLowerCase().includes(query) ||
            char.personality.some(trait => trait.toLowerCase().includes(query))
        );
    }

    return filtered;
});

// 生命周期
onMounted(() => {
    loadCharacters();
});

// 方法
const loadCharacters = async () => {
    isLoading.value = true;
    try {
        const response = await $fetch('/api/characters') as ApiResponse<Character[]>;
        if (response.success && response.data) {
            characters.value = response.data.filter(char => char.isActive);
        }
    } catch (error) {
        console.error('Failed to load characters:', error);
    } finally {
        isLoading.value = false;
    }
};

const selectCharacter = (character: Character) => {
    emit('characterSelected', character);
    hideCharacterDetail();
};

const showCharacterDetail = (character: Character) => {
    detailDialog.value = {
        show: true,
        character
    };
};

const hideCharacterDetail = () => {
    detailDialog.value = {
        show: false,
        character: null
    };
};

const clearSearch = () => {
    searchQuery.value = '';
};

const resetFilters = () => {
    searchQuery.value = '';
    selectedCategory.value = 'ALL';
};

const getCategoryCount = (category: CharacterCategory | 'ALL'): number => {
    if (category === 'ALL') return characters.value.length;
    return characters.value.filter(char => char.category === category).length;
};

const getCategoryLabel = (category: CharacterCategory): string => {
    const labels = {
        HISTORICAL: '历史人物',
        FICTIONAL: '虚构角色',
        CELEBRITY: '现代名人',
        CUSTOM: '自定义'
    };
    return labels[category] || '未知';
};
</script>

<style scoped>
.character-selection {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.selection-header {
    text-align: center;
    margin-bottom: 3rem;
}

.page-title {
    margin: 0 0 1rem 0;
    font-size: 2.5rem;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.page-subtitle {
    margin: 0;
    font-size: 1.2rem;
    color: #666;
}

.search-filters {
    margin-bottom: 2rem;
}

.search-box {
    position: relative;
    max-width: 400px;
    margin: 0 auto 2rem;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

.search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 2px solid #e0e0e0;
    border-radius: 25px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
}

.search-input:focus {
    border-color: #667eea;
}

.clear-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 1.2rem;
}

.filter-tabs {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.filter-tab {
    padding: 0.75rem 1.5rem;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.filter-tab:hover {
    border-color: #667eea;
}

.filter-tab.active {
    background: #667eea;
    border-color: #667eea;
    color: white;
}

.count {
    font-size: 0.8rem;
    opacity: 0.8;
}

.loading-state {
    text-align: center;
    padding: 3rem;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.character-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
}

.character-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.character-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
    border-color: #667eea;
}

.character-avatar {
    position: relative;
    text-align: center;
    margin-bottom: 1rem;
}

.avatar-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #667eea;
}

.category-badge {
    position: absolute;
    bottom: -5px;
    right: 50%;
    transform: translateX(50%);
    background: #667eea;
    color: white;
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    border-radius: 10px;
    white-space: nowrap;
}

.character-info {
    flex: 1;
    margin-bottom: 1rem;
}

.character-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    color: #333;
    text-align: center;
    font-weight: 600;
}

.character-background {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.personality-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    justify-content: center;
}

.personality-tag {
    background: #f0f2ff;
    color: #667eea;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.quote-preview {
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.quote-text {
    font-style: italic;
    color: #555;
    font-size: 0.85rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.character-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-secondary,
.btn-primary {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.btn-secondary {
    background: #f8f9fa;
    color: #667eea;
    border: 1px solid #667eea;
}

.btn-secondary:hover {
    background: #667eea;
    color: white;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5a6fd8;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
}

.character-detail-dialog {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.dialog-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dialog-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #f0f0f0;
    color: #333;
}

.dialog-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.detail-avatar {
    text-align: center;
    margin-bottom: 2rem;
}

.avatar-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #667eea;
    margin-bottom: 1rem;
}

.category-info {
    background: #667eea;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 15px;
    font-size: 0.9rem;
    display: inline-block;
}

.detail-section {
    margin-bottom: 2rem;
}

.detail-section h4 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.personality-grid {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.speaking-style {
    color: #666;
    font-style: italic;
    line-height: 1.5;
}

.quotes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.quote-item {
    margin: 0;
    padding: 1rem;
    background: #f8f9fa;
    border-left: 4px solid #667eea;
    border-radius: 8px;
    font-style: italic;
    color: #555;
    line-height: 1.4;
}

.dialog-actions {
    padding: 1.5rem;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .character-selection {
        padding: 1rem;
    }

    .page-title {
        font-size: 2rem;
    }

    .character-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
    }

    .filter-tabs {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 0.5rem;
    }

    .filter-tab {
        flex-shrink: 0;
    }

    .character-detail-dialog {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
    }

    .dialog-actions {
        flex-direction: column;
    }
}
</style>