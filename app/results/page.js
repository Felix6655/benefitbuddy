'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Heart,
  Printer,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  Info,
  Edit,
  MapPin,
  Users,
  Calendar,
  Phone,
  X,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

const STORAGE_KEY = 'benefitbuddy_quiz';

// ============================================
// PROGRAM DEFINITIONS
// ============================================
const PROGRAMS = {
  snap: {
    id: 'snap',
    name: 'SNAP (Food Assistance)',
    icon: '🛒',
    description: 'Monthly benefits to help low-income households buy groceries.',
    officialLink: 'https://www.fns.usda.gov/snap/state-directory',
  },
  medicaid: {
    id: 'medicaid',
    name: 'Medicaid',
    icon: '🏥',
    description: 'Free or low-cost health coverage for eligible low-income adults, children, and families.',
    officialLink: 'https://www.medicaid.gov/about-us/beneficiary-resources/index.html',
  },
  medicare_savings: {
    id: 'medicare_savings',
    name: 'Medicare Savings Programs',
    icon: '💊',
    description: 'Help seniors with limited income pay Medicare premiums, deductibles, and copays.',
    officialLink: 'https://www.medicare.gov/medicare-savings-programs',
  },
  housing: {
    id: 'housing',
    name: 'Housing Assistance (HUD)',
    icon: '🏠',
    description: 'Rental assistance programs including Section 8 vouchers and public housing.',
    officialLink: 'https://www.hud.gov/topics/rental_assistance',
  },
  liheap: {
    id: 'liheap',
    name: 'Energy Assistance (LIHEAP)',
    icon: '💡',
    description: 'Help low-income households pay for heating and cooling their homes.',
    officialLink: 'https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap',
  },
  va_benefits: {
    id: 'va_benefits',
    name: 'VA Benefits',
    icon: '🎖️',
    description: 'Healthcare, disability compensation, pension, and education benefits for veterans.',
    officialLink: 'https://www.va.gov/',
  },
  chip: {
    id: 'chip',
    name: 'CHIP (Children\'s Health Insurance)',
    icon: '👶',
    description: 'Low-cost health coverage for children in families who earn too much for Medicaid.',
    officialLink: 'https://www.medicaid.gov/chip/index.html',
  },
  wic: {
    id: 'wic',
    name: 'WIC (Women, Infants & Children)',
    icon: '🍼',
    description: 'Nutritious foods and nutrition education for pregnant women and young children.',
    officialLink: 'https://www.fns.usda.gov/wic',
  },
  ssi: {
    id: 'ssi',
    name: 'SSI (Supplemental Security Income)',
    icon: '🤝',
    description: 'Monthly cash payments for people with limited income who are 65+, blind, or disabled.',
    officialLink: 'https://www.ssa.gov/ssi/',
  },
};

// ============================================
// CONFIDENCE LEVELS
// ============================================
const CONFIDENCE = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// ============================================
// DATA HELPERS
// ============================================
function normalizeQuizData(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const toBool = (val) => val === true || val === 'yes' || val === 'true';
  const toNumber = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  };

  const normalizeNeeds = (needs) => {
    if (!needs || !Array.isArray(needs)) return [];
    return needs.map(n => {
      const v = String(n).toLowerCase();
      if (v.includes('food') || v === 'food_help') return 'food';
      if (v.includes('health') || v === 'healthcare') return 'healthcare';
      if (v.includes('housing') || v.includes('rent')) return 'housing';
      if (v.includes('util') || v.includes('energy') || v === 'utilities') return 'utilities';
      if (v.includes('cash') || v === 'cash_assistance') return 'cash';
      return v;
    });
  };

  const ageVal = raw.age_range || raw.ageRange || raw.age || '';
  let ageCategory = '18to64';
  if (String(ageVal).toLowerCase().includes('under')) ageCategory = 'under18';
  else if (String(ageVal).includes('65')) ageCategory = '65plus';

  return {
    zip: raw.zip_code || raw.zip || '',
    state: raw.state || '',
    householdSize: toNumber(raw.household_size || raw.householdSize) || 1,
    ageRange: ageCategory,
    incomeMode: (raw.income_type || '').toLowerCase().includes('year') ? 'yearly' : 'monthly',
    income: toNumber(raw.income_amount || raw.income),
    housing: (raw.housing_status || raw.housing || '').toLowerCase() === 'own' ? 'own' : 'rent',
    disabled: toBool(raw.has_disability || raw.disabled),
    veteran: toBool(raw.is_veteran || raw.veteran),
    needs: normalizeNeeds(raw.needs),
    hasChildren: toBool(raw.has_children || raw.pregnant_or_children),
  };
}

