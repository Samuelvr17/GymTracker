/*
  # Fix User Session Function

  1. Functions
    - Fix set_user_session function parameter name
    - Ensure proper session handling
    - Add better error handling

  2. Security
    - Maintain RLS policies
    - Ensure session security
*/

-- Drop and recreate the set_user_session function with correct parameter name
DROP FUNCTION IF EXISTS set_user_session(uuid);
DROP FUNCTION IF EXISTS set_user_session(user_uuid uuid);

CREATE OR REPLACE FUNCTION set_user_session(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the user_id in the session
  PERFORM set_config('app.user_id', user_id::text, false);
  
  -- Return confirmation
  RETURN 'Session set for user: ' || user_id::text;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error setting user session: %', SQLERRM;
END;
$$;

-- Ensure the test function exists
CREATE OR REPLACE FUNCTION test_current_session()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id text;
  result json;
BEGIN
  -- Get current user_id from session
  current_user_id := current_setting('app.user_id', true);
  
  -- Build result
  result := json_build_object(
    'user_id', current_user_id,
    'user_id_uuid', CASE 
      WHEN current_user_id IS NOT NULL AND current_user_id != '' 
      THEN current_user_id::uuid 
      ELSE NULL 
    END,
    'session_active', current_user_id IS NOT NULL AND current_user_id != ''
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'user_id', NULL,
      'session_active', false
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_user_session(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION test_current_session() TO anon, authenticated;