import React from 'react';
import { ArrowLeft, Calendar, Clock, Trash2 } from 'lucide-react';
import { WorkoutWithDetails } from '../types';
import { supabase } from '../lib/supabase';

interface WorkoutDetailsProps {
  workout: WorkoutWithDetails;
  onBack: () => void;
}

export function WorkoutDetails({ workout, onBack }: WorkoutDetailsProps) {
  const handleDeleteWorkout = async () => {
    if (confirm(`¿Estás seguro de que quieres eliminar este entrenamiento de "${workout.routine.name}"? Esta acción no se puede deshacer.`)) {
      try {
        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('id', workout.id);

        if (error) throw error;
        onBack(); // Regresa al historial después de eliminar
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Error al eliminar el entrenamiento');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between p-4 pt-8 sm:pt-12">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors">
            <ArrowLeft size={20} className="sm:hidden" strokeWidth={2.5} />
            <ArrowLeft size={24} className="hidden sm:block" strokeWidth={2.5} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold">Detalles</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="bg-white rounded-t-3xl mt-4 min-h-screen">
        <div className="p-4 sm:p-6 pt-6 sm:pt-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{workout.routine.name}</h2>
            <div className="flex items-center text-gray-600 mb-2 text-sm sm:text-base">
              <Calendar size={14} className="mr-2 sm:hidden" />
              <Calendar size={16} className="mr-2 hidden sm:block" />
              <span className="font-medium">
                {new Date(workout.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <Clock size={14} className="mr-2 sm:hidden" />
              <Clock size={16} className="mr-2 hidden sm:block" />
              <span className="font-medium">
                {new Date(workout.date).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {workout.notes && (
              <div className="mt-3">
              <div className="flex items-center text-blue-600">
                <Clock size={14} className="mr-2 sm:hidden" />
                <Clock size={16} className="mr-2 hidden sm:block" />
                <span className="font-bold">Duración: 2m</span>
              </div>
            </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            {workout.workout_exercises.map(workoutExercise => (
              <div key={workoutExercise.id} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {workoutExercise.exercise.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {workoutExercise.exercise.technique && (
                      <div className="bg-purple-100 text-purple-700 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium">
                        ⚡ {workoutExercise.exercise.technique}
                      </div>
                    )}
                    {workoutExercise.exercise.expected_reps && (
                      <div className="bg-blue-100 text-blue-700 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium">
                        🎯 {workoutExercise.exercise.expected_reps} reps
                      </div>
                    )}
                  </div>
                  <span className="font-bold">{workout.notes}</span>
                </div>

                {workoutExercise.workout_sets.length > 0 && (
                  <div className="mb-4 sm:mb-5">
                    <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden">
                      <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 grid grid-cols-3 gap-2 sm:gap-4">
                        <span className="text-xs sm:text-sm font-bold text-gray-700">Serie</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-700 text-center">Peso</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-700 text-center">Reps</span>
                      </div>
                      {workoutExercise.workout_sets.map(set => (
                        <div key={set.id} className="px-3 sm:px-4 py-2 sm:py-3 grid grid-cols-3 gap-2 sm:gap-4 border-b border-gray-100 last:border-b-0">
                          <span className="text-base sm:text-lg font-bold text-gray-800">
                            {set.set_number}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-gray-900 text-center">
                            {set.weight || 0} kg
                          </span>
                          <span className="text-base sm:text-lg font-bold text-gray-900 text-center">
                            {set.reps || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workoutExercise.notes && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2">Notas</h4>
                    <p className="text-gray-700 font-medium text-sm sm:text-base">
                      {workoutExercise.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Delete Button */}
          <div className="mt-6 sm:mt-8 pb-6 sm:pb-8">
            <button
              onClick={handleDeleteWorkout}
              className="w-full bg-red-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} className="sm:hidden" />
              <Trash2 size={20} className="hidden sm:block" />
              Eliminar Entrenamiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}