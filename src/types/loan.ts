export type LoanType = 'secured' | 'unsecured';

export type CollateralType = 'vehicle' | 'equipment' | 'land';

export interface LoanCalculation {
  principal: number;
  interestRate: number;
  termMonths: number;
  rawInterest: number;
  cappedInterest: number;
  totalRepayment: number;
  monthlyPayment: number;
  isDuplumApplied: boolean;
}

export interface DocumentFile {
  file: File;
  preview: string;
  type: 'id' | 'income' | 'asset' | 'photo';
  name: string;
}

export interface CollateralInfo {
  type: CollateralType;
  assetValue: number;
  maxLoanAmount: number;
}

export interface LoanApplication {
  loanType: LoanType;
  amount: number;
  termMonths: number;
  calculation: LoanCalculation;
  documents: DocumentFile[];
  mpesaNumber: string;
  fullName: string;
  collateral?: CollateralInfo;
}

export type FormStep = 'type' | 'collateral' | 'amount' | 'documents' | 'mpesa' | 'review' | 'success';
