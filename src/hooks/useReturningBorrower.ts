import { useState, useCallback } from 'react';

export interface ReturningBorrowerInfo {
  borrowerId: string;
  isRepeat: boolean;
  docsReused: boolean;
  collateralChanged: boolean;
  fullName?: string;
  email?: string;
  previousCollateral?: string;
}

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbz63M9fBF-OSVr3kBReS23ygpWL7HkMF6xNuhzY18S82i6psRZ31xfIfo0j27XWVEuY/exec';

export function useReturningBorrower() {
  const [borrowerInfo, setBorrowerInfo] = useState<ReturningBorrowerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if borrower exists via Google Sheets GET request
  const checkBorrower = useCallback(async (borrowerId: string): Promise<ReturningBorrowerInfo | null> => {
    if (!borrowerId || borrowerId.length < 10) return null;
    
    setIsLoading(true);
    
    try {
      const url = `${ENDPOINT}?action=checkBorrower&borrowerId=${encodeURIComponent(borrowerId)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        setIsLoading(false);
        return null;
      }
      
      const data = await response.json();
      
      if (data.found) {
        const info: ReturningBorrowerInfo = {
          borrowerId,
          isRepeat: true,
          docsReused: false, // Will be set by user choice
          collateralChanged: false,
          fullName: data.fullName || undefined,
          email: data.email || undefined,
          previousCollateral: data.collateralDescription || undefined,
        };
        setBorrowerInfo(info);
        setIsLoading(false);
        return info;
      }
    } catch (error) {
      console.error('Error checking borrower:', error);
    }
    
    setIsLoading(false);
    return null;
  }, []);

  // Set document reuse choice
  const setDocsReused = useCallback((reuse: boolean) => {
    setBorrowerInfo(prev => prev ? { ...prev, docsReused: reuse } : null);
  }, []);

  // Set collateral changed flag
  const setCollateralChanged = useCallback((changed: boolean) => {
    setBorrowerInfo(prev => prev ? { ...prev, collateralChanged: changed } : null);
  }, []);

  // Clear borrower info
  const clearBorrower = useCallback(() => {
    setBorrowerInfo(null);
  }, []);

  return {
    borrowerInfo,
    isLoading,
    checkBorrower,
    setDocsReused,
    setCollateralChanged,
    clearBorrower,
  };
}
