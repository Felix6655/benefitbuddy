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

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app'}/#website`,
      'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app',
      'name': 'BenefitBuddy',
      'description': 'Find government benefits you may qualify for',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app'}/start`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app'}/#organization`,
      'name': 'BenefitBuddy',
      'url': process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app',
      'description': 'A free tool to help people find government assistance programs they may be eligible for.',
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is BenefitBuddy?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'BenefitBuddy is a free tool that helps you find government assistance programs you may be eligible for, including SNAP, Medicaid, housing assistance, and more.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Is BenefitBuddy a government website?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No, BenefitBuddy is not affiliated with any government agency. We provide information and guidance to help you understand what benefits you may qualify for, but you must apply through official government channels.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Is my information secure?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'We collect minimal personal information and never share or sell your data. Most fields are optional, and we only use your information to show you relevant benefit recommendations.',
          },
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
