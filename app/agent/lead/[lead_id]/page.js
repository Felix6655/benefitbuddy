'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Loader2,
  Phone,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Shield,
} from 'lucide-react';

export default function AgentLeadReceiptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.lead_id;
  const token = searchParams.get('token');

  const [lead, setLead] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId || !token) {
        setError('Missing lead ID or token');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/agent/lead/${leadId}?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch lead');
          setLoading(false);
          return;
        }

        setLead(data.lead);
        setAgent(data.agent);
      } catch (err) {
        setError('Failed to load lead data');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId, token]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format phone for display
  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'hot': return { bg: '#FFEBEE', color: '#C62828', icon: '🔥', label: 'HOT' };
      case 'warm': return { bg: '#FFF3E0', color: '#E65100', icon: '☀️', label: 'WARM' };
      case 'cold': return { bg: '#E3F2FD', color: '#1565C0', icon: '❄️', label: 'COLD' };
      default: return { bg: '#ECEFF1', color: '#546E7A', icon: '•', label: 'UNKNOWN' };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F1E9' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#D08C60' }} />
          <p className="text-xl" style={{ color: '#6B625A' }}>Loading lead information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F1E9' }}>
        <Card className="max-w-md w-full border-2" style={{ borderColor: '#FFCDD2', backgroundColor: '#FFFFFF' }}>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#C62828' }} />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#3D3530' }}>Access Denied</h1>
            <p className="text-lg" style={{ color: '#6B625A' }}>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priorityBadge = getPriorityBadge(lead?.lead_priority);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E9' }}>
      {/* Header */}
      <header className="w-full" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#D08C60' }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold" style={{ color: '#3D3530' }}>BenefitBuddy</h1>
              <p className="text-xs" style={{ color: '#6B625A' }}>Agent Lead Receipt</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#E8F5E9' }}>
            <Shield className="w-4 h-4" style={{ color: '#2E7D32' }} />
            <span className="text-xs font-medium" style={{ color: '#2E7D32' }}>Verified</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Agent Info */}
        {agent && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
            <p className="text-sm" style={{ color: '#1565C0' }}>
              Assigned to: <strong>{agent.name}</strong>
            </p>
          </div>
        )}

        {/* Lead Card */}
        <Card className="border-2" style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}>
          <CardContent className="p-6">
            {/* Header with name and priority */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-6 h-6" style={{ color: '#D08C60' }} />
                  <h2 className="text-2xl font-bold" style={{ color: '#3D3530' }}>
                    {lead?.full_name}
                  </h2>
                </div>
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                  style={{ backgroundColor: priorityBadge.bg, color: priorityBadge.color }}
                >
                  {priorityBadge.icon} {priorityBadge.label} LEAD
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                <Phone className="w-5 h-5" style={{ color: '#D08C60' }} />
                <div>
                  <p className="text-xs" style={{ color: '#6B625A' }}>Phone</p>
                  <a 
                    href={`tel:${lead?.phone}`}
                    className="text-lg font-bold hover:underline"
                    style={{ color: '#3D3530' }}
                  >
                    {formatPhone(lead?.phone)}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                <MapPin className="w-5 h-5" style={{ color: '#D08C60' }} />
                <div>
                  <p className="text-xs" style={{ color: '#6B625A' }}>Location</p>
                  <p className="text-lg font-bold" style={{ color: '#3D3530' }}>
                    {lead?.zip_code}{lead?.state && `, ${lead.state}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                <Calendar className="w-5 h-5" style={{ color: '#D08C60' }} />
                <div>
                  <p className="text-xs" style={{ color: '#6B625A' }}>Created</p>
                  <p className="text-lg font-bold" style={{ color: '#3D3530' }}>
                    {formatDate(lead?.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pre-Qualifying Answers */}
            <div className="pt-6" style={{ borderTop: '1px solid #E8DDCF' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: '#6B625A' }}>
                PRE-QUALIFYING ANSWERS
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F8F1E9' }}>
                  <span style={{ color: '#6B625A' }}>Turning 65 soon?</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ 
                      backgroundColor: lead?.turning_65_soon ? '#E8F5E9' : '#FFEBEE',
                      color: lead?.turning_65_soon ? '#2E7D32' : '#C62828'
                    }}
                  >
                    {lead?.turning_65_soon ? 'YES' : 'NO'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F8F1E9' }}>
                  <span style={{ color: '#6B625A' }}>Has Medicare now?</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ 
                      backgroundColor: lead?.has_medicare_now ? '#E8F5E9' : '#FFF3E0',
                      color: lead?.has_medicare_now ? '#2E7D32' : '#E65100'
                    }}
                  >
                    {lead?.has_medicare_now ? 'YES' : 'NO'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: lead?.wants_call_today ? '#E8F5E9' : '#F8F1E9' }}>
                  <span style={{ color: '#6B625A' }}>Wants call today?</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ 
                      backgroundColor: lead?.wants_call_today ? '#2E7D32' : '#ECEFF1',
                      color: lead?.wants_call_today ? '#FFFFFF' : '#546E7A'
                    }}
                  >
                    {lead?.wants_call_today ? '⚡ YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #E8DDCF' }}>
              <p className="text-xs" style={{ color: '#6B625A' }}>
                Lead ID: {lead?.id}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6B625A' }}>
                This is a secure, verified lead receipt from BenefitBuddy
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
