<template>
    <div class="conversation-history">
        <!-- 头部 -->
        <div class="history-header">
            <h2 class="page-title">
                <i class="icon">💬</i>
                对话历史
            </h2>
            <div class="header-actions">
                <button @click="refreshList" :disabled="isLoading" class="btn-secondary">
                    <i class="icon">🔄</i>
                    {{ isLoading ? '加载中...' : '刷新' }}
                </button>
            </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-bar" v-if="stats">
            <div class="stat-item">
                <span class="stat-label">总对话数</span>
                <span class="stat-value">{{ stats.total }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">今日对话</span>
                <span class="stat-value">{{ stats.today }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">活跃角色</span>
                <span class="stat-value">{{ stats.activeCharacters }}</span>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading && conversations.length === 0" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载对话历史...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!isLoading && conversations.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>还没有对话记录</h3>
            <p>开始与你喜欢的角色对话吧！</p>
            <button @click="$emit('startNewConversation')" class="btn-primary">
                开始新对话
            </button>
        </div>

        <!-- 对话列表 -->
        <div v-else class="conversation-list">
            <div v-for="conversation in conversations" :key="conversation.id" class="conversation-card"
                @click="openConversation(conversation)">
                <!-- 角色头像和信息 -->
                <div class="conversation-info">
                    <div class="character-avatar">
                        <img :src="conversation.character.avatar || '/default-avatar.png'"
                            :alt="conversation.character.name" class="avatar-image" />
                        <div class="character-category">
                            {{ getCategoryLabel(conversation.character.category) }}
                        </div>
                    </div>

                    <div class="conversation-details">
                        <h3 class="conversation-title">{{ conversation.title }}</h3>
                        <p class="character-name">与 {{ conversation.character.name }} 的对话</p>
                        <p class="last-message">{{ conversation.lastMessage }}</p>

                        <div class="conversation-meta">
                            <span class="message-count">
                                <i class="icon">💬</i>
                                {{ conversation.messageCount }} 条消息
                            </span>
                            <span class="update-time">
                                {{ formatRelativeTime(conversation.lastMessageTime) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="conversation-actions" @click.stop>
                    <button @click="openConversation(conversation)" class="action-btn continue-btn" title="继续对话">
                        <i class="icon">💬</i>
                    </button>
                    <button @click="showDeleteConfirm(conversation)" class="action-btn delete-btn" title="删除对话">
                        <i class="icon">🗑️</i>
                    </button>
                </div>
            </div>

            <!-- 加载更多 -->
            <div v-if="hasMore" class="load-more">
                <button @click="loadMore" :disabled="isLoadingMore" class="btn-secondary load-more-btn">
                    {{ isLoadingMore ? '加载中...' : '加载更多' }}
                </button>
            </div>
        </div>

        <!-- 删除确认对话框 -->
        <div v-if="deleteDialog.show" class="dialog-overlay" @click="hideDeleteConfirm">
            <div class="dialog" @click.stop>
                <div class="dialog-header">
                    <h3>确认删除</h3>
                </div>
                <div class="dialog-body">
                    <p>确定要删除与 <strong>{{ deleteDialog.conversation?.character.name }}</strong> 的对话吗？</p>
                    <p class="warning-text">此操作不可撤销，所有消息都将被永久删除。</p>
                </div>
                <div class="dialog-actions">
                    <button @click="hideDeleteConfirm" class="btn-secondary">
                        取消
                    </button>
                    <button @click="deleteConversation" :disabled="deleteDialog.isDeleting" class="btn-danger">
                        {{ deleteDialog.isDeleting ? '删除中...' : '确认删除' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    Character,
    ApiResponse,
    CharacterCategory
} from '~/types';

interface ConversationItem {
    id: string;
    title: string;
    character: {
        id: string;
        name: string;
        avatar?: string;
        category: CharacterCategory;
    };
    lastMessage: string;
    lastMessageTime: Date;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ConversationListResponse {
    conversations: ConversationItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const props = defineProps<{
    userId: string;
}>();

const emit = defineEmits<{
    openConversation: [conversationId: string, character: Character];
    startNewConversation: [];
}>();

// 响应式数据
const conversations = ref<ConversationItem[]>([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const currentPage = ref(1);
const hasMore = ref(true);
const stats = ref<{
    total: number;
    today: number;
    activeCharacters: number;
} | null>(null);

const deleteDialog = ref({
    show: false,
    conversation: null as ConversationItem | null,
    isDeleting: false
});

// 生命周期
onMounted(() => {
    loadConversations();
    loadStats();
});

// 方法
const loadConversations = async (reset = true) => {
    if (reset) {
        isLoading.value = true;
        currentPage.value = 1;
        conversations.value = [];
    } else {
        isLoadingMore.value = true;
    }

    try {
        const response = await $fetch('/api/conversations/list', {
            query: {
                userId: props.userId,
                page: currentPage.value,
                limit: 20
            }
        }) as ApiResponse<ConversationListResponse>;

        if (response.success && response.data) {
            if (reset) {
                conversations.value = response.data.conversations;
            } else {
                conversations.value.push(...response.data.conversations);
            }

            hasMore.value = currentPage.value < response.data.pagination.totalPages;
        }
    } catch (error) {
        console.error('Failed to load conversations:', error);
    } finally {
        isLoading.value = false;
        isLoadingMore.value = false;
    }
};

const loadMore = async () => {
    if (hasMore.value && !isLoadingMore.value) {
        currentPage.value++;
        await loadConversations(false);
    }
};

const refreshList = async () => {
    await loadConversations(true);
    await loadStats();
};

const loadStats = async () => {
    try {
        // 计算统计信息
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayConversations = conversations.value.filter(
            conv => new Date(conv.createdAt) >= today
        );

        const activeCharacters = new Set(
            conversations.value.map(conv => conv.character.id)
        );

        stats.value = {
            total: conversations.value.length,
            today: todayConversations.length,
            activeCharacters: activeCharacters.size
        };
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
};

const openConversation = (conversation: ConversationItem) => {
    const character: Character = {
        id: conversation.character.id,
        name: conversation.character.name,
        avatar: conversation.character.avatar,
        category: conversation.character.category,
        background: '', // 这些信息需要从完整的角色数据中获取
        personality: [],
        speakingStyle: '',
        quotes: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    emit('openConversation', conversation.id, character);
};

const showDeleteConfirm = (conversation: ConversationItem) => {
    deleteDialog.value = {
        show: true,
        conversation,
        isDeleting: false
    };
};

const hideDeleteConfirm = () => {
    deleteDialog.value = {
        show: false,
        conversation: null,
        isDeleting: false
    };
};

const deleteConversation = async () => {
    if (!deleteDialog.value.conversation) return;

    deleteDialog.value.isDeleting = true;

    try {
        const response = await $fetch(`/api/conversation/${deleteDialog.value.conversation.id}`, {
            method: 'DELETE',
            query: { userId: props.userId }
        }) as ApiResponse;

        if (response.success) {
            // 从列表中移除已删除的对话
            conversations.value = conversations.value.filter(
                conv => conv.id !== deleteDialog.value.conversation!.id
            );

            // 更新统计信息
            await loadStats();

            hideDeleteConfirm();
        }
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        alert('删除对话失败，请重试');
    } finally {
        deleteDialog.value.isDeleting = false;
    }
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

const formatRelativeTime = (timestamp: Date): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return time.toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.conversation-history {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
}

.history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e0e0e0;
}

.page-title {
    margin: 0;
    font-size: 2rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.btn-secondary,
.btn-primary,
.btn-danger {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-secondary {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
    background: #e9ecef;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5a6fd8;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #c82333;
}

.stats-bar {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
}

.stat-item {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
}

.stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
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

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.conversation-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.conversation-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.conversation-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.conversation-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.character-avatar {
    position: relative;
    flex-shrink: 0;
}

.avatar-image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #667eea;
}

.character-category {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: #667eea;
    color: white;
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    border-radius: 10px;
    white-space: nowrap;
}

.conversation-details {
    flex: 1;
    min-width: 0;
}

.conversation-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.2rem;
    color: #333;
    font-weight: 600;
}

.character-name {
    margin: 0 0 0.5rem 0;
    color: #667eea;
    font-weight: 500;
    font-size: 0.9rem;
}

.last-message {
    margin: 0 0 0.75rem 0;
    color: #666;
    font-size: 0.9rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.conversation-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #999;
}

.message-count,
.update-time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.conversation-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

.action-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.continue-btn {
    background: #667eea;
    color: white;
}

.continue-btn:hover {
    background: #5a6fd8;
    transform: scale(1.1);
}

.delete-btn {
    background: #dc3545;
    color: white;
}

.delete-btn:hover {
    background: #c82333;
    transform: scale(1.1);
}

.load-more {
    text-align: center;
    margin-top: 2rem;
}

.load-more-btn {
    padding: 1rem 2rem;
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
}

.dialog {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 400px;
    width: 90%;
    overflow: hidden;
}

.dialog-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
    margin: 0;
    color: #333;
}

.dialog-body {
    padding: 1.5rem;
}

.dialog-body p {
    margin: 0 0 1rem 0;
    color: #666;
}

.warning-text {
    color: #dc3545 !important;
    font-size: 0.9rem;
}

.dialog-actions {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .conversation-history {
        padding: 0.5rem;
    }

    .history-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .stats-bar {
        flex-direction: column;
        gap: 1rem;
    }

    .conversation-card {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .conversation-info {
        flex-direction: row;
    }

    .conversation-actions {
        justify-content: center;
    }

    .dialog {
        margin: 1rem;
    }
}
</style>