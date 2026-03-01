import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '../FileUpload';
import { Microscope, Clock } from 'lucide-react';

export interface CenterVerificationData {
  accreditationNumber: string;
  accreditationType: string;
  gstNumber: string;
  registrationCertificate: File | null;
  ownerIdProof: File | null;
}

interface CenterVerificationStepProps {
  data: CenterVerificationData;
  onChange: (data: Partial<CenterVerificationData>) => void;
  errors: Partial<Record<keyof CenterVerificationData, string>>;
}

const accreditationTypes = [
  'NABL (National Accreditation Board for Testing and Calibration Laboratories)',
  'NABH (National Accreditation Board for Hospitals & Healthcare Providers)',
  'CLIA (Clinical Laboratory Improvement Amendments)',
  'State License',
  'Other',
];

export function CenterVerificationStep({ data, onChange, errors }: CenterVerificationStepProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <Microscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Center Verification</p>
          <p className="text-xs text-muted-foreground mt-1">
            We verify diagnostic centers to ensure quality standards. All documents are kept secure and confidential.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Accreditation Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.accreditationType}
          onValueChange={(v) => onChange({ accreditationType: v })}
        >
          <SelectTrigger className={`h-11 rounded-xl ${errors.accreditationType ? 'border-destructive' : ''}`}>
            <SelectValue placeholder="Select accreditation type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-60">
            {accreditationTypes.map(a => (
              <SelectItem key={a} value={a} className="rounded-lg">{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.accreditationType && <p className="text-xs text-destructive">{errors.accreditationType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accreditationNumber" className="text-sm font-medium">
          Accreditation / License Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="accreditationNumber"
          type="text"
          placeholder="e.g., NABL-MC-12345"
          value={data.accreditationNumber}
          onChange={(e) => onChange({ accreditationNumber: e.target.value })}
          className={`h-11 rounded-xl ${errors.accreditationNumber ? 'border-destructive' : ''}`}
        />
        {errors.accreditationNumber && <p className="text-xs text-destructive">{errors.accreditationNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gstNumber" className="text-sm font-medium">
          GST Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="gstNumber"
          type="text"
          placeholder="e.g., 22AAAAA0000A1Z5"
          value={data.gstNumber}
          onChange={(e) => onChange({ gstNumber: e.target.value })}
          className={`h-11 rounded-xl ${errors.gstNumber ? 'border-destructive' : ''}`}
        />
        {errors.gstNumber && <p className="text-xs text-destructive">{errors.gstNumber}</p>}
      </div>

      <FileUpload
        label="Registration Certificate"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.registrationCertificate}
        onChange={(file) => onChange({ registrationCertificate: file })}
        error={errors.registrationCertificate}
        required
      />

      <FileUpload
        label="Owner / Director ID Proof (Aadhaar/PAN)"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.ownerIdProof}
        onChange={(file) => onChange({ ownerIdProof: file })}
        error={errors.ownerIdProof}
        required
      />

      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Verification Status:</span> Pending (24–48 hours after submission)
        </p>
      </div>
    </div>
  );
}
