import type { DayKey, ExerciseDef } from '../types'

export interface DayWorkout {
  key: DayKey
  label: string
  name: string
  isRest: boolean
  exercises: ExerciseDef[]
}

export const WEEKLY_SPLIT: Record<DayKey, DayWorkout> = {
  mon: {
    key: 'mon',
    label: 'Mon',
    name: 'Upper A — Chest & Back',
    isRest: false,
    exercises: [
      { id: 'bench_press', name: 'Barbell Bench Press', sets: 4, repsTarget: '5-6', defaultRestSeconds: 180 },
      { id: 'barbell_row', name: 'Barbell Row', sets: 4, repsTarget: '6-8', defaultRestSeconds: 150 },
      { id: 'incline_db_press', name: 'Incline Dumbbell Press', sets: 3, repsTarget: '8-10', defaultRestSeconds: 120 },
      { id: 'seated_cable_row', name: 'Seated Cable Row', sets: 3, repsTarget: '10', defaultRestSeconds: 90 },
      { id: 'lateral_raises_mon', name: 'Lateral Raises', sets: 4, repsTarget: '15-20', defaultRestSeconds: 60 },
      { id: 'face_pulls', name: 'Face Pulls', sets: 3, repsTarget: '20', defaultRestSeconds: 60 },
    ],
  },
  tue: {
    key: 'tue',
    label: 'Tue',
    name: 'Lower A — Squat & Hamstrings',
    isRest: false,
    exercises: [
      { id: 'barbell_squat', name: 'Barbell Squat', sets: 4, repsTarget: '8', defaultRestSeconds: 180 },
      { id: 'rdl', name: 'Romanian Deadlift', sets: 4, repsTarget: '8-10', defaultRestSeconds: 150 },
      { id: 'leg_press', name: 'Leg Press', sets: 3, repsTarget: '10-12', defaultRestSeconds: 120 },
      { id: 'leg_curl', name: 'Leg Curl', sets: 3, repsTarget: '12', defaultRestSeconds: 90 },
      { id: 'leg_extension', name: 'Leg Extension', sets: 3, repsTarget: '15', defaultRestSeconds: 90 },
      { id: 'standing_calf_raise', name: 'Standing Calf Raise', sets: 4, repsTarget: '20', defaultRestSeconds: 60 },
    ],
  },
  wed: {
    key: 'wed',
    label: 'Wed',
    name: 'Rest Day',
    isRest: true,
    exercises: [],
  },
  thu: {
    key: 'thu',
    label: 'Thu',
    name: 'Upper B — Shoulders & Arms',
    isRest: false,
    exercises: [
      { id: 'ohp', name: 'Overhead Barbell Press', sets: 4, repsTarget: '5-6', defaultRestSeconds: 180 },
      { id: 'weighted_pullup', name: 'Weighted Pull-ups / Lat Pulldown', sets: 4, repsTarget: '6-10', defaultRestSeconds: 150 },
      { id: 'cable_lateral_raises', name: 'Cable Lateral Raises', sets: 5, repsTarget: '15-20', defaultRestSeconds: 60 },
      { id: 'rear_delt_fly', name: 'Rear Delt Fly', sets: 4, repsTarget: '15', defaultRestSeconds: 60 },
      { id: 'barbell_curl', name: 'Barbell Curl', sets: 3, repsTarget: '10', defaultRestSeconds: 90 },
      { id: 'skull_crushers', name: 'Skull Crushers', sets: 3, repsTarget: '12', defaultRestSeconds: 90 },
    ],
  },
  fri: {
    key: 'fri',
    label: 'Fri',
    name: 'Lower B — Deadlift & Glutes',
    isRest: false,
    exercises: [
      { id: 'deadlift', name: 'Conventional Deadlift', sets: 4, repsTarget: '5', defaultRestSeconds: 240 },
      { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', sets: 3, repsTarget: '10 each', defaultRestSeconds: 120 },
      { id: 'hip_thrust', name: 'Hip Thrust', sets: 4, repsTarget: '12', defaultRestSeconds: 120 },
      { id: 'leg_press_wide', name: 'Leg Press (Wide Stance)', sets: 3, repsTarget: '12', defaultRestSeconds: 120 },
      { id: 'seated_calf_raise', name: 'Seated Calf Raise', sets: 4, repsTarget: '20', defaultRestSeconds: 60 },
    ],
  },
  sat: {
    key: 'sat',
    label: 'Sat',
    name: 'Optional — Arms & Weak Points',
    isRest: false,
    exercises: [
      { id: 'incline_cable_fly', name: 'Incline Cable Fly', sets: 3, repsTarget: '15', defaultRestSeconds: 90 },
      { id: 'dips', name: 'Dips', sets: 3, repsTarget: '10-12', defaultRestSeconds: 90 },
      { id: 'hammer_curl', name: 'Hammer Curl', sets: 3, repsTarget: '12', defaultRestSeconds: 90 },
      { id: 'tricep_rope_pushdown', name: 'Tricep Rope Pushdown', sets: 3, repsTarget: '15', defaultRestSeconds: 60 },
      { id: 'lateral_raises_sat', name: 'Lateral Raises', sets: 3, repsTarget: '20', defaultRestSeconds: 60 },
    ],
  },
  sun: {
    key: 'sun',
    label: 'Sun',
    name: 'Rest Day',
    isRest: true,
    exercises: [],
  },
}

export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const MAIN_LIFTS: { id: string; label: string }[] = [
  { id: 'bench_press', label: 'Bench Press' },
  { id: 'barbell_row', label: 'Barbell Row' },
  { id: 'ohp', label: 'OHP' },
  { id: 'deadlift', label: 'Deadlift' },
  { id: 'barbell_squat', label: 'Squat' },
]
