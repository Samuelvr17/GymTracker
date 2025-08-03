import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Clock, MessageSquare, Save } from 'lucide-react';
import { RoutineWithExercises } from '../types';

interface WorkoutSessionProps {
  routine: RoutineWithExercises;
  onBack: () => void;
  onSaveWorkout: (workoutData: any) => void;
}

export function WorkoutSession({ routine, onBack, onSaveWorkout }: WorkoutSessionProps) {
  const [workoutData, setWorkoutData] = useState<{[key: string]: any}>({});
  const [exerciseNotes, setExerciseNotes] = useState<{[key: string]: string}>({});
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addSet = (exerciseId: string) => {
    const currentSets = workoutData[exerciseId]?.sets || [];
    const newSetNumber = currentSets.length + 1;
    
    setWorkoutData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: [...currentSets, { set_number: newSetNumber, weight: '', reps: '' }]
      }
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setWorkoutData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId]?.sets.filter((_: any, index: number) => index !== setIndex) || []
      }
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: string, value: string) => {
    setWorkoutData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId]?.sets.map((set: any, index: number) => 
          index === setIndex ? { ...set, [field]: value } : set
        ) || []
      }
    }));
  };


  const handleSave = () => {
    const exercises = Object.entries(workoutData).map(([exerciseId, data]: [string, any]) => ({
      id: exerciseId,
      notes: exerciseNotes[exerciseId] || '',
      sets: (data.sets || []).map((set: any) => ({
        weight: set.weight ? parseFloat(set.weight) : null,
        reps: set.reps ? parseInt(set.reps) : null
      }))
    }));

    const workoutPayload = {
      exercises,
      duration: elapsedTime
    };
    
    onSaveWorkout(workoutPayload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between p-4 pt-12">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-bold">Entrenamiento</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Timer */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Clock size={20} />
          <div>
            <p className="text-green-100 text-xs">Tiempo de entrenamiento</p>
            <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl mt-4 min-h-screen">
        <div className="p-6 pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{routine.name}</h2>
            <p className="text-gray-600">Registra tu entrenamiento</p>
          </div>

          {/* Exercises */}
          <div className="space-y-6">
            {routine.exercises?.map((exercise) => (
              <div key={exercise.id} className="bg-gray-50 rounded-2xl p-5">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{exercise.name}</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {exercise.expected_reps && (
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        🎯 {exercise.expected_reps} reps
                      </div>
                    )}
                    {exercise.technique && (
                      <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                        ⚡ {exercise.technique}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sets */}
                <div className="space-y-3 mb-4">
                  {(workoutData[exercise.id]?.sets || []).map((set: any, setIndex: number) => (
                    <div key={setIndex} className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-gray-700 w-6">{setIndex + 1}</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'weight', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center font-medium"
                        />
                        <span className="text-gray-600 text-sm">kg</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'reps', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center font-medium"
                        />
                        <span className="text-gray-600 text-sm">reps</span>
                        <button
                          onClick={() => removeSet(exercise.id, setIndex)}
                          className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {/* Rest buttons */}
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                          1:30
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                          3:00
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Set Button */}
                <button
                  onClick={() => addSet(exercise.id)}
                  className="w-full py-3 border-2 border-dashed border-green-300 text-green-600 rounded-xl hover:border-green-400 hover:text-green-700 transition-colors flex items-center justify-center gap-2 font-medium mb-4"
                >
                  <Plus size={20} />
                  Añadir serie
                </button>

                {/* Notes */}
                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={16} className="text-gray-600" />
                    <span className="text-sm font-bold text-gray-700">Notas</span>
                  </div>
                  <textarea
                    placeholder="Añade comentarios sobre este ejercicio..."
                    value={exerciseNotes[exercise.id] || ''}
                    onChange={(e) => setExerciseNotes(prev => ({
                      ...prev,
                      [exercise.id]: e.target.value
                    }))}
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none h-16 text-sm text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 pb-8">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Guardar Entreno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}