import React from 'react';
import { Plus, Dumbbell, Calendar } from 'lucide-react';
import { Routine } from '../types';

interface RoutinesListProps {
  routines: Routine[];
  loading: boolean;
  onCreateRoutine: () => void;
  onSelectRoutine: (routine: Routine) => void;
}

export function RoutinesList({ routines, loading, onCreateRoutine, onSelectRoutine }: RoutinesListProps) {
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
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Rutinas</h1>
        <button
          onClick={onCreateRoutine}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105"
        >
            <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {routines.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Dumbbell size={40} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">No hay rutinas</h3>
            <p className="text-gray-600 mb-8 font-medium">Crea tu primera rutina para comenzar</p>
          <button
            onClick={onCreateRoutine}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Crear Rutina
          </button>
        </div>
      ) : (
          <div className="space-y-4">
          {routines.map(routine => (
            <button
              key={routine.id}
              onClick={() => onSelectRoutine(routine)}
                className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 text-left transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{routine.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Dumbbell size={16} className="mr-2" />
                      <span className="font-medium">
                        {routine.exercises?.length || 0} ejercicios
                      </span>
                    </div>
                </div>
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Dumbbell size={20} className="text-blue-600" />
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