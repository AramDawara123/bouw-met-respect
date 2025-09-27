-- Update existing discount usage counts based on actual order data
UPDATE discount_codes 
SET used_count = (
  SELECT COUNT(*) 
  FROM orders 
  WHERE orders.discount_code = discount_codes.code 
  AND orders.payment_status = 'paid'
)
WHERE code IN (
  SELECT DISTINCT discount_code 
  FROM orders 
  WHERE discount_code IS NOT NULL
);

-- Create a function to automatically update discount usage when orders are updated
CREATE OR REPLACE FUNCTION update_discount_usage_on_payment()
RETURNS trigger AS $$
BEGIN
  -- Only increment when payment status changes to 'paid' and there's a discount code
  IF NEW.payment_status = 'paid' 
     AND OLD.payment_status != 'paid' 
     AND NEW.discount_code IS NOT NULL THEN
    
    UPDATE discount_codes 
    SET used_count = used_count + 1,
        updated_at = now()
    WHERE code = NEW.discount_code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update discount usage when order payment status changes
DROP TRIGGER IF EXISTS trigger_update_discount_usage ON orders;
CREATE TRIGGER trigger_update_discount_usage
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_usage_on_payment();