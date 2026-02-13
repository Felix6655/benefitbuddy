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
} from 'lucide-react';
import { getSnapStateApplyUrl, getMedicaidHelpUrl, OFFICIAL_PROGRAM_URLS, getStateNameFromAbbr } from '@/lib/stateLinks';

const STORAGE_KEY = 'benefitbuddy_quiz';

// ============================================
// PROGRAM DEFINITIONS
// ============================================
const PROGRAMS = {
  snap: {
    id: 'snap',
    name: 'SNAP (Food Assistance)',
    icon: '🛒',
    description: 'The Supplemental Nutrition Assistance Program provides monthly benefits to help low-income households buy groceries.',
    officialLink: 'https://www.fns.usda.gov/snap/state-directory',
  },
  medicaid: {
    id: 'medicaid',
    name: 'Medicaid',
    icon: '🏥',
    description: 'Medicaid offers free or low-cost health coverage for eligible low-income adults, children, and families.',
    officialLink: 'https://www.medicaid.gov/about-us/beneficiary-resources/index.html',
  },
  medicare_savings: {
    id: 'medicare_savings',
    name: 'Medicare Savings Programs',
    icon: '💊',
    description: 'These programs help seniors with limited income pay Medicare premiums, deductibles, and copays.',
    officialLink: 'https://www.medicare.gov/medicare-savings-programs',
  },
  housing: {
    id: 'housing',
    name: 'Housing Assistance (HUD)',
    icon: '🏠',
    description: 'HUD offers rental assistance programs including Section 8 vouchers and public housing options.',
    officialLink: 'https://www.hud.gov/topics/rental_assistance',
  },
  liheap: {
    id: 'liheap',
    name: 'Energy Assistance (LIHEAP)',
    icon: '💡',
    description: 'LIHEAP helps low-income households pay for heating and cooling their homes.',
    officialLink: 'https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap',
  },
  va_benefits: {
    id: 'va_benefits',
    name: 'VA Benefits',
    icon: '🎖️',
    description: 'Veterans may qualify for healthcare, disability compensation, pension, education benefits, and more.',
    officialLink: 'https://www.va.gov/',
  },
  chip: {
    id: 'chip',
    name: 'CHIP (Children\'s Health Insurance)',
    icon: '👶',
    description: 'CHIP provides low-cost health coverage for children in families who earn too much for Medicaid but cannot afford private insurance.',
    officialLink: 'https://www.medicaid.gov/about-us/beneficiary-resources/index.html',
  },
  ssi: {
    id: 'ssi',
    name: 'SSI (Supplemental Security Income)',
    icon: '🤝',
    description: 'SSI provides monthly cash payments to people with limited income and resources who are 65+, blind, or disabled.',
    officialLink: 'https://www.ssa.gov/ssi/',
  },
  wic: {
    id: 'wic',
    name: 'WIC (Women, Infants & Children)',
    icon: '🍼',
    description: 'WIC provides nutritious foods, nutrition education, breastfeeding support, and health referrals for pregnant women and young children.',
    officialLink: 'https://www.fns.usda.gov/wic',
  },
};

// ============================================
// DATA NORMALIZATION HELPERS
// ============================================

/**
 * Normalize the quiz data to handle variations in field names and values
 */
