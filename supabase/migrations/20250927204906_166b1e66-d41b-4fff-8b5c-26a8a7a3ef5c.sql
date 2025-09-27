-- Fix function search path security issues by setting secure search paths

-- Update the new function
CREATE OR REPLACE FUNCTION update_discount_usage_on_payment()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update existing functions to have secure search paths
CREATE OR REPLACE FUNCTION public.increment_discount_usage(code_to_increment text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  UPDATE discount_codes 
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE code = UPPER(code_to_increment);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_discount_usage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;