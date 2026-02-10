<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import type { Ref } from 'vue'
import { validateFile, formatFileSize, getFileTypeCategory } from '@/api/storage'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
  sendFile: [message: string, file: File]
}>()

const message = ref('')
const inputRef: Ref<HTMLInputElement | null> = ref(null)
const fileInputRef: Ref<HTMLInputElement | null> = ref(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)

// 计算属性：是否有文件或消息内容
const canSend = computed(() => {
  return message.value.trim() !== '' || selectedFile.value !== null
})

// 选择文件
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file) {
      const validation = validateFile(file)
      if (validation.valid) {
        selectedFile.value = file
      } else {
        alert(validation.error)
      }
    }
  }
  // 重置 input，允许选择同一文件
  target.value = ''
}

// 触发文件选择
const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

// 移除选中的文件
const removeSelectedFile = () => {
  selectedFile.value = null
}

// 处理拖放事件
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file) {
      const validation = validateFile(file)
      if (validation.valid) {
        selectedFile.value = file
      } else {
        alert(validation.error)
      }
    }
  }
}

// 发送消息
const handleSend = () => {
  if (!canSend.value || props.disabled) return

  // 如果有文件，发送文件消息
  if (selectedFile.value) {
    emit('sendFile', message.value.trim(), selectedFile.value)
    message.value = ''
    selectedFile.value = null
  } else {
    // 只发送文本消息
    const trimmed = message.value.trim()
    if (trimmed) {
      emit('send', trimmed)
      message.value = ''
    }
  }

  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleSend()
  }
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({
  focus,
})
</script>

<template>
  <div
    class="chat-input"
    :class="{ 'chat-input--dragging': isDragging }"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <!-- 文件上传按钮 -->
    <button
      class="chat-input__file-btn"
      :disabled="disabled"
      @click="triggerFileSelect"
      title="上传文件"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <input
        ref="fileInputRef"
        type="file"
        class="chat-input__file-input"
        @change="handleFileSelect"
      >
    </button>

    <!-- 消息输入区域 -->
    <div class="chat-input__input-wrapper">
      <textarea
        ref="inputRef"
        v-model="message"
        :disabled="disabled"
        class="chat-input__field"
        :placeholder="selectedFile ? '添加描述...' : '输入消息...'"
        rows="2"
        @keydown="handleKeydown"
      />

      <!-- 文件预览区域 -->
      <div v-if="selectedFile" class="chat-input__file-preview">
        <div class="chat-input__file-info">
          <svg class="chat-input__file-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="chat-input__file-details">
            <div class="chat-input__file-name">{{ selectedFile.name }}</div>
            <div class="chat-input__file-size">{{ formatFileSize(selectedFile.size) }}</div>
          </div>
        </div>
        <button class="chat-input__file-remove" @click="removeSelectedFile" title="移除文件">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 发送按钮 -->
    <button
      class="chat-input__send-btn"
      :disabled="disabled || !canSend"
      @click="handleSend"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--background-primary);
  border-top: 1px solid var(--border-color);
  transition: all 0.2s;
}

.chat-input--dragging {
  background: var(--background-secondary);
  border-top-color: var(--text-primary);
}

.chat-input__file-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: var(--background-secondary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-bottom: 4px;
}

.chat-input__file-btn:hover:not(:disabled) {
  background: var(--background-tertiary);
  transform: scale(1.05);
}

.chat-input__file-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input__file-input {
  display: none;
}

.chat-input__input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-input__field {
  min-height: 60px;
  max-height: 200px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  background: var(--background-secondary);
  color: var(--text-primary);
}

.chat-input__field:focus {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 3px rgba(128, 128, 128, 0.1);
}

.chat-input__field::placeholder {
  color: var(--text-tertiary);
}

.chat-input__field:disabled {
  background: var(--background-tertiary);
  cursor: not-allowed;
}

.chat-input__file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  gap: 0.75rem;
}

.chat-input__file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.chat-input__file-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.chat-input__file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
}

.chat-input__file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-input__file-size {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.chat-input__file-remove {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.chat-input__file-remove:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.chat-input__send-btn {
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: var(--text-primary);
  color: var(--background-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-bottom: 4px;
}

.chat-input__send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

.chat-input__send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.chat-input__send-btn:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}
</style>