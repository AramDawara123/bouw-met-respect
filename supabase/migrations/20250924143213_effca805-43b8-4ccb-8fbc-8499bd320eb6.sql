-- Link Dawara Consulting company profile to partner membership
UPDATE company_profiles 
SET partner_membership_id = '64bef497-52d5-4a7a-908c-d1365a3498a5',
    contact_email = 'arram.dawara@gmail.com'
WHERE name = 'Dawara Consulting' 
AND partner_membership_id IS NULL;