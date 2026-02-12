'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowLeft,
} from 'lucide-react';

const STORAGE_KEY = 'benefitbuddy_quiz';

// Program definitions with official links
const PROGRAMS = {
  snap: {
    id: 'snap',
    name: 'SNAP (Food Assistance)',
    icon: '🛒',
    description: 'The Supplemental Nutrition Assistance Program helps low-income households buy groceries.',
    officialLink: 'https://www.fns.usda.gov/snap/state-directory',
    color: '#4CAF50',
  },
  medicaid: {
    id: 'medicaid',
    name: 'Medicaid',
    icon: '🏥',
    description: 'Medicaid provides free or low-cost health coverage for eligible low-income adults and families.',
    officialLink: 'https://www.medicaid.gov/about-us/beneficiary-resources/index.html',
    color: '#2196F3',
  },
  medicare_savings: {
    id: 'medicare_savings',
    name: 'Medicare Savings Programs',
    icon: '💊',
    description: 'These programs help pay Medicare premiums, deductibles, and copays for seniors with limited income.',
    officialLink: 'https://www.medicare.gov/medicare-savings-programs',
    color: '#9C27B0',
  },
  housing: {
    id: 'housing',
    name: 'Housing Assistance (HUD)',
    icon: '🏠',
    description: 'HUD offers rental assistance programs including Section 8 vouchers and public housing.',
    officialLink: 'https://www.hud.gov/topics/rental_assistance',
    color: '#FF9800',
  },
  liheap: {
    id: 'liheap',
    name: 'Energy Assistance (LIHEAP)',
    icon: '💡',
    description: 'LIHEAP helps low-income households pay heating and cooling bills.',
    officialLink: 'https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap',
    color: '#FFC107',
  },
  va_benefits: {
    id: 'va_benefits',
    name: 'VA Benefits',
    icon: '🎖️',
    description: 'Veterans may qualify for healthcare, disability compensation, pension, and other benefits.',
    officialLink: 'https://www.va.gov/',
    color: '#3F51B5',
  },
  chip: {
    id: 'chip',
    name: 'CHIP (Children\'s Health Insurance)',
    icon: '👶',
    description: 'CHIP provides low-cost health coverage for children in families who earn too much for Medicaid.',
    officialLink: 'https://www.medicaid.gov/about-us/beneficiary-resources/index.html',
    color: '#E91E63',
  },
  ssi: {
    id: 'ssi',
    name: 'SSI (Supplemental Security Income)',
    icon: '🤝',
    description: 'SSI provides monthly payments to people with limited income who are 65+, blind, or disabled.',
    officialLink: 'https://www.ssa.gov/ssi/',
    color: '#607D8B',
  },
  wic: {
    id: 'wic',
    name: 'WIC (Women, Infants & Children)',
    icon: '🍼',
    description: 'WIC provides nutritious foods, nutrition education, and health referrals for pregnant women and young children.',
    officialLink: 'https://www.fns.usda.gov/wic',
    color: '#FF5722',
  },
};

// Calculate income threshold based on household size
function getIncomeThreshold(householdSize) {
  const baseThreshold = 25000;
  const perPersonAddition = 9000;
  return baseThreshold + (Math.max(1, householdSize) - 1) * perPersonAddition;
}

// Convert income to yearly amount
function getYearlyIncome(data) {
  if (!data.income_amount) return null;
  const amount = parseFloat(data.income_amount);
  if (isNaN(amount)) return null;
  return data.income_type === 'yearly' ? amount : amount * 12;
}

// Check if income is considered "low"
function isLowIncome(data) {
  const yearlyIncome = getYearlyIncome(data);
  if (yearlyIncome === null) return false; // Can't determine
  const householdSize = parseInt(data.household_size) || 1;
  const threshold = getIncomeThreshold(householdSize);
  return yearlyIncome < threshold;
}

// Check if income is "very low" (for SSI)
function isVeryLowIncome(data) {
  const yearlyIncome = getYearlyIncome(data);
  if (yearlyIncome === null) return false;
  const householdSize = parseInt(data.household_size) || 1;
  const threshold = getIncomeThreshold(householdSize) * 0.5; // 50% of low-income threshold
  return yearlyIncome < threshold;
}

