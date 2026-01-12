import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { LoanTypeStep } from './LoanTypeStep';
import { CollateralStep, LTV_LIMITS } from './CollateralStep';
import { LoanAmountStep } from './LoanAmountStep';
import { DocumentUploadStep } from './DocumentUploadStep';
import { MpesaStep } from './MpesaStep';
import { ReviewStep } from './ReviewStep';
import { SuccessStep } from './SuccessStep';
import { 
  LoanType, 
  LoanCalculation, 
  DocumentFile, 
  LoanApplication as LoanAppType,
  FormStep,
  CollateralType,
  CollateralInfo,
} from '@/types/loan';
import { calculateLoan } from '@/lib/loanCalculator';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  loanType: null as LoanType | null,
  amount: 10000,
  termMonths: 3,
  calculation: null as LoanCalculation | null,
  documents: [] as DocumentFile[],
  mpesaNumber: '',
  fullName: '',
  email: '',
  collateralType: null as CollateralType | null,
  assetValue: 0,
};

export function LoanApplication() {
  const { toast } = useToast();
  const [step, setStep] = useState<FormStep>('type');
  const [formData, setFormData] = useState(initialState);

  const handleLoanTypeSelect = (type: LoanType) => {
  setFormData(prev => ({ ...prev, loanType: type }));

  // FORCE correct next step immediately
  if (type === 'secured') {
    setStep('collateral');
  } else {
    setStep('amount');
  }
};

  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleTermChange = (termMonths: number) => {
    setFormData(prev => ({ ...prev, termMonths }));
  };

  const handleCalculationChange = useCallback((calculation: LoanCalculation) => {
    setFormData(prev => ({ ...prev, calculation }));
  }, []);

  const handleDocumentsChange = (documents: DocumentFile[]) => {
    setFormData(prev => ({ ...prev, documents }));
  };

  const handleMpesaChange = (mpesaNumber: string) => {
    setFormData(prev => ({ ...prev, mpesaNumber }));
  };

  const handleNameChange = (fullName: string) => {
    setFormData(prev => ({ ...prev, fullName }));
  };

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
  };

  const handleCollateralTypeChange = (collateralType: CollateralType) => {
    setFormData(prev => ({ ...prev, collateralType }));
  };

  const handleAssetValueChange = (assetValue: number) => {
    setFormData(prev => ({ ...prev, assetValue }));
  };

  // Calculate max loan amount for secured loans
  const getMaxLoanAmount = (): number | undefined => {
    if (formData.loanType === 'secured' && formData.collateralType && formData.assetValue > 0) {
      return Math.floor(formData.assetValue * LTV_LIMITS[formData.collateralType]);
    }
    return undefined;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:...;base64, prefix to get raw base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    try {
      // Convert all documents to Base64
      const filesPromises = formData.documents.map(async (doc) => {
        const base64 = await convertFileToBase64(doc.file);
        return {
          base64,
          fileName: doc.name,
          mimeType: doc.file.type,
        };
      });

      const files = await Promise.all(filesPromises);

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbw3wHKN9FlXHlISrG20IbdEzsyKimB7WSrfnI5-6YPFZj9jCkwAiHX0NuPQMJYymp74/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            loanType: formData.loanType,
            amount: formData.amount,
            termMonths: formData.termMonths,
            mpesaNumber: formData.mpesaNumber,
            collateralType: formData.collateralType,
            assetValue: formData.assetValue,
            files,
          }),
        }
      );

      if (!response.ok) throw new Error("Submission failed");

      setStep("success");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error sending your application.",
        variant: "destructive",
      });
    }
  };

  const handleNewApplication = () => {
    // Clean up document previews
    formData.documents.forEach(doc => URL.revokeObjectURL(doc.preview));
    
    setFormData(initialState);
    setStep('type');
  };

  const getStepOrder = (): FormStep[] => {
    if (formData.loanType === 'secured') {
      return ['type', 'collateral', 'amount', 'documents', 'mpesa', 'review', 'success'];
    }
    return ['type', 'amount', 'documents', 'mpesa', 'review', 'success'];
  };

  const goNext = () => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  // Build collateral info for secured loans
  const collateralInfo: CollateralInfo | undefined = 
    formData.loanType === 'secured' && formData.collateralType && formData.assetValue > 0
      ? {
          type: formData.collateralType,
          assetValue: formData.assetValue,
          maxLoanAmount: getMaxLoanAmount() || 0,
        }
      : undefined;

  // Build complete application object
  const application: LoanAppType = {
    loanType: formData.loanType || 'unsecured',
    amount: formData.amount,
    termMonths: formData.termMonths,
    calculation: formData.calculation || calculateLoan(formData.amount, formData.termMonths),
    documents: formData.documents,
    mpesaNumber: formData.mpesaNumber,
    fullName: formData.fullName,
    collateral: collateralInfo,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-foreground">QuickLoan</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container max-w-lg mx-auto px-4">
        <ProgressBar currentStep={step} loanType={formData.loanType} />
      </div>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === 'type' && (
            <LoanTypeStep
  key="type"
  selectedType={formData.loanType}
  onSelect={handleLoanTypeSelect}
  onNext={() => {}}
            />
          )}

          {step === 'collateral' && formData.loanType === 'secured' && (
            <CollateralStep
              key="collateral"
              collateralType={formData.collateralType}
              assetValue={formData.assetValue}
              onCollateralTypeChange={handleCollateralTypeChange}
              onAssetValueChange={handleAssetValueChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === 'amount' && (
            <LoanAmountStep
              key="amount"
              amount={formData.amount}
              termMonths={formData.termMonths}
              maxLoanAmount={getMaxLoanAmount()}
              loanType={formData.loanType}
              onAmountChange={handleAmountChange}
              onTermChange={handleTermChange}
              onCalculationChange={handleCalculationChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === 'documents' && formData.loanType && (
            <DocumentUploadStep
              key="documents"
              loanType={formData.loanType}
              documents={formData.documents}
              onDocumentsChange={handleDocumentsChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === 'mpesa' && (
            <MpesaStep
              key="mpesa"
              mpesaNumber={formData.mpesaNumber}
              fullName={formData.fullName}
              email={formData.email}
              calculation={formData.calculation}
              onMpesaChange={handleMpesaChange}
              onNameChange={handleNameChange}
              onEmailChange={handleEmailChange}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              key="review"
              application={application}
              onSubmit={handleSubmit}
              onBack={goBack}
            />
          )}

          {step === 'success' && (
            <SuccessStep
              key="success"
              application={application}
              onNewApplication={handleNewApplication}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
