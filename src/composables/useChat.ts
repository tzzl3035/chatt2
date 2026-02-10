import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import type { ChatRoom } from '@/types/chat'

export function useChat() {
  const chatStore = useChatStore()
  const router = useRouter()

  const currentRoom = computed(() => chatStore.currentRoom)
  const rooms = computed(() => chatStore.rooms)
  const messages = computed(() => chatStore.messages)
  const currentMessages = computed(() => chatStore.currentMessages)
  const onlineUsersList = computed(() => chatStore.onlineUsersList)
  const isLoadingRooms = computed(() => chatStore.isLoadingRooms)
  const isLoadingMessages = computed(() => chatStore.isLoadingMessages)
  const error = computed(() => chatStore.error)

  const fetchRooms = async () => {
    return await chatStore.fetchRooms()
  }

  const fetchRoom = async (roomId: string) => {
    return await chatStore.fetchRoom(roomId)
  }

  const createOrGetRoom = async (name: string, currentUserId: string | null = null) => {
    const result = await chatStore.createOrGetRoom(name)
    if (result.success && result.data) {
      await router.push(`/room/${result.data.id}`)
    }
    return result
  }

  const fetchMessages = async (roomId: string) => {
    return await chatStore.fetchMessages(roomId)
  }

  const sendMessage = async (roomId: string, content: string) => {
    return await chatStore.sendMessage({ room_id: roomId, content })
  }

  const setCurrentRoom = (room: ChatRoom | null, currentUserId: string | null = null) => {
    return chatStore.setCurrentRoom(room, currentUserId)
  }

  const clearMessages = (roomId: string) => {
    chatStore.clearMessages(roomId)
  }

  return {
    currentRoom,
    rooms,
    messages,
    currentMessages,
    onlineUsersList,
    isLoadingRooms,
    isLoadingMessages,
    error,
    fetchRooms,
    fetchRoom,
    createOrGetRoom,
    fetchMessages,
    sendMessage,
    setCurrentRoom,
    clearMessages,
  }
}