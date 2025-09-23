-- Create function to handle user confirmation and send welcome email
CREATE OR REPLACE FUNCTION public.handle_user_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  response_body text;
BEGIN
  -- Only process if email_confirmed_at was just set (changed from null to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Call our edge function to send welcome email
    SELECT net.http_post(
      url := 'https://pkvayugxzgkoipclcpli.supabase.co/functions/v1/partner-confirmation-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
      body := json_build_object(
        'type', 'INSERT',
        'table', 'auth.users',
        'record', json_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'email_confirmed_at', NEW.email_confirmed_at
        )
      )::jsonb
    ) INTO response_body;
    
    -- Log the response for debugging
    RAISE LOG 'Partner confirmation email response: %', response_body;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table for email confirmation
DROP TRIGGER IF EXISTS on_user_confirmed ON auth.users;
CREATE TRIGGER on_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_confirmation();