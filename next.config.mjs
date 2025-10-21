const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const remotePatterns = []

if (supabaseUrl) {
  try {
    const { host } = new URL(supabaseUrl)
    remotePatterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/storage/v1/object/public/**",
    })
  } catch {
    // Ignore malformed URLs so local development can proceed.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
}

export default nextConfig
