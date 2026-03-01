import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface CenterDetailsData {
  centerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
}

interface CenterDetailsStepProps {
  data: CenterDetailsData;
  onChange: (data: Partial<CenterDetailsData>) => void;
  errors: Partial<Record<keyof CenterDetailsData, string>>;
}

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
];

export function CenterDetailsStep({ data, onChange, errors }: CenterDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="centerName" className="text-sm font-medium">
          Center Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="centerName"
          type="text"
          placeholder="City Diagnostics Lab"
          value={data.centerName}
          onChange={(e) => onChange({ centerName: e.target.value })}
          className={`h-11 rounded-xl ${errors.centerName ? 'border-destructive' : ''}`}
        />
        {errors.centerName && <p className="text-xs text-destructive">{errors.centerName}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="centerEmail" className="text-sm font-medium">
            Official Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="centerEmail"
            type="email"
            placeholder="info@diagnostics.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={`h-11 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="centerPhone" className="text-sm font-medium">
            Phone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="centerPhone"
            type="tel"
            placeholder="+91 98765 43210"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className={`h-11 rounded-xl ${errors.phone ? 'border-destructive' : ''}`}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="centerAddress" className="text-sm font-medium">
          Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="centerAddress"
          type="text"
          placeholder="123, Medical Complex, Main Road"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          className={`h-11 rounded-xl ${errors.address ? 'border-destructive' : ''}`}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="centerCity" className="text-sm font-medium">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="centerCity"
            type="text"
            placeholder="Mumbai"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={`h-11 rounded-xl ${errors.city ? 'border-destructive' : ''}`}
          />
          {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            State <span className="text-destructive">*</span>
          </Label>
          <Select value={data.state} onValueChange={(v) => onChange({ state: v })}>
            <SelectTrigger className={`h-11 rounded-xl ${errors.state ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-60">
              {states.map(s => (
                <SelectItem key={s} value={s} className="rounded-lg">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="centerPincode" className="text-sm font-medium">Pincode</Label>
          <Input
            id="centerPincode"
            type="text"
            placeholder="400001"
            value={data.pincode}
            onChange={(e) => onChange({ pincode: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="centerWebsite" className="text-sm font-medium">Website <span className="text-muted-foreground">(Optional)</span></Label>
        <Input
          id="centerWebsite"
          type="url"
          placeholder="https://www.diagnostics.com"
          value={data.website}
          onChange={(e) => onChange({ website: e.target.value })}
          className="h-11 rounded-xl"
        />
      </div>
    </div>
  );
}
