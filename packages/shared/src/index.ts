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

export const publishVideoSchema = z.object({
  hash: z.string().min(1),
  title: z.string().min(1).max(200),
  cover: z.string().min(1),
  description: z.string().max(2000).optional().default(''),
  partitionId: z.coerce.number().int().min(0).default(0),
})

export const uploadVerifySchema = z.object({
  hash: z.string().min(1),
  fileName: z.string().min(1),
})

export const uploadMergeSchema = z.object({
  hash: z.string().min(1),
  fileName: z.string().min(1),
  size: z.coerce.number().int().positive(),
})

export type PublishVideoInput = z.infer<typeof publishVideoSchema>

export * from './social'