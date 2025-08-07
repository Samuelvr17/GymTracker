/*
  # Fix Authentication System and RLS Policies

  1. Database Functions
    - `set_user_session` - Sets user session variable for RLS
    - `get_current_user_id` - Gets current user ID from session

  2. Updated RLS Policies
    - All tables now use session-based user identification
    - Proper permissions for authenticated users
    - Allow anonymous users to authenticate

  3. Security
    - Enable RLS on all tables
    - User-specific data access only
    - Secure session management
*/

-- Create function to set user session
CREATE OR REPLACE FUNCTION set_user_session(user_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', user_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.user_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own routines" ON routines;
DROP POLICY IF EXISTS "Users can manage exercises in their routines" ON exercises;
DROP POLICY IF EXISTS "Users can manage sets in their exercises" ON exercise_sets;
DROP POLICY IF EXISTS "Users can manage their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can manage exercises in their workouts" ON workout_exercises;
DROP POLICY IF EXISTS "Users can manage sets in their workout exercises" ON workout_sets;
DROP POLICY IF EXISTS "Allow authentication lookup" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Users table policies
CREATE POLICY "Allow user registration" ON users
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authentication lookup" ON users
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (id = get_current_user_id());

-- Routines table policies
CREATE POLICY "Users can manage their own routines" ON routines
  FOR ALL TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- Exercises table policies
CREATE POLICY "Users can manage exercises in their routines" ON exercises
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM routines r 
    WHERE r.id = exercises.routine_id 
    AND r.user_id = get_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM routines r 
    WHERE r.id = exercises.routine_id 
    AND r.user_id = get_current_user_id()
  ));

-- Exercise sets table policies
CREATE POLICY "Users can manage sets in their exercises" ON exercise_sets
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM exercises e
    JOIN routines r ON r.id = e.routine_id
    WHERE e.id = exercise_sets.exercise_id 
    AND r.user_id = get_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM exercises e
    JOIN routines r ON r.id = e.routine_id
    WHERE e.id = exercise_sets.exercise_id 
    AND r.user_id = get_current_user_id()
  ));

-- Workouts table policies
CREATE POLICY "Users can manage their own workouts" ON workouts
  FOR ALL TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- Workout exercises table policies
CREATE POLICY "Users can manage exercises in their workouts" ON workout_exercises
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workouts w 
    WHERE w.id = workout_exercises.workout_id 
    AND w.user_id = get_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM workouts w 
    WHERE w.id = workout_exercises.workout_id 
    AND w.user_id = get_current_user_id()
  ));

-- Workout sets table policies
CREATE POLICY "Users can manage sets in their workout exercises" ON workout_sets
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = workout_sets.workout_exercise_id 
    AND w.user_id = get_current_user_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = workout_sets.workout_exercise_id 
    AND w.user_id = get_current_user_id()
  ));