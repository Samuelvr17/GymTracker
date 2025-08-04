import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { RoutinesList } from './components/RoutinesList';
import { CreateRoutine } from './components/CreateRoutine';
import { RoutineDetail } from './components/RoutineDetail';
import { WorkoutSession } from './components/WorkoutSession';
import { WorkoutHistory } from './components/WorkoutHistory';
import { WorkoutDetails } from './components/WorkoutDetails';
import { useRoutines } from './hooks/useRoutines';
import { useWorkouts } from './hooks/useWorkouts';
import { Routine, RoutineWithExercises, WorkoutWithDetails } from './types';

type Screen = 
  | 'routines'
  | 'create-routine'
  | 'routine-detail'
  | 'edit-routine'
  | 'workout-session'
  | 'workout-history'
  | 'workout-details';

function App() {
  const [activeTab, setActiveTab] = useState<'routines' | 'reports'>('routines');
  const [currentScreen, setCurrentScreen] = useState<Screen>('routines');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedRoutineWithExercises, setSelectedRoutineWithExercises] = useState<RoutineWithExercises | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithDetails | null>(null);

  const { routines, loading: routinesLoading, fetchRoutines, getRoutineWithExercises } = useRoutines();
  const { workouts, loading: workoutsLoading, saveWorkout } = useWorkouts();

  const handleTabChange = (tab: 'routines' | 'reports') => {
    setActiveTab(tab);
    setCurrentScreen(tab === 'routines' ? 'routines' : 'workout-history');
  };

  const handleCreateRoutine = () => {
    setCurrentScreen('create-routine');
  };

  const handleSelectRoutine = async (routine: Routine) => {
    setSelectedRoutine(routine);
    const routineWithExercises = await getRoutineWithExercises(routine.id);
    if (routineWithExercises) {
      setSelectedRoutineWithExercises(routineWithExercises);
      setCurrentScreen('routine-detail');
    }
  };

  const handleStartWorkout = () => {
    setCurrentScreen('workout-session');
  };

  const handleEditRoutine = () => {
    if (selectedRoutineWithExercises) {
      setCurrentScreen('edit-routine');
    }
  };

  const handleSaveWorkout = async (exerciseData: any[]) => {
    if (selectedRoutineWithExercises) {
      await saveWorkout(selectedRoutineWithExercises.id, exerciseData, null);
      setCurrentScreen('routines');
    }
  };

  const handleSelectWorkout = (workout: WorkoutWithDetails) => {
    setSelectedWorkout(workout);
    setCurrentScreen('workout-details');
  };

  const handleBack = async () => {
    switch (currentScreen) {
      case 'create-routine':
      case 'edit-routine':
        await fetchRoutines();
        setCurrentScreen('routines');
        break;
      case 'routine-detail':
        setCurrentScreen('routines');
        break;
      case 'workout-session':
        setCurrentScreen('routine-detail');
        break;
      case 'workout-details':
        setCurrentScreen('workout-history');
        break;
      default:
        setCurrentScreen('routines');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'routines':
        return (
          <RoutinesList
            routines={routines}
            loading={routinesLoading}
            onCreateRoutine={handleCreateRoutine}
            onSelectRoutine={handleSelectRoutine}
          />
        );

      case 'create-routine':
        return (
          <CreateRoutine onBack={handleBack} />
        );

      case 'edit-routine':
        if (!selectedRoutineWithExercises) return null;
        return (
          <CreateRoutine
            onBack={handleBack}
            routineId={selectedRoutineWithExercises.id}
            initialData={{
              name: selectedRoutineWithExercises.name,
              exercises: selectedRoutineWithExercises.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                technique: ex.technique || '',
                expected_reps: ex.expected_reps || '',
                sets: ex.sets.map(set => ({
                  weight: set.weight?.toString() || '',
                  reps: set.reps?.toString() || ''
                }))
              }))
            }}
          />
        );

      case 'routine-detail':
        if (!selectedRoutineWithExercises) return null;
        return (
          <RoutineDetail
            routine={selectedRoutineWithExercises}
            onBack={handleBack}
            onStartWorkout={handleStartWorkout}
            onEditRoutine={handleEditRoutine}
          />
        );

      case 'workout-session':
        if (!selectedRoutineWithExercises) return null;
        return (
          <WorkoutSession
            routine={selectedRoutineWithExercises}
            onBack={handleBack}
            onSaveWorkout={handleSaveWorkout}
          />
        );

      case 'workout-history':
        return (
          <WorkoutHistory
            workouts={workouts}
            loading={workoutsLoading}
            onSelectWorkout={handleSelectWorkout}
          />
        );

      case 'workout-details':
        if (!selectedWorkout) return null;
        return (
          <WorkoutDetails
            workout={selectedWorkout}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderScreen()}
    </Layout>
  );
}

export default App;