/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',     // Google
      'avatars.githubusercontent.com', // GitHub
      'platform-lookaside.fbsbx.com', // Facebook
      'graph.facebook.com'            // Facebook
    ],
  },
  experimental: {
    forceSwcTransforms: true,
    esmExternals: true,
  },
}

module.exports = nextConfig 