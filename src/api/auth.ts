import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile, RegisterCredentials, LoginCredentials } from '@/types/auth'

/**
 * Sign up a new user
 * Note: This function is for Supabase Auth. The main app uses custom auth in stores/auth.ts
 */
export async function signUp(credentials: RegisterCredentials) {
  try {
    // Note: Custom auth system uses username + password without email
    // This function is kept for compatibility but not used in the main app
    // Using a placeholder email for Supabase Auth if needed
    const placeholderEmail = `${credentials.username}@placeholder.local`
    
    // Sign up user - Supabase will send verification email automatically
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: placeholderEmail,
      password: credentials.password,
      options: {
        // Optional: You can set a redirect URL for email confirmation
        // emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      throw new Error(`注册失败: ${signUpError.message}`)
    }
    
    if (!authData.user) {
      throw new Error('注册失败: 未创建用户')
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: credentials.username,
        email: placeholderEmail,
      })

    if (profileError) {
      throw new Error(`创建用户资料失败: ${profileError.message}`)
    }

    return { success: true, user: authData.user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '注册失败，请检查网络连接和输入信息',
    }
  }
}

/**
 * Sign in a user
 */
export async function signIn(credentials: LoginCredentials) {
  try {
    let email = credentials.identifier

    // Check if identifier is an email or username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.identifier)) {
      // It's a username, fetch the corresponding email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', credentials.identifier)
        .single()

      if (profileError || !profileData?.email) {
        throw new Error('用户名或密码错误')
      }

      email = profileData.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: credentials.password,
    })

    if (error) throw error
    if (!data.user) throw new Error('Failed to sign in')

    return { success: true, user: data.user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign in',
    }
  }
}

/**
 * Sign out a user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out',
    }
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    return null
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      return null
    }
    return data
  } catch (error) {
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, profile: data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send password reset email',
    }
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password',
    }
  }
}