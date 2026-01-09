export type LoanType = 'secured' | 'unsecured';

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

export interface LoanApplication {
  loanType: LoanType;
  amount: number;
  termMonths: number;
  calculation: LoanCalculation;
  documents: DocumentFile[];
  mpesaNumber: string;
  fullName: string;
}

export type FormStep = 'type' | 'amount' | 'documents' | 'mpesa' | 'review' | 'success';
