import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Base URL configuration - always use NEXT_PUBLIC_SITE_URL for canonical/SEO
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BenefitBuddy - Free Medicare & Benefits Help | Find Programs You Qualify For',
    template: '%s | BenefitBuddy',
  },
  description: 'Get free help finding Medicare plans and government benefits you may qualify for. Connect with licensed Medicare advisors. Check eligibility for SNAP, Medicaid, housing assistance, and 10+ programs in minutes.',
  keywords: [
    'Medicare help',
    'Medicare advisor',
    'Medicare enrollment',
    'free Medicare consultation',
    'government benefits',
    'SNAP benefits',
    'Medicaid eligibility',
    'food stamps',
    'housing assistance',
    'senior benefits',
    'Medicare Supplement',
    'Medicare Advantage',
    'turning 65 Medicare',
    'benefits eligibility check',
  ],
  authors: [{ name: 'BenefitBuddy' }],
  creator: 'BenefitBuddy',
  publisher: 'BenefitBuddy',
  category: 'Health & Insurance',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'BenefitBuddy',
    title: 'BenefitBuddy - Free Medicare & Benefits Help',
    description: 'Get free help finding Medicare plans and government benefits. Connect with licensed advisors. No cost, no obligation.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'BenefitBuddy - Free Medicare & Benefits Help',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BenefitBuddy - Free Medicare & Benefits Help',
    description: 'Get free help finding Medicare plans and government benefits. Connect with licensed advisors.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@benefitbuddy',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'BenefitBuddy',
    'mobile-web-app-capable': 'yes',
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      'url': siteUrl,
      'name': 'BenefitBuddy',
      'description': 'Free Medicare help and government benefits eligibility tool',
      'publisher': {
        '@id': `${siteUrl}/#organization`,
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${siteUrl}/start`,
        },
        'query-input': 'required name=search_term_string',
      },
      'inLanguage': 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      'name': 'BenefitBuddy',
      'url': siteUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/og-image.png`,
        'width': 1200,
        'height': 630,
      },
      'description': 'BenefitBuddy helps people find Medicare plans and government assistance programs they may be eligible for. Free service with licensed Medicare advisors.',
      'sameAs': [],
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        'availableLanguage': ['English'],
      },
    },
    {
      '@type': 'Service',
      '@id': `${siteUrl}/#service`,
      'name': 'Free Medicare & Benefits Consultation',
      'provider': {
        '@id': `${siteUrl}/#organization`,
      },
      'description': 'Connect with licensed Medicare advisors for free. Check eligibility for Medicare, Medicaid, SNAP, and other government assistance programs.',
      'serviceType': 'Insurance Consultation',
      'areaServed': {
        '@type': 'Country',
        'name': 'United States',
      },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'description': 'Free consultation with licensed Medicare advisors',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is BenefitBuddy?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'BenefitBuddy is a free tool that helps you find government assistance programs and Medicare plans you may be eligible for. We connect you with licensed Medicare advisors at no cost.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Is BenefitBuddy a government website?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No, BenefitBuddy is not affiliated with any government agency. We provide information and connect you with licensed advisors to help you understand what benefits you may qualify for, but you must apply through official government channels.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Is my information secure?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes, we collect minimal personal information and never sell or share your data. Your information is only used to connect you with licensed Medicare advisors and show you relevant benefit recommendations.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Does this service cost anything?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No! BenefitBuddy is completely free to use. Speaking with a licensed Medicare advisor through our service is also free with no obligation.',
          },
        },
        {
          '@type': 'Question',
          'name': 'What programs can BenefitBuddy help me find?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'BenefitBuddy can help you check eligibility for Medicare, Medicaid, SNAP (food stamps), housing assistance, energy assistance (LIHEAP), VA benefits, CHIP, WIC, SSI, and Medicare Savings Programs.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}/#breadcrumb`,
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl,
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: '#F8F1E9' }}>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} style={{ backgroundColor: '#F8F1E9', color: '#2E2A26', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
