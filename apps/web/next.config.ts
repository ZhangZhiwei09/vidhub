import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@vidhub/db', '@vidhub/shared'],
}

export default nextConfig