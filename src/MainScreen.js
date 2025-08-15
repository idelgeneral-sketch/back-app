import React from 'react';
import './MainScreen.css';

const MainScreen = ({ onStartWorkout }) => {
  return (
    <div className="main-screen">
      <div className="logo-container">
        <div className="logo">
          <h1>💪 FitTracker</h1>
          <p>Your Personal Workout Companion</p>
        </div>
      </div>
      
      <div className="welcome-message">
        <h2>Ready to crush your workout?</h2>
        <p>Complete 6 exercises to build strength and endurance</p>
      </div>
      
      <button className="start-button" onClick={onStartWorkout}>
        Start Workout
      </button>
      
      <div className="features">
        <div className="feature">
          <span className="feature-icon">⏱️</span>
          <span>Built-in Timer</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📊</span>
          <span>Progress Tracking</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🎯</span>
          <span>Rep Counter</span>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;
