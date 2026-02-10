<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { useAuth } from '@/composables/useAuth'
import { createRoomSchema } from '@/utils/validation'
import { useToast } from 'vue-toastification'
import type { ChatRoom } from '@/types/chat'
import RoomList from '@/components/RoomList.vue'

const router = useRouter()
const { rooms, isLoadingRooms, fetchRooms, createOrGetRoom } = useChat()
const { profile } = useAuth()
const toast = useToast()

const showCreateModal = ref(false)
const newRoomName = ref('')

const handleLoadRooms = async () => {
  await fetchRooms()
}

const handleOpenCreateModal = () => {
  newRoomName.value = ''
  showCreateModal.value = true
}

const handleCloseCreateModal = () => {
  showCreateModal.value = false
  newRoomName.value = ''
}

const handleCreateRoom = async () => {
  try {
    const result = createRoomSchema.safeParse({ name: newRoomName.value })
    if (!result.success) {
      toast.error(result.error.issues?.[0]?.message || '聊天室名称验证失败')
      return
    }

    const createResult = await createOrGetRoom(newRoomName.value)
    
    if (!createResult.success) {
      // 提供更具体的错误信息
      let errorMessage = createResult.error || '创建聊天室失败'
      if (errorMessage.includes('用户未登录')) {
        errorMessage = '请先登录后再创建聊天室'
      } else if (errorMessage.includes('permission denied') || errorMessage.includes('权限')) {
        errorMessage = '没有创建聊天室的权限，请检查数据库设置'
      } else if (errorMessage.includes('chat_rooms')) {
        errorMessage = '聊天室表不存在或无法访问，请检查数据库配置'
      }
      
      toast.error(errorMessage)
    } else {
      toast.success(`聊天室 "${newRoomName.value}" 创建成功！`)
      handleCloseCreateModal()
    }
  } catch (error) {
    toast.error('创建聊天室失败，请稍后重试')
  }
}

const handleRoomClick = (room: ChatRoom) => {
  router.push(`/room/${room.id}`)
}

onMounted(() => {
  handleLoadRooms()
})
</script>

<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">聊天室</h1>
          <p class="dashboard-subtitle">选择一个聊天室开始聊天</p>
        </div>
        <button class="create-room-btn" @click="handleOpenCreateModal">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          创建聊天室
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="user-welcome" v-if="profile">
        <div class="user-avatar">
          {{ profile.username.charAt(0).toUpperCase() }}
        </div>
        <div class="user-greeting">
          <span class="greeting-text">欢迎回来，</span>
          <span class="user-name">{{ profile.username }}</span>
        </div>
      </div>

      <RoomList
        :rooms="rooms"
        :is-loading="isLoadingRooms"
        @click="handleRoomClick"
      />
    </div>

    <!-- Create Room Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="handleCloseCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">创建聊天室</h2>
          <button class="modal-close" @click="handleCloseCreateModal">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="roomName" class="form-label">聊天室名称</label>
            <input
              id="roomName"
              v-model="newRoomName"
              type="text"
              class="form-input"
              placeholder="请输入聊天室名称"
              @keyup.enter="handleCreateRoom"
            />
            <p class="form-hint">输入房间名称即可创建或加入已有聊天室</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="handleCloseCreateModal">
            取消
          </button>
          <button class="btn btn-primary" @click="handleCreateRoom">
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.dashboard-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.dashboard-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

.create-room-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--text-primary);
  color: var(--background-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-room-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.create-room-btn:active {
  transform: translateY(0);
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--background-primary);
  font-weight: 700;
  font-size: 1.5rem;
}

.user-greeting {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.greeting-text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 100%;
  max-width: 480px;
  background: var(--background-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--background-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  background: var(--background-primary);
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 3px rgba(128, 128, 128, 0.1);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--background-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--background-tertiary);
}

.btn-primary {
  background: var(--text-primary);
  color: var(--background-primary);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 1.5rem 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .create-room-btn {
    width: 100%;
    justify-content: center;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .modal-content {
    max-width: 100%;
  }
}
</style>