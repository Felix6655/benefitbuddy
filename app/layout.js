import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app'),
  title: {
    default: 'BenefitBuddy - Find Benefits You May Qualify For',
    template: '%s | BenefitBuddy',
  },
  description: 'A free, easy-to-use tool to help you find government benefits and assistance programs you may be eligible for. Get personalized recommendations for SNAP, Medicaid, housing assistance, and more.',
  keywords: ['benefits', 'government assistance', 'SNAP', 'Medicaid', 'food stamps', 'housing assistance', 'senior benefits', 'disability benefits'],
  authors: [{ name: 'BenefitBuddy' }],
  creator: 'BenefitBuddy',
  publisher: 'BenefitBuddy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app',
    siteName: 'BenefitBuddy',
    title: 'BenefitBuddy - Find Benefits You May Qualify For',
    description: 'A free, easy-to-use tool to help you find government benefits and assistance programs.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BenefitBuddy - Find Benefits You May Qualify For',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BenefitBuddy - Find Benefits You May Qualify For',
    description: 'A free, easy-to-use tool to help you find government benefits and assistance programs.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
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
    <html lang="en">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://benefitbuddy.vercel.app'} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
