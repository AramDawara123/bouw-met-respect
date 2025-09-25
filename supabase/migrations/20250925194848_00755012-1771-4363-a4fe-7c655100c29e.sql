-- Fix the handle_user_confirmation function to handle errors properly
CREATE OR REPLACE FUNCTION public.handle_user_confirmation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process if email_confirmed_at was just set (changed from null to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Log that user was confirmed
    RAISE LOG 'User confirmed: % (email: %)', NEW.id, NEW.email;
    
    -- For now, just log - we'll handle partner welcome emails separately
    -- This prevents the JSON parsing error that was causing confirmation failures
  END IF;
  
  RETURN NEW;
END;
$function$;