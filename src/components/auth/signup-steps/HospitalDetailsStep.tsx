import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface HospitalDetailsData {
  hospitalName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  numBeds: string;
  departments: string[];
}

interface HospitalDetailsStepProps {
  data: HospitalDetailsData;
  onChange: (data: Partial<HospitalDetailsData>) => void;
  errors: Partial<Record<keyof HospitalDetailsData, string>>;
}

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'
];

const departmentOptions = [
  'General Medicine', 'Surgery', 'Orthopedics', 'Pediatrics', 'Cardiology',
  'Neurology', 'Gynecology', 'Dermatology', 'ENT', 'Ophthalmology',
  'Psychiatry', 'Radiology', 'Pathology', 'Emergency', 'ICU', 'Oncology'
];

export function HospitalDetailsStep({ data, onChange, errors }: HospitalDetailsStepProps) {
  const handleDeptToggle = (dept: string) => {
    const current = data.departments || [];
    if (current.includes(dept)) {
      onChange({ departments: current.filter(d => d !== dept) });
    } else {
      onChange({ departments: [...current, dept] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hospitalName" className="text-sm font-medium">
          Hospital Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="hospitalName"
          type="text"
          placeholder="City General Hospital"
          value={data.hospitalName}
          onChange={(e) => onChange({ hospitalName: e.target.value })}
          className={`h-11 rounded-xl ${errors.hospitalName ? 'border-destructive' : ''}`}
        />
        {errors.hospitalName && <p className="text-xs text-destructive">{errors.hospitalName}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hospitalEmail" className="text-sm font-medium">
            Official Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="hospitalEmail"
            type="email"
            placeholder="admin@hospital.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={`h-11 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="hospitalPhone" className="text-sm font-medium">
            Phone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="hospitalPhone"
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
        <Label htmlFor="hospitalAddress" className="text-sm font-medium">
          Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="hospitalAddress"
          type="text"
          placeholder="456, Healthcare Avenue"
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          className={`h-11 rounded-xl ${errors.address ? 'border-destructive' : ''}`}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hospitalCity" className="text-sm font-medium">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="hospitalCity"
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
          <Label htmlFor="hospitalPincode" className="text-sm font-medium">Pincode</Label>
          <Input
            id="hospitalPincode"
            type="text"
            placeholder="400001"
            value={data.pincode}
            onChange={(e) => onChange({ pincode: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numBeds" className="text-sm font-medium">
          Number of Beds <span className="text-destructive">*</span>
        </Label>
        <Input
          id="numBeds"
          type="number"
          min="1"
          placeholder="100"
          value={data.numBeds}
          onChange={(e) => onChange({ numBeds: e.target.value })}
          className={`h-11 rounded-xl ${errors.numBeds ? 'border-destructive' : ''}`}
        />
        {errors.numBeds && <p className="text-xs text-destructive">{errors.numBeds}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Departments <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {departmentOptions.map(dept => (
            <button
              key={dept}
              type="button"
              onClick={() => handleDeptToggle(dept)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                data.departments?.includes(dept)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted border-border hover:border-primary/50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        {errors.departments && <p className="text-xs text-destructive">{errors.departments}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospitalWebsite" className="text-sm font-medium">Website <span className="text-muted-foreground">(Optional)</span></Label>
        <Input
          id="hospitalWebsite"
          type="url"
          placeholder="https://www.hospital.com"
          value={data.website}
          onChange={(e) => onChange({ website: e.target.value })}
          className="h-11 rounded-xl"
        />
      </div>
    </div>
  );
}
