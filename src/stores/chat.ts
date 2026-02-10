import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/api/supabase'
import { useAuthStore } from '@/stores/auth'
import type { ChatRoom, Message, SendMessageInput } from '@/types/chat'
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'

interface OnlineUser {
  userId: string
  username: string
  onlineAt: number
}

export const useChatStore = defineStore('chat', () => {
  // State
  const currentRoom = ref<ChatRoom | null>(null)
  const rooms = ref<ChatRoom[]>([])
  const messages = ref<Record<string, Message[]>>({})
  const onlineUsers = ref<Map<string, OnlineUser>>(new Map())
  const isLoadingRooms = ref(false)
  const isLoadingMessages = ref(false)
  const error = ref<string | null>(null)
  let realtimeChannel: RealtimeChannel | null = null

  // Computed
  const currentMessages = computed(() => {
    if (!currentRoom.value) return []
    return messages.value[currentRoom.value.id] || []
  })

  const onlineUsersList = computed(() => {
    return Array.from(onlineUsers.value.values())
  })

  // Fetch all chat rooms
  const fetchRooms = async () => {
    isLoadingRooms.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError
      rooms.value = data || []
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch rooms'
      return { success: false, error: error.value }
    } finally {
      isLoadingRooms.value = false
    }
  }

  // Fetch a single chat room by ID
  const fetchRoom = async (roomId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (fetchError) throw fetchError
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch room'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    }
  }

  // Create or get a chat room by name
  const createOrGetRoom = async (name: string) => {
    try {
      // 获取 authStore
      const authStore = useAuthStore()

      // First try to find existing room
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('name', name)
        .maybeSingle()

      if (existingRoom) {
        return { success: true, data: existingRoom }
      }

      // If not found, create new room
      
      // 检查用户是否登录（使用自定义认证系统）
      if (!authStore.user || !authStore.user.id) {
        throw new Error('用户未登录，请先登录')
      }

      const { data, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          created_by: authStore.user.id,
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }
      
      // Add to rooms list
      rooms.value.unshift(data)
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建聊天室失败'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    }
  }

  // Fetch messages for a room
  const fetchMessages = async (roomId: string) => {
    isLoadingMessages.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (fetchError) throw fetchError

      // Transform data to include username
      const transformedMessages = (data || []).map((msg: any) => ({
        ...msg,
        username: msg.profiles?.username || 'Unknown',
      }))

      messages.value[roomId] = transformedMessages
      return { success: true, data: transformedMessages }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch messages'
      return { success: false, error: error.value }
    } finally {
      isLoadingMessages.value = false
    }
  }

  // Send a message
  const sendMessage = async (input: SendMessageInput) => {
    error.value = null
    try {
      // 获取 authStore
      const authStore = useAuthStore()
      
      // 检查用户是否登录（使用自定义认证系统）
      if (!authStore.user || !authStore.user.id) {
        throw new Error('User not authenticated')
      }

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          room_id: input.room_id,
          user_id: authStore.user.id,
          content: input.content,
        })
        .select()
        .single()

      if (sendError) throw sendError

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      return { success: false, error: error.value }
    }
  }

  // Send a file message
  const sendFileMessage = async (
    roomId: string,
    content: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    error.value = null
    try {
      // 获取 authStore
      const authStore = useAuthStore()
      
      // 检查用户是否登录（使用自定义认证系统）
      if (!authStore.user || !authStore.user.id) {
        throw new Error('User not authenticated')
      }

      // 上传文件
      const { uploadFile } = await import('@/api/storage')
      const uploadResult = await uploadFile(file, roomId, onProgress)

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || '文件上传失败')
      }

      // 发送消息并附带文件信息
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: authStore.user.id,
          content: content || '',
          file_url: uploadResult.data.url,
          file_name: uploadResult.data.fileName,
          file_size: uploadResult.data.fileSize,
          file_type: uploadResult.data.fileType,
        })
        .select()
        .single()

      if (sendError) throw sendError

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send file message'
      return { success: false, error: error.value }
    }
  }

  // Subscribe to real-time messages
  const subscribeToRoom = (roomId: string, currentUserId: string | null) => {
    // Unsubscribe from previous channel
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }

    // Clear previous online users
    onlineUsers.value.clear()

    realtimeChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the new message with profile info
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              profiles:user_id (
                username
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            const newMessage = {
              ...data,
              username: data.profiles?.username || 'Unknown',
            }

            // 检查消息是否已存在，避免重复添加
            if (!messages.value[roomId]) {
              messages.value[roomId] = []
            }

            const messageExists = messages.value[roomId].some(msg => msg.id === newMessage.id)
            if (!messageExists) {
              messages.value[roomId].push(newMessage)
            }
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        // 获取所有在线用户
        const state = realtimeChannel?.presenceState<RealtimePresenceState<OnlineUser>>()
        if (!state) return

        onlineUsers.value.clear()

        Object.entries(state).forEach(([userId, presences]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0] as any
            onlineUsers.value.set(userId, {
              userId,
              username: presence.username || 'Unknown',
              onlineAt: presence.online_at || Date.now()
            })
          }
        })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          onlineUsers.value.set(key, {
            userId: key,
            username: presence.username || 'Unknown',
            onlineAt: presence.online_at || Date.now()
          })
        })
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        onlineUsers.value.delete(key)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUserId) {
          // 将当前用户标记为在线
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', currentUserId)
            .single()

          await realtimeChannel?.track({
            online_at: new Date().toISOString(),
            username: profile?.username || 'Unknown'
          })
        }
      })

    return realtimeChannel
  }

  // Unsubscribe from real-time messages
  const unsubscribeFromRoom = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  // Set current room
  const setCurrentRoom = async (room: ChatRoom | null, currentUserId: string | null = null) => {
    currentRoom.value = room
    if (room) {
      // 等待消息加载完成
      await fetchMessages(room.id)
      subscribeToRoom(room.id, currentUserId)
    } else {
      onlineUsers.value.clear()
      unsubscribeFromRoom()
    }
  }

  // Clear messages for a room
  const clearMessages = (roomId: string) => {
    delete messages.value[roomId]
  }

  return {
    // State
    currentRoom,
    rooms,
    messages,
    onlineUsers,
    isLoadingRooms,
    isLoadingMessages,
    error,
    // Computed
    currentMessages,
    onlineUsersList,
    // Actions
    fetchRooms,
    fetchRoom,
    createOrGetRoom,
    fetchMessages,
    sendMessage,
    sendFileMessage,
    subscribeToRoom,
    unsubscribeFromRoom,
    setCurrentRoom,
    clearMessages,
  }
})