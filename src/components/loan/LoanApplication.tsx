import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { BorrowerIdentityStep } from './BorrowerIdentityStep';
import { WelcomeBackBanner } from './WelcomeBackBanner';
import { LoanTypeStep } from './LoanTypeStep';
import { CollateralStep, LTV_LIMITS } from './CollateralStep';
import { LoanAmountStep } from './LoanAmountStep';
import { DocumentUploadStep } from './DocumentUploadStep';
import { DocumentReusePrompt } from './DocumentReusePrompt';
import { MpesaStep } from './MpesaStep';
import { ReviewStep } from './ReviewStep';
import { SuccessStep } from './SuccessStep';
import { DebugPanel } from './DebugPanel';

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
import { useReturningBorrower, normalizeBorrowerId } from '@/hooks/useReturningBorrower';

// Extended form step to include identity and document choice
type ExtendedFormStep = FormStep | 'identity' | 'doc-choice';

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
  borrowerId: '',
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

  const [step, setStep] = useState<ExtendedFormStep>('identity');
  const [formData, setFormData] = useState(initialState);

  // Safely define borrower flags
  const isRepeat = borrowerInfo?.isRepeat ?? false;
  const docsReused = borrowerInfo?.docsReused ?? false;
  const collateralChanged = borrowerInfo?.collateralChanged ?? false;

  const handleBorrowerIdChange = (borrowerId: string) => {
    setFormData(prev => ({ ...prev, borrowerId }));
  };

  const handleCheckBorrower = async (borrowerId: string) => {
    const existing = await checkBorrower(borrowerId);
    if (existing) {
      // Pre-fill name and email if found
      if (existing.fullName) {
        setFormData(prev => ({ ...prev, fullName: existing.fullName || prev.fullName }));
      }
      if (existing.email) {
        setFormData(prev => ({ ...prev, email: existing.email || prev.email }));
      }
      // Set mpesaNumber to borrowerId for phone-based lookups
      setFormData(prev => ({ ...prev, mpesaNumber: borrowerId }));
    }
  };

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
    
    if (isRepeat && borrowerInfo?.previousCollateral) {
      const hasChanged = borrowerInfo.previousCollateral !== collateralDescription;
      setCollateralChanged(hasChanged);
    }
    
    setFormData(prev => ({
      ...prev,
      assetValue,
      collateralDescription,
    }));
  };

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
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    try {
      let files: { base64: string; fileName: string; mimeType: string }[] = [];
      if (!docsReused && formData.documents.length > 0) {
        const filesPromises = formData.documents.map(async (doc) => {
          const base64 = await convertFileToBase64(doc.file);
          return { base64, fileName: doc.name, mimeType: doc.file.type };
        });
        files = await Promise.all(filesPromises);
      }

      // Use normalized borrowerId for consistent storage
      const normalizedBorrowerId = normalizeBorrowerId(formData.borrowerId || formData.mpesaNumber);

      const payload = {
        borrowerId: normalizedBorrowerId,
        fullName: formData.fullName,
        email: formData.email,
        mpesaNumber: formData.mpesaNumber,
        isRepeat,
        docsReused,
        collateralChanged,
        loanType: formData.loanType,
        loanAmount: formData.amount,
        amount: formData.amount,
        loanTerm: formData.termMonths,
        termMonths: formData.termMonths,
        interestRate: 20,
        collateralType: formData.collateralType,
        collateralDescription: formData.collateralDescription,
        assetValue: formData.assetValue,
        files,
      };

      console.log('[LoanApplication] Submitting with normalized borrowerId:', normalizedBorrowerId);

      await fetch(
        "https://script.google.com/macros/s/AKfycbxo-Dr4pesDY6kr2FhMfmAJxpWL7HkMF6xNuhzY18S82i6psRZ31xfIfo0j27XWVEuY/exec",
        { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }
      );

      setStep("success");
    } catch (error) {
      toast({ title: "Submission Failed", description: "There was a network error sending your application. Please try again.", variant: "destructive" });
    }
  };

  const handleNewApplication = () => {
    formData.documents.forEach(doc => URL.revokeObjectURL(doc.preview));
    setFormData(initialState);
    clearBorrower();
    setStep('identity');
  };

  const handleDocReuse = (reuse: boolean) => {
    setDocsReused(reuse);
    setStep(reuse ? 'mpesa' : 'documents');
  };

  const getStepOrder = (): ExtendedFormStep[] => {
    const baseSteps: ExtendedFormStep[] = ['identity', 'type'];
    
    if (formData.loanType === 'secured') {
      if (isRepeat) {
        return [...baseSteps, 'collateral', 'amount', 'doc-choice', 'documents', 'mpesa', 'review', 'success'];
      }
      return [...baseSteps, 'collateral', 'amount', 'documents', 'mpesa', 'review', 'success'];
    }
    
    if (isRepeat) {
      return [...baseSteps, 'amount', 'doc-choice', 'documents', 'mpesa', 'review', 'success'];
    }
    return [...baseSteps, 'amount', 'documents', 'mpesa', 'review', 'success'];
  };

  const goNext = () => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(step);
    
    // Special handling for amount step for repeat borrowers
    if (step === 'amount' && isRepeat) {
      setStep('doc-choice');
      return;
    }
    
    // Handle doc-choice outcomes for repeat borrowers
    if (step === 'doc-choice') {
      if (docsReused) {
        // Docs reused - skip to mpesa
        setStep('mpesa');
        return;
      }
      // Not reusing docs - go to full document upload
      setStep('documents');
      return;
    }
    
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(step);
    
    // Special handling for doc-choice
    if (step === 'doc-choice') {
      setStep('amount');
      return;
    }
    
    // If on mpesa and docs were reused, go back to doc-choice
    if (step === 'mpesa' && isRepeat && docsReused) {
      setStep('doc-choice');
      return;
    }
    
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  const collateralInfo: CollateralInfo | undefined = 
    formData.loanType === 'secured' && formData.collateralType && formData.assetValue > 0
      ? { type: formData.collateralType, assetValue: formData.assetValue, maxLoanAmount: getMaxLoanAmount() || 0 }
      : undefined;

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

  // Map extended steps to base FormStep for progress bar
  const getProgressStep = (): FormStep => {
    if (step === 'identity') return 'type';
    if (step === 'doc-choice') return 'documents';
    return step as FormStep;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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

      {/* Welcome Back Banner for repeat borrowers */}
      {isRepeat && step !== 'identity' && step !== 'success' && (
        <WelcomeBackBanner borrowerId={formData.borrowerId} />
      )}

      {step !== 'identity' && step !== 'success' && (
        <div className="container max-w-lg mx-auto px-4">
          <ProgressBar currentStep={getProgressStep()} loanType={formData.loanType} />
        </div>
      )}

      <main className="container max-w-lg mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === 'identity' && (
            <BorrowerIdentityStep
              key="identity"
              borrowerId={formData.borrowerId}
              isLoading={isLoading}
              onBorrowerIdChange={handleBorrowerIdChange}
              onCheckBorrower={handleCheckBorrower}
              onNext={() => setStep('type')}
            />
          )}

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

          {step === 'doc-choice' && isRepeat && (
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
              key="review"
              application={application}
              borrowerInfo={{ isRepeat, docsReused, collateralChanged }}
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

      {/* Debug Panel - temporary */}
      <DebugPanel
        borrowerId={formData.borrowerId}
        isRepeat={isRepeat}
        docsReused={docsReused}
        collateralChanged={collateralChanged}
      />
    </div>
  );
}
