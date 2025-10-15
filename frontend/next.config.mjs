// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/xrmaaolcl/**', // Adjust the pathname to match your ImageKit setup
      },
    ],
  },
}

export default nextConfig