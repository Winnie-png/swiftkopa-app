import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  User, 
  Phone, 
  FileText, 
  Calculator, 
  Wallet, 
  Shield, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Car,
  Wrench,
  MapPin,
  RefreshCw,
  Files,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/loanCalculator';
import { LoanApplication, CollateralType } from '@/types/loan';

interface BorrowerInfo {
  isRepeat?: boolean;
  docsReused?: boolean;
  collateralChanged?: boolean;
}

interface ReviewStepProps {
  application: LoanApplication;
  borrowerInfo?: BorrowerInfo;
  onSubmit: () => Promise<void>;
  onBack: () => void;
}

const collateralLabels: Record<CollateralType, { label: string; icon: typeof Car }> = {
  vehicle: { label: 'Vehicle', icon: Car },
  equipment: { label: 'Equipment', icon: Wrench },
  land: { label: 'Land', icon: MapPin },
};

export function ReviewStep({ application, borrowerInfo, onSubmit, onBack }: ReviewStepProps) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agreed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
    }
  };

  const sections = [
    {
      icon: application.loanType === 'secured' ? Shield : Wallet,
      title: 'Loan Type',
      value: application.loanType === 'secured' ? 'Secured Loan' : 'Unsecured Loan',
      color: 'text-primary',
    },
    // Add collateral info for secured loans
    ...(application.loanType === 'secured' && application.collateral ? [{
      icon: collateralLabels[application.collateral.type].icon,
      title: 'Collateral',
      items: [
        { label: 'Type', value: collateralLabels[application.collateral.type].label },
        { label: 'Asset Value', value: formatCurrency(application.collateral.assetValue) },
        { label: 'Max Loan (LTV)', value: formatCurrency(application.collateral.maxLoanAmount) },
      ],
      color: 'text-accent',
    }] : []),
    {
      icon: Calculator,
      title: 'Loan Details',
      items: [
        { label: 'Principal', value: formatCurrency(application.calculation.principal) },
        { label: 'Term', value: `${application.calculation.termMonths} months` },
        { label: 'Interest', value: formatCurrency(application.calculation.cappedInterest) },
        { label: 'Total Repayment', value: formatCurrency(application.calculation.totalRepayment), highlight: true },
        { label: 'Monthly Payment', value: formatCurrency(application.calculation.monthlyPayment), highlight: true },
      ],
      color: 'text-accent',
    },
    {
      icon: User,
      title: 'Personal Details',
      value: application.fullName,
      color: 'text-foreground',
    },
    {
      icon: Phone,
      title: 'M-Pesa Number',
      value: application.mpesaNumber,
      color: 'text-success',
    },
    {
      icon: FileText,
      title: 'Documents',
      value: `${application.documents.length} file${application.documents.length !== 1 ? 's' : ''} uploaded`,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Review Application</h2>
        <p className="text-muted-foreground">
          Confirm your loan details before submitting
        </p>

        {/* Borrower Status Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {borrowerInfo?.isRepeat && (
            <Badge variant="secondary">
              <RefreshCw className="w-3 h-3 mr-1" />
              Returning Borrower
            </Badge>
          )}

          {borrowerInfo?.docsReused && (
            <Badge>
              <Files className="w-3 h-3 mr-1" />
              Documents Reused
            </Badge>
          )}

          {borrowerInfo?.collateralChanged && (
            <Badge variant="outline">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Collateral Updated
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {section.title}
                    </p>
                    {section.items ? (
                      <div className="mt-2 space-y-1">
                        {section.items.map((item) => (
                          <div key={item.label} className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className={`text-sm font-medium ${item.highlight ? 'text-primary' : ''}`}>
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium text-foreground mt-0.5">{section.value}</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Duplum notice if applied */}
      {application.calculation.isDuplumApplied && (
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Duplum Rule Applied</p>
              <p className="text-sm text-muted-foreground mt-1">
                Interest has been capped at the principal amount as per Kenyan law.
                Original interest would have been {formatCurrency(application.calculation.rawInterest)}.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Terms Agreement */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
            I confirm that all information provided is accurate. I agree to the loan terms including 
            20% monthly interest (flat rate) with duplum rule applied, and authorize disbursement 
            to my M-Pesa number.
          </label>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="flex-1"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!agreed || isSubmitting}
          className="flex-1 gradient-primary text-primary-foreground shadow-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
