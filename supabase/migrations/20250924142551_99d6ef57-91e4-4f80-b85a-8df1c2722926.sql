-- Fix user_id mismatch for partner membership
UPDATE partner_memberships 
SET user_id = 'd9b77126-50af-4dfd-921a-c78466c1452c'
WHERE email = 'arram.dawara@gmail.com' 
AND user_id = '3581767f-b3e3-4578-af07-70b4927bf40a';