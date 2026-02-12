// Benefits matching rules - rules-based, not AI
export const BENEFITS = [
  {
    id: 'snap',
    name: 'SNAP (Food Assistance)',
    description: 'Supplemental Nutrition Assistance Program provides monthly benefits for groceries.',
    icon: '🛒',
    color: 'bg-green-100 border-green-500',
    match: (data) => {
      // Generally available for low-income households
      const lowIncome = ['under_1000', '1000_2000', '2000_3000'].includes(data.monthly_income_range);
      return lowIncome;
    },
    reason: 'Based on your household income, you may qualify for food assistance.',
    nextSteps: [
      'Visit your local SNAP office or apply online',
      'Gather proof of income and household size',
      'Complete an interview (phone or in-person)',
    ],
    officialLink: 'https://www.fns.usda.gov/snap/recipient/eligibility',
  },
  {
    id: 'medicaid',
    name: 'Medicaid',
    description: 'Free or low-cost health coverage for eligible low-income adults and families.',
    icon: '🏥',
    color: 'bg-blue-100 border-blue-500',
    match: (data) => {
      const lowIncome = ['under_1000', '1000_2000', '2000_3000'].includes(data.monthly_income_range);
      const noInsurance = data.has_health_insurance === 'no';
      return lowIncome || noInsurance;
    },
    reason: 'Based on your income and insurance status, you may qualify for Medicaid.',
    nextSteps: [
      'Apply through your state Medicaid agency or Healthcare.gov',
      'Provide proof of income and residency',
      'You may get coverage within 45 days',
    ],
    officialLink: 'https://www.medicaid.gov/about-us/beneficiary-resources/index.html',
  },
  {
    id: 'medicare_savings',
    name: 'Medicare Savings Programs',
    description: 'Help paying Medicare premiums, deductibles, and copays for seniors with limited income.',
    icon: '💊',
    color: 'bg-purple-100 border-purple-500',
    match: (data) => {
      const isSenior = data.age_range === '65_plus';
      const lowIncome = ['under_1000', '1000_2000', '2000_3000'].includes(data.monthly_income_range);
      return isSenior && lowIncome;
    },
    reason: 'As a senior with limited income, you may qualify for help with Medicare costs.',
    nextSteps: [
      'Contact your State Health Insurance Assistance Program (SHIP)',
      'Apply through your state Medicaid office',
      'Bring your Medicare card and income documents',
    ],
    officialLink: 'https://www.medicare.gov/your-medicare-costs/get-help-paying-costs/medicare-savings-programs',
  },
  {
    id: 'chip',
    name: 'CHIP (Children\'s Health Insurance)',
    description: 'Free or low-cost health coverage for children in families who earn too much for Medicaid.',
    icon: '👶',
    color: 'bg-yellow-100 border-yellow-500',
    match: (data) => {
      return data.pregnant_or_children === 'yes';
    },
    reason: 'You indicated you have children or are pregnant.',
    nextSteps: [
      'Apply at Healthcare.gov or your state CHIP program',
      'Coverage can start immediately for children',
      'Premiums are usually very low or free',
    ],
    officialLink: 'https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/',
  },
  {
    id: 'liheap',
    name: 'LIHEAP (Energy Assistance)',
    description: 'Help paying heating and cooling bills for low-income households.',
    icon: '💡',
    color: 'bg-orange-100 border-orange-500',
    match: (data) => {
      const lowIncome = ['under_1000', '1000_2000', '2000_3000'].includes(data.monthly_income_range);
      return lowIncome;
    },
    reason: 'Based on your income, you may qualify for help with utility bills.',
    nextSteps: [
      'Contact your local Community Action Agency',
      'Apply during the heating or cooling season',
      'Bring utility bills and proof of income',
    ],
    officialLink: 'https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap',
  },
  {
    id: 'wic',
    name: 'WIC (Women, Infants, Children)',
    description: 'Nutrition program for pregnant women, new mothers, and young children.',
    icon: '🍼',
    color: 'bg-pink-100 border-pink-500',
    match: (data) => {
      return data.pregnant_or_children === 'yes';
    },
    reason: 'You indicated you are pregnant or have young children.',
    nextSteps: [
      'Find your local WIC office',
      'Schedule a certification appointment',
      'Bring proof of income and child\'s immunization records',
    ],
    officialLink: 'https://www.fns.usda.gov/wic',
  },
  {
    id: 'unemployment',
    name: 'Unemployment Insurance',
    description: 'Temporary income for workers who lost their job through no fault of their own.',
    icon: '💼',
    color: 'bg-indigo-100 border-indigo-500',
    match: (data) => {
      return data.employment_status === 'unemployed';
    },
    reason: 'You indicated you are currently unemployed.',
    nextSteps: [
      'File a claim with your state unemployment office',
      'Gather your work history and employer information',
      'Continue to search for work while receiving benefits',
    ],
    officialLink: 'https://www.dol.gov/general/topic/unemployment-insurance',
  },
  {
    id: 'va_benefits',
    name: 'VA Benefits',
    description: 'Healthcare, disability compensation, and other benefits for veterans.',
    icon: '🎖️',
    color: 'bg-red-100 border-red-500',
    match: (data) => {
      return data.veteran === 'yes';
    },
    reason: 'You indicated you are a veteran.',
    nextSteps: [
      'Register at VA.gov or visit your local VA office',
      'Apply for VA health care enrollment',
      'Check eligibility for disability compensation',
    ],
    officialLink: 'https://www.va.gov/health-care/',
  },
  {
    id: 'housing_assistance',
    name: 'Housing Assistance',
    description: 'Help with rent, finding affordable housing, or avoiding eviction.',
    icon: '🏠',
    color: 'bg-teal-100 border-teal-500',
    match: (data) => {
      const lowIncome = ['under_1000', '1000_2000', '2000_3000'].includes(data.monthly_income_range);
      const housingNeed = ['rent', 'unhoused', 'other'].includes(data.housing_status);
      return lowIncome && housingNeed;
    },
    reason: 'Based on your income and housing situation, you may qualify for assistance.',
    nextSteps: [
      'Contact your local Public Housing Authority (PHA)',
      'Apply for Section 8 Housing Choice Voucher',
      'Ask about emergency rental assistance programs',
    ],
    officialLink: 'https://www.hud.gov/topics/rental_assistance',
  },
  {
    id: 'ssi',
    name: 'SSI (Supplemental Security Income)',
    description: 'Monthly payments for people with limited income who are 65+, blind, or disabled.',
    icon: '🤝',
    color: 'bg-cyan-100 border-cyan-500',
    match: (data) => {
      const isSeniorOrDisabled = data.age_range === '65_plus' || data.disability === 'yes';
      const lowIncome = ['under_1000', '1000_2000'].includes(data.monthly_income_range);
      return isSeniorOrDisabled && lowIncome;
    },
    reason: 'Based on your age/disability status and income, you may qualify for SSI.',
    nextSteps: [
      'Apply online at ssa.gov or call 1-800-772-1213',
      'Gather medical records if applying for disability',
      'Provide proof of income and resources',
    ],
    officialLink: 'https://www.ssa.gov/ssi/',
  },
];

export function matchBenefits(submissionData) {
  return BENEFITS.filter(benefit => benefit.match(submissionData));
}
