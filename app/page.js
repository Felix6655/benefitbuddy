'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  FileText,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Phone,
  X,
  UserCheck,
  CheckCircle,
  Loader2,
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
    // Apply high contrast class to html element
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
    <div className="w-full" style={{ backgroundColor: '#FFF8F0', borderBottom: '1px solid #E8DDCF' }}>
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium" style={{ color: '#6B625A' }}>
          ℹ️ This is an informational tool, not a government site.
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cycleFontSize}
            className="text-xs h-8 px-3"
            style={{ borderColor: '#E8DDCF' }}
          >
            {fontSize === 'normal' ? <ZoomIn className="w-4 h-4 mr-1" /> : <ZoomOut className="w-4 h-4 mr-1" />}
            {fontSize === 'normal' ? 'Larger Text' : fontSize === 'large' ? 'Extra Large' : 'Normal Text'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHighContrast(!highContrast)}
            className="text-xs h-8 px-3"
            style={{ borderColor: '#E8DDCF' }}
          >
            {highContrast ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
            {highContrast ? 'Normal' : 'High Contrast'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleReadPage}
            className="text-xs h-8 px-3"
            style={{ borderColor: '#E8DDCF' }}
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
    <header className="w-full" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D08C60' }}>
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold" style={{ color: '#3D3530' }}>BenefitBuddy</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/start">
            <Button 
              size="lg" 
              className="text-lg px-6 py-3 h-auto text-white"
              style={{ backgroundColor: '#D08C60' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
            >
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
    <footer className="w-full mt-auto" style={{ backgroundColor: '#FFF8F0', borderTop: '1px solid #E8DDCF' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-3" style={{ color: '#3D3530' }}>About BenefitBuddy</h3>
            <p className="senior-text" style={{ color: '#6B625A' }}>
              We help you understand government benefits you may qualify for.
              Free to use, no sign-up required.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3" style={{ color: '#3D3530' }}>Official Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.benefits.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 senior-text hover:underline" style={{ color: '#D08C60' }}>
                  Benefits.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="https://www.medicare.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 senior-text hover:underline" style={{ color: '#D08C60' }}>
                  Medicare.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="https://www.ssa.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 senior-text hover:underline" style={{ color: '#D08C60' }}>
                  SSA.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
              <li>
                <a href="https://www.medicaid.gov" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 senior-text hover:underline" style={{ color: '#D08C60' }}>
                  Medicaid.gov <ExternalLink className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3" style={{ color: '#3D3530' }}>Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="senior-text hover:underline" style={{ color: '#D08C60' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="senior-text hover:underline" style={{ color: '#D08C60' }}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid #E8DDCF', paddingTop: '1.5rem' }}>
          <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#FEF3E2', border: '1px solid #E8DDCF' }}>
            <p className="text-sm" style={{ color: '#8B6914' }}>
              <strong>⚠️ Important:</strong> BenefitBuddy is not affiliated with Medicare, Medicaid, Social Security Administration, 
              or any other government agency. This site provides informational guidance only and is not legal, medical, or financial advice. 
              Always verify eligibility through official government channels.
            </p>
          </div>
          <p className="text-center text-sm" style={{ color: '#6B625A' }}>
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
    <section className="w-full py-16" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#3D3530' }}>
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}>
            <AccordionTrigger className="px-6 text-lg font-medium text-left" style={{ color: '#3D3530' }}>
              What is BenefitBuddy?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text" style={{ color: '#6B625A' }}>
              BenefitBuddy is a free tool that helps you discover government assistance programs 
              you may be eligible for. We ask a few simple questions and show you programs like 
              SNAP, Medicaid, housing assistance, and more.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}>
            <AccordionTrigger className="px-6 text-lg font-medium text-left" style={{ color: '#3D3530' }}>
              Is BenefitBuddy a government website?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text" style={{ color: '#6B625A' }}>
              No. BenefitBuddy is not affiliated with any government agency. We provide 
              information and guidance to help you understand what benefits you might qualify for, 
              but you must apply through official government channels.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3" className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}>
            <AccordionTrigger className="px-6 text-lg font-medium text-left" style={{ color: '#3D3530' }}>
              Is my information safe?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text" style={{ color: '#6B625A' }}>
              We collect minimal information and most fields are optional. We never sell 
              or share your personal data. Your information is only used to show you 
              relevant benefit recommendations.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4" className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}>
            <AccordionTrigger className="px-6 text-lg font-medium text-left" style={{ color: '#3D3530' }}>
              How accurate are the results?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text" style={{ color: '#6B625A' }}>
              Our tool uses general eligibility guidelines to suggest programs you might 
              qualify for. Actual eligibility depends on many factors and must be verified 
              through the official application process. Think of our results as a starting point.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5" className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}>
            <AccordionTrigger className="px-6 text-lg font-medium text-left" style={{ color: '#3D3530' }}>
              Does this cost anything?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 senior-text" style={{ color: '#6B625A' }}>
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F1E9' }}>
      <AccessibilityControls />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Warm Paper Gradient with proper height */}
        <section 
          className="relative w-full py-20 md:py-28"
          style={{
            minHeight: '520px',
            background: 'radial-gradient(circle at top, #FFF8F0 0%, #F8F1E9 55%, #F2E6D8 100%)'
          }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#3D3530' }}>
              Find Benefits You May Qualify For
            </h1>
            <p className="text-xl md:text-2xl mb-8" style={{ color: '#6B625A' }}>
              Answer a few simple questions and discover government programs 
              that could help you with food, healthcare, housing, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/start">
                <Button 
                  size="lg" 
                  className="text-xl px-8 py-6 h-auto font-bold shadow-lg w-full sm:w-auto text-white"
                  style={{ backgroundColor: '#D08C60' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
                >
                  Start Now — It's Free
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-lg" style={{ color: '#6B625A' }}>
              Takes about 3 minutes • No sign-up required
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-16" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#3D3530' }} id="how-it-works">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-2 hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
                <CardHeader>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFF8F0' }}>
                    <FileText className="w-8 h-8" style={{ color: '#D08C60' }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: '#3D3530' }}>1. Answer Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="senior-text" style={{ color: '#6B625A' }}>
                    Simple questions about your household, income, and situation. 
                    Most fields are optional.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
                <CardHeader>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFF8F0' }}>
                    <ShieldCheck className="w-8 h-8" style={{ color: '#D08C60' }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: '#3D3530' }}>2. Get Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="senior-text" style={{ color: '#6B625A' }}>
                    We match your answers to programs you might qualify for 
                    and explain why.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
                <CardHeader>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFF8F0' }}>
                    <HelpCircle className="w-8 h-8" style={{ color: '#D08C60' }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: '#3D3530' }}>3. Take Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="senior-text" style={{ color: '#6B625A' }}>
                    Get clear instructions and links to official sites 
                    where you can apply.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Programs We Help With */}
        <section className="w-full py-16" style={{ backgroundColor: '#FFF8F0' }}>
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#3D3530' }}>
              Programs We Can Help You Find
            </h2>
            <p className="text-center mb-12 senior-text max-w-2xl mx-auto" style={{ color: '#6B625A' }}>
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
                <div 
                  key={program.name} 
                  className="rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}
                >
                  <span className="text-3xl block mb-2">{program.icon}</span>
                  <span className="font-medium" style={{ color: '#3D3530' }}>{program.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQSection />

        {/* CTA Section */}
        <section className="w-full py-16" style={{ backgroundColor: '#D08C60' }}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to See What You May Qualify For?
            </h2>
            <p className="text-xl mb-8" style={{ color: 'rgba(255,255,255,0.9)' }}>
              It only takes a few minutes and could help you get assistance 
              you didn't know was available.
            </p>
            <Link href="/start">
              <Button 
                size="lg" 
                className="text-xl px-8 py-6 h-auto font-bold shadow-lg"
                style={{ backgroundColor: '#FFFFFF', color: '#D08C60' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFF8F0'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
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
