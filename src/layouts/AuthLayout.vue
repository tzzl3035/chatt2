<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <div class="auth-layout">
    
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="auth-title">chatt2</h1>
        <p class="auth-subtitle">实时聊天室</p>
      </div>
      <div class="auth-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-secondary);
  padding: 1rem;
  position: relative;
}

.theme-toggle-wrapper {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: var(--background-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.auth-header {
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  background: var(--text-primary);
  color: var(--background-primary);
}

.auth-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.auth-content {
  padding: 2rem;
}
</style>