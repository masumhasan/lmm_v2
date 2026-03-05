export interface User {
  id: number;
  username: string;
  email?: string;
  isSubscribed?: boolean;
  onboardingCompleted?: boolean;
}

export interface Workout {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  reps: number;
  muscles: Record<string, number>;
}

export interface DriftTile {
  id: number;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface ReturnToNowScreen {
  id: number;
  text: string;
  instruction: string;
}

export interface MuscleProgress {
  muscle_id: string;
  muscle_name: string;
  sessions_trained: number[];
  rep_count: number;
}

export interface UserState {
  progress: any[];
  stats: Record<string, number>;
  tracking: Record<string, string>;
  completedWorkouts: number[];
  muscleProgress: MuscleProgress[];
}
