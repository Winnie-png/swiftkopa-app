import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { DocumentFile, LoanType } from '@/types/loan';

interface DocumentUploadStepProps {
  loanType: LoanType;
  documents: DocumentFile[];
  onDocumentsChange: (docs: DocumentFile[]) => void;
  onNext: () => void;
  onBack: () => void;
  assetOnlyMode?: boolean; // For repeat borrowers with changed collateral
}

export function DocumentUploadStep({
  loanType,
  documents,
  onDocumentsChange,
  onNext,
  onBack,
  assetOnlyMode = false,
}: DocumentUploadStepProps) {
  const [localDocs, setLocalDocs] = useState<DocumentFile[]>(documents);

  const handleFileChange = (files: FileList | null, docType: 'id' | 'income' | 'asset' | 'photo') => {
    if (!files) return;
    
    const newDocs: DocumentFile[] = Array.from(files).map(file => ({
      name: file.name,
      file,
      preview: URL.createObjectURL(file),
      type: docType,
    }));
    
    // Replace existing files of the same type
    const filtered = localDocs.filter(doc => doc.type !== docType);
    const updated = [...filtered, ...newDocs];
    setLocalDocs(updated);
    onDocumentsChange(updated);
  };

  const removeFile = (fileName: string, docType: string) => {
    const updated = localDocs.filter(doc => !(doc.name === fileName && doc.type === docType));
    setLocalDocs(updated);
    onDocumentsChange(updated);
  };

  const getFilesByType = (type: string) => localDocs.filter(d => d.type === type);

  const renderFileList = (files: DocumentFile[]) => {
    if (files.length === 0) return null;
    return (
      <div className="mt-2 space-y-1">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="truncate max-w-[200px]">{file.name}</span>
            </div>
            <button
              onClick={() => removeFile(file.name, file.type)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {assetOnlyMode ? 'Update Asset Documents' : 'Upload Documents'}
      </h2>
      <p className="text-muted-foreground">
        {assetOnlyMode 
          ? 'Your ID and income documents are on file. Please upload updated asset documents only.'
          : 'Submit your ID, income proof & asset documents.'
        }
      </p>

      {/* Asset-only mode notice */}
      {assetOnlyMode && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-500">Collateral Changed</p>
            <p className="text-sm text-muted-foreground">
              Your collateral has changed. Please upload updated asset documents.
            </p>
          </div>
        </div>
      )}

      <Card className="p-5 space-y-5">
        {/* National ID - only for new borrowers */}
        {!assetOnlyMode && (
          <div>
            <label className="block mb-2 font-medium">
              National ID <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Choose file</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(e.target.files, 'id')}
                />
              </label>
            </div>
            {renderFileList(getFilesByType('id'))}
          </div>
        )}

        {/* Proof of Income - only for new borrowers */}
        {!assetOnlyMode && (
          <div>
            <label className="block mb-2 font-medium">
              Proof of Income <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Choose file</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(e.target.files, 'income')}
                />
              </label>
            </div>
            {renderFileList(getFilesByType('income'))}
          </div>
        )}

        {/* Asset Documents - always shown */}
        <div>
          <label className="block mb-2 font-medium">
            Asset Documents (logbook, title deed, ownership proof) <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Choose files</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                multiple
                onChange={e => handleFileChange(e.target.files, 'asset')}
              />
            </label>
          </div>
          {renderFileList(getFilesByType('asset'))}
        </div>

        {/* Asset Photos - always shown */}
        <div>
          <label className="block mb-2 font-medium">
            Asset Photos <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Choose photos</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={e => handleFileChange(e.target.files, 'photo')}
              />
            </label>
          </div>
          {renderFileList(getFilesByType('photo'))}
        </div>
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
