-- 20250809_fix_fk_user_id.sql

-- 1) Quita el constraint viejo
ALTER TABLE routines
  DROP CONSTRAINT IF EXISTS routines_user_id_fkey;

-- 2) Añádelo de nuevo apuntando a public.users(id)
ALTER TABLE routines
  ADD CONSTRAINT routines_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- Si tienes el mismo problema en workouts, repítelo:
ALTER TABLE workouts
  DROP CONSTRAINT IF EXISTS workouts_user_id_fkey;

ALTER TABLE workouts
  ADD CONSTRAINT workouts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;
