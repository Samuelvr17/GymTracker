export interface Routine {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  routine_id: string;
  name: string;
  technique?: string;
  expected_reps?: string;
  order_index: number;
}

export interface ExerciseSet {
  id: string;
  exercise_id: string;
  set_number: number;
  weight?: number;
  reps?: number;
}

export interface Workout {
  id: string;
  user_id: string;
  routine_id: string;
  date: string;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  notes?: string;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight?: number;
  reps?: number;
}

export interface RoutineWithExercises extends Routine {
  exercises: (Exercise & { sets: ExerciseSet[] })[];
}

export interface WorkoutWithDetails extends Workout {
  routine: Routine;
  workout_exercises: (WorkoutExercise & {
    exercise: Exercise;
    workout_sets: WorkoutSet[];
  })[];
}