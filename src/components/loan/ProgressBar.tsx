import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { FormStep } from '@/types/loan';

interface ProgressBarProps {
  currentStep: FormStep;
}

const steps: { key: FormStep; label: string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount' },
  { key: 'documents', label: 'Docs' },
  { key: 'mpesa', label: 'M-Pesa' },
  { key: 'review', label: 'Review' },
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);
  
  if (currentStep === 'success') {
    return null;
  }
  
  return (
    <div className="w-full px-2 py-4">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
        
        {/* Progress line */}
        <motion.div 
          className="absolute top-4 left-0 h-0.5 bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.key === currentStep;
          
          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-colors duration-200
                  ${isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </motion.div>
              <span className={`
                mt-2 text-xs font-medium
                ${isCurrent ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
