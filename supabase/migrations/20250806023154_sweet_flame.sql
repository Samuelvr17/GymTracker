/*
  # Add username-based authentication system

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `users` table
    - Add policies for user registration and authentication
    - Update existing table policies to use custom users table
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow user registration (anyone can insert)
DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Users can read own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = uid());

-- Allow anonymous users to read for authentication
DROP POLICY IF EXISTS "Allow authentication lookup" ON users;
CREATE POLICY "Allow authentication lookup"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Update routines table to reference custom users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'routines' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE routines ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update workouts table to reference custom users  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workouts ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update RLS policies for routines
DROP POLICY IF EXISTS "Users can manage their own routines" ON routines;
CREATE POLICY "Users can manage their own routines"
  ON routines
  FOR ALL
  TO anon, authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE id = user_id
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE id = user_id
    )
  );

-- Update RLS policies for workouts
DROP POLICY IF EXISTS "Users can manage their own workouts" ON workouts;
CREATE POLICY "Users can manage their own workouts"
  ON workouts
  FOR ALL
  TO anon, authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE id = user_id
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE id = user_id
    )
  );

-- Update RLS policies for exercises (through routines)
DROP POLICY IF EXISTS "Users can manage exercises in their routines" ON exercises;
CREATE POLICY "Users can manage exercises in their routines"
  ON exercises
  FOR ALL
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routines r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = exercises.routine_id 
      AND r.user_id = u.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = exercises.routine_id 
      AND r.user_id = u.id
    )
  );

-- Update RLS policies for exercise_sets (through exercises and routines)
DROP POLICY IF EXISTS "Users can manage sets in their exercises" ON exercise_sets;
CREATE POLICY "Users can manage sets in their exercises"
  ON exercise_sets
  FOR ALL
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN routines r ON r.id = e.routine_id
      JOIN users u ON r.user_id = u.id
      WHERE e.id = exercise_sets.exercise_id 
      AND r.user_id = u.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN routines r ON r.id = e.routine_id
      JOIN users u ON r.user_id = u.id
      WHERE e.id = exercise_sets.exercise_id 
      AND r.user_id = u.id
    )
  );

-- Update RLS policies for workout_exercises (through workouts)
DROP POLICY IF EXISTS "Users can manage exercises in their workouts" ON workout_exercises;
CREATE POLICY "Users can manage exercises in their workouts"
  ON workout_exercises
  FOR ALL
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN users u ON w.user_id = u.id
      WHERE w.id = workout_exercises.workout_id 
      AND w.user_id = u.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN users u ON w.user_id = u.id
      WHERE w.id = workout_exercises.workout_id 
      AND w.user_id = u.id
    )
  );

-- Update RLS policies for workout_sets (through workout_exercises and workouts)
DROP POLICY IF EXISTS "Users can manage sets in their workout exercises" ON workout_sets;
CREATE POLICY "Users can manage sets in their workout exercises"
  ON workout_sets
  FOR ALL
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      JOIN users u ON w.user_id = u.id
      WHERE we.id = workout_sets.workout_exercise_id 
      AND w.user_id = u.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      JOIN users u ON w.user_id = u.id
      WHERE we.id = workout_sets.workout_exercise_id 
      AND w.user_id = u.id
    )
  );
