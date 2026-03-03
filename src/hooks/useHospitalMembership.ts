import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useHospitalMembership() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hospital-membership', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Check if this doctor is a member of a hospital organization
      const { data: membership, error: memError } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          branch_id,
          organization_id,
          organizations (
            id,
            name,
            logo_url,
            type,
            city,
            state,
            phone,
            email
          )
        `)
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .limit(10);

      if (memError) throw memError;

      // Find hospital membership specifically
      const hospitalMembership = membership?.find(
        (m) => (m.organizations as any)?.type === 'hospital'
      );

      if (!hospitalMembership) return null;

      return {
        membershipId: hospitalMembership.id,
        role: hospitalMembership.role,
        branchId: hospitalMembership.branch_id,
        organizationId: hospitalMembership.organization_id,
        hospital: hospitalMembership.organizations as {
          id: string;
          name: string;
          logo_url: string | null;
          type: string;
          city: string;
          state: string | null;
          phone: string | null;
          email: string | null;
        },
      };
    },
  });
}
