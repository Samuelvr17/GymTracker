-- 20250807_fix_rls_policies.sql

-- Routines
DROP POLICY IF EXISTS "Users can manage their own routines" ON routines;
CREATE POLICY "Users can manage their own routines"
  ON routines
  FOR ALL
  TO authenticated
  USING (get_current_user_id() = user_id)
  WITH CHECK (get_current_user_id() = user_id);

-- Exercises
DROP POLICY IF EXISTS "Users can manage exercises in their routines" ON exercises;
CREATE POLICY "Users can manage exercises in their routines"
  ON exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = exercises.routine_id
        AND routines.user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = exercises.routine_id
        AND routines.user_id = get_current_user_id()
    )
  );

-- Exercise sets
DROP POLICY IF EXISTS "Users can manage sets in their exercises" ON exercise_sets;
CREATE POLICY "Users can manage sets in their exercises"
  ON exercise_sets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN routines ON routines.id = exercises.routine_id
      WHERE exercises.id = exercise_sets.exercise_id
        AND routines.user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN routines ON routines.id = exercises.routine_id
      WHERE exercises.id = exercise_sets.exercise_id
        AND routines.user_id = get_current_user_id()
    )
  );

-- Workouts
DROP POLICY IF EXISTS "Users can manage their own workouts" ON workouts;
CREATE POLICY "Users can manage their own workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (get_current_user_id() = user_id)
  WITH CHECK (get_current_user_id() = user_id);

-- Workout exercises
DROP POLICY IF EXISTS "Users can manage exercises in their workouts" ON workout_exercises;
CREATE POLICY "Users can manage exercises in their workouts"
  ON workout_exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
        AND workouts.user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
        AND workouts.user_id = get_current_user_id()
    )
  );

-- Workout sets
DROP POLICY IF EXISTS "Users can manage sets in their workout exercises" ON workout_sets;
CREATE POLICY "Users can manage sets in their workout exercises"
  ON workout_sets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_sets.workout_exercise_id
        AND workouts.user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = workout_sets.workout_exercise_id
        AND workouts.user_id = get_current_user_id()
    )
  );
