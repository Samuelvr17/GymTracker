/*
  # Debug User Functions and Policies

  1. Functions
    - Enhanced set_user_session with better error handling
    - Enhanced get_current_user_id with debugging
  
  2. Test Functions
    - Functions to test the authentication system
*/

-- Drop existing functions if they exist (con CASCADE para eliminar dependencias)
DROP FUNCTION IF EXISTS set_user_session(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_current_user_id() CASCADE;

-- Enhanced set_user_session function with debugging
CREATE OR REPLACE FUNCTION set_user_session(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the user session variable
  PERFORM set_config('app.user_id', user_uuid::text, false);
  
  -- Return confirmation
  RETURN 'Session set for user: ' || user_uuid::text;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error setting user session: %', SQLERRM;
END;
$$;

-- Enhanced get_current_user_id function with debugging
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_text text;
  user_id_uuid uuid;
BEGIN
  -- Get the user session variable
  user_id_text := current_setting('app.user_id', true);
  
  -- If no session is set, return null
  IF user_id_text IS NULL OR user_id_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Convert to UUID
  BEGIN
    user_id_uuid := user_id_text::uuid;
    RETURN user_id_uuid;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid user_id in session: %', user_id_text;
  END;
END;
$$;

-- Test function to check current session
CREATE OR REPLACE FUNCTION test_current_session()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'raw_setting', current_setting('app.user_id', true),
    'parsed_user_id', get_current_user_id(),
    'session_exists', CASE WHEN get_current_user_id() IS NOT NULL THEN true ELSE false END
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_user_session(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION test_current_session() TO anon, authenticated;
