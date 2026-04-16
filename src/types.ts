export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DayWorkout {
  key: DayKey
  label: string
  name: string
  isRest: boolean
  exercises: ExerciseDef[]
}

export interface MealDef {
  id: string
  time: string
  name: string
  description: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface PhaseNutrition {
  kcal: number
  protein: number
  carbs: number
  fat: number
  meals: MealDef[]
}

export interface SupplementDef {
  id: string
  name: string
  dose: string
  timing: string
  important?: boolean
}
export type Phase = 'cut' | 'bulk'
export type TabKey = 'today' | 'workout' | 'diet' | 'progress' | 'settings'

export interface ExerciseDef {
  id: string
  name: string
  sets: number
  repsTarget: string
  defaultRestSeconds: number
}

export interface SetEntry {
  completed: boolean
  weight: number | null
  reps: number | null
}

export interface ExerciseSessionLog {
  exerciseId: string
  sets: SetEntry[]
  restSeconds: number
  notes: string
}

export interface WorkoutSession {
  date: string
  dayKey: DayKey
  exercises: ExerciseSessionLog[]
  startTime: string | null
  endTime: string | null
  totalVolume: number
}

export interface DietDayLog {
  date: string
  mealsEaten: string[]
  supplementsTaken: string[]
}

export interface BodyStat {
  date: string
  weight: number
  bodyFat: number | null
  notes: string
}

export interface UserProfile {
  height: number
  weight: number
  age: number
  sex: 'male' | 'female'
  goal: string
  startDate: string
  targetDate: string
  targetBodyFat: string
}

export interface AppSettings {
  phase: Phase
  defaultRestSeconds: number
  notificationsEnabled: boolean
}

export interface AppState {
  userProfile: UserProfile
  sessions: WorkoutSession[]
  waterLogs: { date: string; cups: number }[]
  dietLogs: DietDayLog[]
  bodyStats: BodyStat[]
  personalBests: Record<string, number>
  settings: AppSettings
}
