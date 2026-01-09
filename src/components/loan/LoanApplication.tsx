import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { LoanTypeStep } from './LoanTypeStep';
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
  FormStep 
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
};

export function LoanApplication() {
  const { toast } = useToast();
  const [step, setStep] = useState<FormStep>('type');
  const [formData, setFormData] = useState(initialState);

  const handleLoanTypeSelect = (type: LoanType) => {
    setFormData(prev => ({ ...prev, loanType: type }));
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

  const handleSubmit = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would:
    // 1. Send data to Google Sheets via Apps Script Web App
    // 2. Upload documents to Google Drive
    // 3. Send email notification to admin
    
    console.log('Loan Application Submitted:', {
      loanType: formData.loanType,
      amount: formData.amount,
      termMonths: formData.termMonths,
      calculation: formData.calculation,
      mpesaNumber: formData.mpesaNumber,
      fullName: formData.fullName,
      documentsCount: formData.documents.length,
    });

    toast({
      title: "Application Submitted",
      description: "Your loan application has been received successfully.",
    });

    setStep('success');
  };

  const handleNewApplication = () => {
    // Clean up document previews
    formData.documents.forEach(doc => URL.revokeObjectURL(doc.preview));
    
    setFormData(initialState);
    setStep('type');
  };

  const goNext = () => {
    const stepOrder: FormStep[] = ['type', 'amount', 'documents', 'mpesa', 'review', 'success'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  };

  const goBack = () => {
    const stepOrder: FormStep[] = ['type', 'amount', 'documents', 'mpesa', 'review', 'success'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  // Build complete application object
  const application: LoanAppType = {
    loanType: formData.loanType || 'unsecured',
    amount: formData.amount,
    termMonths: formData.termMonths,
    calculation: formData.calculation || calculateLoan(formData.amount, formData.termMonths),
    documents: formData.documents,
    mpesaNumber: formData.mpesaNumber,
    fullName: formData.fullName,
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
        <ProgressBar currentStep={step} />
      </div>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {step === 'type' && (
            <LoanTypeStep
              key="type"
              selectedType={formData.loanType}
              onSelect={handleLoanTypeSelect}
              onNext={goNext}
            />
          )}

          {step === 'amount' && (
            <LoanAmountStep
              key="amount"
              amount={formData.amount}
              termMonths={formData.termMonths}
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
              calculation={formData.calculation}
              onMpesaChange={handleMpesaChange}
              onNameChange={handleNameChange}
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
