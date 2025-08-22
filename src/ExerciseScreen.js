import React, { useState, useEffect } from 'react';
import './ExerciseScreen.css';
import workoutSpeech from './speechUtils';

const GLOBAL_REP_DURATION = 2; // Default 2 seconds per rep
const SET_PREPARATION_DELAY = 1; // 1 second delay before starting new set

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
  const [isPreparingForSet, setIsPreparingForSet] = useState(false);
  const [preparationTimer, setPreparationTimer] = useState(0);
  const [announcedReps, setAnnouncedReps] = useState(new Set());

  // Reset states when exercise changes
  useEffect(() => {
    setCurrentSet(1);
    setCurrentRep(0);
    setRepTimer(0);
    setIsResting(false);
    setRestTimer(0);
    setIsRunning(false);
    setIsPaused(false);
    setHasAnnouncedExercise(false);
    setIsWaitingForVoice(false);
    setIsPreparingForSet(false);
    setPreparationTimer(0);
    setAnnouncedReps(new Set());
  }, [exerciseIndex, exercise.name]); // Reset when exerciseIndex or exercise name changes

  // Get rep duration from exercise or use global default
  const repDuration = exercise.repDuration || GLOBAL_REP_DURATION;

  // Calculate derived values first
  const progressPercentage = ((exerciseIndex + (currentSet - 1) / exercise.sets) / totalExercises) * 100;
  const isExerciseComplete = currentSet === exercise.sets && currentRep === exercise.reps;

  // handling what happens when excercise is complete
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
    if (isRunning && !isPaused && !isResting && !isPreparingForSet) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isResting, isPreparingForSet]);

  // Rep timer - automatically advances reps based on duration and voice counting
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && !isResting && !isWaitingForVoice && !isPreparingForSet) {
      interval = setInterval(() => {
        setRepTimer(prev => {
          const newRepTimer = prev + 0.1; // Update every 100ms for smooth progress
          
          // ASYNC VOICE ANNOUNCEMENT - Non-blocking
          const timeUntilRepComplete = repDuration - newRepTimer;
          if (timeUntilRepComplete <= 0.2 && timeUntilRepComplete > 0.1) {
            // Calculate which rep we're currently performing (currentRep is 0-indexed for display)
            const currentPerformingRep = currentRep + 1;
            const repKey = `${currentSet}-${currentPerformingRep}`;
            
            // Only announce if we haven't announced this rep yet and we're not at max reps
            if (voiceEnabled && !announcedReps.has(repKey) && currentRep < exercise.reps) {
              setAnnouncedReps(prev => new Set([...prev, repKey]));
              // Fire and forget - don't wait for speech to complete
              setTimeout(() => {
                workoutSpeech.announceRepNumber(currentPerformingRep);
              }, 0);
            }
          }
          
          // Check if we should advance to next rep - INDEPENDENT of speech
          if (newRepTimer >= repDuration) {
            setCurrentRep(prevRep => {
              const nextRep = prevRep + 1;
              
              // Check if set is complete (all reps done)
              if (nextRep >= exercise.reps) {
                // Set complete - check if this was the last set of the exercise
                if (currentSet >= exercise.sets) {
                  // This was the last set - but we may still need to rest before moving to next exercise
                  setIsRunning(false);
                  setIsPaused(false);
                  
                  // Clear announced reps
                  setAnnouncedReps(new Set());
                  
                  // Check if we need rest time after completing the exercise
                  if (exercise.restTime > 0) {
                    // ASYNC rest announcement - don't block timer
                    if (voiceEnabled) {
                      setIsWaitingForVoice(true);
                      Promise.resolve().then(() => {
                        setTimeout(() => {
                          workoutSpeech.speak("מנוחה", {
                            onEnd: () => {
                              setIsWaitingForVoice(false);
                              setIsResting(true);
                              setRestTimer(exercise.restTime);
                            }
                          });
                        }, 1500);
                      });
                    } else {
                      setIsResting(true);
                      setRestTimer(exercise.restTime);
                    }
                  } else {
                    // No rest time, move to next exercise immediately
                    setTimeout(() => {
                      handleExerciseComplete();
                    }, 100);
                  }
                } else {
                  // Move to next set - start rest period first
                  setCurrentSet(prevSet => prevSet + 1);
                  setCurrentRep(0); // Reset to 0 for next set
                  setIsRunning(false);
                  setIsPaused(false);
                  
                  // Clear announced reps for next set
                  setAnnouncedReps(new Set());
                  
                  // Start rest period if there's rest time
                  if (exercise.restTime > 0) {
                    // ASYNC rest announcement - don't block timer
                    if (voiceEnabled) {
                      setIsWaitingForVoice(true);
                      Promise.resolve().then(() => {
                        setTimeout(() => {
                          workoutSpeech.speak("Set complete! Rest", {
                            onEnd: () => {
                              setIsWaitingForVoice(false);
                              setIsResting(true);
                              setRestTimer(exercise.restTime);
                            }
                          });
                        }, 1500);
                      });
                    } else {
                      setIsResting(true);
                      setRestTimer(exercise.restTime);
                    }
                  } else {
                    // No rest time, start next set immediately
                    setIsPreparingForSet(true);
                    setPreparationTimer(SET_PREPARATION_DELAY);
                  }
                }
              }
              return nextRep;
            });
            return 0; // Reset rep timer immediately when rep completes
          }
          
          return newRepTimer;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isResting, isWaitingForVoice, isPreparingForSet, currentRep, currentSet, exercise.reps, exercise.sets, repDuration, voiceEnabled, announcedReps]);

  // Rest timer
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          const nextValue = prev - 1;
          
          // Voice countdown for last 3 seconds - announce AFTER decrementing
          if (voiceEnabled && nextValue <= 3 && nextValue > 0) {
            workoutSpeech.announceRestCountdown(nextValue);
          }
          
          if (nextValue <= 0) {
            setIsResting(false);
            setRepTimer(0);
            
            // Check if we completed the entire exercise (all sets done)
            if (currentSet >= exercise.sets && currentRep >= exercise.reps) {
              // Exercise fully complete - move to next exercise
              setTimeout(() => {
                handleExerciseComplete();
              }, 100);
            } else {
              // More sets to go - start preparation phase before next set
              setIsPreparingForSet(true);
              setPreparationTimer(SET_PREPARATION_DELAY);
            }
            return 0;
          }
          return nextValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, voiceEnabled, currentSet, exercise.sets, currentRep, exercise.reps]);

  // Preparation timer - countdown before starting new set
  useEffect(() => {
    let interval;
    if (isPreparingForSet && preparationTimer > 0) {
      interval = setInterval(() => {
        setPreparationTimer(prev => {
          const nextValue = prev - 1;
          
          if (nextValue <= 0) {
            setIsPreparingForSet(false);
            // Start the new set
            setIsRunning(true);
            setIsPaused(false);
            if (voiceEnabled) {
              workoutSpeech.speak("Go!");
            }
            return 0;
          }
          return nextValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPreparingForSet, preparationTimer, voiceEnabled]);

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
      // Clear announced reps when starting
      setAnnouncedReps(new Set());
      // Reset rep timer to ensure clean start
      setRepTimer(0);
      
      if (voiceEnabled) {
        setIsWaitingForVoice(true);
        Promise.resolve().then(() => {
          workoutSpeech.announceWorkoutStart(() => {
            setIsWaitingForVoice(false);
            setIsRunning(true);
            setIsPaused(false);
          });
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

  const handleSkipNext = () => {
    // Stop current exercise and move to next
    setIsRunning(false);
    setIsPaused(false);
    setIsResting(false);
    setRepTimer(0);
    setRestTimer(0);
    // Reset counters for next exercise
    setCurrentSet(1);
    setCurrentRep(0);
    // Clear announced reps when skipping
    setAnnouncedReps(new Set());
    
    if (voiceEnabled) {
      workoutSpeech.stop();
    }
    handleExerciseComplete();
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
        <div className="exercise-instructions">
          <strong>Instructions:</strong> {exercise.instructions}
        </div>
      </div>

      {/* Counters - Half width side by side */}
      <div className="counters-container">
        <div className="counter counter-reps">
          <div className="counter-label">Reps</div>
          <div className="counter-value">{currentRep}/{exercise.reps}</div>
        </div>
        <div className="counter counter-sets">
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
        {!isExerciseComplete && !isResting && !isPreparingForSet && (
          <>
            <button 
              className={`start-pause-button ${isRunning ? 'pause' : 'start'} ${isWaitingForVoice ? 'waiting' : ''}`}
              onClick={handleStart}
              disabled={isWaitingForVoice}
            >
              {isWaitingForVoice ? '⏳ Starting...' : (!isRunning ? '▶️ Start' : (isPaused ? '▶️ Resume' : '⏸️ Pause'))}
            </button>
            <button 
              className="skip-next-button"
              onClick={handleSkipNext}
              title="Skip to next exercise"
            >
              ⏭️ Skip Next
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