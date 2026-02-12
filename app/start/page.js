'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const TOTAL_STEPS = 5;

// Step Components
function StepBasicInfo({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3D3530] mb-2">
          Let's get to know you
        </h2>
        <p className="text-muted senior-text">
          This information is optional but helps us personalize your results.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name" className="text-lg font-medium text-[#3D3530]">
            Your Name (optional)
          </Label>
          <Input
            id="full_name"
            value={data.full_name || ''}
            onChange={(e) => onChange('full_name', e.target.value)}
            placeholder="Your name"
            className="mt-2 h-14 text-lg border-[#E8DDCF] focus:border-[#D08C60]"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-lg font-medium text-[#3D3530]">
            Email (optional)
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="you@example.com"
            className="mt-2 h-14 text-lg border-[#E8DDCF] focus:border-[#D08C60]"
          />
          {errors.email && (
            <p className="text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-lg font-medium text-[#3D3530]">
            Phone Number (optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            className="mt-2 h-14 text-lg border-[#E8DDCF] focus:border-[#D08C60]"
          />
        </div>
      </div>

      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        name="website"
        value={data.website || ''}
        onChange={(e) => onChange('website', e.target.value)}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

function StepDemographics({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3D3530] mb-2">
          About Your Household
        </h2>
        <p className="text-muted senior-text">
          This helps us find programs for your situation.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-lg font-medium mb-3 block text-[#3D3530]">
            Your Age Range <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={data.age_range || ''}
            onValueChange={(value) => onChange('age_range', value)}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {[
              { value: '18_24', label: '18-24' },
              { value: '25_34', label: '25-34' },
              { value: '35_49', label: '35-49' },
              { value: '50_64', label: '50-64' },
              { value: '65_plus', label: '65 or older' },
            ].map((option) => (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={`age_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`age_${option.value}`}
                  className="flex items-center justify-center p-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-[#FFF8F0] peer-data-[state=checked]:border-[#D08C60] peer-data-[state=checked]:bg-[#FFF8F0] text-lg font-medium text-[#3D3530]"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.age_range && (
            <p className="text-red-600 mt-2">{errors.age_range}</p>
          )}
        </div>

        <div>
          <Label htmlFor="zip_code" className="text-lg font-medium text-[#3D3530]">
            ZIP Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="zip_code"
            value={data.zip_code || ''}
            onChange={(e) => onChange('zip_code', e.target.value)}
            placeholder="12345"
            className="mt-2 h-14 text-lg max-w-xs border-[#E8DDCF] focus:border-[#D08C60]"
            maxLength={10}
          />
          {errors.zip_code && (
            <p className="text-red-600 mt-1">{errors.zip_code}</p>
          )}
        </div>

        <div>
          <Label htmlFor="household_size" className="text-lg font-medium text-[#3D3530]">
            Household Size <span className="text-red-500">*</span>
          </Label>
          <p className="text-muted text-sm mb-2">Including yourself</p>
          <Select
            value={data.household_size || ''}
            onValueChange={(value) => onChange('household_size', value)}
          >
            <SelectTrigger className="h-14 text-lg max-w-xs border-[#E8DDCF]">
              <SelectValue placeholder="Select household size" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={String(num)} className="text-lg">
                  {num} {num === 1 ? 'person' : 'people'}
                </SelectItem>
              ))}
              <SelectItem value="9+" className="text-lg">9 or more</SelectItem>
            </SelectContent>
          </Select>
          {errors.household_size && (
            <p className="text-red-600 mt-1">{errors.household_size}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepFinancial({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3D3530] mb-2">
          Income & Employment
        </h2>
        <p className="text-muted senior-text">
          Many programs are based on income. Give us your best estimate.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-lg font-medium mb-3 block text-[#3D3530]">
            Monthly Household Income (before taxes) <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={data.monthly_income_range || ''}
            onValueChange={(value) => onChange('monthly_income_range', value)}
            className="space-y-3"
          >
            {[
              { value: 'under_1000', label: 'Under $1,000' },
              { value: '1000_2000', label: '$1,000 - $2,000' },
              { value: '2000_3000', label: '$2,000 - $3,000' },
              { value: '3000_4000', label: '$3,000 - $4,000' },
              { value: '4000_plus', label: 'Over $4,000' },
            ].map((option) => (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={`income_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`income_${option.value}`}
                  className="flex items-center p-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-[#FFF8F0] peer-data-[state=checked]:border-[#D08C60] peer-data-[state=checked]:bg-[#FFF8F0] text-lg text-[#3D3530]"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.monthly_income_range && (
            <p className="text-red-600 mt-2">{errors.monthly_income_range}</p>
          )}
        </div>

        <div>
          <Label className="text-lg font-medium mb-3 block text-[#3D3530]">
            Employment Status <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={data.employment_status || ''}
            onValueChange={(value) => onChange('employment_status', value)}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: 'employed', label: 'Employed' },
              { value: 'part_time', label: 'Part-time' },
              { value: 'unemployed', label: 'Unemployed' },
              { value: 'retired', label: 'Retired' },
              { value: 'disabled', label: 'Unable to work' },
              { value: 'student', label: 'Student' },
            ].map((option) => (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={`emp_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`emp_${option.value}`}
                  className="flex items-center justify-center p-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-[#FFF8F0] peer-data-[state=checked]:border-[#D08C60] peer-data-[state=checked]:bg-[#FFF8F0] text-lg text-[#3D3530]"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.employment_status && (
            <p className="text-red-600 mt-2">{errors.employment_status}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepSituation({ data, onChange, errors }) {
  const YesNoQuestion = ({ field, label }) => (
    <div>
      <Label className="text-lg font-medium mb-3 block text-[#3D3530]">{label} <span className="text-red-500">*</span></Label>
      <RadioGroup
        value={data[field] || ''}
        onValueChange={(value) => onChange(field, value)}
        className="flex gap-4"
      >
        <div>
          <RadioGroupItem value="yes" id={`${field}_yes`} className="peer sr-only" />
          <Label
            htmlFor={`${field}_yes`}
            className="flex items-center justify-center px-8 py-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-green-50 peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 text-lg font-medium text-[#3D3530]"
          >
            Yes
          </Label>
        </div>
        <div>
          <RadioGroupItem value="no" id={`${field}_no`} className="peer sr-only" />
          <Label
            htmlFor={`${field}_no`}
            className="flex items-center justify-center px-8 py-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-100 text-lg font-medium text-[#3D3530]"
          >
            No
          </Label>
        </div>
      </RadioGroup>
      {errors[field] && <p className="text-red-600 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3D3530] mb-2">
          Your Situation
        </h2>
        <p className="text-muted senior-text">
          Answer Yes or No to help us find the right programs.
        </p>
      </div>

      <div className="space-y-6">
        <YesNoQuestion field="veteran" label="Are you a veteran?" />
        <YesNoQuestion field="disability" label="Do you have a disability?" />
        <YesNoQuestion field="student" label="Are you currently a student?" />
        <YesNoQuestion field="pregnant_or_children" label="Are you pregnant or do you have children?" />
      </div>
    </div>
  );
}

function StepHousing({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3D3530] mb-2">
          Housing & Healthcare
        </h2>
        <p className="text-muted senior-text">
          Last step! This helps us find housing and health programs.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-lg font-medium mb-3 block text-[#3D3530]">
            What is your housing situation? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={data.housing_status || ''}
            onValueChange={(value) => onChange('housing_status', value)}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: 'rent', label: 'I rent' },
              { value: 'own', label: 'I own my home' },
              { value: 'unhoused', label: 'No stable housing' },
              { value: 'other', label: 'Other situation' },
            ].map((option) => (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={`housing_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`housing_${option.value}`}
                  className="flex items-center justify-center p-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-[#FFF8F0] peer-data-[state=checked]:border-[#D08C60] peer-data-[state=checked]:bg-[#FFF8F0] text-lg text-center text-[#3D3530]"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.housing_status && (
            <p className="text-red-600 mt-2">{errors.housing_status}</p>
          )}
        </div>

        <div>
          <Label className="text-lg font-medium mb-3 block text-[#3D3530]">
            Do you currently have health insurance? <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={data.has_health_insurance || ''}
            onValueChange={(value) => onChange('has_health_insurance', value)}
            className="flex gap-4"
          >
            <div>
              <RadioGroupItem value="yes" id="insurance_yes" className="peer sr-only" />
              <Label
                htmlFor="insurance_yes"
                className="flex items-center justify-center px-8 py-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-green-50 peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 text-lg font-medium text-[#3D3530]"
              >
                Yes
              </Label>
            </div>
            <div>
              <RadioGroupItem value="no" id="insurance_no" className="peer sr-only" />
              <Label
                htmlFor="insurance_no"
                className="flex items-center justify-center px-8 py-4 bg-white border-2 border-[#E8DDCF] rounded-lg cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-gray-600 peer-data-[state=checked]:bg-gray-100 text-lg font-medium text-[#3D3530]"
              >
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.has_health_insurance && (
            <p className="text-red-600 mt-2">{errors.has_health_insurance}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Wizard Component
export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const progress = (step / TOTAL_STEPS) * 100;

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user changes value
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      // Optional fields, just validate email format if provided
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (step === 2) {
      if (!data.age_range) newErrors.age_range = 'Please select your age range';
      if (!data.zip_code || data.zip_code.length < 5) newErrors.zip_code = 'Please enter a valid ZIP code';
      if (!data.household_size) newErrors.household_size = 'Please select household size';
    }

    if (step === 3) {
      if (!data.monthly_income_range) newErrors.monthly_income_range = 'Please select your income range';
      if (!data.employment_status) newErrors.employment_status = 'Please select your employment status';
    }

    if (step === 4) {
      if (!data.veteran) newErrors.veteran = 'Please answer this question';
      if (!data.disability) newErrors.disability = 'Please answer this question';
      if (!data.student) newErrors.student = 'Please answer this question';
      if (!data.pregnant_or_children) newErrors.pregnant_or_children = 'Please answer this question';
    }

    if (step === 5) {
      if (!data.housing_status) newErrors.housing_status = 'Please select your housing situation';
      if (!data.has_health_insurance) newErrors.has_health_insurance = 'Please answer this question';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < TOTAL_STEPS) {
        setStep(step + 1);
        window.scrollTo(0, 0);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      // Redirect to results page
      router.push(`/results?id=${result.id}`);
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepBasicInfo data={data} onChange={handleChange} errors={errors} />;
      case 2:
        return <StepDemographics data={data} onChange={handleChange} errors={errors} />;
      case 3:
        return <StepFinancial data={data} onChange={handleChange} errors={errors} />;
      case 4:
        return <StepSituation data={data} onChange={handleChange} errors={errors} />;
      case 5:
        return <StepHousing data={data} onChange={handleChange} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F1E9]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8DDCF]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D08C60] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#3D3530]">BenefitBuddy</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-[#6B625A] hover:text-[#3D3530]">Exit</Button>
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[#E8DDCF] py-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="border-2 border-[#E8DDCF] bg-white">
          <CardContent className="p-6 md:p-8">
            {renderStep()}

            {submitError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {submitError}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#E8DDCF]">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                size="lg"
                className="h-14 px-6 text-lg border-[#E8DDCF] text-[#6B625A] hover:bg-[#FFF8F0]"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                size="lg"
                className="h-14 px-8 text-lg bg-[#D08C60] hover:bg-[#B76E45] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : step === TOTAL_STEPS ? (
                  <>
                    <CheckCircle className="mr-2 w-5 h-5" />
                    See My Results
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Message */}
        <p className="text-center text-muted text-sm mt-6">
          🔒 Your information is private and secure. We never sell your data.
        </p>
      </main>
    </div>
  );
}
