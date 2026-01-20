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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Phone,
  Calendar,
  DollarSign,
  User,
  Mail,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationCardProps {
  application: LoanApplicationData;
  onUpdate: (rowIndex: number, status: ApplicationStatus, notes: string) => Promise<boolean>;
}

const ApplicationCard = ({ application, onUpdate }: ApplicationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(application["Notes"] || '');
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(application["Status"]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setSelectedStatus(newStatus);
    setUpdating(true);
    await onUpdate(application.rowIndex, newStatus, notes);
    setUpdating(false);
  };

  const handleNotesUpdate = async () => {
    setUpdating(true);
    await onUpdate(application.rowIndex, application["Status"], notes);
    setUpdating(false);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      case 'Disbursed':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Disbursed</Badge>;
      case 'Pending Review':
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending Review</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
    if (isNaN(numAmount)) return String(amount);
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(numAmount);
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
              <span className="font-medium truncate">{application["Full Name"]}</span>
              {getStatusBadge(application["Status"])}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatCurrency(application["Amount"])}
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {application["Loan Type"]}
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
                <span>{application["Mpesa Number"]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(application["Timestamp"])}</span>
              </div>
              {application["Email"] && (
                <div className="flex items-center gap-2 col-span-full">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{application["Email"]}</span>
                </div>
              )}
            </div>

            {/* Documents */}
            {application["Documents"] && (
              <div>
                <p className="text-sm font-medium mb-2">Documents</p>
                <a
                  href={application["Documents"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-background px-2 py-1 rounded border hover:bg-muted transition-colors text-primary"
                >
                  <FileText className="w-3 h-3" />
                  View Documents
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Status Dropdown */}
            <div>
              <p className="text-sm font-medium mb-2">Update Status</p>
              <Select
                value={selectedStatus}
                onValueChange={(value) => handleStatusChange(value as ApplicationStatus)}
                disabled={updating}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Disbursed">Disbursed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <p className="text-sm font-medium mb-2">Admin Notes</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                className="min-h-[80px] text-sm"
              />
              {notes !== (application["Notes"] || '') && (
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
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ApplicationCard;
