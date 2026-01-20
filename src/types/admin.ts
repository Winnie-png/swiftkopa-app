export interface LoanApplicationData {
  rowIndex: number;
  "Timestamp": string;
  "Full Name": string;
  "Email": string;
  "Loan Type": string;
  "Amount": string | number;
  "Mpesa Number": string;
  "Status": ApplicationStatus;
  "Notes"?: string;
  "Documents"?: string;
}

export type ApplicationStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Disbursed';

export interface LoanStats {
  totalVolume: number;
  pendingVolume: number;
}
