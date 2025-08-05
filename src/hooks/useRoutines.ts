import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Routine, RoutineWithExercises } from '../types';

export function useRoutines() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          exercises (*)
        `)
        .eq('user_id', user.id)
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
    if (!user) throw new Error('Usuario no autenticado');
    
    try {
      const { data, error } = await supabase
        .from('routines')
        .insert([{ name, user_id: user.id }])
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
    if (!user) return null;
    
    try {
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .eq('user_id', user.id)
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
    if (user) {
      fetchRoutines();
    }
  }, [user]);

  return {
    routines,
    loading,
    fetchRoutines,
    createRoutine,
    getRoutineWithExercises
  };
}