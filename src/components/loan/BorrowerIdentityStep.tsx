import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BorrowerIdentityStepProps {
  borrowerId: string;
  isLoading: boolean;
  onBorrowerIdChange: (id: string) => void;
  onCheckBorrower: (id: string) => Promise<void>;
  onNext: () => void;
}

export function BorrowerIdentityStep({
  borrowerId,
  isLoading,
  onBorrowerIdChange,
  onCheckBorrower,
  onNext,
}: BorrowerIdentityStepProps) {
  const [touched, setTouched] = useState(false);

  const formatInput = (value: string) => {
    // Allow only digits
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const isValid = borrowerId.length === 10;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    onBorrowerIdChange(formatted);
  };

  const handleContinue = async () => {
    if (!isValid) return;
    await onCheckBorrower(borrowerId);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Let's Get Started</h2>
        <p className="text-muted-foreground mt-1">
          Enter your phone number or National ID to begin
        </p>
      </div>

      <Card className="p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Borrower ID</h3>
              <p className="text-xs text-muted-foreground">Phone number or National ID</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrowerId">Phone Number or National ID</Label>
            <div className="relative">
              <Input
                id="borrowerId"
                type="tel"
                placeholder="0712345678 or 12345678"
                value={borrowerId}
                onChange={handleChange}
                onBlur={() => setTouched(true)}
                className={`h-14 text-lg pl-12 ${
                  touched && !isValid
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }`}
                disabled={isLoading}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                🇰🇪
              </span>
            </div>
            {touched && !isValid && (
              <p className="text-xs text-destructive">
                Enter a 10-digit phone number or National ID
              </p>
            )}
          </div>
        </div>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        We'll check if you have an existing account to speed up your application
      </p>

      <Button
        onClick={handleContinue}
        disabled={!isValid || isLoading}
        className="w-full h-14 gradient-primary text-primary-foreground shadow-button text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  );
}
