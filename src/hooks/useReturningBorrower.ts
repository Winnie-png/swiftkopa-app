import { useState } from 'react';

// Define your borrower type
interface Borrower {
  borrowerId: string;
  fullName: string;
  email: string;
  docsReused?: boolean;
  collateralChanged?: boolean;
  previousCollateral?: string;
}

// Normalizes phone numbers: 07XXXXXXXX → 2547XXXXXXXX
function normalizePhone(phone: string): string {
  let digits = phone.toString().replace(/\D/g, ''); // remove non-digits
  if (digits.startsWith('0')) digits = '254' + digits.slice(1);
  return digits;
}

export function useReturningBorrower() {
  const [borrowerInfo, setBorrowerInfo] = useState<Borrower | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated fetch from Google Sheets
  const fetchBorrowers = async (): Promise<Borrower[]> => {
    // Replace this with your real Google Script fetch
    // Example response:
    return [
      { borrowerId: '700038822', fullName: 'Winnie Mango', email: 'winnie@example.com', previousCollateral: 'car:500000' }
    ];
  };

  const checkBorrower = async (borrowerId: string) => {
    setIsLoading(true);
    try {
      const normalizedId = normalizePhone(borrowerId);
      const borrowers = await fetchBorrowers();
      const match = borrowers.find(b => normalizePhone(b.borrowerId) === normalizedId);

      const info: Borrower = match
        ? { ...match, docsReused: false, collateralChanged: false }
        : { borrowerId: normalizedId, fullName: '', email: '' };

      setBorrowerInfo(info);

      console.log('[ReturningBorrower] check', {
        borrowerId,
        normalizedId,
        matchFound: !!match,
        borrowerInfo: info,
      });

      return !!match;
    } finally {
      setIsLoading(false);
    }
  };

  const saveBorrower = async (
    borrowerId: string,
    fullName: string,
    email: string,
    docsReused = false,
    collateralChanged = false,
    previousCollateral = ''
  ) => {
    const normalizedId = normalizePhone(borrowerId);

    // Here you would push to Google Sheets via your Apps Script
    // Example payload:
    const payload = {
      borrowerId: normalizedId,
      fullName,
      email,
      docsReused,
      collateralChanged,
      previousCollateral,
    };

    console.log('[ReturningBorrower] save', payload);

    setBorrowerInfo(payload);
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
    saveBorrower,
    clearBorrower,
    setDocsReused,
    setCollateralChanged,
  };
  }
