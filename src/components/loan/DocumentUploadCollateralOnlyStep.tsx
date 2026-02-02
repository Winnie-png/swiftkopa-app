import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { DocumentFile } from '@/types/loan';

interface DocumentUploadCollateralOnlyStepProps {
  documents: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DocumentUploadCollateralOnlyStep({
  documents,
  onDocumentsChange,
  onNext,
  onBack,
}: DocumentUploadCollateralOnlyStepProps) {
  const [assetDocs, setAssetDocs] = useState<DocumentFile[]>([]);
  const [assetPhotos, setAssetPhotos] = useState<DocumentFile[]>([]);

  const handleFileChange = (files: FileList | null, docType: 'doc' | 'photo') => {
    if (!files) return;
    const fileType = docType === 'doc' ? 'asset' : 'photo';
    const newDocs: DocumentFile[] = Array.from(files).map(file => ({
      name: file.name,
      file,
      preview: URL.createObjectURL(file),
      type: fileType,
    }));
    if (docType === 'doc') {
      setAssetDocs(newDocs);
      onDocumentsChange([...assetPhotos, ...newDocs]);
    } else {
      setAssetPhotos(newDocs);
      onDocumentsChange([...assetDocs, ...newDocs]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Upload Asset Documents</h2>

      <Card className="p-4">
        <label className="block mb-2 font-medium">Asset Documents (logbook, title deed, ownership proof)</label>
        <input type="file" multiple onChange={e => handleFileChange(e.target.files, 'doc')} />
      </Card>

      <Card className="p-4">
        <label className="block mb-2 font-medium">Asset Photos</label>
        <input type="file" multiple onChange={e => handleFileChange(e.target.files, 'photo')} />
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
