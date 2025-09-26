-- Fix the partner membership record to link to the correct user
UPDATE partner_memberships 
SET 
  user_id = '6841e898-0dcd-4537-9468-bd0d69516f8b',
  email = 'aramdawara1@gmail.com'
WHERE id = 'a30a435e-820c-4da5-b031-370e00823db9';