function getYearlyIncome(data) {
  if (data.income === null) return null;
  return data.incomeMode === 'yearly' ? data.income : data.income * 12;
}

function getLowIncomeThreshold(householdSize) {
  return 25000 + (Math.max(1, householdSize) - 1) * 9000;
}

// ============================================
// MATCHING LOGIC
// ============================================
function matchPrograms(data) {
  const likelyMatches = [];
  const alsoCheck = [];
  const added = new Set();

  const yearlyIncome = getYearlyIncome(data);
  const threshold = getLowIncomeThreshold(data.householdSize);
  const veryLowThreshold = threshold * 0.65;
  const isLowIncome = yearlyIncome !== null && yearlyIncome < threshold;
  const isVeryLowIncome = yearlyIncome !== null && yearlyIncome < veryLowThreshold;

  const addLikely = (id, reasons, confidence = CONFIDENCE.MEDIUM) => {
    if (!added.has(id)) {
      added.add(id);
      likelyMatches.push({ program: PROGRAMS[id], reasons, confidence });
    }
  };

  const addAlsoCheck = (id, reasons, confidence = CONFIDENCE.LOW) => {
    if (!added.has(id)) {
      added.add(id);
      alsoCheck.push({ program: PROGRAMS[id], reasons, confidence });
    }
  };

  // SNAP - food needs
  if (data.needs.includes('food')) {
    addLikely('snap', [
      'You indicated need for food assistance',
      isLowIncome ? 'Income within typical limits' : 'Income limits vary by state',
    ], isLowIncome ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM);
  }

  // Medicaid - healthcare + low income
  if (data.needs.includes('healthcare') && isLowIncome) {
    addLikely('medicaid', [
      'You need healthcare assistance',
      'Income appears within Medicaid limits',
    ], isVeryLowIncome ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM);
  }

  // Medicare Savings - 65+
  if (data.ageRange === '65plus') {
    addLikely('medicare_savings', [
      'You are 65 or older',
      'These programs reduce Medicare costs',
    ], isLowIncome ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM);
  }

  // Housing - housing needs + rent + low income
  if (data.needs.includes('housing')) {
    addLikely('housing', [
      'You indicated housing assistance need',
      data.housing === 'rent' ? 'You currently rent' : 'Programs may help homeowners too',
    ], (data.housing === 'rent' && isLowIncome) ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM);
  }

  // LIHEAP - utilities
  if (data.needs.includes('utilities')) {
    addLikely('liheap', [
      'You need utility bill assistance',
      'LIHEAP helps with heating/cooling costs',
    ], isLowIncome ? CONFIDENCE.HIGH : CONFIDENCE.MEDIUM);
  }

  // VA Benefits - veteran
  if (data.veteran) {
    addLikely('va_benefits', [
      'You are a veteran',
      'VA offers healthcare, disability, pension, education',
    ], CONFIDENCE.HIGH);
  }

  // CHIP - children + healthcare
  if (data.ageRange === 'under18' || data.hasChildren) {
    if (data.needs.includes('healthcare')) {
      addLikely('chip', [
        'Children in household need healthcare',
        'CHIP covers children in moderate-income families',
      ], CONFIDENCE.HIGH);
    } else {
      addAlsoCheck('chip', [
        'Children may qualify for CHIP',
        'Covers children above Medicaid limits',
      ], CONFIDENCE.MEDIUM);
    }
  }

  // WIC - children + food
  if ((data.ageRange === 'under18' || data.hasChildren) && data.needs.includes('food')) {
    addAlsoCheck('wic', [
      'Children or pregnant women may qualify',
      'Provides nutritious foods and education',
    ], CONFIDENCE.MEDIUM);
  }

  // SSI - disabled or very low income
  if (data.disabled) {
    addLikely('ssi', [
      'You have a disability',
      'SSI provides monthly cash assistance',
    ], CONFIDENCE.HIGH);
  } else if (isVeryLowIncome || data.needs.includes('cash')) {
    addAlsoCheck('ssi', [
      'You may qualify based on income',
      'SSI helps those with limited resources',
    ], CONFIDENCE.LOW);
  }

  return { likelyMatches, alsoCheck };
}

