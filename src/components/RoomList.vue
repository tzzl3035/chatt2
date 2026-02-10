<script setup lang="ts">
import type { ChatRoom } from '@/types/chat'
import RoomCard from './RoomCard.vue'

defineProps<{
  rooms: ChatRoom[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  click: [room: ChatRoom]
}>()

const handleRoomClick = (room: ChatRoom) => {
  emit('click', room)
}
</script>

<template>
  <div class="room-list">
    <div v-if="isLoading" class="room-list__loading">
      <div class="loading-spinner"></div>
      <p>加载聊天室...</p>
    </div>

    <div v-else-if="rooms.length === 0" class="room-list__empty">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 8H19C20.1046 8 21 8.89543 21 10V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H7M7 8H17M7 8V16M17 8V16M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>暂无聊天室</p>
      <p class="empty-hint">输入聊天室名称即可创建</p>
    </div>

    <div v-else class="room-list__items">
      <RoomCard
        v-for="room in rooms"
        :key="room.id"
        :room="room"
        @click="handleRoomClick"
      />
    </div>
  </div>
</template>

<style scoped>
.room-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.room-list__loading,
.room-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-tertiary);
}

.room-list__loading svg,
.room-list__empty svg {
  color: var(--border-color);
  margin-bottom: 1rem;
}

.room-list__loading p,
.room-list__empty p {
  margin: 0;
  font-size: 0.9375rem;
}

.empty-hint {
  font-size: 0.8125rem !important;
  margin-top: 0.5rem !important;
}

.room-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
</style>