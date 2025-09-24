-- Create verify_admin_access function for RLS policies
CREATE OR REPLACE FUNCTION verify_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user exists in profiles table with admin role
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND (is_admin = true OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;