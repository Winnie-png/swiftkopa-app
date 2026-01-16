export interface LoanApplicationData {
  id: string;
  rowIndex: number;
  fullName: string;
  email: string;
  loanType: 'secured' | 'unsecured';
  amount: number;
  termMonths: number;
  mpesaNumber: string;
  collateralType: string | null;
  assetValue: number;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  submittedAt: string;
  documents: DocumentInfo[];
}

export interface DocumentInfo {
  fileName: string;
  fileUrl?: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
