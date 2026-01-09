import { motion } from 'framer-motion';
import { CheckCircle, Phone, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/loanCalculator';
import { LoanApplication } from '@/types/loan';

interface SuccessStepProps {
  application: LoanApplication;
  onNewApplication: () => void;
}

export function SuccessStep({ application, onNewApplication }: SuccessStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2 
        }}
        className="relative mx-auto w-24 h-24"
      >
        <div className="absolute inset-0 gradient-success rounded-full animate-pulse-gold" />
        <div className="absolute inset-2 bg-success rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success-foreground" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-foreground">Loan Submitted Successfully!</h2>
        <p className="text-muted-foreground mt-2">
          Your application is being reviewed. We'll notify you via SMS.
        </p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-5 bg-primary/5 border-primary/20 text-left">
          <h3 className="font-semibold text-foreground mb-4">Application Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Amount</span>
              <span className="font-semibold">{formatCurrency(application.calculation.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payment</span>
              <span className="font-semibold text-primary">{formatCurrency(application.calculation.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold">{application.calculation.termMonths} months</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disbursement to</span>
                <span className="font-semibold">{application.mpesaNumber}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <h4 className="font-medium text-foreground">What happens next?</h4>
        
        <div className="grid gap-3">
          <Card className="p-4 flex items-center gap-3 text-left">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Review in Progress</p>
              <p className="text-xs text-muted-foreground">Usually within 24 hours</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-3 text-left">
            <div className="p-2 rounded-lg bg-success/10">
              <Phone className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">SMS Notification</p>
              <p className="text-xs text-muted-foreground">You'll receive approval status via SMS</p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* New Application Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="pt-4"
      >
        <Button
          onClick={onNewApplication}
          variant="outline"
          className="w-full"
        >
          Start New Application
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