// Main matching function
function matchPrograms(data) {
  const likelyMatches = [];
  const alsoCheck = [];
  const needs = data.needs || [];
  const ageRange = data.age_range || '';
  const isVeteran = data.is_veteran === 'yes';
  const hasDisability = data.has_disability === 'yes';
  const householdSize = parseInt(data.household_size) || 1;
  const state = data.state || '';
  const yearlyIncome = getYearlyIncome(data);
  const lowIncome = isLowIncome(data);
  const veryLowIncome = isVeryLowIncome(data);

  // Helper to create program match with reasons
  const createMatch = (programId, reasons, requirements) => ({
    program: PROGRAMS[programId],
    reasons,
    requirements,
  });

  // SNAP - Food help
  if (needs.includes('food_help')) {
    likelyMatches.push(createMatch('snap', [
      'You indicated you need help with food',
      lowIncome ? 'Your income may fall within eligibility limits' : 'Income limits vary by state',
      `Household size of ${householdSize} is considered in eligibility`,
    ], [
      'Proof of identity',
      'Proof of residency',
      'Proof of income (pay stubs, benefit letters)',
      'Additional documents may be requested depending on program',
    ]));
  }

  // Medicaid - Healthcare for low income
  if (needs.includes('healthcare') && ageRange !== 'under_18') {
    if (lowIncome || yearlyIncome === null) {
      likelyMatches.push(createMatch('medicaid', [
        'You indicated you need help with healthcare',
        lowIncome ? 'Your income appears to fall within Medicaid limits' : 'Income limits vary by state',
        state ? `${state} has its own Medicaid program with specific rules` : 'Each state has different Medicaid rules',
      ], [
        'Proof of identity',
        'Proof of citizenship or immigration status',
        'Proof of income',
        'Additional documents may be requested depending on program',
      ]));
    }
  }

  // CHIP - Children's healthcare (moves to LIKELY if under 18 + healthcare need)
  if (ageRange === 'under_18') {
    if (needs.includes('healthcare')) {
      likelyMatches.push(createMatch('chip', [
        'You are under 18 years old',
        'You indicated you need help with healthcare',
        'CHIP covers children in families who earn too much for Medicaid',
      ], [
        'Child\'s birth certificate',
        'Proof of family income',
        'Proof of residency',
        'Additional documents may be requested depending on program',
      ]));
    } else {
      alsoCheck.push(createMatch('chip', [
        'You are under 18 years old',
        'CHIP may be available even if you have some coverage',
      ], [
        'Child\'s birth certificate',
        'Proof of family income',
        'Additional documents may be requested depending on program',
      ]));
    }
  }

  // Medicare Savings Programs - 65+
  if (ageRange === '65_plus') {
    likelyMatches.push(createMatch('medicare_savings', [
      'You are 65 or older',
      'These programs help with Medicare costs',
      lowIncome ? 'Your income may qualify you for premium assistance' : 'Income limits vary by program type',
    ], [
      'Medicare card',
      'Proof of income and assets',
      'Proof of residency',
      'Additional documents may be requested depending on program',
    ]));
  }

  // Housing assistance
  if (needs.includes('housing')) {
    likelyMatches.push(createMatch('housing', [
      'You indicated you need help with housing',
      data.housing_status === 'rent' ? 'You are currently renting' : 'Housing programs may help with various situations',
      'Wait lists vary by location',
    ], [
      'Proof of identity for all household members',
      'Proof of income',
      'Rental history',
      'Additional documents may be requested depending on program',
    ]));
  }

  // LIHEAP - Utility assistance
  if (needs.includes('utilities')) {
    likelyMatches.push(createMatch('liheap', [
      'You indicated you need help with utilities',
      lowIncome ? 'Your income may qualify you for assistance' : 'Income limits vary by state',
      'LIHEAP can help with heating and cooling costs',
    ], [
      'Recent utility bill',
      'Proof of income',
      'Proof of residency',
      'Additional documents may be requested depending on program',
    ]));
  }

  // VA Benefits - Veterans
  if (isVeteran) {
    likelyMatches.push(createMatch('va_benefits', [
      'You indicated you are a veteran',
      'VA offers healthcare, disability, pension, and other benefits',
      'Eligibility depends on service history and discharge status',
    ], [
      'DD-214 or separation documents',
      'Proof of identity',
      'Medical records (for disability claims)',
      'Additional documents may be requested depending on program',
    ]));
  }

  // SSI - Disabled or very low income
  if (hasDisability || veryLowIncome) {
    const reasons = [];
    if (hasDisability) reasons.push('You indicated you have a disability');
    if (veryLowIncome) reasons.push('Your income appears to be very limited');
    if (ageRange === '65_plus') reasons.push('You are 65 or older');
    reasons.push('SSI provides monthly cash assistance');

    if (hasDisability) {
      likelyMatches.push(createMatch('ssi', reasons, [
        'Medical records documenting disability',
        'Proof of limited income and resources',
        'Proof of citizenship or eligible immigration status',
        'Additional documents may be requested depending on program',
      ]));
    } else {
      alsoCheck.push(createMatch('ssi', reasons, [
        'Proof of limited income and resources',
        'Medical documentation (if applicable)',
        'Additional documents may be requested depending on program',
      ]));
    }
  }

  // WIC - Food help for children
  if (needs.includes('food_help') && (ageRange === 'under_18')) {
    alsoCheck.push(createMatch('wic', [
      'You indicated you need help with food',
      'You are under 18',
      'WIC serves pregnant women, new mothers, and children under 5',
    ], [
      'Proof of identity',
      'Proof of residency',
      'Proof of income',
      'Additional documents may be requested depending on program',
    ]));
  }

  // Cash assistance goes to generic info
  if (needs.includes('cash_assistance') && !likelyMatches.find(m => m.program.id === 'ssi')) {
    if (!alsoCheck.find(m => m.program.id === 'ssi')) {
      alsoCheck.push(createMatch('ssi', [
        'You indicated you need cash assistance',
        'SSI may be available for those with limited income',
        'Additional state programs may also be available',
      ], [
        'Proof of limited income and resources',
        'Additional documents may be requested depending on program',
      ]));
    }
  }

  return { likelyMatches, alsoCheck };
}

