-- Update existing company profiles to link them to partner memberships where possible
UPDATE company_profiles 
SET partner_membership_id = pm.id
FROM partner_memberships pm 
WHERE company_profiles.partner_membership_id IS NULL 
  AND pm.payment_status = 'paid'
  AND (
    LOWER(company_profiles.name) = LOWER(pm.company_name) 
    OR company_profiles.contact_email = pm.email
  );

-- Update RLS policy to allow partners to manage profiles linked to their membership OR matching their company info
DROP POLICY IF EXISTS "Partners can manage their own company profiles" ON company_profiles;

CREATE POLICY "Partners can manage their own company profiles" 
ON company_profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM partner_memberships pm 
    WHERE pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
      AND (
        -- Direct link via partner_membership_id
        pm.id = company_profiles.partner_membership_id
        OR 
        -- Fallback for existing profiles - match by company name or email
        (
          company_profiles.partner_membership_id IS NULL 
          AND (
            LOWER(company_profiles.name) = LOWER(pm.company_name)
            OR company_profiles.contact_email = pm.email
          )
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM partner_memberships pm 
    WHERE pm.user_id = auth.uid() 
      AND pm.payment_status = 'paid'
      AND (
        -- Direct link via partner_membership_id
        pm.id = company_profiles.partner_membership_id
        OR 
        -- Fallback for existing profiles - match by company name or email
        (
          company_profiles.partner_membership_id IS NULL 
          AND (
            LOWER(company_profiles.name) = LOWER(pm.company_name)
            OR company_profiles.contact_email = pm.email
          )
        )
      )
  )
);