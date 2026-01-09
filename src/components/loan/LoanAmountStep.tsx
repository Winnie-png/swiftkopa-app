import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calculator, Info, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateLoan, formatCurrency } from '@/lib/loanCalculator';
import { LoanCalculation } from '@/types/loan';

interface LoanAmountStepProps {
  amount: number;
  termMonths: number;
  onAmountChange: (amount: number) => void;
  onTermChange: (term: number) => void;
  onCalculationChange: (calc: LoanCalculation) => void;
  onNext: () => void;
  onBack: () => void;
}

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 500000;
const MIN_TERM = 1;
const MAX_TERM = 12;

export function LoanAmountStep({
  amount,
  termMonths,
  onAmountChange,
  onTermChange,
  onCalculationChange,
  onNext,
  onBack,
}: LoanAmountStepProps) {
  const [localAmount, setLocalAmount] = useState(amount || 10000);
  const [localTerm, setLocalTerm] = useState(termMonths || 3);
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);

  useEffect(() => {
    const calc = calculateLoan(localAmount, localTerm);
    setCalculation(calc);
    onCalculationChange(calc);
  }, [localAmount, localTerm, onCalculationChange]);

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
    const clamped = Math.min(Math.max(value, 0), MAX_AMOUNT);
    setLocalAmount(clamped);
    onAmountChange(clamped);
  };

  const handleAmountSliderChange = (value: number[]) => {
    setLocalAmount(value[0]);
    onAmountChange(value[0]);
  };

  const handleTermChange = (value: number[]) => {
    setLocalTerm(value[0]);
    onTermChange(value[0]);
  };

  const isValidAmount = localAmount >= MIN_AMOUNT && localAmount <= MAX_AMOUNT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Loan Details</h2>
        <p className="text-muted-foreground mt-1">Enter amount and choose repayment term</p>
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <Label htmlFor="amount" className="text-base font-medium">Loan Amount (KES)</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            KES
          </span>
          <Input
            id="amount"
            type="text"
            value={localAmount.toLocaleString()}
            onChange={handleAmountInputChange}
            className="pl-14 text-xl font-semibold h-14"
          />
        </div>
        <Slider
          value={[localAmount]}
          onValueChange={handleAmountSliderChange}
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          step={1000}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(MIN_AMOUNT)}</span>
          <span>{formatCurrency(MAX_AMOUNT)}</span>
        </div>
      </div>

      {/* Term Slider */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Repayment Term</Label>
        <div className="text-center py-4 bg-muted rounded-xl">
          <span className="text-3xl font-bold text-primary">{localTerm}</span>
          <span className="text-muted-foreground ml-2">
            {localTerm === 1 ? 'month' : 'months'}
          </span>
        </div>
        <Slider
          value={[localTerm]}
          onValueChange={handleTermChange}
          min={MIN_TERM}
          max={MAX_TERM}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 month</span>
          <span>12 months</span>
        </div>
      </div>

      {/* Calculation Summary */}
      {calculation && isValidAmount && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Repayment Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal</span>
                <span className="font-semibold">{formatCurrency(calculation.principal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest ({(calculation.interestRate * 100)}%/mo × {calculation.termMonths})</span>
                <span className="font-semibold">{formatCurrency(calculation.cappedInterest)}</span>
              </div>

              {calculation.isDuplumApplied && (
                <div className="flex items-start gap-2 p-3 bg-accent/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-foreground">Duplum Rule Applied</p>
                    <p className="text-muted-foreground">Interest capped at principal amount</p>
                  </div>
                </div>
              )}

              <div className="border-t border-primary/20 pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-medium text-foreground">Total Repayment</span>
                  <span className="font-bold text-primary">{formatCurrency(calculation.totalRepayment)}</span>
                </div>
              </div>

              <div className="p-4 gradient-gold rounded-xl text-center">
                <p className="text-xs text-accent-foreground/80 uppercase tracking-wide">Monthly Payment</p>
                <p className="text-2xl font-bold text-accent-foreground">
                  {formatCurrency(calculation.monthlyPayment)}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>20% per month (flat, duplum applied)</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isValidAmount}
          className="flex-1 gradient-primary text-primary-foreground shadow-button"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
