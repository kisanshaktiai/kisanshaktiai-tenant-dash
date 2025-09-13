-- First, let's check if there's a trigger on the farmers table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'farmers';

-- Check the user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check if there's a function that creates user_profiles
SELECT 
    proname AS function_name,
    prosrc AS function_body
FROM pg_proc
WHERE prosrc LIKE '%user_profiles%' 
    AND proname LIKE '%farmer%';