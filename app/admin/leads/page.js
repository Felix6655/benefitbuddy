'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart,
  Loader2,
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  User,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Download,
  PhoneCall,
  Trophy,
  XCircle,
} from 'lucide-react';

function AdminLeadsContent() {
  const searchParams = useSearchParams();
  const adminKey = searchParams.get('key');
  
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  const fetchLeads = async () => {
    if (!adminKey) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/leads?key=${encodeURIComponent(adminKey)}`);
      
      if (response.status === 401) {
        setIsAuthorized(false);
        setError('Invalid admin key');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setIsAuthorized(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (!adminKey) return;
    try {
      const response = await fetch(`/api/admin/agents?key=${encodeURIComponent(adminKey)}`);
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchAgents();
  }, [adminKey]);

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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return { bg: '#E3F2FD', color: '#1565C0' };
      case 'contacted': return { bg: '#E8F5E9', color: '#2E7D32' };
      case 'converted': return { bg: '#F3E5F5', color: '#7B1FA2' };
      case 'lost': return { bg: '#FFEBEE', color: '#C62828' };
      default: return { bg: '#ECEFF1', color: '#546E7A' };
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'hot': return { bg: '#FFEBEE', color: '#C62828', icon: '🔥' };
      case 'warm': return { bg: '#FFF3E0', color: '#E65100', icon: '☀️' };
      case 'cold': return { bg: '#E3F2FD', color: '#1565C0', icon: '❄️' };
      default: return { bg: '#ECEFF1', color: '#546E7A', icon: '•' };
    }
  };

  // Filter leads by priority and agent
  const filteredLeads = leads.filter(lead => {
    // Priority filter
    if (priorityFilter !== 'all' && lead.lead_priority !== priorityFilter) {
      return false;
    }
    // Agent filter
    if (agentFilter === 'unassigned') {
      return !lead.assigned_agent;
    }
    if (agentFilter !== 'all' && lead.assigned_agent?.id !== agentFilter) {
      return false;
    }
    return true;
  });

  // Count leads by priority
  const priorityCounts = {
    all: leads.length,
    hot: leads.filter(l => l.lead_priority === 'hot').length,
    warm: leads.filter(l => l.lead_priority === 'warm').length,
    cold: leads.filter(l => l.lead_priority === 'cold').length,
  };

  // Update lead status
  const updateLeadStatus = async (leadId, newStatus) => {
    setUpdatingId(leadId);
    try {
      const response = await fetch(`/api/admin/leads?key=${encodeURIComponent(adminKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus, status_updated_at: new Date().toISOString() }
            : lead
        )
      );
    } catch (err) {
      alert('Error updating lead status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Copy lead info to clipboard
  const copyLeadInfo = async (lead) => {
    const info = [
      `Name: ${lead.full_name}`,
      `Phone: ${formatPhone(lead.phone_display || lead.phone)}`,
      `ZIP: ${lead.zip_code}`,
      lead.state ? `State: ${lead.state}` : null,
      `Priority: ${(lead.lead_priority || 'cold').toUpperCase()}`,
      '---',
      lead.turning_65_soon !== undefined ? `Turning 65 Soon: ${lead.turning_65_soon ? 'Yes' : 'No'}` : null,
      lead.has_medicare_now !== undefined ? `Has Medicare: ${lead.has_medicare_now ? 'Yes' : 'No'}` : null,
      lead.wants_call_today !== undefined ? `Wants Call Today: ${lead.wants_call_today ? 'Yes' : 'No'}` : null,
      '---',
      `Source: ${lead.source || 'medicare_cta'}`,
      lead.matched_programs?.length > 0 
        ? `Programs: ${lead.matched_programs.join(', ')}` 
        : null,
      `Created: ${formatDate(lead.created_at)}`,
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(info);
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = info;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Export leads to CSV
  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert('No leads to export');
      return;
    }

    // CSV headers
    const headers = ['created_at', 'lead_priority', 'source', 'full_name', 'phone', 'zip_code', 'state', 'turning_65_soon', 'has_medicare_now', 'wants_call_today', 'matched_programs', 'status'];
    
    // Build CSV rows
    const rows = filteredLeads.map(lead => [
      lead.created_at || '',
      lead.lead_priority || 'cold',
      lead.source || 'medicare_cta',
      lead.full_name || '',
      formatPhone(lead.phone_display || lead.phone),
      lead.zip_code || '',
      lead.state || '',
      lead.turning_65_soon === true ? 'Yes' : (lead.turning_65_soon === false ? 'No' : ''),
      lead.has_medicare_now === true ? 'Yes' : (lead.has_medicare_now === false ? 'No' : ''),
      lead.wants_call_today === true ? 'Yes' : (lead.wants_call_today === false ? 'No' : ''),
      (lead.matched_programs || []).join('; '),
      lead.status || 'new',
    ]);

    // Escape CSV values
    const escapeCSV = (value) => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `benefitbuddy_leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Unauthorized state
  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F1E9' }}>
        <Card 
          className="max-w-md w-full border-2"
          style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}
        >
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#D08C60' }} />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#3D3530' }}>
              Access Denied
            </h1>
            <p className="text-lg mb-6" style={{ color: '#6B625A' }}>
              {error || 'Please provide a valid admin key to access this page.'}
            </p>
            <p className="text-sm" style={{ color: '#6B625A' }}>
              URL format: /admin/leads?key=YOUR_ADMIN_KEY
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E9' }}>
      {/* Header */}
      <header 
        className="w-full"
        style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin?key=${adminKey}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#D08C60' }}
              >
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold" style={{ color: '#3D3530' }}>Leads Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={loading || leads.length === 0}
              style={{ borderColor: '#D08C60', color: '#D08C60' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              disabled={loading}
              style={{ borderColor: '#E8DDCF' }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Priority Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('all')}
            style={priorityFilter === 'all' 
              ? { backgroundColor: '#D08C60', color: 'white' } 
              : { borderColor: '#E8DDCF' }
            }
          >
            All ({priorityCounts.all})
          </Button>
          <Button
            variant={priorityFilter === 'hot' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('hot')}
            style={priorityFilter === 'hot' 
              ? { backgroundColor: '#C62828', color: 'white' } 
              : { borderColor: '#FFCDD2', color: '#C62828' }
            }
          >
            🔥 Hot ({priorityCounts.hot})
          </Button>
          <Button
            variant={priorityFilter === 'warm' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('warm')}
            style={priorityFilter === 'warm' 
              ? { backgroundColor: '#E65100', color: 'white' } 
              : { borderColor: '#FFE0B2', color: '#E65100' }
            }
          >
            ☀️ Warm ({priorityCounts.warm})
          </Button>
          <Button
            variant={priorityFilter === 'cold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('cold')}
            style={priorityFilter === 'cold' 
              ? { backgroundColor: '#1565C0', color: 'white' } 
              : { borderColor: '#BBDEFB', color: '#1565C0' }
            }
          >
            ❄️ Cold ({priorityCounts.cold})
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E3F2FD' }}
              >
                <User className="w-6 h-6" style={{ color: '#1565C0' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#6B625A' }}>Total Leads</p>
                <p className="text-2xl font-bold" style={{ color: '#3D3530' }}>{leads.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#C62828' }}>Hot Leads</p>
                <p className="text-2xl font-bold" style={{ color: '#C62828' }}>{priorityCounts.hot}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FFF8F0' }}
              >
                <Clock className="w-6 h-6" style={{ color: '#D08C60' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#6B625A' }}>New (Pending)</p>
                <p className="text-2xl font-bold" style={{ color: '#3D3530' }}>
                  {leads.filter(l => l.status === 'new').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E8F5E9' }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: '#4CAF50' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#6B625A' }}>Today</p>
                <p className="text-2xl font-bold" style={{ color: '#3D3530' }}>
                  {leads.filter(l => {
                    const today = new Date().toDateString();
                    return new Date(l.created_at).toDateString() === today;
                  }).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#3D3530' }}>
          {priorityFilter === 'all' 
            ? `Medicare Leads (${filteredLeads.length})` 
            : `${priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)} Leads (${filteredLeads.length})`
          }
        </h1>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#D08C60' }} />
            <p style={{ color: '#6B625A' }}>Loading leads...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <Card 
            className="border-2"
            style={{ borderColor: '#FFCDD2', backgroundColor: '#FFEBEE' }}
          >
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#C62828' }} />
              <p style={{ color: '#C62828' }}>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && filteredLeads.length === 0 && (
          <Card 
            className="border-2"
            style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}
          >
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 mx-auto mb-4" style={{ color: '#E8DDCF' }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: '#3D3530' }}>
                {priorityFilter === 'all' ? 'No Leads Yet' : `No ${priorityFilter} Leads`}
              </h2>
              <p style={{ color: '#6B625A' }}>
                {priorityFilter === 'all' 
                  ? 'Medicare leads will appear here when users submit the "Get Help Near Me" form.'
                  : `No leads with "${priorityFilter}" priority found. Try a different filter.`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Leads table */}
        {!loading && !error && filteredLeads.length > 0 && (
          <div className="space-y-4">
            {filteredLeads.map((lead) => {
              const statusStyle = getStatusColor(lead.status);
              const priorityStyle = getPriorityColor(lead.lead_priority);
              return (
                <Card 
                  key={lead.id}
                  className="border-2 overflow-hidden"
                  style={{ 
                    borderColor: lead.lead_priority === 'hot' ? '#FFCDD2' : '#E8DDCF', 
                    backgroundColor: '#FFFFFF',
                    borderLeftWidth: lead.lead_priority === 'hot' ? '4px' : '2px',
                    borderLeftColor: lead.lead_priority === 'hot' ? '#C62828' : (lead.lead_priority === 'warm' ? '#E65100' : '#E8DDCF'),
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Main info */}
                      <div className="flex-1 p-4 md:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold" style={{ color: '#3D3530' }}>
                                {lead.full_name}
                              </h3>
                              {/* Priority Badge */}
                              <span 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
                                style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.color }}
                              >
                                {priorityStyle.icon} {lead.lead_priority?.toUpperCase() || 'COLD'}
                              </span>
                              {/* Assigned Agent Badge */}
                              {lead.assigned_agent && (
                                <span 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                  style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                                >
                                  → {lead.assigned_agent.name}
                                </span>
                              )}
                            </div>
                            <span 
                              className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                            >
                              {lead.status?.toUpperCase() || 'NEW'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" style={{ color: '#D08C60' }} />
                            <a 
                              href={`tel:${lead.phone}`}
                              className="font-medium hover:underline"
                              style={{ color: '#3D3530' }}
                            >
                              {formatPhone(lead.phone_display || lead.phone)}
                            </a>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" style={{ color: '#D08C60' }} />
                            <span style={{ color: '#6B625A' }}>
                              {lead.zip_code}
                              {lead.state && `, ${lead.state}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" style={{ color: '#D08C60' }} />
                            <span style={{ color: '#6B625A' }}>
                              {formatDate(lead.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Assigned Agent Info */}
                        {lead.assigned_agent && (
                          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8DDCF' }}>
                            <p className="text-sm mb-2 font-medium" style={{ color: '#6B625A' }}>Assigned Agent:</p>
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="font-medium" style={{ color: '#3D3530' }}>
                                {lead.assigned_agent.name}
                              </span>
                              {lead.assigned_agent.phone && (
                                <a href={`tel:${lead.assigned_agent.phone}`} className="flex items-center gap-1 text-sm hover:underline" style={{ color: '#D08C60' }}>
                                  <Phone className="w-3 h-3" />
                                  {lead.assigned_agent.phone}
                                </a>
                              )}
                              {lead.delivery?.agent_webhook_sent && (
                                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                                  ✓ Webhook delivered
                                </span>
                              )}
                              {lead.delivery?.agent_webhook_error && (
                                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>
                                  ✗ Webhook failed
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pre-qualifying Answers */}
                        {(lead.turning_65_soon !== undefined || lead.has_medicare_now !== undefined || lead.wants_call_today !== undefined) && (
                          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8DDCF' }}>
                            <p className="text-sm mb-2 font-medium" style={{ color: '#6B625A' }}>Pre-Qualifying Answers:</p>
                            <div className="flex flex-wrap gap-3">
                              {lead.turning_65_soon !== undefined && (
                                <span 
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{ 
                                    backgroundColor: lead.turning_65_soon ? '#E8F5E9' : '#FFEBEE',
                                    color: lead.turning_65_soon ? '#2E7D32' : '#C62828'
                                  }}
                                >
                                  Turning 65: {lead.turning_65_soon ? 'Yes' : 'No'}
                                </span>
                              )}
                              {lead.has_medicare_now !== undefined && (
                                <span 
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{ 
                                    backgroundColor: lead.has_medicare_now ? '#E3F2FD' : '#FFF8F0',
                                    color: lead.has_medicare_now ? '#1565C0' : '#D08C60'
                                  }}
                                >
                                  Has Medicare: {lead.has_medicare_now ? 'Yes' : 'No'}
                                </span>
                              )}
                              {lead.wants_call_today !== undefined && (
                                <span 
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{ 
                                    backgroundColor: lead.wants_call_today ? '#E8F5E9' : '#ECEFF1',
                                    color: lead.wants_call_today ? '#2E7D32' : '#546E7A'
                                  }}
                                >
                                  Wants Call Today: {lead.wants_call_today ? 'Yes ⚡' : 'No'}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Matched programs */}
                        {lead.matched_programs && lead.matched_programs.length > 0 && (
                          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E8DDCF' }}>
                            <p className="text-sm mb-2" style={{ color: '#6B625A' }}>Matched Programs:</p>
                            <div className="flex flex-wrap gap-2">
                              {lead.matched_programs.map((prog, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ backgroundColor: '#FFF8F0', color: '#D08C60' }}
                                >
                                  {prog}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid #E8DDCF' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyLeadInfo(lead)}
                            className="h-8"
                            style={{ borderColor: '#E8DDCF' }}
                          >
                            {copiedId === lead.id ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" style={{ color: '#4CAF50' }} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 mr-1.5" />
                                Copy Lead
                              </>
                            )}
                          </Button>
                          
                          {lead.status !== 'contacted' && lead.status !== 'converted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateLeadStatus(lead.id, 'contacted')}
                              disabled={updatingId === lead.id}
                              className="h-8"
                              style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                            >
                              {updatingId === lead.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Mark Contacted
                            </Button>
                          )}
                          
                          {lead.status !== 'converted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateLeadStatus(lead.id, 'converted')}
                              disabled={updatingId === lead.id}
                              className="h-8"
                              style={{ borderColor: '#7B1FA2', color: '#7B1FA2' }}
                            >
                              {updatingId === lead.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <Trophy className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Mark Converted
                            </Button>
                          )}

                          {lead.status !== 'lost' && lead.status !== 'converted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateLeadStatus(lead.id, 'lost')}
                              disabled={updatingId === lead.id}
                              className="h-8"
                              style={{ borderColor: '#C62828', color: '#C62828' }}
                            >
                              {updatingId === lead.id ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              Mark Lost
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Source badge */}
                      <div 
                        className="px-4 py-2 md:px-6 md:py-6 flex items-center justify-center"
                        style={{ backgroundColor: '#FFF8F0', borderLeft: '1px solid #E8DDCF' }}
                      >
                        <span className="text-xs font-medium" style={{ color: '#6B625A' }}>
                          {lead.source || 'medicare_cta'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Loading fallback for Suspense
function LeadsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E9' }}>
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#D08C60' }} />
        <p className="text-xl" style={{ color: '#6B625A' }}>Loading leads dashboard...</p>
      </div>
    </div>
  );
}

// Export default with Suspense wrapper
export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<LeadsLoading />}>
      <AdminLeadsContent />
    </Suspense>
  );
}
