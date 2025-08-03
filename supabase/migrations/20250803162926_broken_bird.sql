/*
  # Gym Tracker Database Schema

  1. New Tables
    - `routines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `exercises`
      - `id` (uuid, primary key)
      - `routine_id` (uuid, foreign key)
      - `name` (text)
      - `technique` (text, optional)
      - `expected_reps` (text, optional)
      - `order_index` (integer)
      - `created_at` (timestamp)
    
    - `exercise_sets`
      - `id` (uuid, primary key)
      - `exercise_id` (uuid, foreign key)
      - `set_number` (integer)
      - `weight` (numeric, optional)
      - `reps` (integer, optional)
    
    - `workouts`
      - `id` (uuid, primary key)
      - `routine_id` (uuid, foreign key)
      - `date` (timestamp)
      - `notes` (text, optional)
    
    - `workout_exercises`
      - `id` (uuid, primary key)
      - `workout_id` (uuid, foreign key)
      - `exercise_id` (uuid, foreign key)
      - `notes` (text, optional)
    
    - `workout_sets`
      - `id` (uuid, primary key)
      - `workout_exercise_id` (uuid, foreign key)
      - `set_number` (integer)
      - `weight` (numeric, optional)
      - `reps` (integer, optional)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create routines table
CREATE TABLE IF NOT EXISTS routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid REFERENCES routines(id) ON DELETE CASCADE,
  name text NOT NULL,
  technique text,
  expected_reps text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create exercise_sets table (template sets for exercises)
CREATE TABLE IF NOT EXISTS exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  weight numeric,
  reps integer
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid REFERENCES routines(id) ON DELETE CASCADE,
  date timestamptz DEFAULT now(),
  notes text
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  notes text
);

-- Create workout_sets table (actual sets performed during workout)
CREATE TABLE IF NOT EXISTS workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  weight numeric,
  reps integer
);

-- Enable Row Level Security
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a personal app)
CREATE POLICY "Enable all operations for all users on routines" ON routines FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users on exercises" ON exercises FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users on exercise_sets" ON exercise_sets FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users on workouts" ON workouts FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users on workout_exercises" ON workout_exercises FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users on workout_sets" ON workout_sets FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_routine_id ON exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_exercises_order_index ON exercises(order_index);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workouts_routine_id ON workouts(routine_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_exercise_id ON workout_sets(workout_exercise_id);