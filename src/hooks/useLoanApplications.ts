import { useReturningBorrower } from '@/hooks/use-returning-borrower';
import { useState, useEffect, useCallback } from 'react';
import { LoanApplicationData, ApplicationStatus, LoanStats } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

// Google Apps Script Web App URL for Admin Dashboard
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz63M9fBF-OSVr3kBReS23ygpLY9wa2lom9Ndrl_tJ9ynxapjCGH6gdfnkIk_hA6VB8/exec';

export const useLoanApplications = () => {
  const [applications, setApplications] = useState<LoanApplicationData[]>([]);
  const [stats, setStats] = useState<LoanStats>({ totalVolume: 0, pendingVolume: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!SCRIPT_URL) {
      setError('Apps Script URL not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(SCRIPT_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Use data directly from Google Sheet without conversion
      const rawApplications = data.applications || [];
      
      // Extract stats from response
      const statsData: LoanStats = data.stats || { totalVolume: 0, pendingVolume: 0 };
      
      // Sort by Timestamp (latest first)
      const sortedData = rawApplications.sort((a: LoanApplicationData, b: LoanApplicationData) => {
        const dateA = new Date(a["Timestamp"]).getTime();
        const dateB = new Date(b["Timestamp"]).getTime();
        return dateB - dateA;
      });
      
      setApplications(sortedData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
      toast({
        title: 'Error',
        description: 'Failed to load loan applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateApplication = async (
    rowIndex: number,
    status: ApplicationStatus,
    notes: string
  ): Promise<boolean> => {
    if (!SCRIPT_URL) {
      toast({
        title: 'Error',
        description: 'Apps Script URL not configured',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          rowNumber: rowIndex,
          status,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.rowIndex === rowIndex ? { ...app, "Status": status, "Notes": notes } : app
        )
      );

      toast({
        title: 'Success',
        description: `Application ${status} successfully`,
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update application',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    stats,
    loading,
    error,
    refetch: fetchApplications,
    updateApplication,
  };
};
