DROP POLICY "Users can view profiles with appropriate access" ON public.profiles;

CREATE POLICY "Users can view profiles with appropriate access"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'doctor'::app_role)
  OR has_role(auth.uid(), 'hospital_admin'::app_role)
  OR has_role(auth.uid(), 'center_admin'::app_role)
);