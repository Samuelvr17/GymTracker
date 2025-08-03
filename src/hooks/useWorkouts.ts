import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WorkoutWithDetails } from '../types';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          routine:routines (*),
          workout_exercises (
            *,
            exercise:exercises (*),
            workout_sets (*)
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (routineId: string, exerciseData: any[], duration?: number) => {
    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([{
          routine_id: routineId,
          date: new Date().toISOString(),
          notes: duration ? `Duración: ${Math.floor(duration / 60)}m ${duration % 60}s` : null
        }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      for (const exercise of exerciseData) {
        const { data: workoutExercise, error: exerciseError } = await supabase
          .from('workout_exercises')
          .insert([{
            workout_id: workout.id,
            exercise_id: exercise.id,
            notes: exercise.notes
          }])
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        if (exercise.sets && exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map((set: any, index: number) => ({
            workout_exercise_id: workoutExercise.id,
            set_number: index + 1,
            weight: set.weight,
            reps: set.reps
          }));

          const { error: setsError } = await supabase
            .from('workout_sets')
            .insert(setsToInsert);

          if (setsError) throw setsError;
        }
      }

      await fetchWorkouts();
      return workout;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return {
    workouts,
    loading,
    fetchWorkouts,
    saveWorkout
  };
}