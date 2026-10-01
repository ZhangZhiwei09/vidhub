import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(__dirname, '../..')

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@vidhub/db', '@vidhub/shared'],
  turbopack: {
    root,
  },
}

export default nextConfig