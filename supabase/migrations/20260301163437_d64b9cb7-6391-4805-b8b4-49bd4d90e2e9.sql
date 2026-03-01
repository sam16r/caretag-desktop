
-- Update handle_new_user to assign the correct role based on signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _requested_role text;
  _assigned_role app_role;
BEGIN
  -- Create profile for the new user
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  
  -- Check the requested role from signup metadata
  _requested_role := NEW.raw_user_meta_data ->> 'role';
  
  -- Only allow specific org roles; default everything else to doctor
  -- This is safe because having a role alone doesn't grant org access —
  -- org-level RLS policies check organization_members separately
  IF _requested_role IN ('center_admin', 'hospital_admin') THEN
    _assigned_role := _requested_role::app_role;
  ELSE
    _assigned_role := 'doctor'::app_role;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _assigned_role);
  
  RETURN NEW;
END;
$function$;
