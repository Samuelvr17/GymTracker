import React from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { WorkoutWithDetails } from '../types';

interface WorkoutDetailsProps {
  workout: WorkoutWithDetails;
  onBack: () => void;
}

export function WorkoutDetails({ workout, onBack }: WorkoutDetailsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between p-4 pt-12">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-bold">Detalles</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="bg-white rounded-t-3xl mt-4 min-h-screen">
        <div className="p-6 pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{workout.routine.name}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar size={16} className="mr-2" />
              <span className="font-medium">
                {new Date(workout.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-2" />
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
                <Clock size={16} className="mr-2" />
                <span className="font-bold">Duración: 2m</span>
              </div>
            </div>
            )}
          </div>

          <div className="space-y-6">
            {workout.workout_exercises.map(workoutExercise => (
              <div key={workoutExercise.id} className="bg-gray-50 rounded-2xl p-5">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {workoutExercise.exercise.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {workoutExercise.exercise.technique && (
                      <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                        ⚡ {workoutExercise.exercise.technique}
                      </div>
                    )}
                    {workoutExercise.exercise.expected_reps && (
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        🎯 {workoutExercise.exercise.expected_reps} reps
                      </div>
                    )}
                  </div>
                  <span className="font-bold">{workout.notes}</span>
                </div>

                {workoutExercise.workout_sets.length > 0 && (
                  <div className="mb-5">
                    <div className="bg-white rounded-xl overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 grid grid-cols-3 gap-4">
                        <span className="text-sm font-bold text-gray-700">Serie</span>
                        <span className="text-sm font-bold text-gray-700 text-center">Peso</span>
                        <span className="text-sm font-bold text-gray-700 text-center">Reps</span>
                      </div>
                      {workoutExercise.workout_sets.map(set => (
                        <div key={set.id} className="px-4 py-3 grid grid-cols-3 gap-4 border-b border-gray-100 last:border-b-0">
                          <span className="text-lg font-bold text-gray-800">
                            {set.set_number}
                          </span>
                          <span className="text-lg font-bold text-gray-900 text-center">
                            {set.weight || 0} kg
                          </span>
                          <span className="text-lg font-bold text-gray-900 text-center">
                            {set.reps || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workoutExercise.notes && (
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Notas</h4>
                    <p className="text-gray-700 font-medium">
                      {workoutExercise.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}