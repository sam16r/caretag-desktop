import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  Calendar, TrendingUp, FileText, DollarSign,
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
];

export default function Reports() {
  const { user, role } = useAuth();
  const [period, setPeriod] = useState('30');
  const since = startOfDay(subDays(new Date(), parseInt(period))).toISOString();

  const { data: appointments } = useQuery({
    queryKey: ['report-appointments', user?.id, role, since],
    queryFn: async () => {
      let q = supabase.from('appointments').select('*').gte('created_at', since);
      if (role === 'doctor') q = q.eq('doctor_id', user!.id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['report-prescriptions', user?.id, role, since],
    queryFn: async () => {
      let q = supabase.from('prescriptions').select('*').gte('created_at', since);
      if (role === 'doctor') q = q.eq('doctor_id', user!.id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: invoices } = useQuery({
    queryKey: ['report-invoices', user?.id, role, since],
    queryFn: async () => {
      let q = supabase.from('invoices').select('*').gte('created_at', since);
      if (role === 'doctor') q = q.eq('doctor_id', user!.id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const appointmentsByStatus = (() => {
    const counts: Record<string, number> = {};
    appointments?.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const appointmentsByDay = (() => {
    const days: Record<string, number> = {};
    const numDays = parseInt(period);
    for (let i = numDays - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'MMM dd');
      days[d] = 0;
    }
    appointments?.forEach(a => {
      const d = format(new Date(a.created_at), 'MMM dd');
      if (days[d] !== undefined) days[d]++;
    });
    const entries = Object.entries(days);
    const step = Math.max(1, Math.floor(entries.length / 15));
    return entries.filter((_, i) => i % step === 0).map(([date, count]) => ({ date, count }));
  })();

  const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) ?? 0;
  const paidRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.total_amount), 0) ?? 0;

  const revenueByDay = (() => {
    const days: Record<string, number> = {};
    invoices?.forEach(inv => {
      const d = format(new Date(inv.created_at), 'MMM dd');
      days[d] = (days[d] || 0) + Number(inv.total_amount);
    });
    return Object.entries(days).map(([date, amount]) => ({ date, amount }));
  })();

  const prescriptionsByStatus = (() => {
    const counts: Record<string, number> = {};
    prescriptions?.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Data insights for your practice</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Appointments', value: appointments?.length ?? 0, icon: Calendar, color: 'text-primary' },
          { title: 'Prescriptions', value: prescriptions?.length ?? 0, icon: FileText, color: 'text-green-500' },
          { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-500' },
          { title: 'Paid Revenue', value: `₹${paidRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
        ].map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Appointments Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={appointmentsByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={appointmentsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {appointmentsByStatus.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              {revenueByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No revenue data for this period</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader><CardTitle className="text-base">Prescription Status</CardTitle></CardHeader>
            <CardContent>
              {prescriptionsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={prescriptionsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                      {prescriptionsByStatus.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No prescription data for this period</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
