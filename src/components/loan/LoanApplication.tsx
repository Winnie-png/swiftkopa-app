// Loan Application Component
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { LoanTypeStep } from './LoanTypeStep';
import { CollateralStep, LTV_LIMITS } from './CollateralStep';
import { LoanAmountStep } from './LoanAmountStep';
import { DocumentUploadStep } from './DocumentUploadStep';
import { DocumentReusePrompt } from './DocumentReusePrompt';
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
import { useReturningBorrower } from '@/hooks/useReturningBorrower';

// Extended form step to include document choice
type ExtendedFormStep = FormStep | 'doc-choice';

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
  collateralDescription: '',
};

export function LoanApplication() {
  const { toast } = useToast();
  const { 
    borrowerInfo, 
    isLoading, 
    checkBorrower, 
    setDocsReused, 
    setCollateralChanged,
    clearBorrower 
  } = useReturningBorrower();
  const [step, setStep] = useState<ExtendedFormStep>('type');
  const [formData, setFormData] = useState(initialState);

  const handleLoanTypeSelect = (type: LoanType) => {
    setFormData(prev => ({ ...prev, loanType: type }));
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
    const collateralDescription = `${formData.collateralType || 'asset'}: ${assetValue}`;
    
    // Detect collateral change for repeat borrowers
    if (borrowerInfo?.isRepeat && borrowerInfo.previousCollateral) {
      const hasChanged = borrowerInfo.previousCollateral !== collateralDescription;
      setCollateralChanged(hasChanged);
    }
    
    setFormData(prev => ({
      ...prev,
      assetValue,
      collateralDescription,
    }));
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
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    try {
      // Only convert documents if not reusing
      let files: { base64: string; fileName: string; mimeType: string }[] = [];
      
      if (!borrowerInfo?.docsReused && formData.documents.length > 0) {
        const filesPromises = formData.documents.map(async (doc) => {
          const base64 = await convertFileToBase64(doc.file);
          return {
            base64,
            fileName: doc.name,
            mimeType: doc.file.type,
          };
        });
        files = await Promise.all(filesPromises);
      }

      // Complete payload with all required fields
      const payload = {
        // Borrower identification
        borrowerId: formData.mpesaNumber,
        fullName: formData.fullName,
        email: formData.email,
        mpesaNumber: formData.mpesaNumber,
        
        // Repeat borrower flags
        isRepeat: borrowerInfo?.isRepeat ?? false,
        docsReused: borrowerInfo?.docsReused ?? false,
        collateralChanged: borrowerInfo?.collateralChanged ?? false,
        
        // Loan details
        loanType: formData.loanType,
        loanAmount: formData.amount,
        amount: formData.amount,
        loanTerm: formData.termMonths,
        termMonths: formData.termMonths,
        interestRate: 20,
        
        // Collateral
        collateralType: formData.collateralType,
        collateralDescription: formData.collateralDescription,
        assetValue: formData.assetValue,
        
        // Documents (empty if reused)
        files,
      };

      await fetch(
        "https://script.google.com/macros/s/AKfycbxo-Dr4pesDY6kr2FhMfmAJxpWL7HkMF6xNuhzY18S82i6psRZ31xfIfo0j27XWVEuY/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        }
      );

      setStep("success");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was a network error sending your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewApplication = () => {
    formData.documents.forEach(doc => URL.revokeObjectURL(doc.preview));
    setFormData(initialState);
    clearBorrower();
    setStep('type');
  };

  // Handle document reuse choice
  const handleDocReuse = (reuse: boolean) => {
    setDocsReused(reuse);
    if (reuse) {
      // Skip to mpesa step
      setStep('mpesa');
    } else {
      // Go to document upload
      setStep('documents');
    }
  };

  const getStepOrder = (): ExtendedFormStep[] => {
    if (formData.loanType === 'secured') {
      if (borrowerInfo?.isRepeat) {
        return ['type', 'collateral', 'amount', 'doc-choice', 'documents', 'mpesa', 'review', 'success'];
      }
      return ['type', 'collateral', 'amount', 'documents', 'mpesa', 'review', 'success'];
    }
    if (borrowerInfo?.isRepeat) {
      return ['type', 'amount', 'doc-choice', 'documents', 'mpesa', 'review', 'success'];
    }
    return ['type', 'amount', 'documents', 'mpesa', 'review', 'success'];
  };

  const goNext = () => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(step);
    
    // For repeat borrowers after amount step, show doc choice
    if (step === 'amount' && borrowerInfo?.isRepeat) {
      setStep('doc-choice');
      return;
    }
    
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(step);
    
    // Special handling for doc-choice step
    if (step === 'doc-choice') {
      setStep('amount');
      return;
    }
    
    // If coming back from mpesa and docs were reused, go to doc-choice
    if (step === 'mpesa' && borrowerInfo?.docsReused) {
      setStep('doc-choice');
      return;
    }
    
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

  // Get progress step for display (map doc-choice to documents)
  const progressStep: FormStep = step === 'doc-choice' ? 'documents' : step as FormStep;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-foreground">SwiftKopa</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container max-w-lg mx-auto px-4">
        <ProgressBar currentStep={progressStep} loanType={formData.loanType} />
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

          {step === 'doc-choice' && borrowerInfo?.isRepeat && (
            <DocumentReusePrompt
              key="doc-choice"
              onReuse={() => handleDocReuse(true)}
              onUploadNew={() => handleDocReuse(false)}
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
              returningBorrower={borrowerInfo}
              isCheckingBorrower={isLoading}
              onMpesaChange={handleMpesaChange}
              onNameChange={handleNameChange}
              onEmailChange={handleEmailChange}
              onNext={goNext}
              onBack={goBack}
              onCheckBorrower={checkBorrower}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              application={application}
              borrowerInfo={{
                isRepeat: borrowerInfo?.isRepeat,
                docsReused: borrowerInfo?.docsReused,
                collateralChanged: borrowerInfo?.collateralChanged,
              }}
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
