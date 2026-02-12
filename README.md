# BenefitBuddy

A free, senior-friendly web application that helps users discover government assistance programs they may be eligible for.

## Features

- **Accessible Design**: Large fonts, high contrast mode, text-to-speech, touch-friendly buttons
- **Multi-Step Wizard**: Easy intake form that collects minimal required information
- **Smart Matching**: Rules-based matching to 10+ federal assistance programs
- **Results Page**: Printable results with next steps and official links
- **Admin Panel**: View, search, and export submissions (protected by admin key)
- **n8n Integration**: Optional webhook forwarding for automation
- **Full SEO**: Sitemap, robots.txt, Open Graph, JSON-LD structured data

## Programs Matched

- SNAP (Food Assistance)
- Medicaid
- Medicare Savings Programs
- CHIP (Children's Health Insurance)
- WIC (Women, Infants, Children)
- LIHEAP (Energy Assistance)
- Housing Assistance
- Unemployment Insurance
- VA Benefits
- SSI (Supplemental Security Income)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB (default) with optional Postgres/Prisma support
- **Validation**: Zod
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=benefitbuddy
   ADMIN_KEY=your-secure-admin-key
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   # Optional: N8N_WEBHOOK_URL=https://your-n8n.com/webhook/xxx
   ```

5. Run development server:
   ```bash
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGO_URL` - MongoDB connection string (Atlas recommended)
   - `DB_NAME` - Database name
   - `ADMIN_KEY` - Strong admin key for /admin access
   - `NEXT_PUBLIC_SITE_URL` - Your production URL
   - `N8N_WEBHOOK_URL` - (Optional) n8n webhook URL

## Usage

### User Flow

1. User visits homepage
2. Clicks "Start Now"
3. Completes 5-step wizard
4. Views matched programs with next steps
5. Can print or save results

### Admin Access

1. Visit `/admin`
2. Enter admin key (from ADMIN_KEY env var)
3. View/search/export submissions
4. Update submission status
5. Delete submissions

### n8n Webhook

When `N8N_WEBHOOK_URL` is set, each new submission triggers a POST request with:

```json
{
  "source": "benefitbuddy",
  "submission": {
    "id": "uuid",
    "age_range": "65_plus",
    "zip_code": "12345",
    "matched_benefits": ["snap", "medicaid"],
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

Note: PII (name, email, phone) is NOT sent to webhook by default for privacy.

## Important Disclaimers

- BenefitBuddy is NOT affiliated with any government agency
- This is an informational tool only
- Users must verify eligibility through official channels
- Not legal, medical, or financial advice

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
