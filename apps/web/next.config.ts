import type { NextConfig } from 'next'
import path from 'node:path'

const root = path.join(__dirname, '../..')

const nextConfig: NextConfig = {
  // pnpm's symlinked dependencies cannot be copied into standalone output on Windows.
  output: process.platform === 'win32' ? undefined : 'standalone',
  transpilePackages: [
    '@vidhub/db',
    '@vidhub/media-runtime',
    '@vidhub/shared',
    '@vidhub/player',
  ],
  turbopack: {
    root,
  },
}

export default nextConfig
