-- Add vendor approval workflow
-- Update profiles table to include vendor approval fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS vendor_request_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- Update RLS policies for vendor approval workflow
-- Only approved vendors can access vendor-specific data
CREATE OR REPLACE FUNCTION public.is_approved_vendor(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_approved FROM profiles WHERE profiles.user_id = $1 AND role = 'vendor'),
    false
  );
$$;

-- Create policy for vendor dashboard access
CREATE POLICY "Only approved vendors can access vendor features"
ON painting_requests
FOR ALL
TO authenticated
WITH CHECK (
  CASE 
    WHEN auth.uid() = vendor_id THEN is_approved_vendor(auth.uid())
    ELSE true
  END
);

-- Create admin function to approve vendors
CREATE OR REPLACE FUNCTION public.approve_vendor(vendor_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only admins can approve vendors';
  END IF;
  
  -- Update the vendor profile
  UPDATE profiles 
  SET 
    is_approved = true,
    approved_at = now(),
    approved_by = auth.uid()
  WHERE 
    user_id = vendor_user_id 
    AND role = 'vendor';
    
  RETURN FOUND;
END;
$$;