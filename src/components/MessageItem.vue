<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Message } from '@/types/chat'
import { formatDateTime } from '@/utils/helpers'
import { renderMarkdown } from '@/utils/markdown'
import { formatFileSize, getFileTypeCategory } from '@/api/storage'

const props = defineProps<{
  message: Message
  isCurrentUser: boolean
}>()

const timeDisplay = computed(() => formatDateTime(props.message.created_at))

const renderedContent = computed(() => renderMarkdown(props.message.content))

// 文件相关计算属性
const hasFile = computed(() => !!props.message.file_url)
const fileType = computed(() => getFileTypeCategory(props.message.file_type || ''))
const fileName = computed(() => props.message.file_name || '未知文件')
const fileSize = computed(() => formatFileSize(props.message.file_size || 0))
const isImage = computed(() => fileType.value === 'image')
const isVideo = computed(() => fileType.value === 'video')
const isAudio = computed(() => fileType.value === 'audio')
const isDocument = computed(() => fileType.value === 'document')

// 图片预览
const showImagePreview = ref(false)
const previewImageUrl = ref('')

const openImagePreview = () => {
  if (props.message.file_url) {
    previewImageUrl.value = props.message.file_url
    showImagePreview.value = true
  }
}

const closeImagePreview = () => {
  showImagePreview.value = false
  previewImageUrl.value = ''
}
</script>

<template>
  <div class="message-item" :class="{ 'message-item--own': isCurrentUser }">
    <div class="message-item__avatar">
      {{ message.username.charAt(0).toUpperCase() }}
    </div>
    <div class="message-item__content">
      <div class="message-item__header">
        <span class="message-item__username">{{ message.username }}</span>
        <span class="message-item__time">{{ timeDisplay }}</span>
      </div>

      <!-- 消息内容 -->
      <div v-if="message.content" class="message-item__text markdown-content" v-html="renderedContent"></div>

      <!-- 文件附件 -->
      <div v-if="hasFile" class="message-item__attachment">
        <!-- 图片预览 -->
        <div v-if="isImage" class="message-item__image-attachment">
          <img
            :src="message.file_url"
            :alt="fileName"
            class="message-item__image"
            @click="openImagePreview"
          />
          <div class="message-item__image-info">
            <span class="message-item__file-name">{{ fileName }}</span>
            <span class="message-item__file-size">{{ fileSize }}</span>
          </div>
        </div>

        <!-- 视频播放器 -->
        <div v-else-if="isVideo" class="message-item__media-attachment">
          <video :src="message.file_url" controls class="message-item__video">
            您的浏览器不支持视频播放
          </video>
          <div class="message-item__media-info">
            <span class="message-item__file-name">{{ fileName }}</span>
            <span class="message-item__file-size">{{ fileSize }}</span>
          </div>
        </div>

<!-- 音频播放器 -->
        <div v-else-if="isAudio" class="message-item__media-attachment">
          <div class="message-item__audio-wrapper">
            <svg class="message-item__audio-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <audio 
              :src="message.file_url" 
              controls 
              preload="metadata" 
              class="message-item__audio"
            >
              您的浏览器不支持音频播放
            </audio>
          </div>
          <div class="message-item__media-info">
            <span class="message-item__file-name">{{ fileName }}</span>
            <span class="message-item__file-size">{{ fileSize }}</span>
          </div>
        </div>

        <!-- 文档下载 -->
        <div v-else-if="isDocument" class="message-item__document-attachment">
          <a :href="message.file_url" :download="fileName" class="message-item__document-link">
            <svg class="message-item__document-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="message-item__document-details">
              <span class="message-item__file-name">{{ fileName }}</span>
              <span class="message-item__file-size">{{ fileSize }}</span>
            </div>
            <svg class="message-item__download-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

        <!-- 其他文件类型 -->
        <div v-else class="message-item__document-attachment">
          <a :href="message.file_url" :download="fileName" class="message-item__document-link">
            <svg class="message-item__document-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="message-item__document-details">
              <span class="message-item__file-name">{{ fileName }}</span>
              <span class="message-item__file-size">{{ fileSize }}</span>
            </div>
            <svg class="message-item__download-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- 图片预览弹窗 -->
  <teleport to="body">
    <transition name="fade">
      <div v-if="showImagePreview" class="image-preview-overlay" @click="closeImagePreview">
        <img :src="previewImageUrl" class="image-preview" @click.stop />
        <button class="image-preview-close" @click="closeImagePreview" aria-label="关闭预览">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
