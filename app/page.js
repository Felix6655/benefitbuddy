'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight,
  Heart,
  ShieldCheck,
  HelpCircle,
  Home,
  Phone,
  FileText,
  ChevronDown,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  ExternalLink,
} from 'lucide-react';

// Accessibility Controls Component
function AccessibilityControls() {
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Apply font size class to body
    document.body.classList.remove('font-large', 'font-extra-large');
    if (fontSize === 'large') {
      document.body.classList.add('font-large');
    } else if (fontSize === 'extra-large') {
      document.body.classList.add('font-extra-large');
    }
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast class to body
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleReadPage = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const text = document.querySelector('main')?.innerText || '';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('extra-large');
    else setFontSize('normal');
  };

  return (
    <div className="bg-blue-50 border-b border-blue-200 py-2 px-4 no-print">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-blue-800 font-medium">
          ℹ️ This is an informational tool, not a government site.
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cycleFontSize}
            className="text-xs h-8 px-3"
          >
            {fontSize === 'normal' ? <ZoomIn className="w-4 h-4 mr-1" /> : <ZoomOut className="w-4 h-4 mr-1" />}
            {fontSize === 'normal' ? 'Larger Text' : fontSize === 'large' ? 'Extra Large' : 'Normal Text'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHighContrast(!highContrast)}
            className="text-xs h-8 px-3"
          >
            {highContrast ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
            {highContrast ? 'Normal' : 'High Contrast'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleReadPage}
            className="text-xs h-8 px-3"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
            {isSpeaking ? 'Stop Reading' : 'Read Page'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="bg-white shadow-sm border-b no-print">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-900">BenefitBuddy</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/start">
            <Button size="lg" className="text-lg px-6 py-3 h-auto">
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-auto no-print">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900">About BenefitBuddy</h3>
            <p className="text-muted senior-text">
              We help you understand government benefits you may qualify for.
              Free to use, no sign-up required.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900">Official Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.benefits.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 senior-text">
                  Benefits.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="https://www.medicare.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 senior-text">
                  Medicare.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="https://www.ssa.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 senior-text">
                  SSA.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="https://www.medicaid.gov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 senior-text">
                  Medicaid.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-900">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-blue-600 hover:underline senior-text">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blue-600 hover:underline senior-text">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Important:</strong> BenefitBuddy is not affiliated with Medicare, Medicaid, Social Security Administration, 
              or any other government agency. This site provides informational guidance only and is not legal, medical, or financial advice. 
              Always verify eligibility through official government channels.
            </p>
          </div>
          <p className="text-center text-muted text-sm">
            © {new Date().getFullYear()} BenefitBuddy. For informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}

// FAQ Section
function FAQSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 text-lg font-medium text-left">
              What is BenefitBuddy?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text text-muted">
              BenefitBuddy is a free tool that helps you discover government assistance programs 
              you may be eligible for. We ask a few simple questions and show you programs like 
              SNAP, Medicaid, housing assistance, and more.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 text-lg font-medium text-left">
              Is BenefitBuddy a government website?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text text-muted">
              No. BenefitBuddy is not affiliated with any government agency. We provide 
              information and guidance to help you understand what benefits you might qualify for, 
              but you must apply through official government channels.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 text-lg font-medium text-left">
              Is my information safe?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text text-muted">
              We collect minimal information and most fields are optional. We never sell 
              or share your personal data. Your information is only used to show you 
              relevant benefit recommendations.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 text-lg font-medium text-left">
              How accurate are the results?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text text-muted">
              Our tool uses general eligibility guidelines to suggest programs you might 
              qualify for. Actual eligibility depends on many factors and must be verified 
              through the official application process. Think of our results as a starting point.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5" className="bg-white rounded-lg border">
            <AccordionTrigger className="px-6 text-lg font-medium text-left">
              Does this cost anything?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text text-muted">
              No! BenefitBuddy is completely free to use. We never ask for payment or 
              credit card information.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

// Main Landing Page Component
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AccessibilityControls />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Benefits You May Qualify For
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Answer a few simple questions and discover government programs 
              that could help you with food, healthcare, housing, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/start">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 text-xl px-8 py-6 h-auto font-bold shadow-lg w-full sm:w-auto"
                >
                  Start Now — It's Free
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-blue-200 text-lg">
              Takes about 3 minutes • No sign-up required
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900" id="how-it-works">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-2 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">1. Answer Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted senior-text">
                    Simple questions about your household, income, and situation. 
                    Most fields are optional.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">2. Get Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted senior-text">
                    We match your answers to programs you might qualify for 
                    and explain why.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">3. Take Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted senior-text">
                    Get clear instructions and links to official sites 
                    where you can apply.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Programs We Help With */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
              Programs We Can Help You Find
            </h2>
            <p className="text-center text-muted mb-12 senior-text max-w-2xl mx-auto">
              We check eligibility for major federal and state assistance programs:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🛒', name: 'SNAP / Food Stamps' },
                { icon: '🏥', name: 'Medicaid' },
                { icon: '💊', name: 'Medicare Savings' },
                { icon: '🏠', name: 'Housing Help' },
                { icon: '💡', name: 'Energy Assistance' },
                { icon: '🎖️', name: 'VA Benefits' },
                { icon: '👶', name: 'CHIP / WIC' },
                { icon: '🤝', name: 'SSI' },
              ].map((program) => (
                <div key={program.name} className="bg-white rounded-lg p-4 text-center border hover:shadow-md transition-shadow">
                  <span className="text-3xl block mb-2">{program.icon}</span>
                  <span className="font-medium text-gray-800">{program.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQSection />

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to See What You May Qualify For?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              It only takes a few minutes and could help you get assistance 
              you didn't know was available.
            </p>
            <Link href="/start">
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 text-xl px-8 py-6 h-auto font-bold shadow-lg"
              >
                Start Now
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
