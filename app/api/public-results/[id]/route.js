import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { matchBenefits, BENEFITS } from '@/lib/benefits';

// GET /api/public-results/[id] - Get results for public display (no PII)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('submissions');
    const submission = await collection.findOne({ id });
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Results not found' },
        { status: 404 }
      );
    }
    
    // Get matched benefits with full details
    const matchedBenefitIds = submission.matched_benefits || [];
    const matchedBenefits = BENEFITS.filter(b => matchedBenefitIds.includes(b.id));
    
    // Return only non-PII data for public results page
    return NextResponse.json({
      id: submission.id,
      age_range: submission.age_range,
      zip_code: submission.zip_code,
      household_size: submission.household_size,
      matched_benefits: matchedBenefits.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        color: b.color,
        reason: b.reason,
        nextSteps: b.nextSteps,
        officialLink: b.officialLink,
      })),
      created_at: submission.created_at,
    });
    
  } catch (error) {
    console.error('Public results error:', error);
    return NextResponse.json(
      { error: 'Unable to load results' },
      { status: 500 }
    );
  }
}
