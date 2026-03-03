-- 1. Create avatar storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Notification triggers for key events

-- Trigger: New appointment -> notify doctor
CREATE OR REPLACE FUNCTION public.notify_on_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
  VALUES (
    NEW.doctor_id,
    'New Appointment Scheduled',
    'A new appointment has been scheduled for ' || to_char(NEW.scheduled_at, 'Mon DD, YYYY HH12:MI AM'),
    'info',
    'appointment',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_appointment
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_appointment();

-- Trigger: Appointment status change -> notify doctor
CREATE OR REPLACE FUNCTION public.notify_on_appointment_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (
      NEW.doctor_id,
      'Appointment ' || initcap(NEW.status::text),
      'An appointment status was changed to ' || NEW.status::text,
      CASE WHEN NEW.status::text = 'cancelled' THEN 'warning' ELSE 'info' END,
      'appointment',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_appointment_status
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_appointment_status_change();

-- Trigger: New diagnostic report -> notify referring doctor
CREATE OR REPLACE FUNCTION public.notify_on_report_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.referring_doctor_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (
      NEW.referring_doctor_id,
      'New Report Available',
      'A diagnostic report "' || NEW.title || '" has been uploaded for your patient.',
      'success',
      'report',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_report
AFTER INSERT ON public.diagnostic_reports
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_report_upload();

-- Trigger: Organization verification status change -> notify owner
CREATE OR REPLACE FUNCTION public.notify_on_org_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (
      NEW.owner_id,
      CASE 
        WHEN NEW.verification_status::text = 'verified' THEN 'Organization Verified!'
        WHEN NEW.verification_status::text = 'rejected' THEN 'Verification Rejected'
        WHEN NEW.verification_status::text = 'under_review' THEN 'Under Review'
        ELSE 'Verification Update'
      END,
      CASE 
        WHEN NEW.verification_status::text = 'verified' THEN 'Your organization "' || NEW.name || '" has been verified successfully.'
        WHEN NEW.verification_status::text = 'rejected' THEN 'Your organization "' || NEW.name || '" verification was rejected. ' || COALESCE(NEW.verification_notes, '')
        WHEN NEW.verification_status::text = 'under_review' THEN 'Your organization "' || NEW.name || '" is now under review.'
        ELSE 'Verification status updated for "' || NEW.name || '".'
      END,
      CASE WHEN NEW.verification_status::text = 'verified' THEN 'success' WHEN NEW.verification_status::text = 'rejected' THEN 'warning' ELSE 'info' END,
      'organization',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_org_verification
AFTER UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_org_verification();