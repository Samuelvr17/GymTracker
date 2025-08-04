import React from 'react';
import { Plus, Dumbbell, Trash2, MoreVertical } from 'lucide-react';
import { Routine } from '../types';
import { supabase } from '../lib/supabase';

interface RoutinesListProps {
  routines: Routine[];
  loading: boolean;
  onCreateRoutine: () => void;
  onSelectRoutine: (routine: Routine) => void;
  onRefresh: () => void;
}

export function RoutinesList({ routines, loading, onCreateRoutine, onSelectRoutine, onRefresh }: RoutinesListProps) {
  const [showDeleteMenu, setShowDeleteMenu] = React.useState<string | null>(null);

  const handleDeleteRoutine = async (routineId: string, routineName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la rutina "${routineName}"? Esta acción no se puede deshacer.`)) {
      try {
        const { error } = await supabase
          .from('routines')
          .delete()
          .eq('id', routineId);

        if (error) throw error;
        onRefresh();
        setShowDeleteMenu(null);
      } catch (error) {
        console.error('Error deleting routine:', error);
        alert('Error al eliminar la rutina');
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Rutinas</h1>
        <button
          onClick={onCreateRoutine}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105"
        >
            <Plus size={20} className="sm:hidden" strokeWidth={2.5} />
            <Plus size={24} className="hidden sm:block" strokeWidth={2.5} />
        </button>
      </div>

      {routines.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Dumbbell size={32} className="sm:hidden text-blue-600" />
              <Dumbbell size={40} className="hidden sm:block text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">No hay rutinas</h3>
            <p className="text-gray-600 mb-6 sm:mb-8 font-medium text-sm sm:text-base">Crea tu primera rutina para comenzar</p>
          <button
            onClick={onCreateRoutine}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Crear Rutina
          </button>
        </div>
      ) : (
          <div className="space-y-3 sm:space-y-4">
          {routines.map(routine => (
            <div
              key={routine.id}
                className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <button
                onClick={() => onSelectRoutine(routine)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2 pr-8">{routine.name}</h3>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Dumbbell size={14} className="mr-2 sm:hidden" />
                      <Dumbbell size={16} className="mr-2 hidden sm:block" />
                      <span className="font-medium">
                        {routine.exercises?.length || 0} ejercicios
                      </span>
                    </div>
                </div>
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Dumbbell size={16} className="sm:hidden text-blue-600" />
                    <Dumbbell size={20} className="hidden sm:block text-blue-600" />
                  </div>
              </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteMenu(showDeleteMenu === routine.id ? null : routine.id);
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical size={16} className="text-gray-500" />
              </button>

              {showDeleteMenu === routine.id && (
                <div className="absolute top-12 right-3 sm:right-4 bg-white rounded-lg shadow-lg border z-10 min-w-[120px]">
                  <button
                    onClick={() => handleDeleteRoutine(routine.id, routine.name)}
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