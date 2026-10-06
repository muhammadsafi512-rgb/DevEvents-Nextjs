import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    typescript:{
        ignoreBuildErrors: true,
    },
    cacheComponents: true,

    images: {
        remotePatterns:[
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            }
        ]
    },
};

export default nextConfig;
