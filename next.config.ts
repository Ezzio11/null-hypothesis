/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we are using output: 'export' if deploying statically (e.g., to Vercel/GitHub Pages)
  // output: 'export', 

  images: {
    remotePatterns: [
      // Existing patterns (if any) should be here.
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      // FIX: Add the Supabase hostname for dynamic image loading from storage
      {
        protocol: 'https',
        hostname: 'gefqshdrgozkxdiuligl.supabase.co',
      },
    ],
  },

  // Example for experimental features (if you use app router/server components)
  experimental: {
    // typedRoutes: true,
    // serverComponentsExternalPackages: ["@tremor/react"],
  },
};

export default nextConfig;