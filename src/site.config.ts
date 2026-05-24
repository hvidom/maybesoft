

export const siteConfig = {
    // Basic site info
    title: 'Maybesoft',
    author: 'hvidom',
    description: 'My project for Create a forms in astro project',
    url: 'https://maybesoft.devopsick.workers.dev/',
  
    // SEO & Metadata
    defaultLocale: 'en',
    twitter: {
      creator: undefined,
      site: undefined,
    },
    defaultOgImage: '/og-image.png',
  
    // Contact Information
    contact: {
      phone: '+353894303043',
      email: 'devopsick@pm.me',
    },
  
    // Navigation
    navigation: [
      { href: '/contact', label: 'Contact' },
    ],
  };
  
  export type SiteConfig = typeof siteConfig;