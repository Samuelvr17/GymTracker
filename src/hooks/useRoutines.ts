import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Routine, RoutineWithExercises } from '../types';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          exercises (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoutine = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('routines')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      await fetchRoutines();
      return data;
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  };

  const getRoutineWithExercises = async (routineId: string): Promise<RoutineWithExercises | null> => {
    try {
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();

      if (routineError) throw routineError;

      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          *,
          exercise_sets (*)
        `)
        .eq('routine_id', routineId)
        .order('order_index');

      if (exercisesError) throw exercisesError;

      return {
        ...routine,
        exercises: exercises.map(ex => ({
          ...ex,
          sets: ex.exercise_sets || []
        }))
      };
    } catch (error) {
      console.error('Error fetching routine with exercises:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  return {
    routines,
    loading,
    fetchRoutines,
    createRoutine,
    getRoutineWithExercises
  };
}