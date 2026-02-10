<script setup lang="ts">
import { computed } from 'vue'
import type { ChatRoom } from '@/types/chat'
import { formatRelativeTime } from '@/utils/helpers'

const props = defineProps<{
  room: ChatRoom
}>()

const emit = defineEmits<{
  click: [room: ChatRoom]
}>()

const handleClick = () => {
  emit('click', props.room)
}

const timeAgo = computed(() => formatRelativeTime(props.room.updated_at))
</script>

<template>
  <div class="room-card" @click="handleClick">
    <div class="room-card__icon">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 8H19C20.1046 8 21 8.89543 21 10V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H7M7 8H17M7 8V16M17 8V16M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="room-card__content">
      <h3 class="room-card__name">{{ room.name }}</h3>
      <p class="room-card__description" v-if="room.description">
        {{ room.description }}
      </p>
      <span class="room-card__time">更新于 {{ timeAgo }}</span>
    </div>
    <div class="room-card__arrow">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.room-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.room-card:hover {
  border-color: var(--text-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.room-card:active {
  transform: translateY(0);
}

.room-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--background-primary);
  flex-shrink: 0;
}

.room-card__content {
  flex: 1;
  min-width: 0;
}

.room-card__name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-card__description {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-card__time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.room-card__arrow {
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.room-card:hover .room-card__arrow {
  transform: translateX(4px);
  color: var(--text-primary);
}
</style>