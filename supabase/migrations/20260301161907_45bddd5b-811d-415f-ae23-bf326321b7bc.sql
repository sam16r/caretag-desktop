
-- =============================================
-- Phase 1: Multi-Entity Foundation Schema (Fixed)
-- =============================================

-- 1. Enums
CREATE TYPE public.org_type AS ENUM ('diagnostic_center', 'hospital');
CREATE TYPE public.org_verification_status AS ENUM ('pending', 'under_review', 'verified', 'rejected');
CREATE TYPE public.org_member_role AS ENUM ('owner', 'admin', 'doctor', 'technician', 'receptionist');

-- Extend app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'center_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hospital_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'technician';

-- =============================================
-- CREATE ALL TABLES FIRST (no cross-references in policies)
-- =============================================

CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  type public.org_type NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  logo_url TEXT,
  website TEXT,
  gst_number TEXT,
  registration_number TEXT,
  accreditation_number TEXT,
  accreditation_type TEXT,
  clinical_establishment_license_url TEXT,
  registration_certificate_url TEXT,
  owner_id_proof_url TEXT,
  letterhead_url TEXT,
  num_beds INTEGER,
  departments TEXT[],
  verification_status public.org_verification_status NOT NULL DEFAULT 'pending',
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.org_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  is_main_branch BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  manager_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.org_branches(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  role public.org_member_role NOT NULL DEFAULT 'technician',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE public.diagnostic_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  branch_id UUID REFERENCES public.org_branches(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  uploaded_by UUID NOT NULL,
  referring_doctor_id UUID,
  report_type TEXT NOT NULL,
  report_category TEXT,
  title TEXT NOT NULL,
  description TEXT,
  findings TEXT,
  conclusion TEXT,
  file_url TEXT,
  file_type TEXT,
  template_id UUID,
  template_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  finalized_at TIMESTAMPTZ,
  finalized_by UUID,
  delivered_at TIMESTAMPTZ,
  test_date TIMESTAMPTZ,
  result_values JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  header_template TEXT,
  footer_template TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER: check org membership
-- =============================================
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND owner_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND owner_id = _user_id
  )
$$;

-- =============================================
-- RLS POLICIES (now all tables exist)
-- =============================================

-- Organizations
CREATE POLICY "Org members can view their organization"
  ON public.organizations FOR SELECT
  USING (owner_id = auth.uid() OR is_org_member(auth.uid(), id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owner can update their organization"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Org Branches
CREATE POLICY "Org members can view branches"
  ON public.org_branches FOR SELECT
  USING (is_org_member(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org owners can insert branches"
  ON public.org_branches FOR INSERT
  WITH CHECK (is_org_owner(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org owners can update branches"
  ON public.org_branches FOR UPDATE
  USING (is_org_owner(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Organization Members
CREATE POLICY "Members can view their org members"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid() OR is_org_owner(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org owners can insert members"
  ON public.organization_members FOR INSERT
  WITH CHECK (is_org_owner(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org owners can update members"
  ON public.organization_members FOR UPDATE
  USING (is_org_owner(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org owners can remove members"
  ON public.organization_members FOR DELETE
  USING (is_org_owner(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Diagnostic Reports
CREATE POLICY "Org members can view their org reports"
  ON public.diagnostic_reports FOR SELECT
  USING (is_org_member(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can view patient reports with active session"
  ON public.diagnostic_reports FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) AND has_active_session(auth.uid(), patient_id));

CREATE POLICY "Org members can create reports"
  ON public.diagnostic_reports FOR INSERT
  WITH CHECK (uploaded_by = auth.uid() AND is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can update their org reports"
  ON public.diagnostic_reports FOR UPDATE
  USING (uploaded_by = auth.uid() OR is_org_owner(auth.uid(), organization_id));

-- Report Templates
CREATE POLICY "Users can view default templates"
  ON public.report_templates FOR SELECT
  USING (is_default = true);

CREATE POLICY "Org members can view org templates"
  ON public.report_templates FOR SELECT
  USING (organization_id IS NOT NULL AND (is_org_member(auth.uid(), organization_id) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Org owners can create templates"
  ON public.report_templates FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (
      (organization_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
      OR (organization_id IS NOT NULL AND is_org_owner(auth.uid(), organization_id))
    )
  );

CREATE POLICY "Org owners can update templates"
  ON public.report_templates FOR UPDATE
  USING (
    (organization_id IS NOT NULL AND is_org_owner(auth.uid(), organization_id))
    OR (organization_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Org owners can delete templates"
  ON public.report_templates FOR DELETE
  USING (
    (organization_id IS NOT NULL AND is_org_owner(auth.uid(), organization_id))
    OR (organization_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  );

-- Notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX idx_organizations_type ON public.organizations(type);
CREATE INDEX idx_organizations_verification ON public.organizations(verification_status);
CREATE INDEX idx_org_branches_org ON public.org_branches(organization_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_branch ON public.organization_members(branch_id);
CREATE INDEX idx_diagnostic_reports_org ON public.diagnostic_reports(organization_id);
CREATE INDEX idx_diagnostic_reports_patient ON public.diagnostic_reports(patient_id);
CREATE INDEX idx_diagnostic_reports_branch ON public.diagnostic_reports(branch_id);
CREATE INDEX idx_diagnostic_reports_status ON public.diagnostic_reports(status);
CREATE INDEX idx_report_templates_org ON public.report_templates(organization_id);
CREATE INDEX idx_report_templates_type ON public.report_templates(report_type);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_branches_updated_at
  BEFORE UPDATE ON public.org_branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnostic_reports_updated_at
  BEFORE UPDATE ON public.diagnostic_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('org-documents', 'org-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload org documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'org-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their org documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their org documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'org-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
