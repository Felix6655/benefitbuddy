'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Heart,
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  X,
  Check,
  Users,
  Globe,
  CreditCard,
  DollarSign,
} from 'lucide-react';

function AdminAgentsContent() {
  const searchParams = useSearchParams();
  const adminKey = searchParams.get('key');
  
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [creditModalAgentId, setCreditModalAgentId] = useState(null);
  const [customCredits, setCustomCredits] = useState('');
  const [updatingCredits, setUpdatingCredits] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    webhook_url: '',
    covered_zips: '',
    state: 'NV',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAgents = async () => {
    if (!adminKey) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/agents?key=${encodeURIComponent(adminKey)}`);
      
      if (response.status === 401) {
        setIsAuthorized(false);
        setError('Invalid admin key');
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch agents');

      const data = await response.json();
      setAgents(data.agents || []);
      setIsAuthorized(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [adminKey]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      webhook_url: '',
      covered_zips: '',
      state: 'NV',
    });
    setFormErrors({});
    setEditingId(null);
    setShowAddForm(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name is required (min 2 characters)';
    }
    if (!formData.covered_zips || formData.covered_zips.trim().length === 0) {
      errors.covered_zips = 'At least one ZIP code is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (formData.webhook_url && !formData.webhook_url.startsWith('http')) {
      errors.webhook_url = 'Webhook URL must start with http:// or https://';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const zipsArray = formData.covered_zips
        .split(/[,\s]+/)
        .map(z => z.trim())
        .filter(z => z.length >= 5);

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone || null,
        email: formData.email || null,
        webhook_url: formData.webhook_url || null,
        covered_zips: zipsArray,
        state: formData.state || 'NV',
      };

      const url = `/api/admin/agents?key=${encodeURIComponent(adminKey)}`;
      const method = editingId ? 'PATCH' : 'POST';
      
      if (editingId) {
        payload.id = editingId;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save agent');
      }

      await fetchAgents();
      resetForm();
    } catch (err) {
      setFormErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (agent) => {
    setFormData({
      name: agent.name,
      phone: agent.phone || '',
      email: agent.email || '',
      webhook_url: agent.webhook_url || '',
      covered_zips: (agent.covered_zips || []).join(', '),
      state: agent.state || 'NV',
    });
    setEditingId(agent.id);
    setShowAddForm(true);
  };

  const handleDelete = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(
        `/api/admin/agents?key=${encodeURIComponent(adminKey)}&id=${agentId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete agent');
      await fetchAgents();
    } catch (err) {
      alert('Error deleting agent: ' + err.message);
    }
  };

  const handleToggleActive = async (agent) => {
    try {
      const response = await fetch(`/api/admin/agents?key=${encodeURIComponent(adminKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agent.id, is_active: !agent.is_active }),
      });
      if (!response.ok) throw new Error('Failed to update agent');
      await fetchAgents();
    } catch (err) {
      alert('Error updating agent: ' + err.message);
    }
  };

  const handleAddCredits = async (agentId, amount) => {
    setUpdatingCredits(agentId);
    try {
      const response = await fetch(`/api/admin/agents?key=${encodeURIComponent(adminKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agentId, action: 'add_credits', amount }),
      });
      if (!response.ok) throw new Error('Failed to add credits');
      await fetchAgents();
    } catch (err) {
      alert('Error adding credits: ' + err.message);
    } finally {
      setUpdatingCredits(null);
    }
  };

  const handleSetCredits = async (agentId) => {
    const amount = parseInt(customCredits, 10);
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid number (0 or greater)');
      return;
    }
    setUpdatingCredits(agentId);
    try {
      const response = await fetch(`/api/admin/agents?key=${encodeURIComponent(adminKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agentId, action: 'set_credits', amount }),
      });
      if (!response.ok) throw new Error('Failed to set credits');
      await fetchAgents();
      setCreditModalAgentId(null);
      setCustomCredits('');
    } catch (err) {
      alert('Error setting credits: ' + err.message);
    } finally {
      setUpdatingCredits(null);
    }
  };

  // Unauthorized state
  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F1E9' }}>
        <Card className="max-w-md w-full border-2" style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#D08C60' }} />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#3D3530' }}>Access Denied</h1>
            <p className="text-lg mb-6" style={{ color: '#6B625A' }}>
              {error || 'Please provide a valid admin key.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E9' }}>
      {/* Header */}
      <header className="w-full" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDCF' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin?key=${adminKey}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D08C60' }}>
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold" style={{ color: '#3D3530' }}>Agent Management</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { resetForm(); setShowAddForm(true); }}
              style={{ borderColor: '#D08C60', color: '#D08C60' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAgents}
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
                <Users className="w-6 h-6" style={{ color: '#1565C0' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#6B625A' }}>Total Agents</p>
                <p className="text-2xl font-bold" style={{ color: '#3D3530' }}>{agents.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
                <Check className="w-6 h-6" style={{ color: '#4CAF50' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#2E7D32' }}>Active</p>
                <p className="text-2xl font-bold" style={{ color: '#2E7D32' }}>
                  {agents.filter(a => a.is_active).length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: '#FFFFFF', borderColor: '#E8DDCF' }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF8F0' }}>
                <MapPin className="w-6 h-6" style={{ color: '#D08C60' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#6B625A' }}>ZIPs Covered</p>
                <p className="text-2xl font-bold" style={{ color: '#3D3530' }}>
                  {new Set(agents.flatMap(a => a.covered_zips || [])).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8 border-2" style={{ borderColor: '#D08C60', backgroundColor: '#FFFFFF' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#3D3530' }}>
                  {editingId ? 'Edit Agent' : 'Add New Agent'}
                </h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors.submit && (
                  <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>
                    {formErrors.submit}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label style={{ color: '#3D3530' }}>Agent Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Smith"
                      className="mt-1"
                      style={{ borderColor: formErrors.name ? '#C62828' : '#E8DDCF' }}
                    />
                    {formErrors.name && <p className="text-sm mt-1" style={{ color: '#C62828' }}>{formErrors.name}</p>}
                  </div>

                  <div>
                    <Label style={{ color: '#3D3530' }}>State</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                      placeholder="NV"
                      className="mt-1"
                      maxLength={2}
                      style={{ borderColor: '#E8DDCF' }}
                    />
                  </div>

                  <div>
                    <Label style={{ color: '#3D3530' }}>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                      style={{ borderColor: '#E8DDCF' }}
                    />
                  </div>

                  <div>
                    <Label style={{ color: '#3D3530' }}>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="agent@example.com"
                      className="mt-1"
                      style={{ borderColor: formErrors.email ? '#C62828' : '#E8DDCF' }}
                    />
                    {formErrors.email && <p className="text-sm mt-1" style={{ color: '#C62828' }}>{formErrors.email}</p>}
                  </div>
                </div>

                <div>
                  <Label style={{ color: '#3D3530' }}>Covered ZIP Codes * (comma-separated)</Label>
                  <Input
                    value={formData.covered_zips}
                    onChange={(e) => setFormData(prev => ({ ...prev, covered_zips: e.target.value }))}
                    placeholder="89101, 89102, 89103, 89104, 89105"
                    className="mt-1"
                    style={{ borderColor: formErrors.covered_zips ? '#C62828' : '#E8DDCF' }}
                  />
                  {formErrors.covered_zips && <p className="text-sm mt-1" style={{ color: '#C62828' }}>{formErrors.covered_zips}</p>}
                  <p className="text-xs mt-1" style={{ color: '#6B625A' }}>
                    Enter Nevada ZIP codes this agent will handle (e.g., 89101, 89102)
                  </p>
                </div>

                <div>
                  <Label style={{ color: '#3D3530' }}>Agent Webhook URL (optional)</Label>
                  <Input
                    value={formData.webhook_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                    placeholder="https://hooks.example.com/agent-notification"
                    className="mt-1"
                    style={{ borderColor: formErrors.webhook_url ? '#C62828' : '#E8DDCF' }}
                  />
                  {formErrors.webhook_url && <p className="text-sm mt-1" style={{ color: '#C62828' }}>{formErrors.webhook_url}</p>}
                  <p className="text-xs mt-1" style={{ color: '#6B625A' }}>
                    HOT leads will be sent directly to this webhook
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="text-white"
                    style={{ backgroundColor: '#D08C60' }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingId ? 'Update Agent' : 'Add Agent'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#3D3530' }}>
          Agents ({agents.length})
        </h1>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#D08C60' }} />
            <p style={{ color: '#6B625A' }}>Loading agents...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && agents.length === 0 && (
          <Card className="border-2" style={{ borderColor: '#E8DDCF', backgroundColor: '#FFFFFF' }}>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#E8DDCF' }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: '#3D3530' }}>No Agents Yet</h2>
              <p style={{ color: '#6B625A' }}>Add agents to start routing HOT leads by ZIP code.</p>
            </CardContent>
          </Card>
        )}

        {/* Agents list */}
        {!loading && agents.length > 0 && (
          <div className="space-y-4">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="border-2 overflow-hidden"
                style={{ 
                  borderColor: agent.is_active ? '#E8DDCF' : '#FFCDD2',
                  backgroundColor: '#FFFFFF',
                  opacity: agent.is_active ? 1 : 0.7,
                }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold" style={{ color: '#3D3530' }}>{agent.name}</h3>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{
                                backgroundColor: agent.is_active ? '#E8F5E9' : '#FFEBEE',
                                color: agent.is_active ? '#2E7D32' : '#C62828',
                              }}
                            >
                              {agent.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: '#6B625A' }}>
                            {agent.state || 'NV'} • {agent.leads_assigned || 0} leads assigned
                          </p>
                        </div>
                      </div>

                      {/* Credits Section */}
                      <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
                              <CreditCard className="w-5 h-5" style={{ color: '#D08C60' }} />
                            </div>
                            <div>
                              <p className="text-xs" style={{ color: '#6B625A' }}>Lead Credits</p>
                              <p className="text-2xl font-bold" style={{ color: (agent.credits_remaining || 0) > 0 ? '#2E7D32' : '#C62828' }}>
                                {agent.credits_remaining || 0}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddCredits(agent.id, 5)}
                              disabled={updatingCredits === agent.id}
                              style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                            >
                              {updatingCredits === agent.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '+5'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddCredits(agent.id, 10)}
                              disabled={updatingCredits === agent.id}
                              style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                            >
                              {updatingCredits === agent.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '+10'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setCreditModalAgentId(agent.id); setCustomCredits(String(agent.credits_remaining || 0)); }}
                              style={{ borderColor: '#1565C0', color: '#1565C0' }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Set
                            </Button>
                          </div>
                        </div>
                        
                        {/* Custom credits modal inline */}
                        {creditModalAgentId === agent.id && (
                          <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid #E8DDCF' }}>
                            <Input
                              type="number"
                              min="0"
                              value={customCredits}
                              onChange={(e) => setCustomCredits(e.target.value)}
                              placeholder="Enter credits"
                              className="w-32 h-8"
                              style={{ borderColor: '#E8DDCF' }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSetCredits(agent.id)}
                              disabled={updatingCredits === agent.id}
                              className="h-8 text-white"
                              style={{ backgroundColor: '#4CAF50' }}
                            >
                              {updatingCredits === agent.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setCreditModalAgentId(null); setCustomCredits(''); }}
                              className="h-8"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        
                        {agent.credits_updated_at && (
                          <p className="text-xs mt-2" style={{ color: '#6B625A' }}>
                            Last updated: {new Date(agent.credits_updated_at).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {agent.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" style={{ color: '#D08C60' }} />
                            <span style={{ color: '#6B625A' }}>{agent.phone}</span>
                          </div>
                        )}
                        {agent.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" style={{ color: '#D08C60' }} />
                            <span style={{ color: '#6B625A' }}>{agent.email}</span>
                          </div>
                        )}
                        {agent.webhook_url && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" style={{ color: '#D08C60' }} />
                            <span className="text-sm truncate" style={{ color: '#6B625A' }}>Webhook configured</span>
                          </div>
                        )}
                      </div>

                      {/* Covered ZIPs */}
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2" style={{ color: '#6B625A' }}>Covered ZIP Codes:</p>
                        <div className="flex flex-wrap gap-2">
                          {(agent.covered_zips || []).map((zip, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded text-xs font-mono"
                              style={{ backgroundColor: '#FFF8F0', color: '#D08C60' }}
                            >
                              {zip}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(agent)}
                          style={{ borderColor: '#E8DDCF' }}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(agent)}
                          style={{ 
                            borderColor: agent.is_active ? '#FFCDD2' : '#C8E6C9',
                            color: agent.is_active ? '#C62828' : '#2E7D32',
                          }}
                        >
                          {agent.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(agent.id)}
                          style={{ borderColor: '#FFCDD2', color: '#C62828' }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AgentsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E9' }}>
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#D08C60' }} />
        <p className="text-xl" style={{ color: '#6B625A' }}>Loading agents...</p>
      </div>
    </div>
  );
}

export default function AdminAgentsPage() {
  return (
    <Suspense fallback={<AgentsLoading />}>
      <AdminAgentsContent />
    </Suspense>
  );
}
