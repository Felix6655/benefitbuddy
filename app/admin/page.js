'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Heart,
  Download,
  Search,
  Trash2,
  Eye,
  Loader2,
  Lock,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check for key in URL on mount
  useEffect(() => {
    const keyFromUrl = searchParams.get('key');
    if (keyFromUrl) {
      setAdminKey(keyFromUrl);
      handleAuth(keyFromUrl);
    } else {
      // Check localStorage
      const savedKey = localStorage.getItem('benefitbuddy_admin_key');
      if (savedKey) {
        setAdminKey(savedKey);
        handleAuth(savedKey);
      }
    }
  }, []);

  const handleAuth = async (key) => {
    setLoading(true);
    setAuthError('');
    
    try {
      const response = await fetch(`/api/admin/submissions?adminKey=${encodeURIComponent(key)}`);
      
      if (response.status === 401) {
        setAuthError('Invalid admin key');
        setIsAuthenticated(false);
        localStorage.removeItem('benefitbuddy_admin_key');
      } else if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('benefitbuddy_admin_key', key);
        const data = await response.json();
        setSubmissions(data.submissions || []);
        setPagination(data.pagination || {});
      } else {
        setAuthError('Something went wrong');
      }
    } catch (error) {
      setAuthError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('adminKey', adminKey);
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/admin/submissions?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setSubmissions(data.submissions || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.open(`/api/admin/export?adminKey=${encodeURIComponent(adminKey)}`, '_blank');
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${id}?adminKey=${encodeURIComponent(adminKey)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Update local state
        setSubmissions(prev => 
          prev.map(s => s.id === id ? { ...s, status: newStatus } : s)
        );
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error('Status update error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${deleteTarget}?adminKey=${encodeURIComponent(adminKey)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== deleteTarget));
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FFF8F0] text-[#D08C60] border border-[#E8DDCF] rounded-full text-sm"><Clock className="w-3 h-3" /> New</span>;
      case 'contacted':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"><RefreshCw className="w-3 h-3" /> Contacted</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"><CheckCircle className="w-3 h-3" /> Closed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>;
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F1E9] p-4">
        <Card className="max-w-md w-full border-[#E8DDCF]">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#D08C60] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-[#3D3530]">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleAuth(adminKey); }} className="space-y-4">
              <div>
                <Label htmlFor="adminKey" className="text-lg text-[#3D3530]">Admin Key</Label>
                <Input
                  id="adminKey"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="mt-2 h-12 text-lg border-[#E8DDCF]"
                  required
                />
              </div>
              
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {authError}
                </div>
              )}
              
              <Button type="submit" className="w-full h-12 text-lg bg-[#D08C60] hover:bg-[#B76E45]" disabled={loading}>
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link href="/" className="text-[#D08C60] hover:text-[#B76E45] hover:underline">
                ← Back to BenefitBuddy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F8F1E9]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8DDCF]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D08C60] rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#3D3530]">BenefitBuddy</span>
            </Link>
            <span className="text-[#E8DDCF]">|</span>
            <span className="text-muted font-medium">Admin Panel</span>
          </div>
          <Button variant="outline" onClick={() => { localStorage.removeItem('benefitbuddy_admin_key'); setIsAuthenticated(false); }} className="border-[#E8DDCF]">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href={`/admin/leads?key=${adminKey}`}>
            <Button variant="outline" className="border-[#D08C60] text-[#D08C60] hover:bg-[#FFF8F0]">
              🔥 Medicare Leads
            </Button>
          </Link>
          <Link href={`/admin/agents?key=${adminKey}`}>
            <Button variant="outline" className="border-[#D08C60] text-[#D08C60] hover:bg-[#FFF8F0]">
              👥 Agent Management
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#E8DDCF]">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-[#D08C60]">{submissions.length}</div>
              <div className="text-muted">Total Submissions</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8DDCF]">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-[#D08C60]">{submissions.filter(s => s.status === 'new').length}</div>
              <div className="text-muted">New</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8DDCF]">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-yellow-600">{submissions.filter(s => s.status === 'contacted').length}</div>
              <div className="text-muted">Contacted</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8DDCF]">
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-green-600">{submissions.filter(s => s.status === 'closed').length}</div>
              <div className="text-muted">Closed</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card className="mb-6 border-[#E8DDCF]">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search" className="text-[#3D3530]">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ZIP, email, phone, name..."
                    className="pl-10 border-[#E8DDCF]"
                  />
                </div>
              </div>
              <div className="w-40">
                <Label htmlFor="status" className="text-[#3D3530]">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1 border-[#E8DDCF]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={fetchSubmissions} disabled={loading} className="bg-[#D08C60] hover:bg-[#B76E45]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
              <Button variant="outline" onClick={handleExport} className="border-[#E8DDCF]">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card className="border-[#E8DDCF]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8DDCF]">
                  <TableHead className="text-[#3D3530]">Date</TableHead>
                  <TableHead className="text-[#3D3530]">Name</TableHead>
                  <TableHead className="text-[#3D3530]">Contact</TableHead>
                  <TableHead className="text-[#3D3530]">ZIP</TableHead>
                  <TableHead className="text-[#3D3530]">Matched</TableHead>
                  <TableHead className="text-[#3D3530]">Status</TableHead>
                  <TableHead className="text-right text-[#3D3530]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted">
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub) => (
                    <TableRow key={sub.id} className="border-[#E8DDCF]">
                      <TableCell className="whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{sub.full_name || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sub.email && <div>{sub.email}</div>}
                          {sub.phone && <div>{sub.phone}</div>}
                          {!sub.email && !sub.phone && '-'}
                        </div>
                      </TableCell>
                      <TableCell>{sub.zip_code}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {sub.matched_benefits?.length || 0} programs
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSubmission(sub)}
                            className="text-[#D08C60] hover:text-[#B76E45]"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(sub.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* View Submission Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3D3530]">Submission Details</DialogTitle>
            <DialogDescription>
              ID: {selectedSubmission?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted">Name</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.full_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted">Date</Label>
                  <p className="font-medium text-[#3D3530]">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted">Email</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted">Phone</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted">ZIP Code</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.zip_code}</p>
                </div>
                <div>
                  <Label className="text-muted">Age Range</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.age_range}</p>
                </div>
                <div>
                  <Label className="text-muted">Household Size</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.household_size}</p>
                </div>
                <div>
                  <Label className="text-muted">Monthly Income</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.monthly_income_range}</p>
                </div>
                <div>
                  <Label className="text-muted">Employment</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.employment_status}</p>
                </div>
                <div>
                  <Label className="text-muted">Veteran</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.veteran}</p>
                </div>
                <div>
                  <Label className="text-muted">Disability</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.disability}</p>
                </div>
                <div>
                  <Label className="text-muted">Student</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.student}</p>
                </div>
                <div>
                  <Label className="text-muted">Children/Pregnant</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.pregnant_or_children}</p>
                </div>
                <div>
                  <Label className="text-muted">Housing</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.housing_status}</p>
                </div>
                <div>
                  <Label className="text-muted">Has Insurance</Label>
                  <p className="font-medium text-[#3D3530]">{selectedSubmission.has_health_insurance}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted">Matched Programs</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSubmission.matched_benefits?.map(b => (
                    <span key={b} className="px-2 py-1 bg-[#FFF8F0] text-[#D08C60] border border-[#E8DDCF] rounded text-sm">{b}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-muted">Status</Label>
                <Select 
                  value={selectedSubmission.status} 
                  onValueChange={(val) => handleStatusChange(selectedSubmission.id, val)}
                  disabled={actionLoading}
                >
                  <SelectTrigger className="mt-1 w-40 border-[#E8DDCF]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#3D3530]">Delete Submission?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The submission will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-[#E8DDCF]">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F1E9]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D08C60]" />
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