// Trust badge component
function TrustBadge() {
  return (
    <div 
      className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg mb-6"
      style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DDCF' }}
    >
      <ShieldCheck className="w-5 h-5" style={{ color: '#D08C60' }} />
      <span className="text-base font-medium" style={{ color: '#6B625A' }}>
        No login required. We never ask for SSN.
      </span>
    </div>
  );
}

// Program card component
function ProgramCard({ match, isLikely }) {
  const { program, reasons, requirements } = match;
  
  return (
    <Card 
      className="border-2 overflow-hidden transition-shadow hover:shadow-lg"
      style={{ borderColor: '#E8DDCF' }}
    >
      <CardHeader 
        className="pb-3"
        style={{ 
          backgroundColor: '#FFF8F0',
          borderBottom: '1px solid #E8DDCF',
        }}
      >
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">{program.icon}</span>
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
      <CardContent className="p-6 space-y-4">
        {/* Why you might qualify */}
        <div>
          <h4 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#3D3530' }}>
            <CheckCircle className="w-5 h-5" style={{ color: '#4CAF50' }} />
            Why you might qualify
          </h4>
          <ul className="space-y-2">
            {reasons.map((reason, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 text-base"
                style={{ color: '#6B625A' }}
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#D08C60' }} />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* What you may need */}
        <div>
          <h4 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#3D3530' }}>
            <Info className="w-5 h-5" style={{ color: '#2196F3' }} />
            What you may need to apply
          </h4>
          <ul className="space-y-2">
            {requirements.map((req, index) => (
              <li 
                key={index} 
                className="flex items-start gap-2 text-base"
                style={{ color: '#6B625A' }}
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#E8DDCF' }} />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Apply button */}
        <a 
          href={program.officialLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <Button 
            className="w-full h-12 text-lg text-white mt-2"
            style={{ backgroundColor: '#D08C60' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
          >
            Apply / Learn More
            <ExternalLink className="ml-2 w-5 h-5" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

// No data state component
function NoDataState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F1E9' }}>
      <Card 
        className="max-w-md w-full border-2"
        style={{ borderColor: '#E8DDCF' }}
      >
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#D08C60' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#3D3530' }}>
            No Quiz Data Found
          </h1>
          <p className="text-lg mb-6" style={{ color: '#6B625A' }}>
            It looks like you haven't completed the quiz yet. Answer a few simple questions to see which benefits you may qualify for.
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

// Main Results Page Component
export default function ResultsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState({ likelyMatches: [], alsoCheck: [] });

  // Load data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if data has meaningful content
        if (parsed && (parsed.zip_code || parsed.state || parsed.needs?.length > 0 || parsed.age_range)) {
          setData(parsed);
          setMatches(matchPrograms(parsed));
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

  if (!data) {
    return <NoDataState />;
  }

  const { likelyMatches, alsoCheck } = matches;
  const hasResults = likelyMatches.length > 0 || alsoCheck.length > 0;

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
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="h-10 px-4"
            style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Results
          </Button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block p-4" style={{ borderBottom: '1px solid #E8DDCF' }}>
        <h1 className="text-2xl font-bold" style={{ color: '#3D3530' }}>BenefitBuddy - Your Results</h1>
        <p style={{ color: '#6B625A' }}>Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3D3530' }}>
            🎉 Your Benefit Matches
          </h1>
          <p className="text-xl" style={{ color: '#6B625A' }}>
            Based on your answers, here are programs you may qualify for.
          </p>
        </div>

        <TrustBadge />

        {/* Disclaimer */}
        <div 
          className="rounded-lg p-4 mb-8"
          style={{ backgroundColor: '#FEF3E2', border: '1px solid #E8DDCF' }}
        >
          <p style={{ color: '#8B6914' }}>
            <strong>⚠️ Important:</strong> These are suggestions based on general eligibility guidelines. 
            Actual eligibility is determined by each program. Always verify with official sources.
          </p>
        </div>

        {!hasResults ? (
          /* No matches found */
          <Card 
            className="border-2 text-center p-8"
            style={{ borderColor: '#E8DDCF' }}
          >
            <CardContent>
              <p className="text-xl mb-4" style={{ color: '#6B625A' }}>
                Based on your answers, we couldn't identify specific programs to recommend.
              </p>
              <p className="text-base mb-6" style={{ color: '#6B625A' }}>
                This doesn't mean you're not eligible for assistance. Try the quiz again with different answers, or visit Benefits.gov for a complete search.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/start">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="h-12 px-6"
                    style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Retake Quiz
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
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3D3530' }}>
                  <CheckCircle className="w-6 h-6" style={{ color: '#4CAF50' }} />
                  Likely Matches ({likelyMatches.length})
                </h2>
                <p className="text-base mb-6" style={{ color: '#6B625A' }}>
                  Programs you're most likely to qualify for based on your answers.
                </p>
                <div className="space-y-6">
                  {likelyMatches.map((match) => (
                    <ProgramCard key={match.program.id} match={match} isLikely={true} />
                  ))}
                </div>
              </section>
            )}

            {/* Also Check Section */}
            {alsoCheck.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3D3530' }}>
                  <Info className="w-6 h-6" style={{ color: '#2196F3' }} />
                  Also Worth Checking ({alsoCheck.length})
                </h2>
                <p className="text-base mb-6" style={{ color: '#6B625A' }}>
                  Additional programs that may be available to you.
                </p>
                <div className="space-y-6">
                  {alsoCheck.map((match) => (
                    <ProgramCard key={match.program.id} match={match} isLikely={false} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Additional Resources */}
        <Card 
          className="border-2 mt-8 no-print"
          style={{ borderColor: '#E8DDCF' }}
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

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 no-print">
          <Link href="/start">
            <Button 
              variant="outline"
              size="lg"
              className="h-12 px-6 w-full sm:w-auto"
              style={{ borderColor: '#E8DDCF', color: '#6B625A' }}
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Retake Quiz
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
    </div>
  );
}
