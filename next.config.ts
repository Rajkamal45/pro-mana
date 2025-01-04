import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xcwqwflelnjrfhfolpwc.supabase.co/storage/v1/object/public/avatars/",
         pathname: '/storage/v1/object/public/avatars/**'
        
      },
    ],
  },
};

export default nextConfig;
