-- Drop the problematic trigger that tries to sync farmers to user_profiles
-- Farmers are not auth.users, they have their own authentication system
DROP TRIGGER IF EXISTS sync_farmer_profile ON public.farmers;
DROP FUNCTION IF EXISTS public.sync_farmer_to_user_profile();