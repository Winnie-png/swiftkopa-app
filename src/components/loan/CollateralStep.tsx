import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Car, Wrench, MapPin, AlertCircle, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/loanCalculator';
import { CollateralType } from '@/types/loan';

interface CollateralStepProps {
  collateralType: CollateralType | null;
  assetValue: number;
  onCollateralTypeChange: (type: CollateralType) => void;
  onAssetValueChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const LTV_LIMITS: Record<CollateralType, number> = {
  vehicle: 0.50,
  equipment: 0.30,
  land: 0.60,
};

const collateralOptions: { 
  type: CollateralType; 
  label: string; 
  icon: React.ReactNode; 
  description: string;
  ltvPercent: number;
}[] = [
  {
    type: 'vehicle',
    label: 'Vehicle',
    icon: <Car className="w-6 h-6" />,
    description: 'Cars, motorcycles, trucks',
    ltvPercent: 50,
  },
  {
    type: 'equipment',
    label: 'Equipment',
    icon: <Wrench className="w-6 h-6" />,
    description: 'Machinery, tools, appliances',
    ltvPercent: 30,
  },
  {
    type: 'land',
    label: 'Land',
    icon: <MapPin className="w-6 h-6" />,
    description: 'Property, plots, real estate',
    ltvPercent: 60,
  },
];

export function CollateralStep({
  collateralType,
  assetValue,
  onCollateralTypeChange,
  onAssetValueChange,
  onNext,
  onBack,
}: CollateralStepProps) {
  const [localAssetValue, setLocalAssetValue] = useState(assetValue || 0);
  const [maxLoanAmount, setMaxLoanAmount] = useState(0);

  useEffect(() => {
    if (collateralType && localAssetValue > 0) {
      const ltv = LTV_LIMITS[collateralType];
      setMaxLoanAmount(Math.floor(localAssetValue * ltv));
    } else {
      setMaxLoanAmount(0);
    }
  }, [collateralType, localAssetValue]);

  const handleAssetValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
    setLocalAssetValue(value);
    onAssetValueChange(value);
  };

  const isValid = collateralType && localAssetValue >= 10000 && maxLoanAmount >= 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Select Collateral</h2>
        <p className="text-muted-foreground mt-1">Choose your asset type for the secured loan</p>
      </div>

      {/* Collateral Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Collateral Type</Label>
        {collateralOptions.map((option) => {
          const isSelected = collateralType === option.type;
          return (
            <motion.div
              key={option.type}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-primary bg-primary/5 border-primary'
                    : 'hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => onCollateralTypeChange(option.type)}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {option.ltvPercent}% LTV
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1 ml-auto"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Asset Value Input */}
      {collateralType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <Label htmlFor="assetValue" className="text-base font-medium">
            Estimated Asset Value (KES)
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              KES
            </span>
            <Input
              id="assetValue"
              type="text"
              value={localAssetValue > 0 ? localAssetValue.toLocaleString() : ''}
              onChange={handleAssetValueChange}
              placeholder="Enter asset value"
              className="pl-14 text-xl font-semibold h-14"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the current market value of your {collateralType}
          </p>
        </motion.div>
      )}

      {/* Max Loan Amount Display */}
      {collateralType && localAssetValue >= 10000 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Based on your selected collateral ({LTV_LIMITS[collateralType] * 100}% LTV)
                </p>
                <p className="text-lg font-bold text-foreground">
                  Maximum loan you can get:
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(maxLoanAmount)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {localAssetValue > 0 && localAssetValue < 10000 && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            Asset value must be at least KES 10,000
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 gradient-primary text-primary-foreground shadow-button"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

export { LTV_LIMITS };
