import { z } from 'zod'

export const loginSchema = z.object({
  account: z.string().min(1).max(64),
  password: z.string().min(6).max(128),
})

export const registerSchema = loginSchema.extend({
  username: z.string().min(1).max(32).optional(),
})

export const paginationSchema = z.object({
  currentPage: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PaginationInput = z.infer<typeof paginationSchema>

export const USER_ROLES = ['user', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]