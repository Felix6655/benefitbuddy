import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for BenefitBuddy - Learn how we handle your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F1E9]">
      <header className="bg-white shadow-sm border-b border-[#E8DDCF]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D08C60] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#3D3530]">BenefitBuddy</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-[#6B625A] hover:text-[#3D3530]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-[#3D3530]">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#3D3530]">Information We Collect</h2>
            <p className="text-muted senior-text">
              BenefitBuddy collects minimal information to help you find benefits you may qualify for. 
              This includes optional contact information (name, email, phone) and required screening 
              information (age range, ZIP code, household size, income range, and situation details).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#3D3530]">How We Use Your Information</h2>
            <p className="text-muted senior-text">
              Your information is used solely to:
            </p>
            <ul className="list-disc list-inside text-muted senior-text mt-2 space-y-2">
              <li>Match you with government assistance programs you may be eligible for</li>
              <li>Display your personalized results</li>
              <li>Improve our screening questions and matching accuracy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#3D3530]">Information Sharing</h2>
            <p className="text-muted senior-text">
              We do not sell, trade, or share your personal information with third parties 
              for marketing purposes. We may share anonymized, aggregated data for research 
              or to improve public benefit programs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#3D3530]">Data Security</h2>
            <p className="text-muted senior-text">
              We implement reasonable security measures to protect your information. 
              However, no internet transmission is completely secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#3D3530]">Your Rights</h2>
            <p className="text-muted senior-text">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted senior-text mt-2 space-y-2">
              <li>Access the information we have about you</li>
              <li>Request deletion of your information</li>
              <li>Opt out of any future communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#3D3530]">Cookies</h2>
            <p className="text-muted senior-text">
              We use minimal cookies necessary for the site to function. We do not use 
              tracking cookies for advertising purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#3D3530]">Contact Us</h2>
            <p className="text-muted senior-text">
              If you have questions about this privacy policy or want to exercise your 
              data rights, please contact us through the website.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-[#FFF8F0] border-t border-[#E8DDCF] py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} BenefitBuddy. For informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
