import { z } from 'zod'

export const commentCreateSchema = z.object({
  vid: z.coerce.number().int().positive(),
  content: z.string().min(1).max(1000),
  replyId: z.coerce.number().int().positive().nullable().optional(),
  target: z.coerce.number().int().positive().nullable().optional(),
})

export const archiveToggleSchema = z.object({
  vid: z.coerce.number().int().positive(),
  value: z.boolean(),
})

export const danmakuCreateSchema = z.object({
  vid: z.coerce.number().int().positive(),
  text: z.string().min(1).max(100),
  color: z.string().max(32).default('#ffffff'),
  time: z.coerce.number().int().min(0).default(0),
  type: z.coerce.number().int().default(0),
})

export const chatSendSchema = z.object({
  toId: z.coerce.number().int().positive(),
  content: z.string().min(1).max(2000),
})

export const liveSwitchSchema = z.object({
  title: z.string().max(200).optional().default(''),
  status: z.coerce.number().int().min(0).max(1),
})

export const adminVideoStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(['pending', 'approved', 'rejected']),
})