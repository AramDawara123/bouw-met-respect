-- Add subscription fields to partner_memberships table
ALTER TABLE partner_memberships 
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS billing_frequency TEXT DEFAULT 'yearly';

-- Add index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_partner_memberships_subscription_id ON partner_memberships(subscription_id);

-- Update discount_codes table to track usage
ALTER TABLE discount_codes 
ADD COLUMN IF NOT EXISTS partner_membership_ids TEXT[] DEFAULT '{}';

-- Add trigger to update discount code usage
CREATE OR REPLACE FUNCTION update_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update used_count when a partner membership uses a discount code
  IF NEW.discount_code IS NOT NULL AND OLD.discount_code IS NULL THEN
    UPDATE discount_codes 
    SET used_count = used_count + 1,
        partner_membership_ids = array_append(partner_membership_ids, NEW.id::text)
    WHERE code = NEW.discount_code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on partner_memberships
DROP TRIGGER IF EXISTS trigger_update_discount_usage ON partner_memberships;
CREATE TRIGGER trigger_update_discount_usage
  AFTER UPDATE ON partner_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_usage();