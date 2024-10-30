/** @type {import('next').NextConfig} */

const nextConfig = {
    eslint: {
        // Warning: this allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    // API route rewrites untuk proxy ke backend
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 
                process.env.NODE_ENV === 'development'
                    ? 'http://localhost:8000/api/:path*'
                    : process.env.NEXT_PUBLIC_API_URL + '/api/:path*',
            },
        ]
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'example.com',
                port: '',
                pathname: '/public/uploads/image/**',
            },
            {
                protocol: 'https',
                hostname: 'dummyimage.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placekitten.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.railway.app',
                port: '',
                pathname: '/**',
            }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    reactStrictMode: true,

    output: 'standalone',

    swcMinify: true,

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ]
            }
        ]
    },

    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            Object.assign(config.resolve.alias, {
                react: 'preact/compat',
                'react-dom/test-utils': 'preact/test-utils',
                'react-dom': 'preact/compat'
            });
        }

        return config;
    },
};

export default nextConfig;