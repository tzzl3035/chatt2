import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import type { Profile, RegisterCredentials, LoginCredentials } from '@/types/auth'

// 简单的密码哈希函数（使用 Web Crypto API）
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hash))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// 验证密码
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<{ id: string; username: string } | null>(null)
  const profile = ref<Profile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)

  // Fetch user profile by ID
  const fetchProfileById = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (fetchError) {
        return null
      }

      profile.value = data
      return data
    } catch (err) {
      return null
    }
  }

  // Fetch user profile
  const fetchProfile = async (username: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      if (fetchError) {
        return null
      }

      profile.value = data
      return data
    } catch (err) {
      return null
    }
  }

  // 从 localStorage 恢复会话
  const restoreSession = async () => {
    const savedSession = localStorage.getItem('user_session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        user.value = session
        // 使用 user.id 而不是 username 来获取 profile
        await fetchProfileById(session.id)
      } catch (err) {
        localStorage.removeItem('user_session')
      }
    }
  }

  // 初始化时恢复会话
  restoreSession()

  // Sign up with username and password
  const signUp = async (credentials: RegisterCredentials) => {
    isLoading.value = true
    error.value = null
    try {
      // 检查用户名是否已存在
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', credentials.username)
        .maybeSingle()

      if (checkError) {
        throw new Error('注册失败，请稍后重试')
      }

      if (existingUser) {
        throw new Error('该用户名已被占用，请选择其他用户名')
      }

      // 生成密码哈希
      const passwordHash = await hashPassword(credentials.password)

      // 创建用户记录
      const userId = crypto.randomUUID()
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: credentials.username,
          email: '', // 自定义认证不需要邮箱
          password_hash: passwordHash,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        throw new Error('注册失败，请稍后重试')
      }

      // 自动登录
      user.value = { id: userId, username: credentials.username }
      localStorage.setItem('user_session', JSON.stringify(user.value))
      
      // 使用 ID 获取完整的 profile
      await fetchProfileById(userId)

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败，请检查网络连接和输入信息'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign in with username and password
  const signIn = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null
    try {

      // 查找用户
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('id, username, password_hash, email')
        .eq('username', credentials.identifier)
        .maybeSingle()

      if (fetchError) {
        throw new Error('登录失败，请稍后重试')
      }

      if (!userData || !userData.password_hash) {
        throw new Error('用户名或密码错误')
      }

      // 验证密码
      const isValid = await verifyPassword(credentials.password, userData.password_hash)
      if (!isValid) {
        throw new Error('用户名或密码错误')
      }

      // 创建会话
      user.value = { id: userData.id, username: userData.username }
      localStorage.setItem('user_session', JSON.stringify(user.value))

      // 使用 ID 获取完整的 profile
      await fetchProfileById(userData.id)

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    isLoading.value = true
    try {
      user.value = null
      profile.value = null
      error.value = null
      localStorage.removeItem('user_session')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign out'
    } finally {
      isLoading.value = false
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    isLoading.value = true
    error.value = null
    try {
      if (!user.value) throw new Error('User not authenticated')

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError
      profile.value = data

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    profile,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    // Actions
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
})