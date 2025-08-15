import React, { useState } from 'react';
import MainScreen from './MainScreen';
import ExerciseScreen from './ExerciseScreen';
import exercises from './exercises.json';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main', 'exercise', 'complete'
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);

  const handleStartWorkout = () => {
    setCurrentScreen('exercise');
    setCurrentExerciseIndex(0);
    setWorkoutStartTime(new Date());
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setCurrentScreen('complete');
    }
  };

  const handleFinishWorkout = () => {
    setCurrentScreen('complete');
  };

  const handleRestartWorkout = () => {
    setCurrentScreen('main');
    setCurrentExerciseIndex(0);
    setWorkoutStartTime(null);
  };

  const handleBackHome = () => {
    setCurrentScreen('main');
    setCurrentExerciseIndex(0);
    setWorkoutStartTime(null);
  };

  const calculateWorkoutDuration = () => {
    if (!workoutStartTime) return 0;
    return Math.floor((new Date() - workoutStartTime) / 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentScreen === 'main') {
    return (
      <div className="App">
        <MainScreen onStartWorkout={handleStartWorkout} />
      </div>
    );
  }

  if (currentScreen === 'exercise') {
    return (
      <div className="App">
        <ExerciseScreen
          exercise={exercises[currentExerciseIndex]}
          exerciseIndex={currentExerciseIndex}
          totalExercises={exercises.length}
          onNextExercise={handleNextExercise}
          onFinishWorkout={handleFinishWorkout}
          onBackHome={handleBackHome}
        />
      </div>
    );
  }

  if (currentScreen === 'complete') {
    const workoutDuration = calculateWorkoutDuration();
    
    return (
      <div className="App">
        <div className="completion-screen">
          <div className="completion-content">
            <div className="completion-icon">🎉</div>
            <h1>Workout Complete!</h1>
            <p>Congratulations! You've finished your workout session.</p>
            
            <div className="workout-stats">
              <div className="stat">
                <div className="stat-value">{exercises.length}</div>
                <div className="stat-label">Exercises</div>
              </div>
              <div className="stat">
                <div className="stat-value">{exercises.reduce((total, ex) => total + ex.sets, 0)}</div>
                <div className="stat-label">Sets</div>
              </div>
              <div className="stat">
                <div className="stat-value">{formatTime(workoutDuration)}</div>
                <div className="stat-label">Duration</div>
              </div>
            </div>

            <div className="completion-message">
              <p>You crushed it! 💪</p>
              <p>Keep up the great work and stay consistent with your fitness goals.</p>
            </div>

            <button className="restart-button" onClick={handleRestartWorkout}>
              Start New Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
