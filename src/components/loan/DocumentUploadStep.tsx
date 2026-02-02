import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DocumentFile, LoanType } from '@/types/loan';
import { UploadField } from './UploadField'; // replace with your actual upload component

interface DocumentUploadStepProps {
  loanType: LoanType;
  documents: DocumentFile[];
  onDocumentsChange: (docs: DocumentFile[]) => void;
  onNext: () => void;
  onBack: () => void;
  showOnlyAssetDocs?: boolean; // New prop
}

export function DocumentUploadStep({
  loanType,
  documents,
  onDocumentsChange,
  onNext,
  onBack,
  showOnlyAssetDocs = false,
}: DocumentUploadStepProps) {
  const [localDocs, setLocalDocs] = useState<DocumentFile[]>(documents);

  const handleChange = (files: DocumentFile[], type: string) => {
    const filtered = localDocs.filter(doc => doc.type !== type);
    const updated = [...filtered, ...files];
    setLocalDocs(updated);
    onDocumentsChange(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Upload Documents</h2>
      <p className="text-muted-foreground">
        {showOnlyAssetDocs
          ? 'Please upload only your asset documents and photos.'
          : 'Submit your ID, income proof & asset documents.'}
      </p>

      <Card className="p-5 space-y-4">
        {/* Only show these if not restricted to asset docs */}
        {!showOnlyAssetDocs && (
          <>
            <UploadField
              label="National ID"
              required
              type="id"
              files={localDocs.filter(d => d.type === 'id')}
              onChange={files => handleChange(files, 'id')}
            />
            <UploadField
              label="Proof of Income"
              required
              type="income"
              files={localDocs.filter(d => d.type === 'income')}
              onChange={files => handleChange(files, 'income')}
            />
          </>
        )}

        {/* Asset documents always required */}
        <UploadField
          label="Asset Documents"
          required
          type="asset-docs"
          files={localDocs.filter(d => d.type === 'asset-docs')}
          onChange={files => handleChange(files, 'asset-docs')}
        />
        <UploadField
          label="Asset Photos"
          required
          type="asset-photos"
          files={localDocs.filter(d => d.type === 'asset-photos')}
          onChange={files => handleChange(files, 'asset-photos')}
        />
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
