import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { WorkoutWithDetails } from '../types';

interface WorkoutHistoryProps {
  workouts: WorkoutWithDetails[];
  loading: boolean;
  onSelectWorkout: (workout: WorkoutWithDetails) => void;
}

export function WorkoutHistory({ workouts, loading, onSelectWorkout }: WorkoutHistoryProps) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Historial</h1>

      {workouts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">No hay entrenamientos</h3>
            <p className="text-gray-600 font-medium">Completa tu primer entrenamiento para ver el historial</p>
        </div>
      ) : (
          <div className="space-y-4">
          {workouts.map(workout => (
            <button
              key={workout.id}
              onClick={() => onSelectWorkout(workout)}
                className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 text-left transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{workout.routine.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar size={16} className="mr-2" />
                      <span className="font-medium">
                        {new Date(workout.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} - {new Date(workout.date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                  </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <span className="font-medium">
                        {workout.notes || 'Sin duración registrada'}
                      </span>
                  </div>
                </div>
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-green-600" />
                  </div>
              </div>
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}