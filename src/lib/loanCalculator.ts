import { LoanCalculation } from '@/types/loan';

const MONTHLY_INTEREST_RATE = 0.20; // 20% per month flat

export function calculateLoan(principal: number, termMonths: number): LoanCalculation {
  // Calculate raw interest: principal × 0.20 × loan_term_months
  const rawInterest = principal * MONTHLY_INTEREST_RATE * termMonths;
  
  // Apply duplum rule: interest must not exceed principal
  const cappedInterest = Math.min(rawInterest, principal);
  const isDuplumApplied = rawInterest > principal;
  
  // Total repayment = principal + capped interest
  const totalRepayment = principal + cappedInterest;
  
  // Monthly payment = total repayment ÷ loan_term_months
  const monthlyPayment = totalRepayment / termMonths;
  
  return {
    principal,
    interestRate: MONTHLY_INTEREST_RATE,
    termMonths,
    rawInterest,
    cappedInterest,
    totalRepayment,
    monthlyPayment,
    isDuplumApplied,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