function normalizeQuizData(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // Helper to check if value indicates "under 18"
  const isUnder18 = (val) => {
    if (!val) return false;
    const v = String(val).toLowerCase().replace(/[^a-z0-9]/g, '');
    // Match: under_18, under18, under 18
    return v.includes('under');
  };

  // Helper to check if value indicates "65+"
  const is65Plus = (val) => {
    if (!val) return false;
    const v = String(val).toLowerCase();
    // Match: 65_plus, 65plus, 65+, 65 or older
    return v.includes('65') || v.includes('senior');
  };

  // Helper to parse boolean-like values
  const toBool = (val) => {
    if (val === true || val === 'yes' || val === 'true' || val === '1') return true;
    return false;
  };

  // Helper to parse number
  const toNumber = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  };

  // Helper to normalize needs array - map quiz need IDs to matching logic keys
  const normalizeNeeds = (needs) => {
    if (!needs) return [];
    if (!Array.isArray(needs)) return [];
    return needs.map(n => {
      const v = String(n).toLowerCase();
      // Map quiz values to matching logic values
      if (v.includes('food') || v === 'food_help') return 'food';
      if (v.includes('health') || v.includes('medical') || v === 'healthcare') return 'healthcare';
      if (v.includes('housing') || v.includes('rent')) return 'housing';
      if (v.includes('util') || v.includes('energy') || v.includes('electric') || v === 'utilities') return 'utilities';
      if (v.includes('cash') || v.includes('money') || v === 'cash_assistance') return 'cash';
      return v;
    });
  };

  // Normalize age range - quiz uses: under_18, 18_64, 65_plus
  let ageCategory = '18to64'; // default
  const ageVal = raw.age_range || raw.ageRange || raw.age || '';
  if (isUnder18(ageVal)) {
    ageCategory = 'under18';
  } else if (is65Plus(ageVal)) {
    ageCategory = '65plus';
  }

  // Normalize income mode
  let incomeMode = 'monthly';
  const modeVal = raw.income_type || raw.incomeMode || raw.incomeType || '';
  if (String(modeVal).toLowerCase().includes('year')) {
    incomeMode = 'yearly';
  }

  return {
    zip: raw.zip_code || raw.zip || raw.zipCode || '',
    state: raw.state || '',
    householdSize: toNumber(raw.household_size || raw.householdSize) || 1,
    ageRange: ageCategory,
    incomeMode: incomeMode,
    income: toNumber(raw.income_amount || raw.income || raw.incomeAmount),
    housing: (raw.housing_status || raw.housing || '').toLowerCase() === 'own' ? 'own' : 'rent',
    disabled: toBool(raw.has_disability || raw.disabled || raw.disability),
    veteran: toBool(raw.is_veteran || raw.veteran),
    needs: normalizeNeeds(raw.needs),
  };
}

/**
 * Calculate yearly income from normalized data
 */
function getYearlyIncome(data) {
  if (data.income === null) return null;
  return data.incomeMode === 'yearly' ? data.income : data.income * 12;
}

/**
 * Calculate low-income threshold based on household size
 */
function getLowIncomeThreshold(householdSize) {
  return 25000 + (Math.max(1, householdSize) - 1) * 9000;
}

// ============================================
// MATCHING LOGIC
// ============================================

