import { useState } from 'react';
import { LoanApplicationData, ApplicationStatus } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Check,
  X,
  FileText,
  Phone,
  Calendar,
  DollarSign,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationCardProps {
  application: LoanApplicationData;
  onUpdate: (rowIndex: number, status: ApplicationStatus, notes: string) => Promise<boolean>;
}

const ApplicationCard = ({ application, onUpdate }: ApplicationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(application.notes || '');
  const [updating, setUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStatusUpdate = async (status: ApplicationStatus) => {
    setUpdating(true);
    const success = await onUpdate(application.rowIndex, status, notes);
    setUpdating(false);
    if (success) {
      setDialogOpen(false);
    }
  };

  const handleNotesUpdate = async () => {
    setUpdating(true);
    await onUpdate(application.rowIndex, application.status, notes);
    setUpdating(false);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{application.fullName}</span>
              {getStatusBadge(application.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(application.amount)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {application.termMonths}mo
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {application.loanType}
              </Badge>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 pt-0 border-t bg-muted/30">
          <div className="grid gap-4">
            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{application.mpesaNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(application.submittedAt)}</span>
              </div>
              {application.email && (
                <div className="flex items-center gap-2 col-span-full">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{application.email}</span>
                </div>
              )}
              {application.collateralType && (
                <div className="flex items-center gap-2 col-span-full">
                  <span className="text-muted-foreground">Collateral:</span>
                  <span className="capitalize">
                    {application.collateralType} ({formatCurrency(application.assetValue)})
                  </span>
                </div>
              )}
            </div>

            {/* Documents */}
            {application.documents && application.documents.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Documents</p>
                <div className="flex flex-wrap gap-2">
                  {application.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-background px-2 py-1 rounded border hover:bg-muted transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      {doc.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-sm font-medium mb-2">Admin Notes</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                className="min-h-[80px] text-sm"
              />
              {notes !== application.notes && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={handleNotesUpdate}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Save Notes
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={application.status === 'approved' || updating}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Application</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>
                      Are you sure you want to approve the loan application for{' '}
                      <strong>{application.fullName}</strong> ({formatCurrency(application.amount)})?
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Confirm Approve
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={application.status === 'rejected' || updating}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Application</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>
                      Are you sure you want to reject the loan application for{' '}
                      <strong>{application.fullName}</strong>?
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Confirm Reject
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ApplicationCard;
