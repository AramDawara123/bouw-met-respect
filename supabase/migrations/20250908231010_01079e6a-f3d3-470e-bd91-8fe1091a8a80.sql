-- Fix critical security vulnerability: Remove overly permissive RLS policies and implement proper access control

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can create memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.memberships;

-- Create secure RLS policies for memberships table

-- Policy 1: Only authenticated users can create memberships (for their own account or as guests)
CREATE POLICY "Authenticated users can create memberships" 
ON public.memberships 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User can create membership for themselves or as a guest (null user_id)
  auth.uid() = user_id OR user_id IS NULL
);

-- Policy 2: Users can only view their own memberships, admins can view all
CREATE POLICY "Users can view own memberships, admins view all" 
ON public.memberships 
FOR SELECT 
TO authenticated
USING (
  -- User can see their own memberships OR user is admin
  auth.uid() = user_id OR verify_admin_access()
);

-- Policy 3: Only users can update their own memberships, admins can update all
CREATE POLICY "Users can update own memberships, admins update all" 
ON public.memberships 
FOR UPDATE 
TO authenticated
USING (
  -- User can update their own memberships OR user is admin
  auth.uid() = user_id OR verify_admin_access()
)
WITH CHECK (
  -- Ensure user_id doesn't change unless admin
  (auth.uid() = user_id AND user_id = OLD.user_id) OR verify_admin_access()
);

-- Policy 4: Only admins can delete memberships
CREATE POLICY "Only admins can delete memberships" 
ON public.memberships 
FOR DELETE 
TO authenticated
USING (verify_admin_access());