import { Stethoscope, Microscope, Building2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AccountType = 'doctor' | 'diagnostic_center' | 'hospital';

interface AccountTypeSelectorProps {
  selected: AccountType | null;
  onSelect: (type: AccountType) => void;
  onContinue: () => void;
}

const accountTypes = [
  {
    type: 'doctor' as AccountType,
    icon: Stethoscope,
    title: 'Independent Doctor',
    description: 'Register as a solo practitioner or clinic-based doctor',
    features: ['Patient management', 'Prescriptions & records', 'CareTag RFID access'],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
  },
  {
    type: 'diagnostic_center' as AccountType,
    icon: Microscope,
    title: 'Diagnostic Center',
    description: 'Register your lab or diagnostic facility',
    features: ['Upload reports to patients', 'Multi-branch support', 'Report templates'],
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
  },
  {
    type: 'hospital' as AccountType,
    icon: Building2,
    title: 'Hospital',
    description: 'Register your hospital or healthcare facility',
    features: ['Department management', 'Doctor & staff onboarding', 'Multi-branch support'],
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500',
  },
];

export function AccountTypeSelector({ selected, onSelect, onContinue }: AccountTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Choose Account Type</h2>
        <p className="text-sm text-muted-foreground">
          Select the type of account that best describes you
        </p>
      </div>

      <div className="space-y-3">
        {accountTypes.map((item) => {
          const Icon = item.icon;
          const isSelected = selected === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelect(item.type)}
              className={cn(
                'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
                isSelected
                  ? `${item.borderColor} ${item.bgColor}`
                  : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
                  isSelected ? item.bgColor : 'bg-muted'
                )}>
                  <Icon className={cn('h-6 w-6', isSelected ? item.color : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    {isSelected && (
                      <div className={cn('h-5 w-5 rounded-full flex items-center justify-center', item.bgColor)}>
                        <div className={cn('h-2.5 w-2.5 rounded-full', item.color.replace('text-', 'bg-'))} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!selected}
        className={cn(
          'w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all',
          selected
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
