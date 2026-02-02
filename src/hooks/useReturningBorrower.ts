import { useState } from 'react';

// Define your borrower type
interface Borrower {
  borrowerId: string;
  fullName: string;
  email: string;
  previousCollateral?: string;
}

// Exported type for returning borrower info with flags
export interface ReturningBorrowerInfo {
  borrowerId: string;
  normalizedBorrowerId: string;
  fullName: string;
  email: string;
  isRepeat: boolean;
  docsReused: boolean;
  collateralChanged: boolean;
  previousCollateral?: string;
}

// Normalizes phone numbers: 07XXXXXXXX → 2547XXXXXXXX
// 8-digit National IDs are preserved as-is
export function normalizeBorrowerId(id: string): string {
  let digits = id.toString().replace(/\D/g, ''); // remove non-digits
  // If starts with 0 and is 10 digits (Kenyan phone), convert to international
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '254' + digits.slice(1);
  }
  return digits;
}

export function useReturningBorrower() {
  const [borrowerInfo, setBorrowerInfo] = useState<ReturningBorrowerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated fetch from Google Sheets
  const fetchBorrowers = async (): Promise<Borrower[]> => {
    // Replace this with your real Google Script fetch
    // Example response:
    return [
      { borrowerId: '254700038822', fullName: 'Winnie Mango', email: 'winnie@example.com', previousCollateral: 'car:500000' }
    ];
  };

  const checkBorrower = async (borrowerId: string): Promise<ReturningBorrowerInfo | null> => {
    setIsLoading(true);
    try {
      const normalizedId = normalizeBorrowerId(borrowerId);
      const borrowers = await fetchBorrowers();
      const match = borrowers.find(b => normalizeBorrowerId(b.borrowerId) === normalizedId);

      const info: ReturningBorrowerInfo = match
        ? {
            borrowerId: match.borrowerId,
            normalizedBorrowerId: normalizedId,
            fullName: match.fullName,
            email: match.email,
            isRepeat: true,
            docsReused: false,
            collateralChanged: false,
            previousCollateral: match.previousCollateral,
          }
        : {
            borrowerId,
            normalizedBorrowerId: normalizedId,
            fullName: '',
            email: '',
            isRepeat: false,
            docsReused: false,
            collateralChanged: false,
          };

      setBorrowerInfo(info);

      console.log('[ReturningBorrower] check', {
        borrowerId,
        normalizedBorrowerId: normalizedId,
        matchFound: !!match,
        borrowerInfo: info,
      });

      return match ? info : null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearBorrower = () => {
    setBorrowerInfo(null);
  };

  const setDocsReused = (docsReused: boolean) => {
    if (borrowerInfo) setBorrowerInfo({ ...borrowerInfo, docsReused });
  };

  const setCollateralChanged = (collateralChanged: boolean) => {
    if (borrowerInfo) setBorrowerInfo({ ...borrowerInfo, collateralChanged });
  };

  return {
    borrowerInfo,
    isLoading,
    checkBorrower,
    clearBorrower,
    setDocsReused,
    setCollateralChanged,
  };
}
