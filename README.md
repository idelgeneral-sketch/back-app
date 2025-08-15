# Workout Plan App 💪

A React-based workout application that helps you track your exercises, sets, reps, and workout progress.

## Features

- **Interactive Exercise Tracking**: Navigate through 6 different exercises
- **Rep and Set Counters**: Track your progress for each exercise
- **Built-in Timer**: Monitor your workout duration
- **Rest Timer**: Automatic rest periods between sets
- **Progress Bar**: Visual representation of workout completion
- **Mobile Responsive**: Works great on all devices

## Exercises Included

1. Push-ups (3 sets × 15 reps)
2. Squats (3 sets × 20 reps)  
3. Plank (3 sets × 45 seconds)
4. Lunges (3 sets × 12 reps)
5. Mountain Climbers (3 sets × 20 reps)
6. Burpees (3 sets × 10 reps)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Render

1. Push your code to a GitHub repository
2. Connect your GitHub repository to Render
3. The `render.yaml` file will automatically configure the deployment
4. Your app will be available at your Render URL

### Manual Render Deployment Steps:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Click "Create Static Site"

## Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Technologies Used

- React 18
- CSS3 with modern features (backdrop-filter, gradients)
- JSON for exercise data storage
- Responsive design with CSS Grid/Flexbox

## App Structure

- **MainScreen**: Landing page with logo and start button
- **ExerciseScreen**: Main workout interface with counters and timers
- **CompletionScreen**: Workout summary and stats
- **JSON Data**: Exercise information and configuration

## Usage

1. Click "Start Workout" on the main screen
2. Follow the exercise instructions displayed
3. Use "Rep Complete" button to track each repetition
4. Use "Set Complete" when you finish all reps in a set
5. Take rest breaks between sets (automatic timer)
6. Progress through all exercises
7. View your workout summary at the end

## Customization

To add or modify exercises, edit the `src/exercises.json` file with your desired exercise data including name, description, sets, reps, rest time, and instructions.
