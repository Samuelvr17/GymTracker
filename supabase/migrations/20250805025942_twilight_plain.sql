/*
  # Add User Authentication and RLS

  1. New Columns
    - Add `user_id` column to `routines` and `workouts` tables
    - Link data to authenticated users

  2. Security
    - Update RLS policies to be user-specific
    - Only authenticated users can access their own data
    - Remove public access policies

  3. Changes
    - All existing data will need user_id (will be handled by the app)
    - New data will automatically include user_id
*/

-- Add user_id column to routines table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'routines' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE routines ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id column to workouts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workouts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

-- Drop existing public policies
DROP POLICY IF EXISTS "Enable all operations for all users on routines" ON routines;
DROP POLICY IF EXISTS "Enable all operations for all users on exercises" ON exercises;
DROP POLICY IF EXISTS "Enable all operations for all users on exercise_sets" ON exercise_sets;
DROP POLICY IF EXISTS "Enable all operations for all users on workouts" ON workouts;
DROP POLICY IF EXISTS "Enable all operations for all users on workout_exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Enable all operations for all users on workout_sets" ON workout_sets;

-- Create user-specific policies for routines
CREATE POLICY "Users can manage their own routines"
  ON routines
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for exercises (through routines)
CREATE POLICY "Users can manage exercises in their routines"
  ON exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routines 
      WHERE routines.id = exercises.routine_id 
      AND routines.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines 
      WHERE routines.id = exercises.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

-- Create user-specific policies for exercise_sets (through exercises and routines)
CREATE POLICY "Users can manage sets in their exercises"
  ON exercise_sets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN routines ON routines.id = exercises.routine_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND routines.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN routines ON routines.id = exercises.routine_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND routines.user_id = auth.uid()
    )
  );

-- Create user-specific policies for workouts
CREATE POLICY "Users can manage their own workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for workout_exercises (through workouts)
CREATE POLICY "Users can manage exercises in their workouts"
  ON workout_exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Create user-specific policies for workout_sets (through workout_exercises and workouts)
CREATE POLICY "Users can manage sets in their workout exercises"
  ON workout_sets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises 
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_sets.workout_exercise_id 
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises 
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_sets.workout_exercise_id 
      AND workouts.user_id = auth.uid()
    )
  );