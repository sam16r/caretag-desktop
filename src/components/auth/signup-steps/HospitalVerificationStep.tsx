import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '../FileUpload';
import { Building2, Clock } from 'lucide-react';

export interface HospitalVerificationData {
  registrationNumber: string;
  accreditationNumber: string;
  gstNumber: string;
  clinicalEstablishmentLicense: File | null;
  registrationCertificate: File | null;
  ownerIdProof: File | null;
  letterhead: File | null;
}

interface HospitalVerificationStepProps {
  data: HospitalVerificationData;
  onChange: (data: Partial<HospitalVerificationData>) => void;
  errors: Partial<Record<keyof HospitalVerificationData, string>>;
}

export function HospitalVerificationStep({ data, onChange, errors }: HospitalVerificationStepProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
        <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Hospital Verification</p>
          <p className="text-xs text-muted-foreground mt-1">
            We verify hospitals to ensure regulatory compliance. All documents are kept secure and confidential.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospitalRegNumber" className="text-sm font-medium">
          Hospital Registration Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="hospitalRegNumber"
          type="text"
          placeholder="State health department registration number"
          value={data.registrationNumber}
          onChange={(e) => onChange({ registrationNumber: e.target.value })}
          className={`h-11 rounded-xl ${errors.registrationNumber ? 'border-destructive' : ''}`}
        />
        {errors.registrationNumber && <p className="text-xs text-destructive">{errors.registrationNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nabhNumber" className="text-sm font-medium">
          NABH Accreditation Number <span className="text-muted-foreground">(if accredited)</span>
        </Label>
        <Input
          id="nabhNumber"
          type="text"
          placeholder="e.g., NABH-H-12345"
          value={data.accreditationNumber}
          onChange={(e) => onChange({ accreditationNumber: e.target.value })}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospitalGst" className="text-sm font-medium">
          GST Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="hospitalGst"
          type="text"
          placeholder="e.g., 22AAAAA0000A1Z5"
          value={data.gstNumber}
          onChange={(e) => onChange({ gstNumber: e.target.value })}
          className={`h-11 rounded-xl ${errors.gstNumber ? 'border-destructive' : ''}`}
        />
        {errors.gstNumber && <p className="text-xs text-destructive">{errors.gstNumber}</p>}
      </div>

      <FileUpload
        label="Clinical Establishment License"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.clinicalEstablishmentLicense}
        onChange={(file) => onChange({ clinicalEstablishmentLicense: file })}
        error={errors.clinicalEstablishmentLicense}
        required
      />

      <FileUpload
        label="Registration Certificate"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.registrationCertificate}
        onChange={(file) => onChange({ registrationCertificate: file })}
        error={errors.registrationCertificate}
        required
      />

      <FileUpload
        label="Authorized Signatory ID Proof"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.ownerIdProof}
        onChange={(file) => onChange({ ownerIdProof: file })}
        error={errors.ownerIdProof}
        required
      />

      <FileUpload
        label="Hospital Letterhead"
        accept=".pdf,.png,.jpg,.jpeg"
        value={data.letterhead}
        onChange={(file) => onChange({ letterhead: file })}
        error={errors.letterhead}
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
