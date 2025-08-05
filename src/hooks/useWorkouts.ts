import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutWithDetails } from '../types';

export function useWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!user) return;
    
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
        .eq('user_id', user.id)
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
    if (!user) throw new Error('Usuario no autenticado');
    
    try {
      console.log('Saving workout with data:', { routineId, exerciseData });
      
      // Formatear la duración en minutos
      const durationText = duration ? `${Math.floor(duration / 60)}m` : null;
      
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([{
          routine_id: routineId,
          user_id: user.id,
          date: new Date().toISOString(),
          notes: durationText
        }])
        .select()
        .single();

      if (workoutError) throw workoutError;
      console.log('Workout created:', workout);

      for (const exercise of exerciseData) {
        console.log('Processing exercise:', exercise);
        
        const { data: workoutExercise, error: exerciseError } = await supabase
          .from('workout_exercises')
          .insert([{
            workout_id: workout.id,
            exercise_id: exercise.exercise_id,
            notes: exercise.notes
          }])
          .select()
          .single();

        if (exerciseError) throw exerciseError;
        console.log('Workout exercise created:', workoutExercise);

        if (exercise.sets && exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map((set: any) => ({
            workout_exercise_id: workoutExercise.id,
            set_number: set.set_number,
            weight: set.weight,
            reps: set.reps
          }));
          
          console.log('Inserting sets:', setsToInsert);

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
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  return {
    workouts,
    loading,
    fetchWorkouts,
    saveWorkout
  };
}