function matchPrograms(data) {
  const likelyMatches = [];
  const alsoCheck = [];
  const addedToLikely = new Set();
  const addedToAlsoCheck = new Set();

  const yearlyIncome = getYearlyIncome(data);
  const threshold = getLowIncomeThreshold(data.householdSize);
  const veryLowThreshold = threshold * 0.65;
  const isLowIncome = yearlyIncome !== null && yearlyIncome < threshold;
  const isVeryLowIncome = yearlyIncome !== null && yearlyIncome < veryLowThreshold;

  // Helper to add to likely
  const addLikely = (programId, reasons, requirements) => {
    if (!addedToLikely.has(programId)) {
      addedToLikely.add(programId);
      likelyMatches.push({
        program: PROGRAMS[programId],
        reasons,
        requirements,
      });
    }
  };

  // Helper to add to also check
  const addAlsoCheck = (programId, reasons, requirements) => {
    if (!addedToLikely.has(programId) && !addedToAlsoCheck.has(programId)) {
      addedToAlsoCheck.add(programId);
      alsoCheck.push({
        program: PROGRAMS[programId],
        reasons,
        requirements,
      });
    }
  };

  // Standard requirements
  const baseRequirements = [
    'Photo ID (driver\'s license, state ID, or passport)',
    'Proof of address (utility bill, lease, or mail)',
  ];
  const incomeRequirements = [
    ...baseRequirements,
    'Proof of income (pay stubs, tax return, or benefit letters)',
    'Additional documents may be requested depending on program',
  ];

  // ===== LIKELY MATCHES =====

  // SNAP - if needs includes food
  if (data.needs.includes('food')) {
    addLikely('snap', [
      'You indicated you need help with food',
      isLowIncome ? 'Your income falls within typical eligibility limits' : 'Income limits vary by state and household size',
      `Your household size (${data.householdSize}) is factored into eligibility`,
    ], incomeRequirements);
  }

  // Medicaid - if needs healthcare AND low income
  if (data.needs.includes('healthcare') && yearlyIncome !== null && isLowIncome) {
    addLikely('medicaid', [
      'You indicated you need help with healthcare',
      'Your income appears to fall within Medicaid eligibility limits',
      data.state ? `${data.state} has its own Medicaid program` : 'Each state has different Medicaid rules',
    ], [
      ...baseRequirements,
      'Proof of income',
      'Proof of citizenship or immigration status',
      'Additional documents may be requested depending on program',
    ]);
  }

  // Medicare Savings - if 65+
  if (data.ageRange === '65plus') {
    addLikely('medicare_savings', [
      'You are 65 years or older',
      'These programs help reduce Medicare costs',
      isLowIncome ? 'Your income may qualify you for assistance' : 'Income limits vary by program type',
    ], [
      'Medicare card or Medicare number',
      ...baseRequirements,
      'Proof of income and assets',
      'Additional documents may be requested depending on program',
    ]);
  }

  // Housing - if needs housing
  if (data.needs.includes('housing')) {
    addLikely('housing', [
      'You indicated you need help with housing',
      data.housing === 'rent' ? 'You currently rent your home' : 'Various housing programs may assist homeowners too',
      'Availability and wait times vary by location',
    ], [
      ...baseRequirements,
      'Proof of income for all household members',
      'Rental history or landlord references',
      'Additional documents may be requested depending on program',
    ]);
  }

  // LIHEAP - if needs utilities
  if (data.needs.includes('utilities')) {
    addLikely('liheap', [
      'You indicated you need help with utilities',
      isLowIncome ? 'Your income appears within LIHEAP limits' : 'Income limits vary by state',
      'LIHEAP helps with heating and cooling costs',
    ], [
      'Recent utility bill showing account number',
      ...baseRequirements,
      'Proof of income',
      'Additional documents may be requested depending on program',
    ]);
  }

  // VA Benefits - if veteran
  if (data.veteran) {
    addLikely('va_benefits', [
      'You indicated you are a veteran',
      'VA benefits include healthcare, disability, pension, and education',
      'Eligibility depends on service history and discharge status',
    ], [
      'DD-214 or military separation documents',
      ...baseRequirements,
      'Medical records (for disability claims)',
      'Additional documents may be requested depending on program',
    ]);
  }

  // CHIP - if under 18 AND needs healthcare (goes to LIKELY)
  if (data.ageRange === 'under18' && data.needs.includes('healthcare')) {
    addLikely('chip', [
      'You are under 18 years old',
      'You indicated you need help with healthcare',
      'CHIP covers children in families who earn too much for Medicaid',
    ], [
      'Child\'s birth certificate or proof of age',
      'Proof of family income',
      ...baseRequirements,
      'Additional documents may be requested depending on program',
    ]);
  }

  // ===== ALSO CHECK =====

  // CHIP - if under 18 (if not already in likely)
  if (data.ageRange === 'under18') {
    addAlsoCheck('chip', [
      'You are under 18 years old',
      'CHIP may provide additional coverage options',
      'Eligibility varies by state and family income',
    ], [
      'Child\'s birth certificate',
      'Proof of family income',
      'Additional documents may be requested depending on program',
    ]);
  }

  // WIC - if needs food AND under 18
  if (data.needs.includes('food') && data.ageRange === 'under18') {
    addAlsoCheck('wic', [
      'You are under 18 and need food assistance',
      'WIC serves pregnant women, new mothers, and children under 5',
      'Provides nutritious foods and nutrition education',
    ], [
      'Proof of identity for participant',
      'Proof of residency',
      'Proof of income',
      'Immunization records (for children)',
      'Additional documents may be requested depending on program',
    ]);
  }

  // SSI - if disabled OR very low income
  if (data.disabled || isVeryLowIncome) {
    const reasons = [];
    if (data.disabled) reasons.push('You indicated you have a disability');
    if (isVeryLowIncome) reasons.push('Your income is very limited');
    if (data.ageRange === '65plus') reasons.push('You are 65 or older');
    reasons.push('SSI provides monthly cash assistance');

    if (data.disabled) {
      addLikely('ssi', reasons, [
        'Medical records documenting disability',
        'Proof of limited income and resources',
        ...baseRequirements,
        'Additional documents may be requested depending on program',
      ]);
    } else {
      addAlsoCheck('ssi', reasons, [
        'Proof of limited income and resources',
        ...baseRequirements,
        'Additional documents may be requested depending on program',
      ]);
    }
  }

  // SSI - if needs cash (add to also check if not already)
  if (data.needs.includes('cash')) {
    addAlsoCheck('ssi', [
      'You indicated you need cash assistance',
      'SSI may be available for those with limited income',
      'Your state may have additional cash assistance programs',
    ], [
      'Proof of limited income and resources',
      ...baseRequirements,
      'Additional documents may be requested depending on program',
    ]);
  }

  return { likelyMatches, alsoCheck };
}

