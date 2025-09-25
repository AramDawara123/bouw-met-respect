-- Update the handle_user_confirmation function to send partner welcome emails
CREATE OR REPLACE FUNCTION public.handle_user_confirmation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  partner_record RECORD;
  response_body text;
BEGIN
  -- Only process if email_confirmed_at was just set (changed from null to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    RAISE LOG 'User confirmed: % (email: %)', NEW.id, NEW.email;
    
    -- Check if this user has an associated partner membership
    SELECT pm.*, p.first_name, p.last_name 
    INTO partner_record
    FROM partner_memberships pm
    LEFT JOIN profiles p ON p.user_id = pm.user_id
    WHERE pm.user_id = NEW.id OR pm.email = NEW.email
    LIMIT 1;
    
    -- If we found a partner record, send welcome email
    IF FOUND THEN
      RAISE LOG 'Sending partner confirmation email for user: %', NEW.email;
      
      -- Call partner confirmation email edge function
      SELECT net.http_post(
        url := 'https://pkvayugxzgkoipclcpli.supabase.co/functions/v1/partner-confirmation-email',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := json_build_object(
          'user_id', NEW.id,
          'email', NEW.email,
          'first_name', COALESCE(partner_record.first_name, partner_record.first_name),
          'last_name', COALESCE(partner_record.last_name, partner_record.last_name)
        )::jsonb
      ) INTO response_body;
      
      RAISE LOG 'Partner confirmation email response: %', response_body;
    ELSE
      RAISE LOG 'No partner record found for user: %', NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;