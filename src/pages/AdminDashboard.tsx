import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLoanApplications } from '@/hooks/useLoanApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, LogOut, RefreshCw, ShieldCheck, DollarSign, AlertTriangle } from 'lucide-react';
import ApplicationCard from '@/components/admin/ApplicationCard';

// Format currency as KES with commas
const formatKES = (amount: number): string => {
  return `KES ${amount.toLocaleString('en-KE')}`;
};

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, logout } = useAdminAuth();
  const { applications, stats, loading, error, refetch, updateApplication } = useLoanApplications();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Count using exact status values from Google Sheet
  const pendingCount = applications.filter(a => a["Status"] === 'Pending Review').length;
  const approvedCount = applications.filter(a => a["Status"] === 'Approved').length;
  const rejectedCount = applications.filter(a => a["Status"] === 'Rejected').length;
  const disbursedCount = applications.filter(a => a["Status"] === 'Disbursed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">SwiftKopa Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Volume Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Loan Volume</p>
                <p className="text-xl font-bold text-green-600">{formatKES(stats.totalVolume)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Risk</p>
                <p className="text-xl font-bold text-orange-600">{formatKES(stats.pendingVolume)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{disbursedCount}</p>
              <p className="text-xs text-muted-foreground">Disbursed</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Loan Applications</h2>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={refetch}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No loan applications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application, index) => (
              <ApplicationCard
                key={application.rowIndex || index}
                application={application}
                onUpdate={updateApplication}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
