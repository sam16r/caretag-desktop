import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  MapPin,
  X,
  Stethoscope,
  Calendar,
  ScanLine,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HospitalWelcomeBannerProps {
  hospital: {
    id: string;
    name: string;
    logo_url: string | null;
    city: string;
    state: string | null;
  };
  memberRole: string;
  userId: string;
}

const ONBOARDING_STEPS = [
  {
    key: 'explore_patients',
    label: 'View your patients',
    icon: Users,
    path: '/patients',
    description: 'Browse and manage your patient list',
  },
  {
    key: 'check_schedule',
    label: 'Check your schedule',
    icon: Calendar,
    path: '/appointments',
    description: 'View upcoming appointments',
  },
  {
    key: 'scan_caretag',
    label: 'Try scanning a CareTag',
    icon: ScanLine,
    path: '/scan',
    description: 'Quick access to patient records',
  },
  {
    key: 'write_prescription',
    label: 'Write a prescription',
    icon: Stethoscope,
    path: '/prescriptions',
    description: 'Create your first digital prescription',
  },
];

function getStorageKey(userId: string, hospitalId: string) {
  return `hospital_onboarding_${userId}_${hospitalId}`;
}

function getDismissedKey(userId: string, hospitalId: string) {
  return `hospital_onboarding_dismissed_${userId}_${hospitalId}`;
}

function getCompletedSteps(userId: string, hospitalId: string): string[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId, hospitalId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCompletedSteps(userId: string, hospitalId: string, steps: string[]) {
  localStorage.setItem(getStorageKey(userId, hospitalId), JSON.stringify(steps));
}

function isDismissed(userId: string, hospitalId: string): boolean {
  return localStorage.getItem(getDismissedKey(userId, hospitalId)) === 'true';
}

function setDismissed(userId: string, hospitalId: string) {
  localStorage.setItem(getDismissedKey(userId, hospitalId), 'true');
}

export function HospitalWelcomeBanner({ hospital, memberRole, userId }: HospitalWelcomeBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissedState] = useState(() => isDismissed(userId, hospital.id));
  const [completed, setCompleted] = useState(() => getCompletedSteps(userId, hospital.id));

  if (dismissed) return null;

  const progress = Math.round((completed.length / ONBOARDING_STEPS.length) * 100);
  const allDone = completed.length === ONBOARDING_STEPS.length;

  const handleStepClick = (step: typeof ONBOARDING_STEPS[0]) => {
    if (!completed.includes(step.key)) {
      const next = [...completed, step.key];
      setCompleted(next);
      setCompletedSteps(userId, hospital.id, next);
    }
    navigate(step.path);
  };

  const handleDismiss = () => {
    setDismissed(userId, hospital.id);
    setDismissedState(true);
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-foreground z-10"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="p-5 space-y-4">
        {/* Welcome header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            {hospital.logo_url ? (
              <img src={hospital.logo_url} alt={hospital.name} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold">
                <Sparkles className="inline h-4 w-4 text-primary mr-1.5 -mt-0.5" />
                Welcome to {hospital.name}!
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              You've been added as a{' '}
              <Badge variant="outline" className="capitalize text-xs mx-0.5">
                {memberRole}
              </Badge>{' '}
              {hospital.city && (
                <span className="inline-flex items-center gap-1">
                  at <MapPin className="h-3 w-3 inline" /> {hospital.city}
                  {hospital.state ? `, ${hospital.state}` : ''}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Getting started</span>
            <span className="text-muted-foreground">
              {completed.length}/{ONBOARDING_STEPS.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ONBOARDING_STEPS.map((step) => {
            const done = completed.includes(step.key);
            return (
              <button
                key={step.key}
                onClick={() => handleStepClick(step)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                  'border hover:shadow-sm',
                  done
                    ? 'bg-muted/50 border-border/50'
                    : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5'
                )}
              >
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                  done ? 'bg-primary/10' : 'bg-primary/10'
                )}>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <step.icon className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* All done message */}
        {allDone && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">You're all set! You've explored the essentials.</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
