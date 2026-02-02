import { useState, useCallback } from 'react';

export interface ReturningBorrowerInfo {
  borrowerId: string;
  normalizedBorrowerId: string;
  isRepeat: boolean;
  docsReused: boolean;
  collateralChanged: boolean;
  fullName?: string;
  email?: string;
  previousCollateral?: string;
}

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbz63M9fBF-OSVr3kBReS23ygpWL7HkMF6xNuhzY18S82i6psRZ31xfIfo0j27XWVEuY/exec';

/**
 * Normalize Kenyan phone numbers to international format (2547XXXXXXXX)
 * Converts: 07XXXXXXXX → 2547XXXXXXXX
 *           7XXXXXXXX → 2547XXXXXXXX
 *           +2547XXXXXXXX → 2547XXXXXXXX
 *           2547XXXXXXXX → 2547XXXXXXXX (unchanged)
 * National IDs (8 digits) are returned as-is
 */
export function normalizeBorrowerId(borrowerId: string): string {
  // Remove any non-digit characters
  const digits = borrowerId.replace(/\D/g, '');
  
  // If it's 8 digits, assume it's a National ID - return as-is
  if (digits.length === 8) {
    return digits;
  }
  
  // Handle phone number formats
  if (digits.startsWith('254') && digits.length === 12) {
    // Already in international format: 2547XXXXXXXX
    return digits;
  }
  
  if (digits.startsWith('0') && digits.length === 10) {
    // Local format: 07XXXXXXXX → 2547XXXXXXXX
    return '254' + digits.substring(1);
  }
  
  if (digits.startsWith('7') && digits.length === 9) {
    // Without leading 0: 7XXXXXXXX → 2547XXXXXXXX
    return '254' + digits;
  }
  
  // Return as-is if no pattern matches
  return digits;
}

export function useReturningBorrower() {
  const [borrowerInfo, setBorrowerInfo] = useState<ReturningBorrowerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if borrower exists via Google Sheets GET request
  const checkBorrower = useCallback(async (borrowerId: string): Promise<ReturningBorrowerInfo | null> => {
    if (!borrowerId || borrowerId.length < 8) return null;
    
    const normalizedId = normalizeBorrowerId(borrowerId);
    
    console.log('[ReturningBorrower] Checking borrower:', {
      borrowerId,
      normalizedBorrowerId: normalizedId,
    });
    
    setIsLoading(true);
    
    try {
      const url = `${ENDPOINT}?action=checkBorrower&borrowerId=${encodeURIComponent(normalizedId)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log('[ReturningBorrower] Detection result:', {
          borrowerId,
          normalizedBorrowerId: normalizedId,
          matchFound: false,
          reason: 'Response not OK',
        });
        setIsLoading(false);
        return null;
      }
      
      const data = await response.json();
      
      console.log('[ReturningBorrower] Detection result:', {
        borrowerId,
        normalizedBorrowerId: normalizedId,
        matchFound: data.found === true,
        responseData: data,
      });
      
      if (data.found) {
        const info: ReturningBorrowerInfo = {
          borrowerId,
          normalizedBorrowerId: normalizedId,
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
      console.error('[ReturningBorrower] Error checking borrower:', error);
      console.log('[ReturningBorrower] Detection result:', {
        borrowerId,
        normalizedBorrowerId: normalizedId,
        matchFound: false,
        reason: 'Network error',
      });
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
