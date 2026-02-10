import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')

  const applyTheme = (themeMode: ThemeMode) => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    // 主题切换已禁用
  }

  const initTheme = () => {
    mode.value = 'light'
    applyTheme('light')
  }

  return {
    mode,
    toggleTheme,
    initTheme,
  }
})