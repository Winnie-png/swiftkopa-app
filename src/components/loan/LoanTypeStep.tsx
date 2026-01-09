import { motion } from 'framer-motion';
import { Shield, Wallet } from 'lucide-react';
import { LoanType } from '@/types/loan';
import { Card } from '@/components/ui/card';

interface LoanTypeStepProps {
  selectedType: LoanType | null;
  onSelect: (type: LoanType) => void;
  onNext: () => void;
}

const loanTypes = [
  {
    type: 'unsecured' as LoanType,
    title: 'Unsecured Loan',
    description: 'Quick personal loan without collateral',
    icon: Wallet,
    features: ['Fast approval', 'No assets required', 'ID & income proof only'],
  },
  {
    type: 'secured' as LoanType,
    title: 'Secured Loan',
    description: 'Lower rates with asset backing',
    icon: Shield,
    features: ['Higher limits', 'Better terms', 'Asset as security'],
  },
];

export function LoanTypeStep({ selectedType, onSelect, onNext }: LoanTypeStepProps) {
  const handleSelect = (type: LoanType) => {
    onSelect(type);
    setTimeout(onNext, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Choose Loan Type</h2>
        <p className="text-muted-foreground mt-1">Select the type of loan that suits your needs</p>
      </div>

      <div className="grid gap-4">
        {loanTypes.map((loan, index) => {
          const Icon = loan.icon;
          const isSelected = selectedType === loan.type;
          
          return (
            <motion.div
              key={loan.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => handleSelect(loan.type)}
                className={`
                  p-5 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'ring-2 ring-primary shadow-card-hover bg-primary/5' 
                    : 'hover:shadow-card-hover hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    p-3 rounded-xl
                    ${isSelected ? 'gradient-primary' : 'bg-muted'}
                  `}>
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{loan.title}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">{loan.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {loan.features.map((feature) => (
                        <span 
                          key={feature}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}
                  `}>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-primary-foreground"
                      />
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