// ============================================
// UI COMPONENTS
// ============================================

function TrustBadge() {
  return (
    <div 
      className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg"
      style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DDCF' }}
    >
      <ShieldCheck className="w-5 h-5 flex-shrink-0" style={{ color: '#D08C60' }} />
      <span className="text-base font-medium" style={{ color: '#6B625A' }}>
        No login required. We never ask for SSN.
      </span>
    </div>
  );
}

function ProgramCard({ match, userState }) {
  const { program, reasons, requirements } = match;
  
  // Get the appropriate apply URL based on program and user's state
  const getApplyUrl = () => {
    switch (program.id) {
      case 'snap':
        // SNAP has verified state-specific URLs via USDA/FNS
        return getSnapStateApplyUrl(userState);
      case 'medicaid':
      case 'chip':
        // Medicaid/CHIP uses the official help page
        return OFFICIAL_PROGRAM_URLS.medicaid;
      case 'medicare_savings':
        return OFFICIAL_PROGRAM_URLS.medicare_savings;
      case 'housing':
        return OFFICIAL_PROGRAM_URLS.housing;
      case 'liheap':
        return OFFICIAL_PROGRAM_URLS.liheap;
      case 'va_benefits':
        return OFFICIAL_PROGRAM_URLS.va_benefits;
      case 'ssi':
        return OFFICIAL_PROGRAM_URLS.ssi;
      case 'wic':
        return OFFICIAL_PROGRAM_URLS.wic;
      default:
        return program.officialLink;
    }
  };

  const applyUrl = getApplyUrl();
  const isSnapWithState = program.id === 'snap' && userState;
  const stateName = userState ? getStateNameFromAbbr(userState) : null;
  
  return (
    <Card 
      className="border-2 overflow-hidden transition-shadow hover:shadow-lg"
      style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}
    >
      <CardHeader 
        className="pb-3"
        style={{ backgroundColor: '#FFF8F0', borderBottom: '1px solid #E8DDCF' }}
      >
        <CardTitle className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0">{program.icon}</span>
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#3D3530' }}>
              {program.name}
            </h3>
            <p className="text-base font-normal mt-1" style={{ color: '#6B625A' }}>
              {program.description}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {/* Why you might qualify */}
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#3D3530' }}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#4CAF50' }} />
            Why you might qualify
          </h4>
          <ul className="space-y-2 ml-7">
            {reasons.map((reason, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 text-base"
                style={{ color: '#6B625A' }}
              >
                <span 
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: '#D08C60' }} 
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What you may need */}
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#3D3530' }}>
            <Info className="w-5 h-5 flex-shrink-0" style={{ color: '#2196F3' }} />
            What you may need to apply
          </h4>
          <ul className="space-y-2 ml-7">
            {requirements.map((req, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 text-base"
                style={{ color: '#6B625A' }}
              >
                <span 
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: '#E8DDCF' }} 
                />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Apply button */}
        <div className="pt-2">
          <a 
            href={applyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <Button 
              className="w-full h-12 text-lg text-white"
              style={{ backgroundColor: '#D08C60' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
            >
              Apply / Learn More
              <ExternalLink className="ml-2 w-5 h-5" />
            </Button>
          </a>
          {/* State-specific link notice for SNAP */}
          {isSnapWithState && (
            <p className="text-sm text-center mt-2" style={{ color: '#6B625A' }}>
              <MapPin className="w-3.5 h-3.5 inline-block mr-1" style={{ color: '#D08C60' }} />
              This link takes you to {stateName || 'your state'}'s official SNAP contact and application info.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F1E9' }}>
      <Card 
        className="max-w-md w-full border-2"
        style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}
      >
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#D08C60' }} />
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#3D3530' }}>
            No Quiz Answers Found
          </h1>
          <p className="text-lg mb-6" style={{ color: '#6B625A' }}>
            Please take the 3-minute quiz first to see which benefits you may qualify for.
          </p>
          <Link href="/start">
            <Button 
              size="lg"
              className="w-full h-14 text-lg text-white"
              style={{ backgroundColor: '#D08C60' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
            >
              Go to Quiz
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryBadge({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
      style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DDCF' }}
    >
      <Icon className="w-4 h-4" style={{ color: '#D08C60' }} />
      <span style={{ color: '#6B625A' }}>{label}:</span>
      <span className="font-medium" style={{ color: '#3D3530' }}>{value}</span>
    </div>
  );
}

// ============================================
// MEDICARE LEAD CAPTURE MODAL
// ============================================

function LeadCaptureModal({ isOpen, onClose, userState, userZip, matchedPrograms }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    zip_code: userZip || '',
    turning_65_soon: null,
    has_medicare_now: null,
    wants_call_today: null,
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
        zip_code: userZip || '',
        turning_65_soon: null,
        has_medicare_now: null,
        wants_call_today: null,
        consent: false,
      });
      setSubmitResult(null);
      setErrors({});
    }
  }, [isOpen, userZip]);

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
          state: userState,
          matched_programs: matchedPrograms,
          source: 'medicare_cta',
          page_url: typeof window !== 'undefined' ? window.location.href : null,
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

// ============================================
// MEDICARE CTA SECTION
// ============================================

function MedicareCTA({ onOpenModal, userState }) {
  const stateName = userState ? getStateNameFromAbbr(userState) : null;
  
  return (
    <Card 
      className="border-2 overflow-hidden no-print"
      style={{ 
        borderColor: '#D08C60', 
        backgroundColor: '#FFF8F0',
        boxShadow: '0 4px 20px rgba(208, 140, 96, 0.15)'
      }}
    >
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#D08C60' }}
          >
            <UserCheck className="w-10 h-10 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#3D3530' }}>
              Need Help Understanding Medicare?
            </h3>
            <p className="text-lg mb-4" style={{ color: '#6B625A' }}>
              Get a <strong>free callback</strong> from a licensed Medicare advisor 
              {stateName ? ` in ${stateName}` : ''} who can explain your options and help you enroll.
            </p>
            <ul className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-base mb-4" style={{ color: '#6B625A' }}>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
                100% Free
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
                No Obligation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
                Licensed Advisors
              </li>
            </ul>
          </div>
          
          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={onOpenModal}
              size="lg"
              className="h-14 px-8 text-lg text-white shadow-lg"
              style={{ backgroundColor: '#D08C60' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
            >
              <Phone className="mr-2 w-5 h-5" />
              Get Help Near Me
            </Button>
          </div>
        </div>
        
        {/* Trust indicators */}
        <div 
          className="mt-6 pt-4 flex flex-wrap justify-center gap-4 text-sm"
          style={{ borderTop: '1px solid #E8DDCF', color: '#6B625A' }}
        >
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" style={{ color: '#D08C60' }} />
            We never share your info
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" style={{ color: '#D08C60' }} />
            Callback within 1 business day
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResultsPage() {
  const [rawData, setRawData] = useState(null);
  const [normalizedData, setNormalizedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState({ likelyMatches: [], alsoCheck: [] });
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRawData(parsed);
        
        const normalized = normalizeQuizData(parsed);
        if (normalized && (normalized.zip || normalized.state || normalized.needs.length > 0 || normalized.ageRange !== '18to64' || normalized.veteran || normalized.disabled)) {
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

  const handlePrint = () => {
    window.print();
  };

  // Check if Medicare CTA should show - expanded triggers
  const hasMedicareProgram = matches.likelyMatches.some(m => m.program.id === 'medicare_savings') ||
                              matches.alsoCheck.some(m => m.program.id === 'medicare_savings');
  const isSenior = normalizedData?.ageRange === '65plus';
  
  // Additional triggers: healthcare-related needs or situations
  const healthcareRelatedNeeds = ['healthcare', 'prescriptions', 'medical'];
  const hasHealthcareNeed = normalizedData?.needs?.some(need => 
    healthcareRelatedNeeds.some(h => need.toLowerCase().includes(h))
  );
  const hasDisability = normalizedData?.disabled === true;
  const hasMedicaidMatch = matches.likelyMatches.some(m => m.program.id === 'medicaid') ||
                           matches.alsoCheck.some(m => m.program.id === 'medicaid');
  const hasSSIMatch = matches.likelyMatches.some(m => m.program.id === 'ssi') ||
                      matches.alsoCheck.some(m => m.program.id === 'ssi');
  
  // Show CTA for: seniors, Medicare/Medicaid/SSI matches, healthcare needs, or disability
  const showMedicareCTA = hasMedicareProgram || isSenior || hasHealthcareNeed || 
                          hasDisability || hasMedicaidMatch || hasSSIMatch;

  // Get list of matched program IDs for lead tracking
  const matchedProgramIds = [
    ...matches.likelyMatches.map(m => m.program.id),
    ...matches.alsoCheck.map(m => m.program.id),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E9' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#D08C60' }} />
          <p className="text-xl" style={{ color: '#6B625A' }}>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!normalizedData) {
    return <EmptyState />;
  }

  const { likelyMatches, alsoCheck } = matches;
  const hasResults = likelyMatches.length > 0 || alsoCheck.length > 0;

  // Format age range for display
  const ageRangeDisplay = {
    'under18': 'Under 18',
    '18to64': '18-64',
    '65plus': '65+',
  }[normalizedData.ageRange] || normalizedData.ageRange;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E9' }}>
      {/* Header */}
      <header 
        className="w-full no-print"
        style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#D08C60' }}
            >
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#3D3530' }}>BenefitBuddy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/start">
              <Button 
                variant="outline" 
                className="h-10 px-4"
                style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Answers
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="h-10 px-4"
              style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block p-4" style={{ borderBottom: '1px solid #E8DDCF' }}>
        <h1 className="text-2xl font-bold" style={{ color: '#3D3530' }}>BenefitBuddy - Your Results</h1>
        <p style={{ color: '#6B625A' }}>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3D3530' }}>
            Your Results
          </h1>
          <p className="text-xl" style={{ color: '#6B625A' }}>
            Based on your answers, here are programs you may qualify for.
          </p>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <SummaryBadge icon={MapPin} label="State" value={normalizedData.state} />
          <SummaryBadge icon={Users} label="Household" value={`${normalizedData.householdSize} ${normalizedData.householdSize === 1 ? 'person' : 'people'}`} />
          <SummaryBadge icon={Calendar} label="Age" value={ageRangeDisplay} />
        </div>

        {/* Trust Badge */}
        <div className="mb-6">
          <TrustBadge />
        </div>

        {/* Disclaimer */}
        <div 
          className="rounded-lg p-4 mb-8"
          style={{ backgroundColor: '#FEF3E2', border: '1px solid #E8DDCF' }}
        >
          <p style={{ color: '#8B6914' }}>
            <strong>⚠️ Important:</strong> These are suggestions based on general eligibility guidelines. 
            Actual eligibility is determined by each program's rules. Always verify with official sources.
          </p>
        </div>

        {!hasResults ? (
          <Card 
            className="border-2 text-center p-8"
            style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}
          >
            <CardContent className="p-0">
              <p className="text-xl mb-4" style={{ color: '#6B625A' }}>
                Based on your answers, we couldn't identify specific programs to recommend.
              </p>
              <p className="text-base mb-6" style={{ color: '#6B625A' }}>
                This doesn't mean you're not eligible. Try updating your answers or visit Benefits.gov for a complete search.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/start">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="h-12 px-6"
                    style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
                  >
                    <Edit className="mr-2 w-5 h-5" />
                    Edit Answers
                  </Button>
                </Link>
                <a href="https://www.benefits.gov" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg"
                    className="h-12 px-6 text-white"
                    style={{ backgroundColor: '#D08C60' }}
                  >
                    Search Benefits.gov
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Likely Matches Section */}
            {likelyMatches.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: '#3D3530' }}>
                  <CheckCircle className="w-7 h-7" style={{ color: '#4CAF50' }} />
                  Likely Matches
                </h2>
                <p className="text-base mb-6 ml-9" style={{ color: '#6B625A' }}>
                  Programs you're most likely to qualify for ({likelyMatches.length} found)
                </p>
                <div className="space-y-6">
                  {likelyMatches.map((match) => (
                    <ProgramCard key={match.program.id} match={match} userState={normalizedData?.state} />
                  ))}
                </div>
              </section>
            )}

            {/* Also Check Section */}
            {alsoCheck.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: '#3D3530' }}>
                  <Info className="w-7 h-7" style={{ color: '#2196F3' }} />
                  Also Check
                </h2>
                <p className="text-base mb-6 ml-9" style={{ color: '#6B625A' }}>
                  Additional programs worth exploring ({alsoCheck.length} found)
                </p>
                <div className="space-y-6">
                  {alsoCheck.map((match) => (
                    <ProgramCard key={match.program.id} match={match} userState={normalizedData?.state} />
                  ))}
                </div>
              </section>
            )}

            {/* Medicare Lead Capture CTA - Show for seniors or Medicare matches */}
            {showMedicareCTA && (
              <section className="mb-10">
                <MedicareCTA 
                  onOpenModal={() => setIsLeadModalOpen(true)} 
                  userState={normalizedData?.state}
                />
              </section>
            )}
          </>
        )}

        {/* Additional Resources */}
        <Card 
          className="border-2 mt-8 no-print"
          style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}
        >
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: '#3D3530' }}>
              📚 Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="https://www.benefits.gov" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-base hover:underline"
              style={{ color: '#D08C60' }}
            >
              Benefits.gov - Search all federal benefits
              <ExternalLink className="w-4 h-4" />
            </a>
            <a 
              href="https://www.findhelp.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-base hover:underline"
              style={{ color: '#D08C60' }}
            >
              FindHelp.org - Local assistance programs
              <ExternalLink className="w-4 h-4" />
            </a>
            <a 
              href="https://www.211.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-base hover:underline"
              style={{ color: '#D08C60' }}
            >
              211.org - Call 211 for local help
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 no-print">
          <Link href="/start">
            <Button 
              variant="outline"
              size="lg"
              className="h-12 px-6 w-full sm:w-auto"
              style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
            >
              <Edit className="mr-2 w-5 h-5" />
              Edit Answers
            </Button>
          </Link>
          <Button 
            variant="outline"
            size="lg"
            onClick={handlePrint}
            className="h-12 px-6 w-full sm:w-auto"
            style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
          >
            <Printer className="mr-2 w-5 h-5" />
            Print Results
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="w-full mt-12 py-6 no-print"
        style={{ backgroundColor: '#FFF8F0', borderTop: '1px solid #E8DDCF' }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: '#6B625A' }}>
            BenefitBuddy is not affiliated with any government agency. 
            For official information, please visit the agency websites directly.
          </p>
        </div>
      </footer>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        userState={normalizedData?.state}
        userZip={normalizedData?.zip}
        matchedPrograms={matchedProgramIds}
      />
    </div>
  );
}
