/**
 * State-specific link helpers for BenefitBuddy
 * 
 * This module provides functions to generate state-specific URLs for benefit programs.
 * Only SNAP has verified state-specific apply links via USDA/FNS directory.
 * Other programs use official national/state contact pages as safe fallbacks.
 */

// State abbreviation to full name mapping
const STATE_NAMES = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia',
};

/**
 * Convert state name to USDA SNAP directory slug
 * Rules:
 * - lowercase
 * - trim whitespace
 * - replace spaces with hyphens
 * - remove periods
 * 
 * @param {string} stateName - Full state name (e.g., "California", "New York")
 * @returns {string} - URL slug (e.g., "california", "new-york")
 */
function stateNameToSlug(stateName) {
  if (!stateName) return '';
  
  return stateName
    .toLowerCase()
    .trim()
    .replace(/\./g, '')        // Remove periods (e.g., "D.C." -> "DC")
    .replace(/\s+/g, '-');     // Replace spaces with hyphens
}

/**
 * Get the USDA/FNS SNAP state directory URL for a given state
 * 
 * @param {string} stateInput - State abbreviation (e.g., "CA") or full name (e.g., "California")
 * @returns {string} - Full URL to state's SNAP directory entry, or fallback to national directory
 * 
 * @example
 * getSnapStateApplyUrl('CA') // => "https://www.fns.usda.gov/snap-directory-entry/california"
 * getSnapStateApplyUrl('New York') // => "https://www.fns.usda.gov/snap-directory-entry/new-york"
 * getSnapStateApplyUrl('DC') // => "https://www.fns.usda.gov/snap-directory-entry/district-of-columbia"
 */
export function getSnapStateApplyUrl(stateInput) {
  const FALLBACK_URL = 'https://www.fns.usda.gov/snap/state-directory';
  
  if (!stateInput) {
    return FALLBACK_URL;
  }
  
  // Normalize input - could be abbreviation or full name
  const input = stateInput.trim().toUpperCase();
  
  // Check if it's an abbreviation
  let stateName = STATE_NAMES[input];
  
  // If not found as abbreviation, assume it's already a full name
  if (!stateName) {
    // Check if input matches a full state name (case-insensitive)
    const inputLower = stateInput.toLowerCase().trim();
    for (const [abbr, name] of Object.entries(STATE_NAMES)) {
      if (name.toLowerCase() === inputLower) {
        stateName = name;
        break;
      }
    }
  }
  
  // If still not found, use the input as-is (for edge cases)
  if (!stateName) {
    stateName = stateInput;
  }
  
  const slug = stateNameToSlug(stateName);
  
  if (!slug) {
    return FALLBACK_URL;
  }
  
  return `https://www.fns.usda.gov/snap-directory-entry/${slug}`;
}

/**
 * Get Medicaid/CHIP state help page URL
 * Uses the official Medicaid.gov contact page as default
 * 
 * @param {string} stateInput - State abbreviation or full name (optional)
 * @returns {object} - Object with main and optional stateProfile URLs
 */
export function getMedicaidHelpUrl(stateInput) {
  const mainUrl = 'https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip';
  
  // State profile URL (if state is provided)
  let stateProfileUrl = null;
  
  if (stateInput) {
    const input = stateInput.trim().toUpperCase();
    let stateName = STATE_NAMES[input];
    
    if (!stateName) {
      const inputLower = stateInput.toLowerCase().trim();
      for (const [abbr, name] of Object.entries(STATE_NAMES)) {
        if (name.toLowerCase() === inputLower) {
          stateName = name;
          break;
        }
      }
    }
    
    if (stateName) {
      // Medicaid state profile uses lowercase state name with spaces
      const stateParam = stateName.toLowerCase().replace(/\s+/g, '-');
      stateProfileUrl = `https://www.medicaid.gov/state-overviews/stateprofile.html?state=${stateParam}`;
    }
  }
  
  return {
    main: mainUrl,
    stateProfile: stateProfileUrl,
  };
}

/**
 * Get state name from abbreviation
 * 
 * @param {string} abbreviation - Two-letter state code
 * @returns {string|null} - Full state name or null if not found
 */
export function getStateNameFromAbbr(abbreviation) {
  if (!abbreviation) return null;
  return STATE_NAMES[abbreviation.toUpperCase().trim()] || null;
}

/**
 * Official program URLs (safe fallbacks - verified national pages)
 * These do NOT guess state-specific apply URLs
 */
export const OFFICIAL_PROGRAM_URLS = {
  snap: 'https://www.fns.usda.gov/snap/state-directory',
  medicaid: 'https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip',
  medicare_savings: 'https://www.medicare.gov/medicare-savings-programs',
  housing: 'https://www.hud.gov/topics/rental_assistance',
  liheap: 'https://www.acf.hhs.gov/ocs/low-income-home-energy-assistance-program-liheap',
  va_benefits: 'https://www.va.gov/',
  chip: 'https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip',
  ssi: 'https://www.ssa.gov/ssi/',
  wic: 'https://www.fns.usda.gov/wic',
};

// ============================================
// DEBUG / VALIDATION (for development)
// ============================================

/**
 * Validate SNAP URL generation with test cases
 * Run this in development to verify URL generation
 */
export function validateSnapUrls() {
  const testCases = [
    { input: 'CA', expected: 'https://www.fns.usda.gov/snap-directory-entry/california' },
    { input: 'California', expected: 'https://www.fns.usda.gov/snap-directory-entry/california' },
    { input: 'NY', expected: 'https://www.fns.usda.gov/snap-directory-entry/new-york' },
    { input: 'New York', expected: 'https://www.fns.usda.gov/snap-directory-entry/new-york' },
    { input: 'DC', expected: 'https://www.fns.usda.gov/snap-directory-entry/district-of-columbia' },
    { input: 'District of Columbia', expected: 'https://www.fns.usda.gov/snap-directory-entry/district-of-columbia' },
    { input: 'TX', expected: 'https://www.fns.usda.gov/snap-directory-entry/texas' },
    { input: '', expected: 'https://www.fns.usda.gov/snap/state-directory' },
    { input: null, expected: 'https://www.fns.usda.gov/snap/state-directory' },
  ];
  
  const results = testCases.map(({ input, expected }) => {
    const actual = getSnapStateApplyUrl(input);
    const passed = actual === expected;
    return {
      input,
      expected,
      actual,
      passed,
    };
  });
  
  console.log('=== SNAP URL Validation Results ===');
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} Input: "${r.input}" => ${r.actual}`);
    if (!r.passed) {
      console.log(`   Expected: ${r.expected}`);
    }
  });
  
  const allPassed = results.every(r => r.passed);
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`);
  
  return results;
}
