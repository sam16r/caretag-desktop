import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Activity,
  User,
  ArrowRight,
  Stethoscope,
  Plus,
  ScanLine,
  Users,
  FileText,
  ArrowUpRight,
  Heart,
  Building2,
  MapPin,
} from 'lucide-react';
import { useDashboardStats, useRecentPatients, useTodayAppointments, useActiveEmergencies } from '@/hooks/useDashboardData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAccessSession, useActiveSessions } from '@/hooks/useAccessSession';
import { HospitalWelcomeBanner } from './HospitalWelcomeBanner';
import { useAuth } from '@/hooks/useAuth';

interface HospitalDoctorDashboardProps {
  hospital: {
    id: string;
    name: string;
    logo_url: string | null;
    city: string;
    state: string | null;
  };
  memberRole: string;
}

export function HospitalDoctorDashboard({ hospital, memberRole }: HospitalDoctorDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentPatients, isLoading: patientsLoading } = useRecentPatients(4);
  const { data: todayAppointments, isLoading: appointmentsLoading } = useTodayAppointments();
  const { data: emergencies, isLoading: emergenciesLoading } = useActiveEmergencies();
  const { data: activeSessions } = useActiveSessions();

  const hasActiveSession = !!(activeSessions?.[0]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      title: 'My Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      iconColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      onClick: () => navigate('/patients'),
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      iconColor: 'text-violet-700',
      iconBg: 'bg-violet-100',
      onClick: () => navigate('/appointments'),
    },
    {
      title: 'Emergencies',
      value: stats?.activeEmergencies || 0,
      icon: AlertTriangle,
      iconColor: (stats?.activeEmergencies || 0) > 0 ? 'text-red-700' : 'text-muted-foreground',
      iconBg: (stats?.activeEmergencies || 0) > 0 ? 'bg-red-100' : 'bg-muted',
      highlight: (stats?.activeEmergencies || 0) > 0,
      onClick: () => navigate('/emergency'),
    },
    {
      title: 'Prescriptions',
      value: stats?.activePrescriptions || 0,
      icon: FileText,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      onClick: () => navigate('/prescriptions'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Onboarding Welcome Banner */}
      {user && (
        <HospitalWelcomeBanner
          hospital={hospital}
          memberRole={memberRole}
          userId={user.id}
        />
      )}

      {/* Hospital Branding Header */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Hospital Logo / Fallback */}
          <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            {hospital.logo_url ? (
              <img
                src={hospital.logo_url}
                alt={hospital.name}
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <Building2 className="h-7 w-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold truncate">{getTimeOfDay()}, Doctor</h1>
              <Badge variant="outline" className="capitalize text-xs shrink-0">
                {memberRole}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{hospital.name}</span>
              {hospital.city && (
                <>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{hospital.city}{hospital.state ? `, ${hospital.state}` : ''}</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/scan')}
              disabled={hasActiveSession}
              className="gap-2"
              size="sm"
            >
              <ScanLine className="h-4 w-4" />
              {hasActiveSession ? 'Session Active' : 'Scan CareTag'}
            </Button>
            <Button
              onClick={() => navigate('/emergency')}
              variant="destructive"
              className="gap-2"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-pointer hover:shadow-md transition-all hover:border-border/80"
            onClick={stat.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-14" />
                  ) : (
                    <span className={cn(
                      "text-2xl font-semibold",
                      stat.highlight && "text-destructive"
                    )}>
                      {stat.value}
                    </span>
                  )}
                </div>
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.iconBg)}>
                  <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'New Patient', icon: Plus, onClick: () => navigate('/patients?action=new') },
            { label: 'Prescription', icon: Stethoscope, onClick: () => navigate('/prescriptions?action=new') },
            { label: 'Schedule', icon: Calendar, onClick: () => navigate('/appointments?action=new') },
          ].map((action) => (
            <Button key={action.label} variant="outline" size="sm" className="gap-2" onClick={action.onClick}>
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-blue-600" />
                Today's Schedule
              </CardTitle>
              <CardDescription>Your upcoming appointments</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')} className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {appointmentsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : todayAppointments && todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => navigate(`/patients/${apt.patient_id}`)}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                    {(apt.patients as any)?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {(apt.patients as any)?.full_name || 'Unknown Patient'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {apt.reason || 'General Consultation'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(new Date(apt.scheduled_at), 'h:mm a')}</p>
                    <Badge
                      variant={apt.status === 'in_progress' ? 'default' : 'secondary'}
                      className="capitalize text-xs"
                    >
                      {apt.status === 'in_progress' ? 'Active' : apt.status}
                    </Badge>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="font-medium">No appointments today</p>
                <p className="text-sm text-muted-foreground">Your schedule is clear</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Emergencies */}
          <Card className={cn(emergencies && emergencies.length > 0 && "border-destructive/30")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={cn(
                "flex items-center gap-2 text-base",
                emergencies && emergencies.length > 0 && "text-destructive"
              )}>
                {emergencies && emergencies.length > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Heart className="h-4 w-4 text-emerald-600" />
                )}
                Emergencies
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/emergency')}>View all</Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {emergenciesLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : emergencies && emergencies.length > 0 ? (
                emergencies.slice(0, 3).map((emergency) => (
                  <div
                    key={emergency.id}
                    onClick={() => navigate(`/patients/${emergency.patient_id}`)}
                    className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {(emergency.patients as any)?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-destructive truncate">{emergency.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="destructive" className="capitalize text-xs">
                            {emergency.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(emergency.created_at), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-medium text-emerald-700">All Clear</p>
                  <p className="text-sm text-muted-foreground">No emergencies</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-violet-600" />
                Recent Patients
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>View all</Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {patientsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : recentPatients && recentPatients.length > 0 ? (
                recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-sm">
                      {patient.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{patient.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.gender} • {patient.blood_group || 'Unknown'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No patients yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
