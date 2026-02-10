export interface ChatRoom {
  id: string
  name: string
  description: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  room_id: string
  user_id: string
  username: string
  content: string
  created_at: string
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
}

export interface ChatState {
  currentRoom: ChatRoom | null
  rooms: ChatRoom[]
  messages: Record<string, Message[]>
  isSubscribed: boolean
  isLoadingRooms: boolean
  isLoadingMessages: boolean
}

export interface SendMessageInput {
  room_id: string
  content: string
}