import { describe, expect, it } from 'vitest'
import { loginSchema, paginationSchema } from './index'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const r = loginSchema.safeParse({ account: 'demo', password: '123456' })
    expect(r.success).toBe(true)
  })

  it('rejects short password', () => {
    const r = loginSchema.safeParse({ account: 'demo', password: '123' })
    expect(r.success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('applies defaults', () => {
    const r = paginationSchema.parse({})
    expect(r.currentPage).toBe(1)
    expect(r.pageSize).toBe(20)
  })
})