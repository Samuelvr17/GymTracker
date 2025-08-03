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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{routine.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Routine Info */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{routine.name}</h2>
          <p className="text-gray-600 text-lg">{routine.exercises?.length || 0} ejercicios</p>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          {routine.exercises?.map((exercise: Exercise) => (
            <div key={exercise.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{exercise.name}</h3>
              <p className="text-gray-600 mb-4">{exercise.sets?.length || 0} series</p>
              
              <div className="flex flex-wrap gap-3">
                {exercise.expected_reps && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700 text-sm font-medium">{exercise.expected_reps} reps</span>
                  </div>
                )}
                {exercise.technique && (
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-xl">
                    <Zap size={14} className="text-purple-600" />
                    <span className="text-purple-700 text-sm font-medium">{exercise.technique}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={onEditRoutine}
            className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Edit size={20} />
            Editar
          </button>
          <button
            onClick={onStartWorkout}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play size={20} />
            Iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
