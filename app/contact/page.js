'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, ArrowLeft, Mail, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, just show success message
    // In production, you would send this to an API endpoint
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E9' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#D08C60' }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#3D3530' }}>BenefitBuddy</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" style={{ color: '#6B625A' }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#3D3530' }}>Contact Us</h1>
        <p className="text-lg mb-8" style={{ color: '#6B625A' }}>
          Have questions about BenefitBuddy? We're here to help.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3D3530' }}>Send Us a Message</h2>
            
            {submitted ? (
              <div 
                className="rounded-lg p-8 text-center"
                style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9' }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#4CAF50' }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#2E7D32' }}>
                  Message Sent!
                </h3>
                <p style={{ color: '#388E3C' }}>
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="mt-4"
                  variant="outline"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" style={{ color: '#3D3530' }}>Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                    required
                    className="mt-1"
                    style={{ borderColor: '#E8DDCF' }}
                  />
                </div>

                <div>
                  <Label htmlFor="email" style={{ color: '#3D3530' }}>Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    required
                    className="mt-1"
                    style={{ borderColor: '#E8DDCF' }}
                  />
                </div>

                <div>
                  <Label htmlFor="subject" style={{ color: '#3D3530' }}>Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="How can we help?"
                    required
                    className="mt-1"
                    style={{ borderColor: '#E8DDCF' }}
                  />
                </div>

                <div>
                  <Label htmlFor="message" style={{ color: '#3D3530' }}>Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us more about your question or concern..."
                    required
                    rows={5}
                    className="mt-1"
                    style={{ borderColor: '#E8DDCF' }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-white"
                  style={{ backgroundColor: '#D08C60' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 w-5 h-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3D3530' }}>Get in Touch</h2>
            
            <div className="space-y-6">
              <div 
                className="rounded-lg p-6"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FFF8F0' }}
                  >
                    <Phone className="w-6 h-6" style={{ color: '#D08C60' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#3D3530' }}>
                      Need Medicare Help?
                    </h3>
                    <p style={{ color: '#6B625A' }}>
                      Click "Get Help Near Me" on the homepage to connect with a licensed Medicare advisor for free.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="rounded-lg p-6"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FFF8F0' }}
                  >
                    <Mail className="w-6 h-6" style={{ color: '#D08C60' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#3D3530' }}>
                      General Inquiries
                    </h3>
                    <p style={{ color: '#6B625A' }}>
                      Use the contact form for questions about BenefitBuddy, partnership opportunities, or feedback.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="rounded-lg p-6"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDCF' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FFF8F0' }}
                  >
                    <MapPin className="w-6 h-6" style={{ color: '#D08C60' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#3D3530' }}>
                      Service Area
                    </h3>
                    <p style={{ color: '#6B625A' }}>
                      BenefitBuddy serves all 50 US states. Our benefits eligibility tool and Medicare advisor network are available nationwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div 
              className="rounded-lg p-4 mt-6"
              style={{ backgroundColor: '#FEF3E2', border: '1px solid #E8DDCF' }}
            >
              <p className="text-sm" style={{ color: '#8B6914' }}>
                <strong>Important:</strong> BenefitBuddy is not affiliated with Medicare, Medicaid, 
                or any government agency. For official information, visit{' '}
                <a 
                  href="https://www.medicare.gov" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Medicare.gov
                </a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ backgroundColor: '#FFF8F0', borderTop: '1px solid #E8DDCF' }} className="py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: '#6B625A' }}>
            © {new Date().getFullYear()} BenefitBuddy. For informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
