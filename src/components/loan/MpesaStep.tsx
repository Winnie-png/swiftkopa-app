import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Phone, ArrowDownCircle, ArrowUpCircle, CheckCircle2, Mail, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/loanCalculator';
import { LoanCalculation } from '@/types/loan';
import { ReturningBorrowerInfo } from '@/hooks/useReturningBorrower';

interface MpesaStepProps {
  mpesaNumber: string;
  fullName: string;
  email: string;
  calculation: LoanCalculation | null;
  returningBorrower: ReturningBorrowerInfo | null;
  onMpesaChange: (number: string) => void;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  onBack: () => void;
  onCheckBorrower: (phone: string) => ReturningBorrowerInfo | null;
}

export function MpesaStep({
  mpesaNumber,
  fullName,
  email,
  calculation,
  returningBorrower,
  onMpesaChange,
  onNameChange,
  onEmailChange,
  onNext,
  onBack,
  onCheckBorrower,
}: MpesaStepProps) {
  const [touched, setTouched] = useState({ phone: false, name: false, email: false });

  const validatePhone = (phone: string) => {
    // Kenyan phone format: 07XXXXXXXX or 01XXXXXXXX or +254...
    const cleaned = phone.replace(/\s/g, '');
    const pattern = /^(0[17]\d{8}|254[17]\d{8}|\+254[17]\d{8})$/;
    return pattern.test(cleaned);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 3 && name.trim().split(' ').length >= 2;
  };

  const validateEmail = (email: string) => {
    if (!email) return false;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email.trim());
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Handle +254 prefix
    if (cleaned.startsWith('254')) {
      cleaned = '0' + cleaned.slice(3);
    }
    
    // Limit to 10 digits
    cleaned = cleaned.slice(0, 10);
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onMpesaChange(formatted);
    
    // Check if returning borrower when phone is complete
    if (formatted.length === 10) {
      const existing = onCheckBorrower(formatted);
      if (existing && existing.fullName && !fullName) {
        onNameChange(existing.fullName);
      }
      if (existing && existing.email && !email) {
        onEmailChange(existing.email);
      }
    }
  };

  const isPhoneValid = validatePhone(mpesaNumber);
  const isNameValid = validateName(fullName);
  const isEmailValid = validateEmail(email);
  const canProceed = isPhoneValid && isNameValid && isEmailValid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">M-Pesa Details</h2>
        <p className="text-muted-foreground mt-1">For loan disbursement and repayments</p>
      </div>

      {/* Welcome back message for returning borrowers */}
      {returningBorrower?.isRepeat && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-primary/10 border border-primary/30 rounded-lg mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Welcome back!</p>
              <p className="text-sm text-muted-foreground">We found your previous details</p>
            </div>
          </div>
          {returningBorrower.docsReused && (
            <p className="text-xs text-muted-foreground mt-2 pl-13">
              ✓ Previous documents on file
            </p>
          )}
        </motion.div>
      )}

      {/* M-Pesa branded section */}
      <Card className="p-5 bg-success/5 border-success/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
            <Phone className="w-6 h-6 text-success-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">M-Pesa</h3>
            <p className="text-xs text-muted-foreground">Safaricom Mobile Money</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (as registered)</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Kamau Mwangi"
              value={fullName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              className={`h-12 ${
                touched.name && !isNameValid 
                  ? 'border-destructive focus-visible:ring-destructive' 
                  : ''
              }`}
            />
            {touched.name && !isNameValid && (
              <p className="text-xs text-destructive">Enter your full name (first and last name)</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                className={`h-12 pl-12 ${
                  touched.email && !isEmailValid 
                    ? 'border-destructive focus-visible:ring-destructive' 
                    : ''
                }`}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            {touched.email && !isEmailValid && (
              <p className="text-xs text-destructive">Enter a valid email address</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpesa">M-Pesa Phone Number</Label>
            <div className="relative">
              <Input
                id="mpesa"
                type="tel"
                placeholder="0712 345 678"
                value={mpesaNumber}
                onChange={handlePhoneChange}
                onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                className={`h-12 pl-12 ${
                  touched.phone && !isPhoneValid 
                    ? 'border-destructive focus-visible:ring-destructive' 
                    : ''
                }`}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                🇰🇪
              </span>
            </div>
            {touched.phone && !isPhoneValid && (
              <p className="text-xs text-destructive">Enter a valid Kenyan phone number</p>
            )}
          </div>
        </div>
      </Card>

      {/* Disbursement & Repayment Info */}
      {calculation && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-success mb-2">
              <ArrowDownCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Disbursement</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(calculation.principal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sent to your M-Pesa</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <ArrowUpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Repayment</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(calculation.monthlyPayment)}/mo
            </p>
            <p className="text-xs text-muted-foreground mt-1">For {calculation.termMonths} months</p>
          </Card>
        </div>
      )}

      {/* Confirmation */}
      {canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-success/10 rounded-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-sm text-foreground">M-Pesa details verified</span>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="flex-1 gradient-primary text-primary-foreground shadow-button"
        >
          Review Application
        </Button>
      </div>
    </motion.div>
  );
}
