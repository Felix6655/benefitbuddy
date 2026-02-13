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

// ============================================
// MEDICARE LEAD CAPTURE MODAL (Homepage Version)
// ============================================

function HomepageLeadModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    zip_code: '',
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: '',
        phone: '',
        zip_code: '',
        consent: false,
      });
      setSubmitResult(null);
      setErrors({});
    }
  }, [isOpen]);

  // Format phone number as user types
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name || formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Please enter your full name';
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.zip_code || !/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid ZIP code';
    }
    if (!formData.consent) {
      newErrors.consent = 'You must agree to be contacted';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          phone: formData.phone,
          zip_code: formData.zip_code,
          consent: formData.consent,
          source: 'homepage_cta',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitResult({ success: true, message: result.message });
      } else {
        setSubmitResult({ 
          success: false, 
          message: result.error || 'Something went wrong. Please try again.' 
        });
        if (result.details) {
          const fieldErrors = {};
          result.details.forEach(d => {
            fieldErrors[d.field] = d.message;
          });
          setErrors(fieldErrors);
        }
      }
    } catch (error) {
      setSubmitResult({ 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Header */}
        <div 
          className="p-6 pb-4"
          style={{ backgroundColor: '#FFF8F0', borderBottom: '1px solid #E8DDCF' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: '#6B625A' }} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#D08C60' }}
            >
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#3D3530' }}>
                Get Free Medicare Help
              </h2>
              <p className="text-sm" style={{ color: '#6B625A' }}>
                A licensed advisor will call you
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitResult?.success ? (
            // Success state - Updated message
            <div className="text-center py-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#E8F5E9' }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: '#4CAF50' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#3D3530' }}>
                Thank You!
              </h3>
              <p className="text-base mb-3" style={{ color: '#6B625A' }}>
                A licensed Medicare advisor may call you in the next <strong>5–15 minutes</strong>.
              </p>
              <p className="text-base mb-6 p-3 rounded-lg" style={{ backgroundColor: '#FFF8F0', color: '#8B6914' }}>
                <Phone className="w-4 h-4 inline-block mr-1" />
                <strong>Please answer unknown numbers</strong> to get help faster.
              </p>
              <Button
                onClick={onClose}
                className="h-12 px-8 text-white"
                style={{ backgroundColor: '#D08C60' }}
              >
                Close
              </Button>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitResult?.success === false && (
                <div 
                  className="p-3 rounded-lg text-sm"
                  style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}
                >
                  {submitResult.message}
                </div>
              )}

              <div>
                <Label 
                  htmlFor="full_name" 
                  className="text-base font-medium"
                  style={{ color: '#3D3530' }}
                >
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Smith"
                  className="mt-1 h-12 text-base"
                  style={{ borderColor: errors.full_name ? '#C62828' : '#E8DDCF' }}
                  disabled={isSubmitting}
                />
                {errors.full_name && (
                  <p className="text-sm mt-1" style={{ color: '#C62828' }}>{errors.full_name}</p>
                )}
              </div>

              <div>
                <Label 
                  htmlFor="phone" 
                  className="text-base font-medium"
                  style={{ color: '#3D3530' }}
                >
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="mt-1 h-12 text-base"
                  style={{ borderColor: errors.phone ? '#C62828' : '#E8DDCF' }}
                  disabled={isSubmitting}
                  maxLength={14}
                />
                {errors.phone && (
                  <p className="text-sm mt-1" style={{ color: '#C62828' }}>{errors.phone}</p>
                )}
              </div>

              <div>
                <Label 
                  htmlFor="zip_code" 
                  className="text-base font-medium"
                  style={{ color: '#3D3530' }}
                >
                  ZIP Code *
                </Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value.replace(/[^\d-]/g, '').slice(0, 10) }))}
                  placeholder="12345"
                  className="mt-1 h-12 text-base"
                  style={{ borderColor: errors.zip_code ? '#C62828' : '#E8DDCF' }}
                  disabled={isSubmitting}
                  maxLength={10}
                />
                {errors.zip_code && (
                  <p className="text-sm mt-1" style={{ color: '#C62828' }}>{errors.zip_code}</p>
                )}
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked }))}
                  className="mt-1"
                  style={{ borderColor: errors.consent ? '#C62828' : '#D08C60' }}
                  disabled={isSubmitting}
                />
                <Label 
                  htmlFor="consent" 
                  className="text-sm leading-relaxed cursor-pointer"
                  style={{ color: '#6B625A' }}
                >
                  I agree to be contacted by a licensed Medicare advisor by phone. 
                  I understand this is a free service with no obligation.
                </Label>
              </div>
              {errors.consent && (
                <p className="text-sm" style={{ color: '#C62828' }}>{errors.consent}</p>
              )}

              {/* Honeypot field - hidden from users */}
              <input
                type="text"
                name="website"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg text-white mt-4"
                style={{ backgroundColor: '#D08C60' }}
                onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#B76E45')}
                onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#D08C60')}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 w-5 h-5" />
                    Request Free Callback
                  </>
                )}
              </Button>

              <p className="text-xs text-center pt-2" style={{ color: '#6B625A' }}>
                🔒 Your information is secure and will only be used to connect you with a licensed advisor.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

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

        {/* Medicare Help CTA Section */}
        <section 
          className="w-full py-12"
          style={{ 
            backgroundColor: '#FFF8F0',
            borderTop: '2px solid #D08C60',
            borderBottom: '2px solid #D08C60'
          }}
        >
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#D08C60' }}
                >
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#3D3530' }}>
                    Need Medicare Help?
                  </h2>
                  <p className="text-lg" style={{ color: '#6B625A' }}>
                    Talk to a Licensed Advisor for Free
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => setIsLeadModalOpen(true)}
                className="text-lg px-8 py-5 h-auto font-bold shadow-lg text-white"
                style={{ backgroundColor: '#D08C60' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
              >
                <Phone className="mr-2 w-5 h-5" />
                Get Help Near Me
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-base" style={{ color: '#6B625A' }}>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#4CAF50' }} />
                100% Free
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#4CAF50' }} />
                No Obligation
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" style={{ color: '#4CAF50' }} />
                Licensed Advisors
              </span>
            </div>
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
