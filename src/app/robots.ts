import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/student/', '/user-onboarding/'],
        },
        sitemap: 'https://viramah.com/sitemap.xml',
    }
}
