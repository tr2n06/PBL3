/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.12', '192.168.1.15', '192.168.1.30', '192.168.1.39', 'localhost', '127.0.0.1']
}

export default nextConfig
