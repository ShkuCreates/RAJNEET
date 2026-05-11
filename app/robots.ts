import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/dashboard',
          '/onboarding',
        ],
      },
    ],
    sitemap: 'https://rajneet.co.in/sitemap.xml',
    host: 'https://rajneet.co.in',
  }
}
