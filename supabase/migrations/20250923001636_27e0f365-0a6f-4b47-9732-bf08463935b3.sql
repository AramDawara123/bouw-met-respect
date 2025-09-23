-- Configure send email hook to use our custom edge function
INSERT INTO auth.hooks (id, hook_table_id, hook_name, created_at, request_id)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.hook_table WHERE table_name = 'send_email'),
  'send_email',
  now(),
  1
)
ON CONFLICT DO NOTHING;

-- Update hook configuration to point to our edge function
UPDATE auth.hooks 
SET 
  uri = 'https://pkvayugxzgkoipclcpli.supabase.co/functions/v1/send-auth-email',
  secrets = jsonb_build_object('RESEND_API_KEY', current_setting('app.settings.resend_api_key', true)),
  updated_at = now()
WHERE hook_name = 'send_email';