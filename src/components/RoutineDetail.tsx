import React from 'react';
import { ArrowLeft, Edit, Play, Dumbbell, Zap } from 'lucide-react';
import { Routine, Exercise } from '../types';

interface RoutineDetailProps {
  routine: Routine;
  onBack: () => void;
  onEditRoutine: () => void;
  onStartWorkout: () => void;
}

export function RoutineDetail({ routine, onBack, onEditRoutine, onStartWorkout }: RoutineDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-b-2xl sm:rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="sm:hidden" />
            <ArrowLeft size={24} className="hidden sm:block" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{routine.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Routine Info */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{routine.name}</h2>
          <p className="text-gray-600 text-base sm:text-lg">{routine.exercises?.length || 0} ejercicios</p>
        </div>

        {/* Exercises List */}
        <div className="space-y-3 sm:space-y-4">
          {routine.exercises?.map((exercise: Exercise) => (
            <div key={exercise.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{exercise.name}</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{exercise.sets?.length || 0} series</p>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {exercise.expected_reps && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700 text-xs sm:text-sm font-medium">{exercise.expected_reps} reps</span>
                  </div>
                )}
                {exercise.technique && (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-purple-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                    <Zap size={12} className="sm:hidden text-purple-600" />
                    <Zap size={14} className="hidden sm:block text-purple-600" />
                    <span className="text-purple-700 text-xs sm:text-sm font-medium">{exercise.technique}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
          <button
            onClick={onEditRoutine}
            className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Edit size={18} className="sm:hidden" />
            <Edit size={20} className="hidden sm:block" />
            Editar
          </button>
          <button
            onClick={onStartWorkout}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play size={18} className="sm:hidden" />
            <Play size={20} className="hidden sm:block" />
            Iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
