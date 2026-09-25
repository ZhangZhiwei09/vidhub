import { createDb, type Db } from '@vidhub/db'

const globalForDb = globalThis as unknown as { __vidhubDb?: Db }

export function getDb(): Db {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  if (!globalForDb.__vidhubDb) {
    globalForDb.__vidhubDb = createDb(url)
  }
  return globalForDb.__vidhubDb
}

/** Lazy proxy so importing this module does not require DATABASE_URL at build time. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb()
    const value = Reflect.get(real, prop, receiver)
    return typeof value === 'function' ? value.bind(real) : value
  },
})