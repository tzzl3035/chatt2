<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useThemeStore } from '@/stores/theme'
import { onMounted } from 'vue'

const route = useRoute()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <component :is="route.meta.layout === 'auth' ? AuthLayout : (route.meta.layout === 'none' ? 'div' : DefaultLayout)">
    <RouterView />
  </component>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--background-secondary);
  transition: color 0.3s, background-color 0.3s;
}

#app {
  display: flex;
  flex-direction: column;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
}

input,
textarea {
  font-family: inherit;
}
</style>