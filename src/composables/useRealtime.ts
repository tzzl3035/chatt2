import { onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtime() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  let realtimeChannel: RealtimeChannel | null = null

  const subscribeToRoom = (roomId: string, _callback?: (payload: any) => void) => {
    // Unsubscribe from previous channel
    if (realtimeChannel) {
      chatStore.unsubscribeFromRoom()
    }

    realtimeChannel = chatStore.subscribeToRoom(roomId, authStore.user?.id || null)
    return realtimeChannel
  }

  const unsubscribeFromRoom = () => {
    chatStore.unsubscribeFromRoom()
    realtimeChannel = null
  }

  // Clean up on unmount
  onUnmounted(() => {
    unsubscribeFromRoom()
  })

  return {
    subscribeToRoom,
    unsubscribeFromRoom,
  }
}