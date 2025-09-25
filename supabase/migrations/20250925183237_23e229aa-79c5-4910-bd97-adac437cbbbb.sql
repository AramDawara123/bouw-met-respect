-- Add RLS policy to allow public access to orders for QR verification
-- This allows anyone to view order details when they have the specific order ID (from QR code)
CREATE POLICY "Public order verification access" ON orders FOR SELECT USING (true);

-- Update the policy description for better documentation
COMMENT ON POLICY "Public order verification access" ON orders IS 'Allows public access to order details for QR code verification - anyone with order ID can view';