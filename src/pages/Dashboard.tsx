import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { CenterDashboard } from '@/components/dashboard/CenterDashboard';
import { HospitalDashboard } from '@/components/dashboard/HospitalDashboard';
import { HospitalDoctorDashboard } from '@/components/dashboard/HospitalDoctorDashboard';
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard';
import { useHospitalMembership } from '@/hooks/useHospitalMembership';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Sliders } from 'lucide-react';

export default function Dashboard() {
  const { role, loading, roleLoading } = useAuth();
  const [useCustomDashboard, setUseCustomDashboard] = useState(false);
  const { data: hospitalMembership, isLoading: hospitalLoading } = useHospitalMembership();

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'center_admin') return <CenterDashboard />;
  if (role === 'hospital_admin') return <HospitalDashboard />;

  // For doctors: check if they belong to a hospital
  if (role === 'doctor' && hospitalLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (role === 'doctor' && hospitalMembership) {
    return (
      <HospitalDoctorDashboard
        hospital={hospitalMembership.hospital}
        memberRole={hospitalMembership.role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUseCustomDashboard(!useCustomDashboard)}
          className="gap-2"
        >
          {useCustomDashboard ? (
            <>
              <LayoutDashboard className="h-4 w-4" />
              Standard View
            </>
          ) : (
            <>
              <Sliders className="h-4 w-4" />
              Customizable View
            </>
          )}
        </Button>
      </div>
      {useCustomDashboard ? <CustomizableDashboard /> : <DoctorDashboard />}
    </div>
  );
}
