// /lib/guides.js

export const GUIDES = [
  {
    slug: "medicare-savings-program",
    title: "Medicare Savings Programs (MSP): Who Qualifies & How to Apply",
    description:
      "Learn what Medicare Savings Programs cover, who qualifies, income limits basics, and how to apply in your state.",
    priority: 0.9,
  },
  {
    slug: "extra-help-part-d",
    title: "Extra Help (Part D): Lower Prescription Costs",
    description:
      "Extra Help can reduce Part D premiums and copays. See what it is, who qualifies, and how to apply.",
    priority: 0.9,
  },
  {
    slug: "medicaid-vs-medicare",
    title: "Medicaid vs Medicare: What’s the Difference?",
    description:
      "A simple guide comparing Medicaid and Medicare, who gets what, and how they can work together.",
    priority: 0.8,
  },
  {
    slug: "medicare-advantage-vs-supplement",
    title: "Medicare Advantage vs Medigap: Which Is Better?",
    description:
      "Compare Medicare Advantage and Medigap (Supplement) plans: costs, coverage, networks, and tradeoffs.",
    priority: 0.8,
  },
  {
    slug: "medigap-plan-g",
    title: "Medigap Plan G: Coverage, Costs, and Who It’s For",
    description:
      "Understand what Medigap Plan G covers, typical costs, and who it may be a good fit for.",
    priority: 0.7,
  },
  {
    slug: "medigap-plan-n",
    title: "Medigap Plan N: Coverage, Copays, and Who It’s For",
    description:
      "A clear breakdown of Medigap Plan N, how it works, common copays, and pros/cons.",
    priority: 0.7,
  },
  {
    slug: "medicare-enrollment-periods",
    title: "Medicare Enrollment Periods Explained (IEP, SEP, AEP)",
    description:
      "Know when you can enroll or switch Medicare coverage. Simple explanations of key enrollment windows.",
    priority: 0.8,
  },
  {
    slug: "medicare-premium-help",
    title: "How to Lower Medicare Costs: Premium Help & Savings Options",
    description:
      "Ways to reduce Medicare premiums and out-of-pocket costs, including MSP and Extra Help.",
    priority: 0.8,
  },
  {
    slug: "snap-seniors",
    title: "SNAP for Seniors: Eligibility and How to Apply",
    description:
      "A senior-friendly guide to SNAP (food assistance), including who qualifies and how to apply.",
    priority: 0.8,
  },
  {
    slug: "liheap-energy-assistance",
    title: "LIHEAP: Help Paying Heating and Electric Bills",
    description:
      "Learn how LIHEAP works, who qualifies, and how to apply for energy assistance.",
    priority: 0.7,
  },
  {
    slug: "section-8-housing-waitlist",
    title: "Section 8 Housing: How the Waitlist Works",
    description:
      "Understand Section 8 basics, waitlists, and tips for checking your local housing authority.",
    priority: 0.6,
  },
  {
    slug: "chip-vs-medicaid",
    title: "CHIP vs Medicaid: What Caregivers Should Know",
    description:
      "A simple guide to CHIP and Medicaid, including who qualifies and how coverage differs.",
    priority: 0.6,
  },
  {
    slug: "ssi-vs-ssdi",
    title: "SSI vs SSDI: Differences, Eligibility, and How to Apply",
    description:
      "Learn the difference between SSI and SSDI in plain language and what you may qualify for.",
    priority: 0.6,
  },
  {
    slug: "food-pantries-near-me",
    title: "How to Find Food Pantries Near You",
    description:
      "Quick ways to find food pantries, meal sites, and local food support.",
    priority: 0.5,
  },
  {
    slug: "free-phone-internet-lifeline",
    title: "Low-Cost Phone & Internet Help (Lifeline and Options)",
    description:
      "Ways to get discounted phone or internet service through Lifeline and other programs.",
    priority: 0.5,
  },
  {
    slug: "va-benefits-for-seniors",
    title: "VA Benefits Seniors Often Miss",
    description:
      "Common VA benefits that may help with health care, prescriptions, and support services.",
    priority: 0.6,
  },
  {
    slug: "va-disability-increase",
    title: "How to Request a VA Disability Increase",
    description:
      "General steps and documentation ideas for requesting a VA disability rating increase.",
    priority: 0.5,
  },
  {
    slug: "prescription-assistance-programs",
    title: "Prescription Assistance Programs: Where to Look",
    description:
      "A practical guide to finding prescription assistance programs and cost-saving options.",
    priority: 0.7,
  },
  {
    slug: "medicare-dental-vision-hearing",
    title: "Medicare Dental, Vision, and Hearing: What’s Covered?",
    description:
      "Understand what Original Medicare covers and common options for dental/vision/hearing.",
    priority: 0.6,
  },
  {
    slug: "home-care-assistance",
    title: "Help Paying for Home Care: Options and Programs",
    description:
      "Common programs and benefits that may help pay for home care or caregiver support.",
    priority: 0.7,
  },
];

export function getGuideBySlug(slug) {
  return GUIDES.find((g) => g.slug === slug) || null;
}
