'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
  MapPin,
  Users,
  DollarSign,
  Home,
  HandHeart,
  ShieldCheck,
} from 'lucide-react';

const TOTAL_STEPS = 5;
const STORAGE_KEY = 'benefitbuddy_quiz';

// US States list
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' },
];

// Trust badge component shown on every step
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

// Step 1: Location
function StepLocation({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#FFF8F0' }}
        >
          <MapPin className="w-8 h-8" style={{ color: '#D08C60' }} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#3D3530' }}>
          Where do you live?
        </h2>
        <p className="text-lg" style={{ color: '#6B625A' }}>
          Benefits vary by location. This helps us find programs in your area.
        </p>
      </div>

      <TrustBadge />

      <div className="space-y-6">
        <div>
          <Label htmlFor="zip_code" className="text-lg font-medium" style={{ color: '#3D3530' }}>
            ZIP Code
          </Label>
          <Input
            id="zip_code"
            value={data.zip_code || ''}
            onChange={(e) => onChange('zip_code', e.target.value)}
            placeholder="Enter your ZIP code (e.g., 12345)"
            className="mt-2 h-14 text-lg"
            style={{ borderColor: '#E8DDCF' }}
            maxLength={10}
          />
        </div>

        <div>
          <Label htmlFor="state" className="text-lg font-medium" style={{ color: '#3D3530' }}>
            State
          </Label>
          <Select
            value={data.state || ''}
            onValueChange={(value) => onChange('state', value)}
          >
            <SelectTrigger className="mt-2 h-14 text-lg" style={{ borderColor: '#E8DDCF' }}>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value} className="text-lg">
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// Step 2: Household
function StepHousehold({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#FFF8F0' }}
        >
          <Users className="w-8 h-8" style={{ color: '#D08C60' }} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#3D3530' }}>
          Tell us about your household
        </h2>
        <p className="text-lg" style={{ color: '#6B625A' }}>
          This helps determine which programs you may qualify for.
        </p>
      </div>

      <TrustBadge />

      <div className="space-y-6">
        <div>
          <Label htmlFor="household_size" className="text-lg font-medium" style={{ color: '#3D3530' }}>
            How many people live in your household?
          </Label>
          <p className="text-base mt-1 mb-2" style={{ color: '#6B625A' }}>Including yourself</p>
          <Select
            value={data.household_size || ''}
            onValueChange={(value) => onChange('household_size', value)}
          >
            <SelectTrigger className="h-14 text-lg" style={{ borderColor: '#E8DDCF' }}>
              <SelectValue placeholder="Select household size" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={String(num)} className="text-lg">
                  {num} {num === 1 ? 'person' : 'people'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-lg font-medium mb-3 block" style={{ color: '#3D3530' }}>
            What is your age range?
          </Label>
          <RadioGroup
            value={data.age_range || ''}
            onValueChange={(value) => onChange('age_range', value)}
            className="space-y-3"
          >
            {[
              { value: 'under_18', label: 'Under 18' },
              { value: '18_64', label: '18 – 64' },
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
                  className="flex items-center p-4 rounded-lg cursor-pointer text-lg font-medium transition-all"
                  style={{
                    backgroundColor: data.age_range === option.value ? '#FFF8F0' : '#FFFFFF',
                    border: `2px solid ${data.age_range === option.value ? '#D08C60' : '#E8DDCF'}`,
                    color: '#3D3530',
                  }}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

// Step 3: Income
function StepIncome({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#FFF8F0' }}
        >
          <DollarSign className="w-8 h-8" style={{ color: '#D08C60' }} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#3D3530' }}>
          About your income
        </h2>
        <p className="text-lg" style={{ color: '#6B625A' }}>
          Many programs are based on income. An estimate is fine.
        </p>
      </div>

      <TrustBadge />

      <div className="space-y-6">
        <div>
          <Label className="text-lg font-medium mb-3 block" style={{ color: '#3D3530' }}>
            How would you like to enter your income?
          </Label>
          <RadioGroup
            value={data.income_type || 'monthly'}
            onValueChange={(value) => onChange('income_type', value)}
            className="flex gap-4"
          >
            {[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ].map((option) => (
              <div key={option.value} className="flex-1">
                <RadioGroupItem
                  value={option.value}
                  id={`income_type_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`income_type_${option.value}`}
                  className="flex items-center justify-center p-4 rounded-lg cursor-pointer text-lg font-medium transition-all"
                  style={{
                    backgroundColor: data.income_type === option.value ? '#FFF8F0' : '#FFFFFF',
                    border: `2px solid ${data.income_type === option.value ? '#D08C60' : '#E8DDCF'}`,
                    color: '#3D3530',
                  }}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="income_amount" className="text-lg font-medium" style={{ color: '#3D3530' }}>
            {data.income_type === 'yearly' ? 'Yearly' : 'Monthly'} household income (optional)
          </Label>
          <p className="text-base mt-1 mb-2" style={{ color: '#6B625A' }}>
            Before taxes. Include all income sources.
          </p>
          <div className="relative">
            <span 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium"
              style={{ color: '#6B625A' }}
            >
              $
            </span>
            <Input
              id="income_amount"
              type="number"
              value={data.income_amount || ''}
              onChange={(e) => onChange('income_amount', e.target.value)}
              placeholder="0"
              className="h-14 text-lg pl-8"
              style={{ borderColor: '#E8DDCF' }}
            />
          </div>
          <p className="text-sm mt-2" style={{ color: '#6B625A' }}>
            Leave blank if you prefer not to answer
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 4: Situation
function StepSituation({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#FFF8F0' }}
        >
          <Home className="w-8 h-8" style={{ color: '#D08C60' }} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#3D3530' }}>
          Your situation
        </h2>
        <p className="text-lg" style={{ color: '#6B625A' }}>
          These help us find additional programs you may qualify for.
        </p>
      </div>

      <TrustBadge />

      <div className="space-y-6">
        <div>
          <Label className="text-lg font-medium mb-3 block" style={{ color: '#3D3530' }}>
            Do you rent or own your home?
          </Label>
          <RadioGroup
            value={data.housing_status || ''}
            onValueChange={(value) => onChange('housing_status', value)}
            className="flex gap-4"
          >
            {[
              { value: 'rent', label: 'I rent' },
              { value: 'own', label: 'I own' },
            ].map((option) => (
              <div key={option.value} className="flex-1">
                <RadioGroupItem
                  value={option.value}
                  id={`housing_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`housing_${option.value}`}
                  className="flex items-center justify-center p-4 rounded-lg cursor-pointer text-lg font-medium transition-all"
                  style={{
                    backgroundColor: data.housing_status === option.value ? '#FFF8F0' : '#FFFFFF',
                    border: `2px solid ${data.housing_status === option.value ? '#D08C60' : '#E8DDCF'}`,
                    color: '#3D3530',
                  }}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-lg font-medium mb-3 block" style={{ color: '#3D3530' }}>
            Do you have a disability?
          </Label>
          <RadioGroup
            value={data.has_disability || ''}
            onValueChange={(value) => onChange('has_disability', value)}
            className="flex gap-4"
          >
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ].map((option) => (
              <div key={option.value} className="flex-1">
                <RadioGroupItem
                  value={option.value}
                  id={`disability_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`disability_${option.value}`}
                  className="flex items-center justify-center p-4 rounded-lg cursor-pointer text-lg font-medium transition-all"
                  style={{
                    backgroundColor: data.has_disability === option.value ? '#FFF8F0' : '#FFFFFF',
                    border: `2px solid ${data.has_disability === option.value ? '#D08C60' : '#E8DDCF'}`,
                    color: '#3D3530',
                  }}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-lg font-medium mb-3 block" style={{ color: '#3D3530' }}>
            Are you a veteran?
          </Label>
          <RadioGroup
            value={data.is_veteran || ''}
            onValueChange={(value) => onChange('is_veteran', value)}
            className="flex gap-4"
          >
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ].map((option) => (
              <div key={option.value} className="flex-1">
                <RadioGroupItem
                  value={option.value}
                  id={`veteran_${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`veteran_${option.value}`}
                  className="flex items-center justify-center p-4 rounded-lg cursor-pointer text-lg font-medium transition-all"
                  style={{
                    backgroundColor: data.is_veteran === option.value ? '#FFF8F0' : '#FFFFFF',
                    border: `2px solid ${data.is_veteran === option.value ? '#D08C60' : '#E8DDCF'}`,
                    color: '#3D3530',
                  }}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

// Step 5: Needs
function StepNeeds({ data, onChange }) {
  const needs = [
    { id: 'food_help', label: 'Food help', icon: '🛒', description: 'Groceries, meal programs' },
    { id: 'healthcare', label: 'Healthcare', icon: '🏥', description: 'Insurance, medical costs' },
    { id: 'housing', label: 'Housing', icon: '🏠', description: 'Rent, finding a place to live' },
    { id: 'utilities', label: 'Utilities', icon: '💡', description: 'Electric, gas, water bills' },
    { id: 'cash_assistance', label: 'Cash assistance', icon: '💵', description: 'Direct financial help' },
  ];

  const toggleNeed = (needId) => {
    const currentNeeds = data.needs || [];
    const newNeeds = currentNeeds.includes(needId)
      ? currentNeeds.filter((n) => n !== needId)
      : [...currentNeeds, needId];
    onChange('needs', newNeeds);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#FFF8F0' }}
        >
          <HandHeart className="w-8 h-8" style={{ color: '#D08C60' }} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#3D3530' }}>
          What kind of help do you need?
        </h2>
        <p className="text-lg" style={{ color: '#6B625A' }}>
          Select all that apply. We'll find relevant programs for you.
        </p>
      </div>

      <TrustBadge />

      <div className="space-y-3">
        {needs.map((need) => {
          const isSelected = (data.needs || []).includes(need.id);
          return (
            <div
              key={need.id}
              onClick={() => toggleNeed(need.id)}
              className="flex items-center p-4 rounded-lg cursor-pointer transition-all"
              style={{
                backgroundColor: isSelected ? '#FFF8F0' : '#FFFFFF',
                border: `2px solid ${isSelected ? '#D08C60' : '#E8DDCF'}`,
              }}
            >
              <Checkbox
                id={need.id}
                checked={isSelected}
                onCheckedChange={() => toggleNeed(need.id)}
                className="w-6 h-6 mr-4"
                style={{ borderColor: '#D08C60' }}
              />
              <span className="text-2xl mr-4">{need.icon}</span>
              <div className="flex-1">
                <span className="text-lg font-medium block" style={{ color: '#3D3530' }}>
                  {need.label}
                </span>
                <span className="text-base" style={{ color: '#6B625A' }}>
                  {need.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main Wizard Component
export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    income_type: 'monthly',
    needs: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save data to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [data]);

  const progress = (step / TOTAL_STEPS) * 100;

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
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
    
    try {
      // Transform data for API
      const submissionData = {
        zip_code: data.zip_code || '',
        state: data.state || '',
        household_size: data.household_size || '1',
        age_range: data.age_range || '18_64',
        income_type: data.income_type || 'monthly',
        income_amount: data.income_amount || '',
        housing_status: data.housing_status || 'rent',
        disability: data.has_disability || 'no',
        veteran: data.is_veteran || 'no',
        needs: data.needs || [],
        // Map to existing API fields
        monthly_income_range: data.income_amount 
          ? (parseInt(data.income_amount) < 1000 ? 'under_1000' 
            : parseInt(data.income_amount) < 2000 ? '1000_2000'
            : parseInt(data.income_amount) < 3000 ? '2000_3000'
            : parseInt(data.income_amount) < 4000 ? '3000_4000'
            : '4000_plus')
          : '2000_3000',
        employment_status: 'employed',
        student: 'no',
        pregnant_or_children: 'no',
        has_health_insurance: data.needs?.includes('healthcare') ? 'no' : 'yes',
      };

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      // Navigate to results
      router.push(`/results?id=${result.id}`);
    } catch (error) {
      console.error('Submission error:', error);
      // Still navigate to results even if API fails
      router.push('/results');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepLocation data={data} onChange={handleChange} />;
      case 2:
        return <StepHousehold data={data} onChange={handleChange} />;
      case 3:
        return <StepIncome data={data} onChange={handleChange} />;
      case 4:
        return <StepSituation data={data} onChange={handleChange} />;
      case 5:
        return <StepNeeds data={data} onChange={handleChange} />;
      default:
        return null;
    }
  };

  const stepIcons = [
    { icon: MapPin, label: 'Location' },
    { icon: Users, label: 'Household' },
    { icon: DollarSign, label: 'Income' },
    { icon: Home, label: 'Situation' },
    { icon: HandHeart, label: 'Needs' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E9' }}>
      {/* Header */}
      <header className="w-full" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#D08C60' }}
            >
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#3D3530' }}>BenefitBuddy</span>
          </Link>
          <Link href="/">
            <Button 
              variant="ghost" 
              className="text-base"
              style={{ color: '#6B625A' }}
            >
              Exit
            </Button>
          </Link>
        </div>
      </header>

      {/* Progress Section */}
      <div className="w-full py-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}>
        <div className="max-w-3xl mx-auto px-4">
          {/* Step indicators */}
          <div className="flex justify-between mb-4">
            {stepIcons.map((item, index) => {
              const Icon = item.icon;
              const isActive = step === index + 1;
              const isCompleted = step > index + 1;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all"
                    style={{
                      backgroundColor: isActive || isCompleted ? '#D08C60' : '#E8DDCF',
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Icon 
                        className="w-5 h-5" 
                        style={{ color: isActive ? '#FFFFFF' : '#6B625A' }} 
                      />
                    )}
                  </div>
                  <span 
                    className="text-xs font-medium hidden sm:block"
                    style={{ color: isActive ? '#D08C60' : '#6B625A' }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="flex justify-between text-sm mb-2" style={{ color: '#6B625A' }}>
            <span className="font-medium">Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card 
          className="border-2"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}
        >
          <CardContent className="p-6 md:p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div 
              className="flex justify-between mt-8 pt-6"
              style={{ borderTop: '1px solid #E8DDCF' }}
            >
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                size="lg"
                className="h-14 px-6 text-lg"
                style={{ 
                  borderColor: '#E8DDCF',
                  color: '#6B625A',
                  opacity: step === 1 ? 0.5 : 1,
                }}
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                size="lg"
                className="h-14 px-8 text-lg text-white"
                style={{ backgroundColor: '#D08C60' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B76E45'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D08C60'}
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
        <p className="text-center text-sm mt-6" style={{ color: '#6B625A' }}>
          🔒 Your information is private and secure. We never sell your data.
        </p>
      </main>
    </div>
  );
}
