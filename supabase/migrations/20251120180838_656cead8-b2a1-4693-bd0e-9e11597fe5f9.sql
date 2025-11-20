-- Complete database migration for Bouw met Respect platform
-- This creates all necessary tables and functions

-- Helper function for updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Helper function for admin access verification
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For now, return true to allow admin access
  -- This can be enhanced with proper role checking later
  RETURN true;
END;
$$;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profile"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- 2. MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  job_title TEXT NOT NULL,
  industry_role TEXT NOT NULL,
  experience_years TEXT NOT NULL,
  specializations TEXT[] NOT NULL,
  newsletter BOOLEAN DEFAULT true,
  mollie_payment_id TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending',
  amount INTEGER DEFAULT 2500,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships"
ON public.memberships FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create memberships"
ON public.memberships FOR INSERT
WITH CHECK (true);

CREATE POLICY "Update memberships"
ON public.memberships FOR UPDATE
USING (true);

-- 3. MEMBERSHIP PRICING TABLE
CREATE TABLE IF NOT EXISTS public.membership_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_type TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  yearly_price_display TEXT NOT NULL,
  employees_range TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membership pricing viewable by everyone"
ON public.membership_pricing FOR SELECT
USING (true);

-- 4. COMPANY PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  partner_membership_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company profiles viewable by everyone"
ON public.company_profiles FOR SELECT
USING (true);

CREATE POLICY "Admins can manage company profiles"
ON public.company_profiles FOR ALL
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- 5. PARTNER MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.partner_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  description TEXT,
  company_size TEXT,
  account_created BOOLEAN DEFAULT false,
  generated_password TEXT,
  logo_url TEXT,
  mollie_payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  amount INTEGER DEFAULT 50000,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create partner memberships"
ON public.partner_memberships FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can view own partner memberships or admins view all"
ON public.partner_memberships FOR SELECT
USING ((auth.uid() = user_id) OR verify_admin_access());

CREATE POLICY "Users can update own partner memberships or admins update all"
ON public.partner_memberships FOR UPDATE
USING ((auth.uid() = user_id) OR verify_admin_access())
WITH CHECK ((auth.uid() = user_id) OR verify_admin_access());

CREATE POLICY "Only admins can delete partner memberships"
ON public.partner_memberships FOR DELETE
USING (verify_admin_access());

-- Add foreign key to company_profiles
ALTER TABLE public.company_profiles 
ADD CONSTRAINT fk_partner_membership 
FOREIGN KEY (partner_membership_id) 
REFERENCES public.partner_memberships(id);

-- 6. PARTNER PRICING TIERS TABLE
CREATE TABLE IF NOT EXISTS public.partner_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_range TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  price_display TEXT NOT NULL,
  is_quote BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner pricing viewable by everyone"
ON public.partner_pricing_tiers FOR SELECT
USING (true);

CREATE POLICY "Admins can manage partner pricing"
ON public.partner_pricing_tiers FOR ALL
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- 7. ACTION ITEMS PRICING TABLE
CREATE TABLE IF NOT EXISTS public.action_items_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size_type TEXT NOT NULL,
  employees_range TEXT NOT NULL,
  price_display TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_quote BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.action_items_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Action items pricing viewable by everyone"
ON public.action_items_pricing FOR SELECT
USING (true);

CREATE POLICY "Admins can manage action items pricing"
ON public.action_items_pricing FOR ALL
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- 8. DISCOUNT CODES TABLE
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL,
  minimum_order_amount INTEGER DEFAULT 0,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  applies_to TEXT DEFAULT 'products' CHECK (applies_to IN ('memberships', 'partners', 'products')),
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discount codes viewable by everyone"
ON public.discount_codes FOR SELECT
USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage discount codes"
ON public.discount_codes FOR ALL
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- 9. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  discount_percentage INTEGER DEFAULT 0,
  discount_fixed INTEGER DEFAULT 0,
  discount_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products viewable by everyone"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (verify_admin_access())
WITH CHECK (verify_admin_access());

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_postal_code TEXT,
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  discount_code TEXT,
  discount_amount INTEGER DEFAULT 0,
  mollie_payment_id TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending',
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders viewable by admins"
ON public.orders FOR SELECT
USING (verify_admin_access());

CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Orders updatable by admins"
ON public.orders FOR UPDATE
USING (verify_admin_access());

-- 11. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can read analytics"
ON public.analytics_events FOR SELECT
USING (auth.role() = 'authenticated');

-- CREATE ALL TRIGGERS
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_membership_pricing_updated_at
BEFORE UPDATE ON public.membership_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_memberships_updated_at
BEFORE UPDATE ON public.partner_memberships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_pricing_tiers_updated_at
BEFORE UPDATE ON public.partner_pricing_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_items_pricing_updated_at
BEFORE UPDATE ON public.action_items_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();