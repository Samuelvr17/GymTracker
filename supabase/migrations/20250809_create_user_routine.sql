-- 20250809_create_user_routine.sql

CREATE OR REPLACE FUNCTION create_user_routine(
  _user_id uuid,
  _name text
)
RETURNS routines
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_r routines%ROWTYPE;
BEGIN
  -- Seta la sesión en esta misma conexión
  PERFORM set_config('app.user_id', _user_id::text, false);

  -- Inserta la rutina garantizando RLS
  INSERT INTO routines (user_id, name)
    VALUES (_user_id, _name)
    RETURNING * INTO new_r;

  RETURN new_r;
END;
$$;

GRANT EXECUTE ON FUNCTION create_user_routine(uuid, text) TO authenticated, anon;
