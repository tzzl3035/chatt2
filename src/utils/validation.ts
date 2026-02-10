import { z } from 'zod'

// Password validation schema
export const passwordSchema = z
  .string()
  .min(6, '密码至少需要6个字符')
  .max(100, '密码不能超过100个字符')

// Username validation schema
export const usernameSchema = z
  .string()
  .min(2, '用户名至少需要2个字符')
  .max(30, '用户名不能超过30个字符')
  .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文')

// Verification code validation schema
export const verificationCodeSchema = z
  .string()
  .length(6, '验证码必须是6位数字')
  .regex(/^\d+$/, '验证码只能包含数字')

// Room name validation schema
export const roomNameSchema = z
  .string()
  .min(1, '聊天室名称不能为空')
  .max(50, '聊天室名称不能超过50个字符')

// Message content validation schema
export const messageContentSchema = z
  .string()
  .min(1, '消息不能为空')
  .max(1000, '消息不能超过1000个字符')
  .trim()

// Login form schema
export const loginSchema = z.object({
  identifier: z.string().min(1, '请输入用户名'),
  password: passwordSchema,
})

// Register form schema
export const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, '请再次输入密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

// Create room schema
export const createRoomSchema = z.object({
  name: roomNameSchema,
})

// Send message schema
export const sendMessageSchema = z.object({
  content: messageContentSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CreateRoomFormData = z.infer<typeof createRoomSchema>
export type SendMessageFormData = z.infer<typeof sendMessageSchema>