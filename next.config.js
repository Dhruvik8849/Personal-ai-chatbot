module.exports = {
  experimental: {
    allowedDevOrigins: ['192.168.137.1'],
  },
}


/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
  },
}

module.exports = nextConfig