// ============================================
// UI COMPONENTS
// ============================================
function ConfidenceBadge({ confidence }) {
  const styles = {
    high: { bg: '#E8F5E9', border: '#C8E6C9', text: '#2E7D32', label: 'High Match', icon: '✓' },
    medium: { bg: '#FFF8E1', border: '#FFECB3', text: '#F57F17', label: 'Medium Match', icon: '○' },
    low: { bg: '#F3E5F5', border: '#E1BEE7', text: '#7B1FA2', label: 'Worth Checking', icon: '?' },
  };
  const s = styles[confidence] || styles.medium;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <span>{s.icon}</span>{s.label}
    </span>
  );
}

function ProgramCard({ match }) {
  const { program, reasons, confidence } = match;
  return (
    <Card className="border-2 overflow-hidden" style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}>
      <CardHeader className="pb-3" style={{ backgroundColor: '#FFF8F0', borderBottom: '1px solid #E8DDCF' }}>
        <CardTitle className="flex items-start gap-3">
          <span className="text-2xl">{program.icon}</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-bold" style={{ color: '#3D3530' }}>{program.name}</h3>
              <ConfidenceBadge confidence={confidence} />
            </div>
            <p className="text-sm" style={{ color: '#6B625A' }}>{program.description}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1 mb-2" style={{ color: '#3D3530' }}>
            <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
            Why you may qualify
          </h4>
          <ul className="space-y-1 ml-5">
            {reasons.map((r, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#6B625A' }}>
                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#D08C60' }} />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <a href={program.officialLink} target="_blank" rel="noopener noreferrer">
          <Button className="w-full h-10 text-white" style={{ backgroundColor: '#D08C60' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}>
            Learn More <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F1E9' }}>
      <Card className="max-w-md w-full border-2" style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#D08C60' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#3D3530' }}>No Quiz Answers Found</h1>
          <p className="text-lg mb-6" style={{ color: '#6B625A' }}>
            Take the quick quiz first to see which benefits you may qualify for.
          </p>
          <Link href="/start">
            <Button size="lg" className="w-full h-14 text-lg text-white" style={{ backgroundColor: '#D08C60' }}>
              Start Quiz <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// LEAD CAPTURE MODAL
// ============================================
function LeadCaptureModal({ isOpen, onClose, quizData, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    phone: '',
    zip: quizData?.zip || '',
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ first_name: '', phone: '', zip: quizData?.zip || '', consent: false });
      setResult(null);
      setErrors({});
    }
  }, [isOpen, quizData]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const validate = () => {
    const errs = {};
    if (!formData.first_name || formData.first_name.trim().length < 2) errs.first_name = 'Please enter your name';
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) errs.phone = 'Please enter a valid 10-digit phone';
    if (!formData.zip || !/^\d{5}/.test(formData.zip)) errs.zip = 'Please enter a valid ZIP code';
    if (!formData.consent) errs.consent = 'You must agree to be contacted';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          phone: formData.phone,
          zip: formData.zip,
          consent: formData.consent,
          answers: quizData,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult({ success: true, advisor: data.assigned_advisor });
        onSuccess?.(data);
      } else {
        setResult({ success: false, message: data.error || 'Something went wrong' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && !result?.success && onClose()}>
      <div className="relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <div className="p-6 pb-4" style={{ backgroundColor: '#FFF8F0', borderBottom: '1px solid #E8DDCF' }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50">
            <X className="w-5 h-5" style={{ color: '#6B625A' }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D08C60' }}>
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#3D3530' }}>Get Help Near You</h2>
              <p className="text-sm" style={{ color: '#6B625A' }}>A licensed advisor will contact you</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {result?.success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F5E9' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#4CAF50' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#3D3530' }}>You're All Set!</h3>
              <p className="text-base mb-4" style={{ color: '#6B625A' }}>
                {result.advisor ? `${result.advisor.name} has been notified and may contact you soon.` : 'An advisor has been notified and may contact you soon.'}
              </p>
              <p className="text-sm p-3 rounded-lg mb-4" style={{ backgroundColor: '#FFF8F0', color: '#8B6914' }}>
                <Phone className="w-4 h-4 inline-block mr-1" />
                <strong>Please answer unknown numbers</strong> to get help faster.
              </p>
              <Button onClick={onClose} className="h-12 px-8 text-white" style={{ backgroundColor: '#D08C60' }}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {result?.success === false && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>
                  {result.message}
                </div>
              )}

              <div>
                <Label htmlFor="first_name" className="text-base font-medium" style={{ color: '#3D3530' }}>First Name *</Label>
                <Input id="first_name" value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="John" className="mt-1 h-12 text-base"
                  style={{ borderColor: errors.first_name ? '#C62828' : '#E8DDCF' }} disabled={isSubmitting} />
                {errors.first_name && <p className="text-sm mt-1" style={{ color: '#C62828' }}>{errors.first_name}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-medium" style={{ color: '#3D3530' }}>Phone Number *</Label>
                <Input id="phone" type="tel" value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                  placeholder="(555) 123-4567" className="mt-1 h-12 text-base" maxLength={14}
                  style={{ borderColor: errors.phone ? '#C62828' : '#E8DDCF' }} disabled={isSubmitting} />
                {errors.phone && <p className="text-sm mt-1" style={{ color: '#C62828' }}>{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="zip" className="text-base font-medium" style={{ color: '#3D3530' }}>ZIP Code *</Label>
                <Input id="zip" value={formData.zip}
                  onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) }))}
                  placeholder="12345" className="mt-1 h-12 text-base" maxLength={5}
                  style={{ borderColor: errors.zip ? '#C62828' : '#E8DDCF' }} disabled={isSubmitting} />
                {errors.zip && <p className="text-sm mt-1" style={{ color: '#C62828' }}>{errors.zip}</p>}
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox id="consent" checked={formData.consent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked }))}
                  className="mt-1" style={{ borderColor: errors.consent ? '#C62828' : '#D08C60' }} disabled={isSubmitting} />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer" style={{ color: '#6B625A' }}>
                  I agree to be contacted by a licensed advisor by phone. This is a free service with no obligation.
                </Label>
              </div>
              {errors.consent && <p className="text-sm" style={{ color: '#C62828' }}>{errors.consent}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg text-white mt-4" style={{ backgroundColor: '#D08C60' }}>
                {isSubmitting ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Submitting...</> : <><Phone className="mr-2 w-5 h-5" />Get Free Help</>}
              </Button>

              <p className="text-xs text-center pt-2" style={{ color: '#6B625A' }}>
                🔒 Your information is secure and only used to connect you with an advisor.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// CTA SECTION
// ============================================
function HelpCTA({ onOpenModal }) {
  return (
    <Card className="border-2 overflow-hidden" style={{ borderColor: '#D08C60', backgroundColor: '#FFF8F0', boxShadow: '0 4px 20px rgba(208,140,96,0.15)' }}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D08C60' }}>
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-1" style={{ color: '#3D3530' }}>Need Help Understanding Your Options?</h3>
            <p className="text-base mb-3" style={{ color: '#6B625A' }}>
              Get a <strong>free callback</strong> from a licensed advisor who can explain your options and help you apply.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm" style={{ color: '#6B625A' }}>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />100% Free</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />No Obligation</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />Licensed Advisors</span>
            </div>
          </div>
          <Button onClick={onOpenModal} size="lg" className="h-14 px-8 text-lg text-white shadow-lg flex-shrink-0" style={{ backgroundColor: '#D08C60' }}>
            <Phone className="mr-2 w-5 h-5" />Get Help Near Me
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function ResultsPage() {
  const [rawData, setRawData] = useState(null);
  const [normalizedData, setNormalizedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState({ likelyMatches: [], alsoCheck: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRawData(parsed);
        const normalized = normalizeQuizData(parsed);
        if (normalized && (normalized.zip || normalized.state || normalized.needs.length > 0 || normalized.veteran || normalized.disabled)) {
          setNormalizedData(normalized);
          setMatches(matchPrograms(normalized));
        }
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrint = () => window.print();
  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/start';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E9' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#D08C60' }} />
      </div>
    );
  }

  if (!normalizedData) {
    return <EmptyState />;
  }

  const { likelyMatches, alsoCheck } = matches;
  const hasResults = likelyMatches.length > 0 || alsoCheck.length > 0;

  const ageDisplay = { under18: 'Under 18', '18to64': '18-64', '65plus': '65+' }[normalizedData.ageRange] || '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E9' }}>
      {/* Header */}
      <header className="w-full no-print" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D08C60' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#3D3530' }}>BenefitBuddy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="h-10 px-4" style={{ borderColor: '#E8DDCF', color: '#6B625A' }}>
              <Printer className="w-4 h-4 mr-2" />Print
            </Button>
            <Button variant="outline" onClick={handleRestart} className="h-10 px-4" style={{ borderColor: '#E8DDCF', color: '#6B625A' }}>
              <RefreshCw className="w-4 h-4 mr-2" />Restart
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#3D3530' }}>Your Results</h1>
          <p className="text-lg" style={{ color: '#6B625A' }}>Programs you may qualify for based on your answers.</p>
        </div>

        {/* Summary */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {normalizedData.state && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DDCF' }}>
              <MapPin className="w-4 h-4" style={{ color: '#D08C60' }} />{normalizedData.state}
            </span>
          )}
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DDCF' }}>
            <Users className="w-4 h-4" style={{ color: '#D08C60' }} />{normalizedData.householdSize} {normalizedData.householdSize === 1 ? 'person' : 'people'}
          </span>
          {ageDisplay && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DDCF' }}>
              <Calendar className="w-4 h-4" style={{ color: '#D08C60' }} />{ageDisplay}
            </span>
          )}
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg mb-6" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DDCF' }}>
          <ShieldCheck className="w-5 h-5" style={{ color: '#D08C60' }} />
          <span className="text-base font-medium" style={{ color: '#6B625A' }}>We never ask for your SSN. Your info stays private.</span>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg p-4 mb-8" style={{ backgroundColor: '#FEF3E2', border: '1px solid #E8DDCF' }}>
          <p style={{ color: '#8B6914' }}>
            <strong>⚠️ Important:</strong> These are suggestions based on general guidelines. Actual eligibility is determined by each program. Always verify with official sources.
          </p>
        </div>

        {/* CTA - Get Help */}
        <div className="mb-8 no-print">
          <HelpCTA onOpenModal={() => setIsModalOpen(true)} />
        </div>

        {!hasResults ? (
          <Card className="border-2 text-center p-8" style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}>
            <p className="text-xl mb-4" style={{ color: '#6B625A' }}>We couldn't identify specific programs to recommend.</p>
            <p className="text-base mb-6" style={{ color: '#6B625A' }}>Try updating your answers or visit Benefits.gov for a complete search.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/start">
                <Button variant="outline" size="lg" className="h-12 px-6" style={{ borderColor: '#E8DDCF', color: '#6B625A' }}>
                  <Edit className="mr-2 w-5 h-5" />Edit Answers
                </Button>
              </Link>
              <a href="https://www.benefits.gov" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-12 px-6 text-white" style={{ backgroundColor: '#D08C60' }}>
                  Search Benefits.gov <ExternalLink className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </Card>
        ) : (
          <>
            {/* Likely Matches */}
            {likelyMatches.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: '#3D3530' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: '#4CAF50' }} />
                  Likely Matches ({likelyMatches.length})
                </h2>
                <p className="text-base mb-4 ml-8" style={{ color: '#6B625A' }}>Programs you're most likely to qualify for</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {likelyMatches.map((m) => <ProgramCard key={m.program.id} match={m} />)}
                </div>
              </section>
            )}

            {/* Also Check */}
            {alsoCheck.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: '#3D3530' }}>
                  <Info className="w-6 h-6" style={{ color: '#2196F3' }} />
                  Also Check ({alsoCheck.length})
                </h2>
                <p className="text-base mb-4 ml-8" style={{ color: '#6B625A' }}>Additional programs worth exploring</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {alsoCheck.map((m) => <ProgramCard key={m.program.id} match={m} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 no-print">
          <Link href="/start">
            <Button variant="outline" size="lg" className="h-12 px-6 w-full sm:w-auto" style={{ borderColor: '#E8DDCF', color: '#6B625A' }}>
              <Edit className="mr-2 w-5 h-5" />Edit Answers
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={handlePrint} className="h-12 px-6 w-full sm:w-auto" style={{ borderColor: '#E8DDCF', color: '#6B625A' }}>
            <Printer className="mr-2 w-5 h-5" />Print Results
          </Button>
        </div>

        {/* Resources */}
        <Card className="border-2 mt-8 no-print" style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: '#3D3530' }}>📚 Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="https://www.benefits.gov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-base hover:underline" style={{ color: '#D08C60' }}>
              Benefits.gov - Search all federal benefits <ExternalLink className="w-4 h-4" />
            </a>
            <a href="https://www.findhelp.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-base hover:underline" style={{ color: '#D08C60' }}>
              FindHelp.org - Local assistance <ExternalLink className="w-4 h-4" />
            </a>
            <a href="https://www.211.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-base hover:underline" style={{ color: '#D08C60' }}>
              211.org - Call 211 for local help <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full mt-12 py-6 no-print" style={{ backgroundColor: '#FFF8F0', borderTop: '1px solid #E8DDCF' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: '#6B625A' }}>
            BenefitBuddy is not affiliated with any government agency. Visit official websites for authoritative information.
          </p>
        </div>
      </footer>

      {/* Lead Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quizData={rawData}
        onSuccess={(data) => console.log('Lead created:', data)}
      />
    </div>
  );
}
