<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { useAuth } from '@/composables/useAuth'
import { useChatStore } from '@/stores/chat'
import { useToast } from 'vue-toastification'
import MessageItem from '@/components/MessageItem.vue'
import ChatInput from '@/components/ChatInput.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const { currentRoom, currentMessages, isLoadingMessages, sendMessage, setCurrentRoom, onlineUsersList } = useChat()
const { user } = useAuth()
const toast = useToast()

const messagesContainer = ref<HTMLElement | null>(null)
const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)

const roomId = computed(() => route.params.id as string)

const isCurrentUser = (messageUserId: string) => {
  return user.value?.id === messageUserId
}

const scrollToBottom = () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      if (messagesContainer.value) {
        // 直接设置滚动位置
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight

        // 再次检查，确保滚动成功（处理渲染延迟的情况）
        setTimeout(() => {
          if (messagesContainer.value) {
            const maxScroll = messagesContainer.value.scrollHeight - messagesContainer.value.clientHeight
            if (Math.abs(messagesContainer.value.scrollTop - maxScroll) > 10) {
              messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
            }
          }
        }, 50)
      }
    })
  })
}

const handleSendMessage = async (content: string) => {
  if (!currentRoom.value) return

  const result = await sendMessage(roomId.value, content)
  if (!result.success) {
    toast.error(result.error || '发送消息失败')
  }
  // 移除这里的 scrollToBottom()，因为 watch 会自动处理
}

const handleSendFileMessage = async (content: string, file: File) => {
  if (!currentRoom.value) {
    toast.error('请先选择聊天室')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    const result = await chatStore.sendFileMessage(
      roomId.value,
      content,
      file,
      (progress) => {
        uploadProgress.value = progress
      }
    )

    if (!result.success) {
      toast.error(result.error || '发送文件失败')
    } else {
      toast.success('文件发送成功')
      scrollToBottom()
    }
  } catch (err) {
    toast.error('文件上传失败，请稍后重试')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

onMounted(async () => {
  if (roomId.value) {
    // 先获取聊天室信息
    const roomResult = await chatStore.fetchRoom(roomId.value)
    if (roomResult.success && roomResult.data) {
      await setCurrentRoom(roomResult.data, user.value?.id || null)
    } else {
      // 如果获取失败，使用默认值
      await setCurrentRoom({ id: roomId.value, name: '聊天室', description: null, created_by: null, created_at: '', updated_at: '' }, user.value?.id || null)
    }
    // 等待 DOM 完全渲染后滚动到底部
    // 使用 setTimeout 确保 Markdown 和 KaTeX 渲染完成
    setTimeout(() => {
      scrollToBottom()
    }, 100)
    chatInputRef.value?.focus()
  }
})

onUnmounted(() => {
  setCurrentRoom(null)
})

// 监听消息变化，有新消息时滚动到底部
watch(() => currentMessages.value.length, (newLength, oldLength) => {
  // 只在消息数量增加时滚动
  if (newLength > oldLength) {
    scrollToBottom()
  }
})

watch(() => route.params.id, async (newId) => {
  if (newId && newId !== roomId.value) {
    // 先获取聊天室信息
    const roomResult = await chatStore.fetchRoom(newId as string)
    if (roomResult.success && roomResult.data) {
      await setCurrentRoom(roomResult.data, user.value?.id || null)
    } else {
      // 如果获取失败，使用默认值
      await setCurrentRoom({ id: newId as string, name: '聊天室', description: null, created_by: null, created_at: '', updated_at: '' }, user.value?.id || null)
    }
    // 等待 DOM 完全渲染后滚动到底部
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }
})

const handleGoBack = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="chat-room-view">
    <div class="chat-room-header">
      <button class="back-btn" @click="handleGoBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        返回
      </button>
      <div class="room-info">
        <h1 class="room-name">{{ currentRoom?.name || '聊天室' }}</h1>
        <p class="room-description" v-if="currentRoom?.description">{{ currentRoom.description }}</p>
        <div class="online-users" v-if="onlineUsersList.length > 0">
          <span class="online-indicator"></span>
          <span class="online-count">{{ onlineUsersList.length }} 人在线</span>
          <span class="online-list">
            {{ onlineUsersList.map(u => u.username).join(', ') }}
          </span>
        </div>
      </div>
    </div>

    <div class="chat-room-content">
      <div v-if="isLoadingMessages" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载消息...</p>
      </div>

      <div v-else class="messages-container" ref="messagesContainer">
        <div v-if="currentMessages.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>暂无消息</p>
          <p class="empty-hint">发送第一条消息开始聊天吧！</p>
        </div>

        <MessageItem
          v-for="message in currentMessages"
          :key="message.id"
          :message="message"
          :is-current-user="isCurrentUser(message.user_id)"
        />
      </div>

      <div class="chat-input-container">
        <ChatInput
          ref="chatInputRef"
          :disabled="!currentRoom || isUploading"
          @send="handleSendMessage"
          @send-file="handleSendFileMessage"
        />
        <!-- 上传进度提示 -->
        <div v-if="isUploading" class="upload-progress">
          <div class="upload-progress-bar" :style="{ width: uploadProgress + '%' }"></div>
          <span class="upload-progress-text">上传中... {{ uploadProgress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-room-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: var(--background-secondary);
}

.chat-room-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--background-primary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--background-primary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--background-secondary);
  border-color: var(--text-tertiary);
}

.back-btn:active {
  transform: scale(0.98);
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.online-users {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.online-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.online-count {
  font-weight: 500;
}

.online-list {
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-room-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 3rem 1rem;
  color: var(--text-tertiary);
}

.loading-state svg,
.empty-state svg {
  color: var(--border-color);
  margin-bottom: 1rem;
}

.loading-state p,
.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

.empty-hint {
  font-size: 0.8125rem !important;
  margin-top: 0.5rem !important;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-input-container {
  flex-shrink: 0;
  background: var(--background-primary);
  border-top: 1px solid var(--border-color);
}

.upload-progress {
  padding: 0.5rem 1.5rem;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-color);
}

.upload-progress-bar {
  height: 4px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
  margin-bottom: 0.5rem;
}

.upload-progress-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  display: block;
}

@media (max-width: 768px) {
  .chat-room-view {
    height: calc(100vh - 56px);
  }

  .chat-room-header {
    padding: 0.75rem 1rem;
  }

  .room-name {
    font-size: 1rem;
  }

  .back-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .messages-container {
    padding: 1rem;
  }
}
</style>