@import 'katex/dist/katex.min.css';

.message-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.message-item--own {
  flex-direction: row-reverse;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--background-primary);
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.message-item--own .message-item__avatar {
  background: var(--text-tertiary);
}

.message-item__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 70%;
}

/* 自己发送的消息内容右对齐，避免右边长空 */
.message-item--own .message-item__content {
  align-items: flex-end;
}

/* 带有文件附件的消息需要更多空间 */
.message-item__content:has(.message-item__attachment) {
  max-width: 85%;
}

.message-item__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.message-item--own .message-item__header {
  justify-content: flex-end;
}

.message-item__username {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.message-item__time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.message-item__text {
  background: #e8e8e8;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  border-top-left-radius: 4px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-primary);
  word-wrap: break-word;
  max-width: 100%;
  width: fit-content;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.message-item--own .message-item__text {
  background: var(--text-primary);
  color: var(--background-primary);
  border-top-left-radius: var(--radius-sm);
  border-top-right-radius: 4px;
}

/* 文件附件样式 */
.message-item__attachment {
  background: var(--background-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.message-item--own .message-item__attachment {
  background: var(--text-primary);
}

/* 图片附件 */
.message-item__image-attachment {
  display: flex;
  flex-direction: column;
}

.message-item__image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-item__image:hover {
  transform: scale(1.02);
}

.message-item__image-info {
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-item--own .message-item__image-info {
  background: rgba(255, 255, 255, 0.1);
}

/* 媒体附件（视频/音频） */
.message-item__media-attachment {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--background-primary);
  min-width: 400px;
}

.message-item__video {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius-sm);
}

.message-item__audio-wrapper {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-sm);
  min-height: 70px;
}

.message-item__audio-icon {
  width: 40px;
  height: 40px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.message-item__audio {
  flex: 1;
  width: 100%;
  min-width: 200px;
  height: 48px;
  display: block;
  outline: none;
  background: transparent;
}

.message-item__media-info {
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
}

.message-item--own .message-item__media-info {
  background: rgba(255, 255, 255, 0.1);
}

.message-item--own .message-item__media-info {
  background: rgba(255, 255, 255, 0.1);
}

/* 文档附件 */
.message-item__document-attachment {
  padding: 0;
}

.message-item__document-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  transition: background 0.2s;
}

.message-item__document-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

.message-item--own .message-item__document-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.message-item__document-icon {
  width: 32px;
  height: 32px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.message-item__document-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.message-item__download-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.message-item__file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-item__file-size {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* 图片预览弹窗 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
  padding: 2rem;
}

.image-preview {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  cursor: default;
}

.image-preview-close {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.image-preview-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .message-item__content {
    max-width: 85%;
  }

  .image-preview {
    max-width: 95vw;
    max-height: 95vh;
  }
}

/* Markdown 内容样式 */
.markdown-content :deep(p) {
  margin: 0 0 0.5rem 0;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.875em;
}

.message-item--own .markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin: 0.5rem 0;
}

.message-item--own .markdown-content :deep(pre) {
  background: rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--text-tertiary);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
}

.markdown-content :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.markdown-content :deep(strong) {
  font-weight: 700;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  margin: 0.5rem 0;
}

/* KaTeX 样式调整 */
.markdown-content :deep(.katex) {
  font-size: 1.05em;
}

.markdown-content :deep(.katex-display) {
  margin: 0.5rem 0;
  overflow-x: auto;
}
</style>