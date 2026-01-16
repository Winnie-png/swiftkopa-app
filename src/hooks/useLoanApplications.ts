import { useState, useEffect, useCallback } from 'react';
import { LoanApplicationData, ApplicationStatus } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

const GET_URL = import.meta.env.VITE_APPS_SCRIPT_GET_URL;
const UPDATE_URL = import.meta.env.VITE_APPS_SCRIPT_UPDATE_URL;

export const useLoanApplications = () => {
  const [applications, setApplications] = useState<LoanApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!GET_URL) {
      setError('Apps Script GET URL not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(GET_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sort by submission date (latest first)
      const sortedData = (data.applications || []).sort((a: LoanApplicationData, b: LoanApplicationData) => {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
      
      setApplications(sortedData);
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
    if (!UPDATE_URL) {
      toast({
        title: 'Error',
        description: 'Apps Script UPDATE URL not configured',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const response = await fetch(UPDATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowIndex,
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
          app.rowIndex === rowIndex ? { ...app, status, notes } : app
        )
      );

      toast({
        title: 'Success',
        description: `Application ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`,
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
    loading,
    error,
    refetch: fetchApplications,
    updateApplication,
  };
};
