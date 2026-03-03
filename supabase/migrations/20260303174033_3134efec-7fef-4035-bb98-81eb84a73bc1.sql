-- Telemedicine sessions table
CREATE TABLE public.telemedicine_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  room_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  call_notes text,
  prescriptions_shared uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can create telemedicine sessions"
ON public.telemedicine_sessions FOR INSERT
TO authenticated
WITH CHECK (doctor_id = auth.uid() AND has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Doctors can view their own sessions"
ON public.telemedicine_sessions FOR SELECT
TO authenticated
USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can update their own sessions"
ON public.telemedicine_sessions FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid());

-- Notify doctor when telemedicine session ends (for record keeping)
CREATE OR REPLACE FUNCTION public.notify_on_telemedicine_end()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status = 'completed' THEN
    INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (
      NEW.doctor_id,
      'Consultation Completed',
      'Your telemedicine session has been saved. Duration: ' || COALESCE(NEW.duration_seconds / 60, 0) || ' minutes.',
      'success',
      'telemedicine',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_telemedicine_end
AFTER UPDATE ON public.telemedicine_sessions
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_telemedicine_end();