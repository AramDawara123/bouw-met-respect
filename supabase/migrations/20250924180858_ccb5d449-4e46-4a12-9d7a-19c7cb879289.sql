-- Grant necessary permissions for verify_admin_access function
GRANT EXECUTE ON FUNCTION verify_admin_access() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_access() TO anon;

-- Also ensure the function is properly accessible
CREATE OR REPLACE FUNCTION verify_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user exists in profiles table with admin role
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;