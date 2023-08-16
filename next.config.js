/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: ''
      },
    ],
  },
  swcMinify: false
}

module.exports = nextConfig
