import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Exercise {
  id?: string;
  name: string;
  technique: string;
  expected_reps: string;
  sets: { weight: string; reps: string }[];
}

interface CreateRoutineProps {
  onBack: () => void;
  routineId?: string;
  initialData?: {
    name: string;
    exercises: Exercise[];
  };
}

export function CreateRoutine({ onBack, routineId, initialData }: CreateRoutineProps) {
  const [routineName, setRoutineName] = useState(initialData?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(initialData?.exercises || []);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: '',
    technique: '',
    expected_reps: '',
    sets: [{ weight: '', reps: '' }]
  });
  const [saving, setSaving] = useState(false);

  const addSet = () => {
    setNewExercise(prev => ({
      ...prev,
      sets: [...prev.sets, { weight: '', reps: '' }]
    }));
  };

  const removeSet = (setIndex: number) => {
    setNewExercise(prev => ({
      ...prev,
      sets: prev.sets.filter((_, index) => index !== setIndex)
    }));
  };

  const updateSet = (setIndex: number, field: 'weight' | 'reps', value: string) => {
    setNewExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set, index) => 
        index === setIndex ? { ...set, [field]: value } : set
      )
    }));
  };

  const addExercise = () => {
    if (newExercise.name.trim()) {
      setExercises(prev => [...prev, { ...newExercise }]);
      setNewExercise({
        name: '',
        technique: '',
        expected_reps: '',
        sets: [{ weight: '', reps: '' }]
      });
      setShowExerciseForm(false);
    }
  };

  const removeExercise = (exerciseIndex: number) => {
    setExercises(prev => prev.filter((_, index) => index !== exerciseIndex));
  };

  const saveRoutine = async () => {
    if (!routineName.trim() || exercises.length === 0) {
      alert('Por favor ingresa el nombre de la rutina y al menos un ejercicio');
      return;
    }

    setSaving(true);
    try {
      let currentRoutineId = routineId;

      if (!currentRoutineId) {
        const { data: routine, error: routineError } = await supabase
          .from('routines')
          .insert([{ name: routineName }])
          .select()
          .single();

        if (routineError) throw routineError;
        currentRoutineId = routine.id;
      } else {
        await supabase
          .from('routines')
          .update({ name: routineName })
          .eq('id', currentRoutineId);
      }

      // Delete existing exercises if editing
      if (routineId) {
        await supabase
          .from('exercises')
          .delete()
          .eq('routine_id', currentRoutineId);
      }

      // Insert exercises
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .insert([{
            routine_id: currentRoutineId,
            name: exercise.name,
            technique: exercise.technique,
            expected_reps: exercise.expected_reps,
            order_index: i
          }])
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Insert template sets
        const setsToInsert = exercise.sets.map((set, setIndex) => ({
          exercise_id: exerciseData.id,
          set_number: setIndex + 1,
          weight: set.weight ? parseFloat(set.weight) : null,
          reps: set.reps ? parseInt(set.reps) : null
        }));

        if (setsToInsert.length > 0) {
          const { error: setsError } = await supabase
            .from('exercise_sets')
            .insert(setsToInsert);

          if (setsError) throw setsError;
        }
      }

      onBack();
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('Error al guardar la rutina');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">
            {routineId ? 'Editar Rutina' : 'Nueva Rutina'}
          </h1>
          <button
            onClick={saveRoutine}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Rutina
          </label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="Ej: Push Day"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Ejercicios</h2>
            <button
              onClick={() => setShowExerciseForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <Plus size={20} className="mr-1" />
              Crear Ejercicio
            </button>
          </div>

          {exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                <button
                  onClick={() => removeExercise(exerciseIndex)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              {exercise.technique && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Técnica:</span> {exercise.technique}
                </p>
              )}
              
              {exercise.expected_reps && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Reps esperadas:</span> {exercise.expected_reps}
                </p>
              )}

              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {setIndex + 1}
                    </span>
                    <input
                      type="number"
                      placeholder="kg"
                      value={set.weight}
                      readOnly
                      className="flex-1 px-2 py-2 border border-gray-300 rounded bg-gray-50 text-center"
                    />
                    <input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      readOnly
                      className="flex-1 px-2 py-2 border border-gray-300 rounded bg-gray-50 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showExerciseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Nuevo Ejercicio</h3>
              <button
                onClick={() => setShowExerciseForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Ejercicio
                </label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Press de Banca"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Técnica
                </label>
                <input
                  type="text"
                  value={newExercise.technique}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, technique: e.target.value }))}
                  placeholder="Ej: Al Fallo, Parciales, Myo-Reps"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de Reps Esperadas
                </label>
                <input
                  type="text"
                  value={newExercise.expected_reps}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, expected_reps: e.target.value }))}
                  placeholder="Ej: 8-12, 6-10"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Series</label>
                  <button
                    onClick={addSet}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    + Añadir Serie
                  </button>
                </div>
                
                <div className="space-y-2">
                  {newExercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        {setIndex + 1}
                      </span>
                      <input
                        type="number"
                        placeholder="kg"
                        value={set.weight}
                        onChange={(e) => updateSet(setIndex, 'weight', e.target.value)}
                        className="flex-1 px-2 py-2 border border-gray-300 rounded text-center"
                      />
                      <input
                        type="number"
                        placeholder="reps"
                        value={set.reps}
                        onChange={(e) => updateSet(setIndex, 'reps', e.target.value)}
                        className="flex-1 px-2 py-2 border border-gray-300 rounded text-center"
                      />
                      {newExercise.sets.length > 1 && (
                        <button
                          onClick={() => removeSet(setIndex)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={addExercise}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                Añadir Ejercicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}