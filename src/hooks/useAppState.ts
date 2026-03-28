import { useCallback } from 'react'
import { useStorage } from './useStorage'
import type { AppState, WorkoutSession, DietDayLog, BodyStat, UserProfile, AppSettings } from '../types'

const DEFAULT_PROFILE: UserProfile = {
  height: 193,
  weight: 87,
  age: 25,
  sex: 'male',
  goal: 'Look great shirtless by July',
  startDate: '2026-03-01',
  targetDate: '2026-07-01',
  targetBodyFat: '13-14',
}

const DEFAULT_SETTINGS: AppSettings = {
  phase: 'cut',
  defaultRestSeconds: 90,
  notificationsEnabled: false,
}

export const INITIAL_STATE: AppState = {
  userProfile: DEFAULT_PROFILE,
  sessions: [],
  waterLogs: [],
  dietLogs: [],
  bodyStats: [],
  personalBests: {},
  settings: DEFAULT_SETTINGS,
}

export function useAppState() {
  const [state, setState] = useStorage<AppState>('physique-v1', INITIAL_STATE)

  const upsertSession = useCallback((session: WorkoutSession) => {
    setState(prev => {
      const others = prev.sessions.filter(s => s.date !== session.date)
      const newPBs = { ...prev.personalBests }
      session.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed && set.weight) {
            const cur = newPBs[ex.exerciseId]
            if (!cur || set.weight > cur) newPBs[ex.exerciseId] = set.weight
          }
        })
      })
      return { ...prev, sessions: [...others, session], personalBests: newPBs }
    })
  }, [setState])

  const getSession = useCallback((date: string): WorkoutSession | undefined => {
    return state.sessions.find(s => s.date === date)
  }, [state.sessions])

  const getLastWeight = useCallback((exerciseId: string, beforeDate: string): number | null => {
    const sorted = state.sessions
      .filter(s => s.date < beforeDate && s.endTime)
      .sort((a, b) => b.date.localeCompare(a.date))
    for (const session of sorted) {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId)
      if (ex) {
        const weights = ex.sets.filter(s => s.completed && s.weight != null).map(s => s.weight!)
        if (weights.length > 0) return Math.max(...weights)
      }
    }
    return null
  }, [state.sessions])

  const getExerciseHistory = useCallback((exerciseId: string, limit = 8): { date: string; maxWeight: number }[] => {
    return state.sessions
      .filter(s => s.endTime && s.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-limit)
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseId === exerciseId)!
        const weights = ex.sets.filter(set => set.completed && set.weight != null).map(set => set.weight!)
        return { date: s.date, maxWeight: weights.length > 0 ? Math.max(...weights) : 0 }
      })
      .filter(h => h.maxWeight > 0)
  }, [state.sessions])

  const getWaterCups = useCallback((date: string): number => {
    return state.waterLogs.find(w => w.date === date)?.cups ?? 0
  }, [state.waterLogs])

  const setWaterCups = useCallback((date: string, cups: number) => {
    setState(prev => {
      const others = prev.waterLogs.filter(w => w.date !== date)
      return { ...prev, waterLogs: cups >= 0 ? [...others, { date, cups }] : others }
    })
  }, [setState])

  const getDietLog = useCallback((date: string): DietDayLog => {
    return state.dietLogs.find(d => d.date === date) ?? { date, mealsEaten: [], supplementsTaken: [] }
  }, [state.dietLogs])

  const setDietLog = useCallback((log: DietDayLog) => {
    setState(prev => {
      const others = prev.dietLogs.filter(d => d.date !== log.date)
      return { ...prev, dietLogs: [...others, log] }
    })
  }, [setState])

  const addBodyStat = useCallback((stat: BodyStat) => {
    setState(prev => {
      const others = prev.bodyStats.filter(s => s.date !== stat.date)
      return { ...prev, bodyStats: [...others, stat].sort((a, b) => a.date.localeCompare(b.date)) }
    })
  }, [setState])

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...settings } }))
  }, [setState])

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setState(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...profile } }))
  }, [setState])

  const getStreakData = useCallback(() => {
    const completedSessions = state.sessions.filter(s => s.endTime)
    const totalSessions = completedSessions.length

    const getWeekKey = (date: string) => {
      const d = new Date(date + 'T12:00:00')
      const day = d.getDay()
      const diff = day === 0 ? -6 : 1 - day
      const monday = new Date(d)
      monday.setDate(d.getDate() + diff)
      return monday.toISOString().split('T')[0]
    }

    const weeksWithSessions = new Set(completedSessions.map(s => getWeekKey(s.date)))

    let streak = 0
    const today = new Date()
    let checkDate = new Date(today)
    const dayOfWeek = checkDate.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    checkDate.setDate(checkDate.getDate() + diffToMonday)

    for (let i = 0; i < 52; i++) {
      const weekKey = checkDate.toISOString().split('T')[0]
      if (weeksWithSessions.has(weekKey)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 7)
      } else if (i === 0) {
        // Allow current week to have no sessions yet (look at prev week)
        checkDate.setDate(checkDate.getDate() - 7)
      } else {
        break
      }
    }

    return { totalSessions, streak }
  }, [state.sessions])

  const resetAll = useCallback(() => {
    setState(INITIAL_STATE)
  }, [setState])

  return {
    state,
    upsertSession,
    getSession,
    getLastWeight,
    getExerciseHistory,
    getWaterCups,
    setWaterCups,
    getDietLog,
    setDietLog,
    addBodyStat,
    updateSettings,
    updateProfile,
    getStreakData,
    resetAll,
  }
}
