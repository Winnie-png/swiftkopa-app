import { motion } from 'framer-motion';
import { FileCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentReusePromptProps {
  onReuse: () => void;
  onUploadNew: () => void;
}

export function DocumentReusePrompt({ onReuse, onUploadNew }: DocumentReusePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <FileCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          We found your documents from your last loan. Use them again?
        </h2>
        <p className="text-muted-foreground mt-2">
          Your ID and other verification documents are securely stored from your previous application.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Button
          onClick={onReuse}
          className="h-16 gradient-primary text-primary-foreground shadow-button"
        >
          <FileCheck className="w-5 h-5 mr-2" />
          Yes, use existing documents
        </Button>

        <Button
          variant="outline"
          onClick={onUploadNew}
          className="h-16"
        >
          <Upload className="w-5 h-5 mr-2" />
          No, I'll upload new documents
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Reusing documents speeds up your application process
      </p>
    </motion.div>
  );
}
