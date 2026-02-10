import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RegisterCredentials, LoginCredentials, Profile } from '@/types/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const profile = computed(() => authStore.profile)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  const signUp = async (credentials: RegisterCredentials) => {
    const result = await authStore.signUp(credentials)
    if (result.success) {
      await router.push('/dashboard')
    }
    return result
  }

  const signIn = async (credentials: LoginCredentials) => {
    const result = await authStore.signIn(credentials)
    if (result.success) {
      await router.push('/dashboard')
    }
    return result
  }

  const signOut = async () => {
    await authStore.signOut()
    await router.push('/login')
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    return await authStore.updateProfile(updates)
  }

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}