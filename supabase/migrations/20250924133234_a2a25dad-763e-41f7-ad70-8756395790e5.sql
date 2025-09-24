-- Create admin user account manually in auth.users
-- First, let's check if we can create the admin account through SQL

-- Create the admin account in auth.users table if it doesn't exist
-- We'll use a simple approach - just insert the user directly
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'info@bouwmetrespect.nl';
    
    IF admin_user_id IS NULL THEN
        -- Create admin user with confirmed email
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at,
            is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'info@bouwmetrespect.nl',
            crypt('admin123456', gen_salt('bf')),
            now(),
            now(),
            '',
            '',
            '',
            '',
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"first_name": "Admin", "last_name": "User"}',
            false,
            null,
            null,
            '',
            '',
            '',
            0,
            null,
            '',
            null,
            false,
            null,
            false
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
    
    -- Ensure admin profile exists
    INSERT INTO public.profiles (user_id, email, is_admin, role)
    VALUES (admin_user_id, 'info@bouwmetrespect.nl', true, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET
        is_admin = true,
        role = 'admin';
        
    RAISE NOTICE 'Admin profile created/updated';
    
END $$;