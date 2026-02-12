import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

// Verify admin key
function verifyAdminKey(request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false;
  
  const headerKey = request.headers.get('x-admin-key');
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('adminKey');
  
  return headerKey === adminKey || queryKey === adminKey;
}

// GET /api/admin/export - Export submissions as CSV
export async function GET(request) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const collection = await getCollection('submissions');
    const submissions = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    // CSV headers
    const headers = [
      'ID',
      'Created At',
      'Full Name',
      'Email',
      'Phone',
      'Age Range',
      'ZIP Code',
      'Household Size',
      'Monthly Income',
      'Employment Status',
      'Veteran',
      'Disability',
      'Student',
      'Pregnant/Children',
      'Housing Status',
      'Has Health Insurance',
      'Matched Benefits',
      'Status',
    ];
    
    // Convert to CSV rows
    const rows = submissions.map(s => [
      s.id,
      s.created_at,
      s.full_name || '',
      s.email || '',
      s.phone || '',
      s.age_range,
      s.zip_code,
      s.household_size,
      s.monthly_income_range,
      s.employment_status,
      s.veteran,
      s.disability,
      s.student,
      s.pregnant_or_children,
      s.housing_status,
      s.has_health_insurance,
      (s.matched_benefits || []).join('; '),
      s.status,
    ]);
    
    // Build CSV content
    const escapeCSV = (val) => {
      const str = String(val || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\n');
    
    // Return as downloadable CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="benefitbuddy-submissions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
    
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
