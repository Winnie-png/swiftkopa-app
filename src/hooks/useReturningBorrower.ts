import { useState, useCallback } from 'react';

export interface ReturningBorrowerInfo {
  borrowerId: string;
  isRepeat: boolean;
  docsReused: boolean;
  collateralChanged: boolean;
  fullName?: string;
  email?: string;
}

const STORAGE_KEY = 'swiftkopa_borrower';

export function useReturningBorrower() {
  const [borrowerInfo, setBorrowerInfo] = useState<ReturningBorrowerInfo | null>(null);

  // Check if borrower exists by phone number
  const checkBorrower = useCallback((phoneNumber: string): ReturningBorrowerInfo | null => {
    if (!phoneNumber || phoneNumber.length < 10) return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      if (data.borrowerId === phoneNumber) {
        const info: ReturningBorrowerInfo = {
          borrowerId: data.borrowerId,
          isRepeat: true,
          docsReused: data.hasDocuments || false,
          collateralChanged: false,
          fullName: data.fullName,
          email: data.email,
        };
        setBorrowerInfo(info);
        return info;
      }
    } catch (error) {
      console.error('Error checking borrower:', error);
    }
    
    return null;
  }, []);

  // Save borrower info after successful submission
  const saveBorrower = useCallback((
    phoneNumber: string, 
    fullName: string, 
    email: string,
    hasDocuments: boolean
  ) => {
    try {
      const data = {
        borrowerId: phoneNumber,
        fullName,
        email,
        hasDocuments,
        lastSubmission: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving borrower:', error);
    }
  }, []);

  // Clear borrower info
  const clearBorrower = useCallback(() => {
    setBorrowerInfo(null);
  }, []);

  return {
    borrowerInfo,
    checkBorrower,
    saveBorrower,
    clearBorrower,
  };
}
