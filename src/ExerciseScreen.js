import React, { useState, useEffect } from 'react';
import './ExerciseScreen.css';
import workoutSpeech from './speechUtils';

const GLOBAL_REP_DURATION = 2; // Default 2 seconds per rep

const ExerciseScreen = ({ exercise, exerciseIndex, totalExercises, onNextExercise, onFinishWorkout, onBackHome }) => {
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [repTimer, setRepTimer] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasAnnouncedExercise, setHasAnnouncedExercise] = useState(false);
  const [isWaitingForVoice, setIsWaitingForVoice] = useState(false);

  // Get rep duration from exercise or use global default
  const repDuration = exercise.repDuration || GLOBAL_REP_DURATION;

  // Calculate derived values first
  const progressPercentage = ((exerciseIndex + (currentSet - 1) / exercise.sets) / totalExercises) * 100;
  const repProgress = (repTimer / repDuration) * 100;
  const isExerciseComplete = currentSet === exercise.sets && currentRep === exercise.reps;

  // Helper function definition
  const handleExerciseComplete = () => {
    if (exerciseIndex < totalExercises - 1) {
      onNextExercise();
    } else {
      onFinishWorkout();
    }
  };

  // General timer that runs throughout the workout
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && !isResting) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isResting]);

  // Rep timer - automatically advances reps based on duration and voice counting
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && !isResting && !isWaitingForVoice) {
      interval = setInterval(() => {
        setRepTimer(prev => {
          const newRepTimer = prev + 0.1; // Update every 100ms for smooth progress
          
          // Check if we should advance to next rep
          if (newRepTimer >= repDuration && currentRep < exercise.reps) {
            setCurrentRep(prevRep => {
              const nextRep = prevRep + 1;
              
              // Announce rep count with voice
              if (voiceEnabled) {
                workoutSpeech.announceRepNumber(nextRep);
              }
              
              // Check if set is complete
              if (nextRep >= exercise.reps) {
                // Set complete - start rest or move to next set
                if (currentSet < exercise.sets) {
                  setCurrentSet(prevSet => prevSet + 1);
                  setCurrentRep(0);
                  setIsResting(true);
                  setRestTimer(exercise.restTime);
                  setIsRunning(false);
                  setIsPaused(false);
                } else {
                  // Exercise complete
                  setIsRunning(false);
                  setIsPaused(false);
                  handleExerciseComplete();
                }
              }
              return nextRep;
            });
            return 0; // Reset rep timer
          }
          
          return newRepTimer;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isResting, isWaitingForVoice, currentRep, currentSet, exercise.reps, exercise.sets, repDuration, voiceEnabled]);

  // Rest timer
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          // Voice countdown for last 3 seconds
          if (voiceEnabled && prev <= 3 && prev > 0) {
            workoutSpeech.announceRestCountdown(prev);
          }
          
          if (prev <= 1) {
            setIsResting(false);
            setRepTimer(0);
            // Automatically continue to next set
            if (voiceEnabled) {
              setIsWaitingForVoice(true);
              workoutSpeech.announceSetStart(currentSet, exercise.sets);
              // Wait a moment for the announcement, then start automatically
              setTimeout(() => {
                setIsWaitingForVoice(false);
                setIsRunning(true);
                setIsPaused(false);
              }, 1500); // 1.5 second delay for voice
            } else {
              setIsRunning(true);
              setIsPaused(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, voiceEnabled, currentSet, exercise.sets]);

  // Exercise announcement when component mounts
  useEffect(() => {
    if (!hasAnnouncedExercise && voiceEnabled) {
      try {
        workoutSpeech.announceExercise(exercise.name);
        setHasAnnouncedExercise(true);
      } catch (error) {
        console.warn('Voice announcement error:', error);
        setHasAnnouncedExercise(true);
      }
    }
  }, [exercise.name, hasAnnouncedExercise, voiceEnabled]);

  // Removed milestone announcements

  // Voice announcement for set completion
  useEffect(() => {
    if (voiceEnabled && isResting && restTimer === exercise.restTime) {
      workoutSpeech.announceSetComplete(currentSet - 1, exercise.sets);
      if (exercise.restTime > 0) {
        workoutSpeech.announceRest(exercise.restTime);
      }
    }
  }, [isResting, restTimer, exercise.restTime, currentSet, exercise.sets, voiceEnabled]);

  // Voice announcement for exercise completion
  useEffect(() => {
    if (voiceEnabled && isExerciseComplete) {
      if (exerciseIndex === totalExercises - 1) {
        workoutSpeech.announceWorkoutComplete();
      } else {
        workoutSpeech.speak('Exercise complete! Moving to next exercise.');
      }
    }
  }, [isExerciseComplete, exerciseIndex, totalExercises, voiceEnabled]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!isRunning) {
      if (voiceEnabled) {
        setIsWaitingForVoice(true);
        workoutSpeech.announceWorkoutStart(() => {
          setIsWaitingForVoice(false);
          setIsRunning(true);
          setIsPaused(false);
        });
      } else {
        setIsRunning(true);
        setIsPaused(false);
      }
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRepTimer(0);
    if (voiceEnabled) {
      workoutSpeech.stop();
    }
  };

  const toggleVoice = () => {
    const newVoiceState = workoutSpeech.toggle();
    setVoiceEnabled(newVoiceState);
  };

  return (
    <div className="exercise-screen">
      {/* Top Navigation */}
      <div className="top-navigation">
        <button 
          className="back-home-button"
          onClick={onBackHome}
          title="Back to Home"
        >
          🏠 Home
        </button>
      </div>

      {/* Exercise Info */}
      <div className="exercise-info">
        <h2 className="exercise-name">{exercise.name}</h2>
        <p className="exercise-description">{exercise.description}</p>
        <div className="exercise-instructions">
          <strong>Instructions:</strong> {exercise.instructions}
        </div>
      </div>

      {/* Counters - Switched order */}
      <div className="counters-container">
        <div className="counter">
          <div className="counter-label">Reps</div>
          <div className="counter-value">{currentRep}/{exercise.reps}</div>
          {/* Rep progress indicator */}
          <div className="rep-progress-bar">
            <div 
              className="rep-progress-fill" 
              style={{ width: `${repProgress}%` }}
            ></div>
          </div>
        </div>
        <div className="counter">
          <div className="counter-label">Set</div>
          <div className="counter-value">{currentSet}/{exercise.sets}</div>
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <div className="rest-timer">
          <div className="rest-label">Rest Time</div>
          <div className="rest-value">{formatTime(restTimer)}</div>
          <button 
            className="skip-rest-button" 
            onClick={() => {
              setIsResting(false);
              setRestTimer(0);
            }}
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="control-buttons">
        {!isExerciseComplete && !isResting && (
          <>
            <button 
              className={`start-pause-button ${isRunning ? 'pause' : 'start'} ${isWaitingForVoice ? 'waiting' : ''}`}
              onClick={handleStart}
              disabled={isWaitingForVoice}
            >
              {isWaitingForVoice ? '⏳ Starting...' : (!isRunning ? '▶️ Start' : (isPaused ? '▶️ Resume' : '⏸️ Pause'))}
            </button>
            <button 
              className="stop-button"
              onClick={handleStop}
              disabled={(!isRunning && !isPaused) || isWaitingForVoice}
            >
              ⏹️ Stop
            </button>
          </>
        )}
        
        {isExerciseComplete && (
          <button className="next-button" onClick={handleExerciseComplete}>
            {exerciseIndex < totalExercises - 1 ? 'Next Exercise' : 'Finish Workout'}
          </button>
        )}
      </div>

      {/* Progress Bar and Timer - Moved to bottom */}
      <div className="bottom-info">
        {/* General Timer */}
        <div className="timer-container">
          <div className="timer">
            <span className="timer-label">Workout Time:</span>
            <span className="timer-value">{formatTime(timer)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-label">
            Workout Progress: {exerciseIndex + 1}/{totalExercises}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-percentage">{Math.round(progressPercentage)}%</div>
        </div>

        {/* Voice Controls - Moved to bottom */}
        <div className="voice-controls">
          <button 
            className={`voice-toggle-button ${voiceEnabled ? 'enabled' : 'disabled'}`}
            onClick={toggleVoice}
            title={`Voice coaching is ${voiceEnabled ? 'ON' : 'OFF'}`}
          >
            {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseScreen;
