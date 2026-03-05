import { Workout, DriftTile, ReturnToNowScreen } from './types';

export const WORKOUTS: Workout[] = [
  {
    id: 0,
    title: "Attention Control",
    description: "Today you train your first mental muscle.",
    difficulty: 1,
    reps: 1,
    muscles: { "Attention Control": 1 }
  },
  {
    id: 1,
    title: "Story Separation",
    description: "Today you train separating story from evidence.",
    difficulty: 2,
    reps: 1,
    muscles: { "Story Separation": 1, "Pattern Recognition": 1 }
  },
  {
    id: 2,
    title: "Alarm Loop",
    description: "Spot the second alarm (the echo) in real time.",
    difficulty: 3,
    reps: 1,
    muscles: { "Loop Disruption": 1, "Escalation Awareness": 1 }
  },
  {
    id: 3,
    title: "Reclaiming Safety",
    description: "Teaching the system what “non-danger” feels like.",
    difficulty: 4,
    reps: 1,
    muscles: { "Sensation Separation": 1, "Non-Reactivity": 1 }
  },
  {
    id: 4,
    title: "The Overthinking Mind",
    description: "Internal noise & attention misplacement.",
    difficulty: 5,
    reps: 1,
    muscles: { "Cognitive Distance": 1, "Attention Control": 1, "Urgency Resistance": 1, "Completion Tolerance": 1 }
  }
];

export const MUSCLES = [
  { id: "attention_control", name: "Attention Control" },
  { id: "urgency_resistance", name: "Urgency Resistance" },
  { id: "completion_tolerance", name: "Completion Tolerance" },
  { id: "pattern_recognition", name: "Pattern Recognition" },
  { id: "story_separation", name: "Story Separation" },
  { id: "loop_disruption", name: "Loop Disruption" },
  { id: "escalation_awareness", name: "Escalation Awareness" },
  { id: "sensation_separation", name: "Sensation Separation" },
  { id: "non_reactivity", name: "Non-Reactivity" },
  { id: "cognitive_distance", name: "Cognitive Distance" }
];

export const DRIFT_TILES: DriftTile[] = [
  { id: 1, type: 'text', content: "The mind is like a mirror; it reflects without judging." },
  { id: 2, type: 'image', content: "A calm lake reflecting the sky.", imageUrl: "https://picsum.photos/seed/lake/800/600" },
  { id: 3, type: 'text', content: "Thoughts are just clouds passing through the vast sky of awareness." },
  { id: 4, type: 'image', content: "A single leaf floating on water.", imageUrl: "https://picsum.photos/seed/leaf/800/600" },
  { id: 5, type: 'text', content: "Notice the space between your thoughts." },
  { id: 6, type: 'image', content: "Distant mountains in the mist.", imageUrl: "https://picsum.photos/seed/mountains/800/600" },
];

export const RETURN_TO_NOW_SCREENS: ReturnToNowScreen[] = [
  { id: 1, text: "Stop.", instruction: "Take a deep breath." },
  { id: 2, text: "Look around.", instruction: "Identify 3 neutral objects." },
  { id: 3, text: "Listen.", instruction: "Notice 2 distinct sounds." },
  { id: 4, text: "Feel.", instruction: "Notice the sensation of your feet on the ground." },
  { id: 5, text: "Breathe.", instruction: "One more deep breath." },
  { id: 6, text: "Now.", instruction: "You are here." },
];
