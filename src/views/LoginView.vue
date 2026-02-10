<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { loginSchema, registerSchema } from '@/utils/validation'
import { useToast } from 'vue-toastification'
import type { LoginFormData, RegisterFormData } from '@/utils/validation'

const route = useRoute()
const { signIn, signUp, isLoading } = useAuth()
const toast = useToast()

const isLoginMode = ref(true)
const loginForm = ref<LoginFormData>({
  identifier: '',
  password: '',
})
const registerForm = ref<RegisterFormData>({
  username: '',
  password: '',
  confirmPassword: '',
})

// Computed properties for v-model
const currentPassword = computed({
  get: () => isLoginMode.value ? loginForm.value.password : registerForm.value.password,
  set: (value) => {
    if (isLoginMode.value) {
      loginForm.value.password = value
    } else {
      registerForm.value.password = value
    }
  }
})

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  // Clear forms when switching
  loginForm.value = { identifier: '', password: '' }
  registerForm.value = { username: '', password: '', confirmPassword: '' }
}

const handleLogin = async () => {
  try {
    const result = loginSchema.safeParse(loginForm.value)
    if (!result.success) {
      toast.error(result.error.issues?.[0]?.message || '验证失败')
      return
    }

    const authResult = await signIn(loginForm.value)
    if (!authResult.success) {
      toast.error(authResult.error || '登录失败')
    }
  } catch {
    toast.error('登录失败，请稍后重试')
  }
}

const handleRegister = async () => {
  try {
    const result = registerSchema.safeParse(registerForm.value)
    if (!result.success) {
      toast.error(result.error.issues?.[0]?.message || '验证失败')
      return
    }

    const authResult = await signUp(registerForm.value)

    if (authResult.success) {
      toast.success('注册成功！')
      // Clear form and switch to login mode
      registerForm.value = { username: '', password: '', confirmPassword: '' }
      isLoginMode.value = true
    } else {
      // Check if user might already be registered
      if (authResult.error?.includes('already registered') || authResult.error?.includes('用户已存在')) {
        toast.error('该邮箱已注册，请直接登录或使用其他邮箱')
        // Switch to login mode
        isLoginMode.value = true
      } else if (authResult.error?.includes('rate limit') || authResult.error?.includes('邮件发送频率超限')) {
        toast.warning(authResult.error)
        // 提示用户检查邮箱或稍后再试
      } else {
        toast.error(authResult.error || '注册失败，请稍后重试')
      }
    }
  } catch (error) {
    toast.error('注册失败，请稍后重试')
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-header">
      <h2 class="login-title">{{ isLoginMode ? '登录' : '注册' }}</h2>
      <p class="login-subtitle">{{ isLoginMode ? '欢迎回来' : '创建新账户' }}</p>
    </div>

    <form class="login-form" @submit.prevent="isLoginMode ? handleLogin() : handleRegister()">
      <!-- Username field (register only) -->
      <div v-if="!isLoginMode" class="form-group">
        <label for="username" class="form-label">用户名</label>
        <input
          id="username"
          v-model="registerForm.username"
          type="text"
          class="form-input"
          placeholder="请输入用户名"
          autocomplete="username"
        />
      </div>

      <!-- Email/Username field (login only) -->
      <div v-if="isLoginMode" class="form-group">
        <label for="identifier" class="form-label">用户名</label>
        <input
          id="identifier"
          v-model="loginForm.identifier"
          type="text"
          class="form-input"
          placeholder="请输入用户名"
          autocomplete="username"
        />
      </div>

      <!-- Password field -->
      <div class="form-group">
        <label for="password" class="form-label">密码</label>
        <input
          id="password"
          v-model="currentPassword"
          type="password"
          class="form-input"
          placeholder="请输入密码"
          autocomplete="current-password"
        />
      </div>

      <!-- Confirm password field (register only) -->
      <div v-if="!isLoginMode" class="form-group">
        <label for="confirm-password" class="form-label">确认密码</label>
        <input
          id="confirm-password"
          v-model="registerForm.confirmPassword"
          type="password"
          class="form-input"
          placeholder="请再次输入密码"
          autocomplete="new-password"
        />
      </div>

      

      <!-- Submit button -->
      <button type="submit" class="submit-btn" :disabled="isLoading">
        {{ isLoading ? '处理中...' : (isLoginMode ? '登录' : '注册') }}
      </button>
    </form>

    <!-- Toggle mode -->
    <div class="toggle-mode">
      <span>{{ isLoginMode ? '还没有账户？' : '已有账户？' }}</span>
      <button type="button" class="toggle-btn" @click="toggleMode">
        {{ isLoginMode ? '立即注册' : '立即登录' }}
      </button>
    </div>

    <!-- Back to home -->
    <div class="back-home">
      <RouterLink to="/" class="back-link">返回首页</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-header {
  text-align: center;
}

.login-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.login-subtitle {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.form-group--with-button {
  gap: 0.5rem;
}

.input-with-button {
  display: flex;
  gap: 0.75rem;
}

.input-with-button .form-input {
  flex: 1;
}

.submit-btn {
  padding: 0.875rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--text-primary);
  color: var(--background-primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.toggle-btn {
  border: none;
  background: none;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9375rem;
  padding: 0;
}

.toggle-btn:hover {
  text-decoration: underline;
}

.back-home {
  text-align: center;
}

.back-link {
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--text-primary);
}
</style>