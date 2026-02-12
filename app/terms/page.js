import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for BenefitBuddy - Understand our terms and conditions.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">BenefitBuddy</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              <strong>⚠️ Important Disclaimer:</strong> BenefitBuddy is NOT affiliated with Medicare, 
              Medicaid, Social Security Administration, or any other government agency. This is an 
              informational tool only and does not constitute legal, medical, or financial advice.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Acceptance of Terms</h2>
            <p className="text-muted senior-text">
              By accessing or using BenefitBuddy, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Description of Service</h2>
            <p className="text-muted senior-text">
              BenefitBuddy is a free informational tool that helps users identify government 
              assistance programs they may be eligible for. We provide general guidance and 
              links to official resources, but we do not determine actual eligibility or 
              process applications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">No Government Affiliation</h2>
            <p className="text-muted senior-text">
              BenefitBuddy is an independent service and is not affiliated with, endorsed by, 
              or connected to any federal, state, or local government agency. All benefit 
              eligibility must be verified directly with the appropriate government agencies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Accuracy of Information</h2>
            <p className="text-muted senior-text">
              While we strive to provide accurate and up-to-date information, benefit 
              programs change frequently. The information provided is for general guidance 
              only and may not reflect the most current eligibility requirements or program 
              details. Always verify information with official government sources.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Limitation of Liability</h2>
            <p className="text-muted senior-text">
              BenefitBuddy and its operators are not liable for any damages arising from 
              your use of this service, including but not limited to missed benefits, 
              incorrect eligibility assessments, or reliance on information provided. 
              Use this service at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">User Responsibilities</h2>
            <p className="text-muted senior-text">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-muted senior-text mt-2 space-y-2">
              <li>Provide accurate information when using the screening tool</li>
              <li>Verify eligibility with official government agencies</li>
              <li>Not use the service for any unlawful purpose</li>
              <li>Not attempt to access administrative functions without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Changes to Terms</h2>
            <p className="text-muted senior-text">
              We reserve the right to modify these terms at any time. Continued use of 
              BenefitBuddy after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact</h2>
            <p className="text-muted senior-text">
              For questions about these terms, please contact us through the website.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-gray-100 border-t py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} BenefitBuddy. For informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
