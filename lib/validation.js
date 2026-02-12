import { z } from 'zod';

export const submissionSchema = z.object({
  full_name: z.string().optional().default(''),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  age_range: z.enum(['18_24', '25_34', '35_49', '50_64', '65_plus'], {
    errorMap: () => ({ message: 'Please select your age range' }),
  }),
  zip_code: z.string().min(5, 'Please enter a 5-digit ZIP code').max(10, 'ZIP code is too long'),
  household_size: z.string().min(1, 'Please select household size'),
  monthly_income_range: z.enum(['under_1000', '1000_2000', '2000_3000', '3000_4000', '4000_plus'], {
    errorMap: () => ({ message: 'Please select your income range' }),
  }),
  employment_status: z.enum(['employed', 'part_time', 'unemployed', 'retired', 'disabled', 'student'], {
    errorMap: () => ({ message: 'Please select your employment status' }),
  }),
  veteran: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please answer yes or no' }),
  }),
  disability: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please answer yes or no' }),
  }),
  student: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please answer yes or no' }),
  }),
  pregnant_or_children: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please answer yes or no' }),
  }),
  housing_status: z.enum(['rent', 'own', 'unhoused', 'other'], {
    errorMap: () => ({ message: 'Please select your housing status' }),
  }),
  has_health_insurance: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please answer yes or no' }),
  }),
  // Honeypot field for spam protection
  website: z.string().optional().default(''),
});

export function validateSubmission(data) {
  return submissionSchema.safeParse(data);
}
