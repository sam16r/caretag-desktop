import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Users,
  Bed,
  FileText,
  Stethoscope,
  ClipboardList,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export function HospitalDashboard() {
  const { user } = useAuth();

  const { data: org } = useQuery({
    queryKey: ['my-organization', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*, org_branches(*)')
        .eq('owner_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: members } = useQuery({
    queryKey: ['hospital-members', org?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org!.id)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!org?.id,
  });

  const doctorCount = members?.filter(m => m.role === 'doctor').length ?? 0;
  const techCount = members?.filter(m => m.role === 'technician').length ?? 0;

  const stats = [
    {
      title: 'Branches',
      value: org?.org_branches?.length ?? 0,
      icon: Building2,
      color: 'text-primary',
    },
    {
      title: 'Doctors',
      value: doctorCount,
      icon: Stethoscope,
      color: 'text-green-500',
    },
    {
      title: 'Staff',
      value: members?.length ?? 0,
      icon: Users,
      color: 'text-accent-foreground',
    },
    {
      title: 'Bed Capacity',
      value: org?.num_beds ?? 'N/A',
      icon: Bed,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {org?.name ?? 'Hospital'}
          </h1>
          <p className="text-muted-foreground text-sm">Hospital Dashboard</p>
        </div>
        <Badge
          variant={org?.verification_status === 'verified' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {org?.verification_status ?? 'pending'}
        </Badge>
      </div>

      {org?.verification_status === 'pending' && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Your hospital is pending verification. Some features may be limited until approved.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Branches & Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org?.org_branches && org.org_branches.length > 0 ? (
              <div className="space-y-3">
                {org.org_branches.map((branch: any) => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {branch.city}{branch.state ? `, ${branch.state}` : ''}
                      </p>
                    </div>
                    <Badge variant={branch.is_main_branch ? 'default' : 'outline'} className="text-xs">
                      {branch.is_main_branch ? 'Main' : 'Branch'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No branches configured yet.</p>
            )}
            {org?.departments && org.departments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {org.departments.map((dept: string) => (
                  <Badge key={dept} variant="secondary" className="text-xs">{dept}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" /> Manage Staff
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Building2 className="h-4 w-4" /> Add New Branch
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" /> View Reports
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <TrendingUp className="h-4 w-4" /> Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
