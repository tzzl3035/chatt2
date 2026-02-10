import { supabase } from './supabase'

// 配置
const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'chat-attachments'
const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 52428800 // 50MB

/**
 * 文件上传结果接口
 */
export interface FileUploadResult {
  success: boolean
  data?: {
    path: string
    url: string
    fileName: string
    fileSize: number
    fileType: string
  }
  error?: string
}

/**
 * 验证文件
 * @param file 要验证的文件
 * @returns 验证结果 { valid: boolean, error?: string }
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(2)
    return {
      valid: false,
      error: `文件大小超过限制，最大允许 ${maxSizeMB}MB，当前文件 ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }
  }

  // 检查文件是否为空
  if (file.size === 0) {
    return {
      valid: false,
      error: '文件不能为空'
    }
  }

  return { valid: true }
}

/**
 * 生成唯一的文件路径
 * @param roomId 聊天室 ID
 * @param fileName 原始文件名
 * @returns 唯一的文件路径
 */
function generateFilePath(roomId: string, fileName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const ext = fileName.split('.').pop()
  const baseName = fileName.replace(/\.[^/.]+$/, '')

  // 只保留字母、数字、下划线和连字符，移除所有其他字符（包括中文）
  // 如果文件名经过清理后为空，使用默认名称
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_')
  const finalBaseName = sanitizedBaseName || 'file'

  return `${roomId}/${timestamp}_${random}_${finalBaseName}.${ext}`
}

/**
 * 获取文件类型分类
 * @param mimeType MIME 类型
 * @returns 文件类型分类
 */
export function getFileTypeCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('text') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation')
  ) {
    return 'document'
  }
  return 'other'
}

/**
 * 上传文件到 Supabase Storage
 * @param file 要上传的文件
 * @param roomId 聊天室 ID
 * @returns 上传结果
 */
export async function uploadFile(
  file: File,
  roomId: string,
  onProgress?: (progress: number) => void
): Promise<FileUploadResult> {
  try {
    // 验证文件
    const validation = validateFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // 生成文件路径
    const filePath = generateFilePath(roomId, file.name)

    // 上传文件
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      // 提供更友好的错误信息
      if (error.message.includes('bucket') || error.message.includes('Bucket')) {
        throw new Error(`Storage bucket "${STORAGE_BUCKET}" 不存在。请在 Supabase 控制台创建该 bucket。`)
      } else if (error.message.includes('permission') || error.message.includes('Permission')) {
        throw new Error('没有上传文件的权限，请检查 Storage bucket 的权限设置。')
      } else if (error.message.includes('size') || error.message.includes('Size')) {
        throw new Error('文件大小超过限制。')
      }
      throw error
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return {
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '文件上传失败'
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * 删除文件
 * @param filePath 文件路径
 * @returns 删除结果
 */
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '文件删除失败'
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * 获取文件的公开 URL
 * @param filePath 文件路径
 * @returns 公开 URL
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * 格式化文件大小显示
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}