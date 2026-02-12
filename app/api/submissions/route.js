import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSubmission } from '@/lib/validation';
import { matchBenefits } from '@/lib/benefits';
import { rateLimit } from '@/lib/rateLimit';
import { v4 as uuidv4 } from 'uuid';

// POST /api/submissions - Create new submission
export async function POST(request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    const rateLimitResult = rateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    
    const data = await request.json();
    
    // Honeypot check - if 'website' field is filled, it's likely a bot
    if (data.website && data.website.length > 0) {
      // Silently accept but don't save
      return NextResponse.json({ id: 'blocked', matched_benefits: [] });
    }
    
    // Validate input
    const validation = validateSubmission(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const validData = validation.data;
    
    // Match benefits based on answers
    const matchedBenefits = matchBenefits(validData);
    
    // Create submission document
    const submission = {
      id: uuidv4(),
      ...validData,
      matched_benefits: matchedBenefits.map(b => b.id),
      created_at: new Date().toISOString(),
      status: 'new',
    };
    
    // Save to database
    const collection = await getCollection('submissions');
    await collection.insertOne(submission);
    
    // Forward to n8n webhook if configured (non-blocking)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      // Fire and forget - don't await
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'benefitbuddy',
          submission: {
            id: submission.id,
            age_range: submission.age_range,
            zip_code: submission.zip_code,
            matched_benefits: submission.matched_benefits,
            created_at: submission.created_at,
            // Don't send PII to webhook by default
          },
        }),
      }).catch(err => {
        console.error('n8n webhook error:', err.message);
      });
    }
    
    return NextResponse.json({
      id: submission.id,
      matched_benefits: matchedBenefits.map(b => b.id),
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
