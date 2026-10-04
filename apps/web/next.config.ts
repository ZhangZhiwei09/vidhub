import type { NextConfig } from 'next'
import path from 'node:path'

const root = path.join(__dirname, '../..')

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@vidhub/db', '@vidhub/shared', '@vidhub/player'],
  turbopack: {
    root,
  },
}

export default nextConfig