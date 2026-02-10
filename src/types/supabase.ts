import type { Database } from './supabase-generated'

export type {
  Json,
  Database,
} from './supabase-generated'

export type Tables = Database['public']['Tables']
export type TablesInsert = Database['public']['Tables']
export type TablesUpdate = Database['public']['Tables']

// Database table types
export type Profile = Tables['profiles']['Row']
export type ProfileInsert = Tables['profiles']['Insert']
export type ProfileUpdate = Tables['profiles']['Update']

export type ChatRoom = Tables['chat_rooms']['Row']
export type ChatRoomInsert = Tables['chat_rooms']['Insert']
export type ChatRoomUpdate = Tables['chat_rooms']['Update']

export type Message = Tables['messages']['Row']
export type MessageInsert = Tables['messages']['Insert']
export type MessageUpdate = Tables['messages']['Update']

export type EmailVerificationCode = Tables['email_verification_codes']['Row']
export type EmailVerificationCodeInsert = Tables['email_verification_codes']['Insert']
export type EmailVerificationCodeUpdate = Tables['email_verification_codes']['Update']