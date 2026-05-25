/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["iconsax-react", "lucide-react", "recharts"],
  },
}

export default nextConfig
