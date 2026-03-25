import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint is run separately in CI; don't block production builds
    ignoreDuringBuilds: true,
  },
}

export default withPayload(nextConfig)
