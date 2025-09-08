-- Add 'offerte' as a valid membership type
ALTER TYPE membership_type ADD VALUE 'offerte';

-- Update payment_status to allow quote_requested
-- Since we can't directly add values to existing CHECK constraints, 
-- we'll update any existing constraints or just allow the new status
-- The payment_status column should accept 'quote_requested' as a valid value