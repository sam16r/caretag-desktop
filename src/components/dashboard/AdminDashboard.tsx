import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Calendar,
  AlertTriangle,
  Activity,
  TrendingUp,
  Pill,
  Shield,
  ArrowRight,
  FileText,
  Settings,
  UserCheck,
  Clock,
  Building2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useDashboardStats, useRecentPatients } from '@/hooks/useDashboardData';
import { format } from 'date-fns';
import { DoctorVerificationPanel } from '@/components/admin/DoctorVerificationPanel';
import { OrgVerificationPanel } from '@/components/admin/OrgVerificationPanel';

// Mock data for charts (would be real data in production)
const opdTrendData = [
  { name: 'Mon', count: 45 },
  { name: 'Tue', count: 52 },
  { name: 'Wed', count: 48 },
  { name: 'Thu', count: 61 },
  { name: 'Fri', count: 55 },
  { name: 'Sat', count: 32 },
  { name: 'Sun', count: 18 },
];

const emergencyTrendData = [
  { name: 'Week 1', cases: 12 },
  { name: 'Week 2', cases: 8 },
  { name: 'Week 3', cases: 15 },
  { name: 'Week 4', cases: 10 },
];

const prescriptionData = [
  { category: 'Antibiotics', count: 145, color: 'hsl(var(--primary))' },
  { category: 'Analgesics', count: 210, color: 'hsl(var(--accent))' },
  { category: 'Cardiovascular', count: 98, color: 'hsl(var(--success))' },
  { category: 'Respiratory', count: 67, color: 'hsl(var(--warning))' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentPatients, isLoading: patientsLoading } = useRecentPatients(4);

  // Fetch pending verifications count
  const { data: pendingVerifications } = useQuery({
    queryKey: ['pending-verifications-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: pendingOrgCount } = useQuery({
    queryKey: ['pending-org-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="verification" className="gap-2 relative">
              <UserCheck className="h-4 w-4" />
              Doctors
              {pendingVerifications && pendingVerifications > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingVerifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="org-verification" className="gap-2 relative">
              <Building2 className="h-4 w-4" />
              Organizations
              {pendingOrgCount && pendingOrgCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingOrgCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/reports')} className="gap-2 shadow-sm">
              <FileText className="h-4 w-4" />
              View Reports
            </Button>
            <Button onClick={() => navigate('/settings')} className="gap-2 shadow-sm">
              <Settings className="h-4 w-4" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Hospital overview for {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/reports')} className="gap-2 shadow-sm">
            <FileText className="h-4 w-4" />
            View Reports
          </Button>
          <Button onClick={() => navigate('/settings')} className="gap-2 shadow-sm">
            <Settings className="h-4 w-4" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="card-interactive stat-glow-primary cursor-pointer group" onClick={() => navigate('/patients')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                {statsLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <p className="text-4xl font-bold tracking-tight">{stats?.totalPatients || 0}</p>
                )}
                <div className="flex items-center gap-1 text-success text-sm font-medium">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Registered patients</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-interactive stat-glow-accent cursor-pointer group" onClick={() => navigate('/appointments')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                {statsLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <p className="text-4xl font-bold tracking-tight">{stats?.todayAppointments || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Scheduled today</p>
              </div>
              <div className="h-14 w-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/25 group-hover:scale-105 transition-transform">
                <Calendar className="h-7 w-7 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`card-interactive cursor-pointer group ${(stats?.activeEmergencies || 0) > 0 ? 'stat-glow-emergency border-emergency/20' : ''}`}
          onClick={() => navigate('/emergency')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Emergencies</p>
                {statsLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <p className={`text-4xl font-bold tracking-tight ${(stats?.activeEmergencies || 0) > 0 ? 'text-emergency' : ''}`}>
                    {stats?.activeEmergencies || 0}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">This week</p>
              </div>
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${
                (stats?.activeEmergencies || 0) > 0 ? 'bg-emergency shadow-emergency/30' : 'bg-muted'
              }`}>
                <AlertTriangle className={`h-7 w-7 ${(stats?.activeEmergencies || 0) > 0 ? 'text-emergency-foreground' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-interactive stat-glow-success cursor-pointer group" onClick={() => navigate('/prescriptions')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Prescriptions</p>
                {statsLoading ? (
                  <Skeleton className="h-10 w-16" />
                ) : (
                  <p className="text-4xl font-bold tracking-tight">{stats?.activePrescriptions || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Currently active</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-success flex items-center justify-center shadow-lg shadow-success/25 group-hover:scale-105 transition-transform">
                <Pill className="h-7 w-7 text-success-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPD Trends Chart */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
              </div>
              OPD Trends
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => navigate('/reports')}>
              View details <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={opdTrendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorCount)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Case Trends */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
              <div className="h-8 w-8 rounded-lg bg-emergency/10 flex items-center justify-center">
                <AlertTriangle className="h-4.5 w-4.5 text-emergency" />
              </div>
              Emergency Cases
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => navigate('/reports')}>
              View details <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergencyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Bar dataKey="cases" fill="hsl(var(--emergency))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4.5 w-4.5 text-primary" />
              </div>
              Recent Patients
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patients')} className="text-primary hover:text-primary">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : recentPatients && recentPatients.length > 0 ? (
              recentPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/70 cursor-pointer transition-all duration-200 hover:shadow-sm animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{patient.caretag_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{patient.gender}</p>
                    <p className="text-xs text-muted-foreground">{patient.blood_group || 'Unknown'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No patients registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prescription Patterns */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Pill className="h-4.5 w-4.5 text-accent" />
              </div>
              Prescription Patterns
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="text-primary hover:text-primary">
              View details <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptionData.map((item, index) => (
              <div
                key={index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(item.count / 250) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Admin */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-primary" />
            </div>
            Admin Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2 relative" 
              onClick={() => setActiveTab('verification')}
            >
              <UserCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Verify Doctors</span>
              {pendingVerifications && pendingVerifications > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingVerifications}
                </Badge>
              )}
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/reports')}>
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/patients')}>
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Manage Patients</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <DoctorVerificationPanel />
        </TabsContent>

        {/* Org Verification Tab */}
        <TabsContent value="org-verification">
          <OrgVerificationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
