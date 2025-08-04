import React from 'react';
import { Calendar, Clock, Trash2, MoreVertical } from 'lucide-react';
import { WorkoutWithDetails } from '../types';
import { supabase } from '../lib/supabase';

interface WorkoutHistoryProps {
  workouts: WorkoutWithDetails[];
  loading: boolean;
  onSelectWorkout: (workout: WorkoutWithDetails) => void;
  onRefresh: () => void;
}

export function WorkoutHistory({ workouts, loading, onSelectWorkout, onRefresh }: WorkoutHistoryProps) {
  const [showDeleteMenu, setShowDeleteMenu] = React.useState<string | null>(null);

  const handleDeleteWorkout = async (workoutId: string, routineName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar este entrenamiento de "${routineName}"? Esta acción no se puede deshacer.`)) {
      try {
        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('id', workoutId);

        if (error) throw error;
        onRefresh();
        setShowDeleteMenu(null);
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Error al eliminar el entrenamiento');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historial</h1>

      {workouts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Clock size={32} className="sm:hidden text-blue-600" />
              <Clock size={40} className="hidden sm:block text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">No hay entrenamientos</h3>
            <p className="text-gray-600 font-medium text-sm sm:text-base">Completa tu primer entrenamiento para ver el historial</p>
        </div>
      ) : (
          <div className="space-y-3 sm:space-y-4">
          {workouts.map(workout => (
            <div
              key={workout.id}
                className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <button
                onClick={() => onSelectWorkout(workout)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2 pr-8">{workout.routine.name}</h3>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-1">
                      <Calendar size={14} className="mr-2 sm:hidden" />
                      <Calendar size={16} className="mr-2 hidden sm:block" />
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
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Clock size={14} className="mr-2 sm:hidden" />
                      <Clock size={16} className="mr-2 hidden sm:block" />
                      <span className="font-medium">
                        {workout.notes || 'Sin duración registrada'}
                      </span>
                  </div>
                </div>
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Clock size={16} className="sm:hidden text-green-600" />
                    <Clock size={20} className="hidden sm:block text-green-600" />
                  </div>
              </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteMenu(showDeleteMenu === workout.id ? null : workout.id);
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical size={16} className="text-gray-500" />
              </button>
              {showDeleteMenu === workout.id && (
                <div className="absolute top-12 right-3 sm:right-4 bg-white rounded-lg shadow-lg border z-10 min-w-[140px]">
                  <button
                    onClick={() => handleDeleteWorkout(workout.id, workout.routine.name)}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center text-sm font-medium"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
      
      {/* Overlay to close delete menu */}
      {showDeleteMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowDeleteMenu(null)}
        />
      )}
    </div>
  );
}