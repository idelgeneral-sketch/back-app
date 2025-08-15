// Speech Synthesis utility functions for workout app

class WorkoutSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isEnabled = true;
    this.voice = null;
    this.initVoice();
  }

  initVoice() {
    // Wait for voices to be loaded
    if (this.synth.getVoices().length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.setDefaultVoice();
      });
    } else {
      this.setDefaultVoice();
    }
  }

  setDefaultVoice() {
    const voices = this.synth.getVoices();
    // Try to find an English voice, prefer female voice for workout coaching
    this.voice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      voice.lang.startsWith('en')
    ) || voices[0];
  }

  speak(text, options = {}) {
    if (!this.isEnabled || !text || !this.synth) {
      // If speech is disabled, still call the callback
      if (options.onEnd) {
        setTimeout(options.onEnd, 0);
      }
      return;
    }

    try {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Add error handling
      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event.error);
        if (options.onEnd) {
          options.onEnd();
        }
      };

      // Add completion callback
      utterance.onend = () => {
        if (options.onEnd) {
          options.onEnd();
        }
      };

      // Speak the text
      this.synth.speak(utterance);
    } catch (error) {
      console.warn('Speech synthesis not supported or error occurred:', error);
      if (options.onEnd) {
        options.onEnd();
      }
    }
  }

  // Workout-specific speech functions
  announceExercise(exerciseName) {
    this.speak(`Starting ${exerciseName}. Get ready!`);
  }

  announceWorkoutStart(onComplete) {
    this.speak("Workout starting!", { onEnd: onComplete });
  }

  announceRepNumber(repNumber) {
    this.speak(repNumber.toString(), { rate: 1.2 });
  }

  announceSetStart(setNumber, totalSets) {
    this.speak(`Set ${setNumber} of ${totalSets}. Go!`);
  }

  announceSetComplete(setNumber, totalSets) {
    if (setNumber < totalSets) {
      this.speak(`Set ${setNumber} complete! Get ready for the next set.`);
    } else {
      this.speak("Exercise complete! Great job!");
    }
  }

  announceRest(seconds) {
    this.speak(`Take a ${seconds} second rest. You're doing great!`);
  }

  announceRestCountdown(seconds) {
    if (seconds <= 3 && seconds > 0) {
      this.speak(seconds.toString());
    } else if (seconds === 0) {
      this.speak("Time's up! Let's go!");
    }
  }

  announceWorkoutComplete() {
    this.speak("Workout complete! Amazing job! You crushed it!");
  }

  announceEncouragement() {
    const encouragements = [
      "You're doing great!",
      "Keep it up!",
      "You've got this!",
      "Stay strong!",
      "Push through!",
      "Almost there!",
      "You're crushing it!"
    ];
    const message = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.speak(message);
  }

  announceRepCount(currentRep, totalReps) {
    // Only announce at quarter intervals to avoid spam
    const quarterPoints = [
      Math.floor(totalReps * 0.25),
      Math.floor(totalReps * 0.5),
      Math.floor(totalReps * 0.75),
      totalReps
    ];
    
    if (quarterPoints.includes(currentRep)) {
      if (currentRep === totalReps) {
        this.speak("Last rep! Finish strong!");
      } else if (currentRep === Math.floor(totalReps * 0.5)) {
        this.speak("Halfway there! Keep going!");
      } else if (currentRep === Math.floor(totalReps * 0.75)) {
        this.speak("Three quarters done! Push through!");
      }
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.synth.cancel();
    }
    return this.isEnabled;
  }

  stop() {
    this.synth.cancel();
  }
}

// Create singleton instance
const workoutSpeech = new WorkoutSpeech();

export default workoutSpeech;
