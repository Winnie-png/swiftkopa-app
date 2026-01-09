import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, FileText, Image, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoanType, DocumentFile } from '@/types/loan';

interface DocumentUploadStepProps {
  loanType: LoanType;
  documents: DocumentFile[];
  onDocumentsChange: (docs: DocumentFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

interface DocumentRequirement {
  type: DocumentFile['type'];
  label: string;
  description: string;
  accept: string;
  required: boolean;
  multiple?: boolean;
}

const getRequiredDocuments = (loanType: LoanType): DocumentRequirement[] => {
  const base: DocumentRequirement[] = [
    {
      type: 'id',
      label: 'National ID',
      description: 'Front and back of your ID card',
      accept: 'image/*,.pdf',
      required: true,
    },
    {
      type: 'income',
      label: 'Proof of Income',
      description: 'Payslip, bank statement, or M-Pesa statement',
      accept: 'image/*,.pdf',
      required: true,
    },
  ];

  if (loanType === 'secured') {
    return [
      ...base,
      {
        type: 'asset',
        label: 'Asset Documents',
        description: 'Logbook, title deed, or ownership proof',
        accept: 'image/*,.pdf',
        required: true,
      },
      {
        type: 'photo',
        label: 'Asset Photos',
        description: 'Clear photos of the asset',
        accept: 'image/*',
        required: true,
        multiple: true,
      },
    ];
  }

  return base;
};

export function DocumentUploadStep({
  loanType,
  documents,
  onDocumentsChange,
  onNext,
  onBack,
}: DocumentUploadStepProps) {
  const requirements = getRequiredDocuments(loanType);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: DocumentFile['type']
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs: DocumentFile[] = [];
    
    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);
      newDocs.push({
        file,
        preview,
        type: docType,
        name: file.name,
      });
    });

    // Replace existing docs of same type
    const filtered = documents.filter(d => d.type !== docType);
    onDocumentsChange([...filtered, ...newDocs]);
  };

  const removeDocument = (index: number) => {
    const newDocs = [...documents];
    URL.revokeObjectURL(newDocs[index].preview);
    newDocs.splice(index, 1);
    onDocumentsChange(newDocs);
  };

  const getDocsForType = (type: DocumentFile['type']) => {
    return documents.filter(d => d.type === type);
  };

  const isComplete = requirements.every(req => {
    const docs = getDocsForType(req.type);
    return req.required ? docs.length > 0 : true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Upload Documents</h2>
        <p className="text-muted-foreground mt-1">
          {loanType === 'secured' 
            ? 'Submit ID, income proof & asset documents' 
            : 'Submit your ID and proof of income'}
        </p>
      </div>

      <div className="space-y-4">
        {requirements.map((req, index) => {
          const typeDocs = getDocsForType(req.type);
          const hasDoc = typeDocs.length > 0;

          return (
            <motion.div
              key={req.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`
                  p-4 transition-all duration-200
                  ${dragOver === req.type ? 'ring-2 ring-primary bg-primary/5' : ''}
                  ${hasDoc ? 'border-success/50 bg-success/5' : ''}
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(req.type);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  const files = e.dataTransfer.files;
                  if (files.length) {
                    const event = { target: { files } } as React.ChangeEvent<HTMLInputElement>;
                    handleFileChange(event, req.type);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg flex-shrink-0
                    ${hasDoc ? 'bg-success/20' : 'bg-muted'}
                  `}>
                    {hasDoc ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{req.label}</h4>
                      {req.required && (
                        <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>

                    {/* Uploaded files preview */}
                    {typeDocs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {typeDocs.map((doc, docIndex) => {
                          const globalIndex = documents.findIndex(d => d === doc);
                          const isImage = doc.file.type.startsWith('image/');
                          
                          return (
                            <div
                              key={docIndex}
                              className="relative group"
                            >
                              {isImage ? (
                                <img
                                  src={doc.preview}
                                  alt={doc.name}
                                  className="w-16 h-16 object-cover rounded-lg border"
                                />
                              ) : (
                                <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg border">
                                  <FileText className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                              <button
                                onClick={() => removeDocument(globalIndex)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Upload button */}
                    <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {hasDoc ? 'Replace' : 'Upload'}
                      </span>
                      <input
                        type="file"
                        accept={req.accept}
                        multiple={req.multiple}
                        onChange={(e) => handleFileChange(e, req.type)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          className="flex-1 gradient-primary text-primary-foreground shadow-button"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
