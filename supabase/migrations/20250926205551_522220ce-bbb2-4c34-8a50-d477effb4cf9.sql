-- Create a function to safely increment discount code usage count
CREATE OR REPLACE FUNCTION increment_discount_usage(code_to_increment text)
RETURNS void AS $$
BEGIN
  UPDATE discount_codes 
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE code = UPPER(code_to_increment);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;