// Speech Synthesis utility functions for workout app - Hebrew Version

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
        this.setHebrewVoice();
      });
    } else {
      this.setHebrewVoice();
    }
  }

  setHebrewVoice() {
    const voices = this.synth.getVoices();
    
    // Look for Hebrew voices (in order of preference)
    const hebrewVoiceNames = [
      'Carmit', // Hebrew (Israel) - common on iOS
      'Hebrew (Israel)', 
      'Hebrew',
      'he-IL',
      'Microsoft Asaf', // Windows Hebrew voice
      'Google עברית', // Google Hebrew
    ];
    
    // First, try to find a Hebrew voice
    for (const voiceName of hebrewVoiceNames) {
      this.voice = voices.find(v => 
        v.name.includes(voiceName) || 
        v.lang.includes('he') ||
        v.lang.includes('iw') // Alternative Hebrew language code
      );
      if (this.voice) {
        console.log('Hebrew voice found:', this.voice.name);
        break;
      }
    }
    
    // Fallback to default voice if no Hebrew voice found
    if (!this.voice) {
      console.warn('No Hebrew voice found. Using default voice.');
      this.voice = voices[0] || null;
    }
  }

  // Hebrew text mappings
  getHebrewText() {
    return {
      // Numbers 1-30 in Hebrew (feminine form for counting)
      numbers: {
        1: 'אחת', 2: 'שתיים', 3: 'שלוש', 4: 'ארבע', 5: 'חמש',
        6: 'שש', 7: 'שבע', 8: 'שמונה', 9: 'תשע', 10: 'עשר',
        11: 'אחת עשרה', 12: 'שתים עשרה', 13: 'שלוש עשרה', 
        14: 'ארבע עשרה', 15: 'חמש עשרה', 16: 'שש עשרה',
        17: 'שבע עשרה', 18: 'שמונה עשרה', 19: 'תשע עשרה', 20: 'עשרים',
        21: 'עשרים ואחת', 22: 'עשרים ושתיים', 23: 'עשרים ושלוש',
        24: 'עשרים וארבע', 25: 'עשרים וחמש', 26: 'עשרים ושש',
        27: 'עשרים ושבע', 28: 'עשרים ושמונה', 29: 'עשרים ותשע', 30: 'שלושים'
      },
      
      // Common workout phrases
      phrases: {
        rest: 'מנוחה',
        go: 'קדימה!',
        workoutStart: 'האימון מתחיל!',
        exerciseComplete: 'התרגיל הסתיים!',
        workoutComplete: 'האימון הסתיים! כל הכבוד!',
        nextExercise: 'עוברים לתרגיל הבא',
        set: 'סט',
        getReady: 'תתכוננו!',
        lastRep: 'חזרה אחרונה! תסיימו חזק!',
        halfway: 'חצי דרך! המשיכו!',
        almostDone: 'כמעט גמרנו! תמשיכו!',
        greatJob: 'עבודה מצוינת!',
        keepGoing: 'המשיכו כך!',
        youGotThis: 'אתם יכולים!',
        pushThrough: 'תדחפו קדימה!',
        stayStrong: 'תישארו חזקים!',
        amazing: 'מדהים!',
        timeUp: 'הזמן נגמר!'
      },
      
      // Exercise names in Hebrew (you can customize these)
      exercises: {
        'Push-ups': 'שכיבות סמיכה',
        'Squats': 'כפיפות ברכיים',
        'Lunges': 'צעדי ענק',
        'Plank': 'פלאנק',
        'Burpees': 'ברפיז',
        'Mountain Climbers': 'מטפסי הרים',
        'Jumping Jacks': 'קפיצות ג\'ק',
        'High Knees': 'ברכיים גבוהות',
        'Sit-ups': 'בטן',
        'Crunches': 'כווצי בטן'
      }
    };
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
      
      // Set voice properties for Hebrew
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'he-IL'; // Hebrew (Israel)
      utterance.rate = options.rate || 0.8; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.8;

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

  // Workout-specific speech functions in Hebrew
  announceExercise(exerciseName) {
    const hebrew = this.getHebrewText();
    const hebrewExercise = hebrew.exercises[exerciseName] || exerciseName;
    this.speak(`תרגיל: ${hebrewExercise}. ${hebrew.phrases.getReady}`);
  }

  announceWorkoutStart(onComplete) {
    const hebrew = this.getHebrewText();
    this.speak(hebrew.phrases.workoutStart, { onEnd: onComplete });
  }

  announceRepNumber(repNumber) {
    const hebrew = this.getHebrewText();
    const hebrewNumber = hebrew.numbers[repNumber] || repNumber.toString();
    this.speak(hebrewNumber, { rate: 1.0 });
  }

  announceSetStart(setNumber, totalSets) {
    const hebrew = this.getHebrewText();
    const setNumberHebrew = hebrew.numbers[setNumber] || setNumber.toString();
    const totalSetsHebrew = hebrew.numbers[totalSets] || totalSets.toString();
    this.speak(`${hebrew.phrases.set} ${setNumberHebrew} מתוך ${totalSetsHebrew}. ${hebrew.phrases.go}`);
  }

  announceSetComplete(setNumber, totalSets) {
    const hebrew = this.getHebrewText();
    const setNumberHebrew = hebrew.numbers[setNumber] || setNumber.toString();
    
    if (setNumber < totalSets) {
      this.speak(`${hebrew.phrases.set} ${setNumberHebrew} הסתיים! ${hebrew.phrases.getReady}`);
    } else {
      this.speak(`${hebrew.phrases.exerciseComplete} ${hebrew.phrases.greatJob}`);
    }
  }

  announceRest(seconds) {
    const hebrew = this.getHebrewText();
    const secondsHebrew = hebrew.numbers[seconds] || seconds.toString();
    this.speak(`${hebrew.phrases.rest} ${secondsHebrew} שניות. ${hebrew.phrases.youGotThis}`);
  }

  announceRestCountdown(seconds) {
    const hebrew = this.getHebrewText();
    if (seconds <= 3 && seconds > 0) {
      const hebrewNumber = hebrew.numbers[seconds] || seconds.toString();
      this.speak(hebrewNumber);
    } else if (seconds === 0) {
      this.speak(`${hebrew.phrases.timeUp} ${hebrew.phrases.go}`);
    }
  }

  announceWorkoutComplete() {
    const hebrew = this.getHebrewText();
    this.speak(`${hebrew.phrases.workoutComplete} ${hebrew.phrases.amazing}`);
  }

  announceEncouragement() {
    const hebrew = this.getHebrewText();
    const encouragements = [
      hebrew.phrases.greatJob,
      hebrew.phrases.keepGoing,
      hebrew.phrases.youGotThis,
      hebrew.phrases.stayStrong,
      hebrew.phrases.pushThrough,
      hebrew.phrases.amazing
    ];
    const message = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.speak(message);
  }

  announceRepCount(currentRep, totalReps) {
    const hebrew = this.getHebrewText();
    // Only announce at quarter intervals to avoid spam
    const quarterPoints = [
      Math.floor(totalReps * 0.25),
      Math.floor(totalReps * 0.5),
      Math.floor(totalReps * 0.75),
      totalReps
    ];
    
    if (quarterPoints.includes(currentRep)) {
      if (currentRep === totalReps) {
        this.speak(hebrew.phrases.lastRep);
      } else if (currentRep === Math.floor(totalReps * 0.5)) {
        this.speak(hebrew.phrases.halfway);
      } else if (currentRep === Math.floor(totalReps * 0.75)) {
        this.speak(hebrew.phrases.almostDone);
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

  // Test function to check Hebrew voice
  testHebrewVoice() {
    const hebrew = this.getHebrewText();
    this.speak(`שלום! זהו מבחן הקול בעברית. ${hebrew.phrases.youGotThis}`);
  }
}

// Create singleton instance
const workoutSpeech = new WorkoutSpeech();

export default workoutSpeech;