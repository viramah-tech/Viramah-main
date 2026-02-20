import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Viramah | Premium Student Living',
        short_name: 'Viramah',
        description: 'Premium student living reimagined — where comfort, community, and craft come together.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F6F4EF',
        theme_color: '#1F3A2D',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
