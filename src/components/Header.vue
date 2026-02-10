<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { user, profile, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <RouterLink to="/dashboard" class="logo">
          <span class="logo-text">chatt2</span>
        </RouterLink>
      </div>

      <div class="header-right">

        <div class="user-info" v-if="user">
          <div class="user-avatar">
            {{ profile?.username?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase() || '?' }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ profile?.username || user.username || '用户' }}</span>
          </div>
        </div>

        <button class="sign-out-btn" @click="handleSignOut">
          退出登录
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--background-primary);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--background-primary);
  font-weight: 600;
  font-size: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.sign-out-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--background-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sign-out-btn:hover {
  background: var(--background-tertiary);
}

.sign-out-btn:active {
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .header-container {
    padding: 0.75rem 1rem;
  }

  .user-details {
    display: none;
  }

  .sign-out-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}
</style>