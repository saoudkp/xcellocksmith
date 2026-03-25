import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint is run separately in CI; don't block production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Migration scripts have loose types; don't block production builds
    ignoreBuildErrors: true,
  },
}

export default withPayload(nextConfig)
