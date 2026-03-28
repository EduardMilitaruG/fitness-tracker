import { useState, useEffect, useRef } from 'react'
import { useAppState } from '../hooks/useAppState'
import { WEEKLY_SPLIT, DAY_ORDER } from '../data/workouts'
import { todayISO, dayKeyFromDate, getWeekDates, formatDuration, vibrate } from '../utils'
import type { DayKey, WorkoutSession, TabKey } from '../types'

interface Props {
  initialDay?: DayKey
  onTabChange?: (tab: TabKey) => void
}

export default function WorkoutScreen({ initialDay }: Props) {
  const { state, upsertSession, getSession, getLastWeight } = useAppState()
  const today = todayISO()
  const todayKey = dayKeyFromDate(new Date())
  const weekDates = getWeekDates()

  const [selectedDay, setSelectedDay] = useState<DayKey>(initialDay || todayKey)
  const [restTimer, setRestTimer] = useState<{ seconds: number; total: number; active: boolean } | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const selectedDate = weekDates.find(d => d.day === selectedDay)?.iso ?? today
  const isToday = selectedDay === todayKey
  const dayWorkout = WEEKLY_SPLIT[selectedDay]
  const session = getSession(selectedDate)

  // Update selected day when initialDay changes
  useEffect(() => {
    if (initialDay) setSelectedDay(initialDay)
  }, [initialDay])

  // Session clock
  useEffect(() => {
    if (session?.startTime && !session.endTime) {
      const tick = () => {
        const start = new Date(session.startTime!).getTime()
        setElapsedSecs(Math.floor((Date.now() - start) / 1000))
      }
      tick()
      sessionTimerRef.current = setInterval(tick, 1000)
      return () => {
        if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      }
    }
  }, [session?.startTime, session?.endTime])

  // Rest timer countdown
  useEffect(() => {
    if (!restTimer?.active) return
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (!prev || !prev.active) return prev
        if (prev.seconds <= 1) {
          clearInterval(interval)
          vibrate([300, 100, 300])
          return { ...prev, seconds: 0, active: false }
        }
        return { ...prev, seconds: prev.seconds - 1 }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [restTimer?.active])

  function startSession() {
    const newSession: WorkoutSession = {
      date: selectedDate,
      dayKey: selectedDay,
      startTime: new Date().toISOString(),
      endTime: null,
      totalVolume: 0,
      exercises: dayWorkout.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: Array.from({ length: ex.sets }, () => ({ completed: false, weight: null, reps: null })),
        restSeconds: state.settings.defaultRestSeconds,
        notes: '',
      })),
    }
    upsertSession(newSession)
  }

  function updateSet(exIdx: number, setIdx: number, patch: { weight?: number | null; completed?: boolean }) {
    if (!session) return
    const exercises = session.exercises.map((ex, i) => {
      if (i !== exIdx) return ex
      const sets = ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s))
      return { ...ex, sets }
    })
    let vol = 0
    exercises.forEach(ex => {
      const def = dayWorkout.exercises.find(d => d.id === ex.exerciseId)
      const repsNum = def ? parseInt(def.repsTarget.split('-')[0]) : 10
      ex.sets.forEach(s => {
        if (s.completed && s.weight) vol += s.weight * repsNum
      })
    })
    upsertSession({ ...session, exercises, totalVolume: vol })
    if (patch.completed) {
      const ex = session.exercises[exIdx]
      setRestTimer({ seconds: ex.restSeconds, total: ex.restSeconds, active: true })
    }
  }

  function updateNotes(exIdx: number, notes: string) {
    if (!session) return
    const exercises = session.exercises.map((ex, i) => (i === exIdx ? { ...ex, notes } : ex))
    upsertSession({ ...session, exercises })
  }

  function updateRestTime(exIdx: number, seconds: number) {
    if (!session) return
    const exercises = session.exercises.map((ex, i) => (i === exIdx ? { ...ex, restSeconds: seconds } : ex))
    upsertSession({ ...session, exercises })
  }

  function finishSession() {
    if (!session) return
    let vol = 0
    session.exercises.forEach(ex => {
      const def = dayWorkout.exercises.find(d => d.id === ex.exerciseId)
      const repsNum = def ? parseInt(def.repsTarget.split('-')[0]) : 10
      ex.sets.forEach(s => {
        if (s.completed && s.weight) vol += s.weight * repsNum
      })
    })
    upsertSession({ ...session, endTime: new Date().toISOString(), totalVolume: vol })
    setRestTimer(null)
    setShowSummary(true)
  }

  const allSetsCompleted = session?.exercises.every(ex => ex.sets.every(s => s.completed)) ?? false
  const completedSetsCount = session?.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0) ?? 0
  const totalSetsCount = session?.exercises.reduce((a, ex) => a + ex.sets.length, 0) ?? 0

  // Session summary
  if (showSummary && session?.endTime) {
    const durationSecs = Math.floor(
      (new Date(session.endTime).getTime() - new Date(session.startTime!).getTime()) / 1000
    )
    const exDone = session.exercises.filter(ex => ex.sets.some(s => s.completed)).length
    return (
      <div className="px-4 py-8 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#1D9E75]/20 border-2 border-[#1D9E75] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
            <path d="M20 6L9 17l-5-5" stroke="#1D9E75" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Session Complete</h2>
          <p className="text-gray-400 text-sm mt-1">{WEEKLY_SPLIT[session.dayKey].name}</p>
        </div>
        <div className="w-full grid grid-cols-3 gap-3">
          <StatCard label="Duration" value={formatDuration(durationSecs)} />
          <StatCard label="Volume" value={`${Math.round(session.totalVolume)}kg`} />
          <StatCard label="Exercises" value={`${exDone}`} />
        </div>
        <button
          onClick={() => setShowSummary(false)}
          className="w-full bg-[#1D9E75] text-white py-3 rounded-xl font-semibold active:scale-95 transition-transform"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Week calendar strip */}
      <div className="px-4 pt-4 pb-3 bg-[#0f0f0f] sticky top-0 z-10 border-b border-white/5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {DAY_ORDER.map((dk, i) => {
            const dateInfo = weekDates[i]
            const isSelected = dk === selectedDay
            const isTodayDay = dk === todayKey
            const hasSession = !!getSession(dateInfo?.iso ?? '')?.endTime
            const dow = WEEKLY_SPLIT[dk]
            return (
              <button
                key={dk}
                onClick={() => setSelectedDay(dk)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[44px] ${
                  isSelected
                    ? 'bg-[#1D9E75] text-white'
                    : isTodayDay
                    ? 'bg-[#1D9E75]/10 text-[#1D9E75] border border-[#1D9E75]/30'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide">{dow.label}</span>
                <span className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-600'}`}>
                  {dateInfo?.iso.split('-')[2]}
                </span>
                {hasSession && (
                  <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-[#1D9E75]'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* Day header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-base">{dayWorkout.name}</h2>
            {session?.startTime && !session.endTime && (
              <p className="text-[#1D9E75] text-xs mt-0.5">{formatDuration(elapsedSecs)} · in progress</p>
            )}
          </div>
          {session?.startTime && !session.endTime && (
            <span className="text-xs text-gray-500 tabular-nums">{completedSetsCount}/{totalSetsCount}</span>
          )}
        </div>

        {/* Rest day */}
        {dayWorkout.isRest && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="text-5xl">😴</div>
            <p className="text-xl font-semibold">Rest Day</p>
            <p className="text-gray-500 text-sm">Recovery is part of progress.</p>
          </div>
        )}

        {/* Start session */}
        {!dayWorkout.isRest && !session && isToday && (
          <button
            onClick={startSession}
            className="w-full bg-[#1D9E75] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform mb-4"
          >
            Start Session
          </button>
        )}

        {/* Exercise cards */}
        {!dayWorkout.isRest && (
          <div className="space-y-3">
            {dayWorkout.exercises.map((def, exIdx) => {
              const log = session?.exercises[exIdx]
              const lastWeight = getLastWeight(def.id, selectedDate)
              const currentMax = log?.sets
                .filter(s => s.completed && s.weight != null)
                .map(s => s.weight!)
                .reduce((a, b) => Math.max(a, b), 0) ?? 0
              const isPR = currentMax > 0 && lastWeight != null && currentMax > lastWeight
              const isNewPR = currentMax > 0 && (state.personalBests[def.id] == null || currentMax > (state.personalBests[def.id] ?? 0))
              const allDone = log?.sets.every(s => s.completed) ?? false

              return (
                <div
                  key={def.id}
                  className={`rounded-2xl p-4 border ${
                    allDone ? 'bg-[#0d2a1e] border-[#1D9E75]/30' : 'bg-[#181818] border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{def.name}</span>
                        {isNewPR && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">🏆 PR</span>
                        )}
                        {isPR && !isNewPR && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#1D9E75]/20 text-[#1D9E75]">↑</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{def.sets} sets × {def.repsTarget} reps</span>
                    </div>
                    {lastWeight != null && (
                      <span className="text-xs text-gray-500 flex-shrink-0">Last: {lastWeight}kg</span>
                    )}
                  </div>

                  {/* Sets */}
                  {log ? (
                    <>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {log.sets.map((set, setIdx) => (
                          <SetCard
                            key={setIdx}
                            num={setIdx + 1}
                            set={set}
                            onToggle={() => updateSet(exIdx, setIdx, { completed: !set.completed })}
                            onWeightChange={w => updateSet(exIdx, setIdx, { weight: w })}
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Notes…"
                        value={log.notes}
                        onChange={e => updateNotes(exIdx, e.target.value)}
                        className="mt-3 w-full bg-white/5 text-gray-300 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-[#1D9E75]/40 placeholder:text-gray-600"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-600">Rest:</span>
                        {[60, 90, 120, 180].map(s => (
                          <button
                            key={s}
                            onClick={() => updateRestTime(exIdx, s)}
                            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                              log.restSeconds === s
                                ? 'bg-[#1D9E75]/20 text-[#1D9E75]'
                                : 'bg-white/5 text-gray-500'
                            }`}
                          >
                            {s}s
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Array.from({ length: def.sets }, (_, i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs text-gray-600"
                        >
                          S{i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {session?.startTime && !session.endTime && (
              <button
                onClick={finishSession}
                disabled={!allSetsCompleted}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 mt-2 ${
                  allSetsCompleted
                    ? 'bg-[#1D9E75] text-white'
                    : 'bg-white/5 text-gray-500 border border-white/5'
                }`}
              >
                {allSetsCompleted ? 'Finish Session ✓' : `${totalSetsCount - completedSetsCount} sets remaining`}
              </button>
            )}

            {session?.endTime && !showSummary && (
              <button
                onClick={() => setShowSummary(true)}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-white/5 text-[#1D9E75] border border-[#1D9E75]/20 active:scale-95 transition-transform"
              >
                View Summary
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rest timer overlay */}
      {restTimer && (
        <div className="fixed inset-x-0 bottom-20 max-w-lg mx-auto px-4 z-40 pointer-events-none">
          <div className="pointer-events-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Rest Timer</p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl font-bold tabular-nums ${
                    restTimer.seconds <= 10 && restTimer.active ? 'text-orange-400' : 'text-[#1D9E75]'
                  }`}
                >
                  {restTimer.seconds}
                </span>
                <span className="text-gray-500 text-sm">sec</span>
                {!restTimer.active && restTimer.seconds === 0 && (
                  <span className="text-[#1D9E75] text-sm ml-1">Go! 💪</span>
                )}
              </div>
              <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#1D9E75] transition-all duration-1000"
                  style={{ width: `${(restTimer.seconds / restTimer.total) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setRestTimer(null)}
              className="w-10 h-10 rounded-xl bg-white/5 text-gray-400 flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SetCard({
  num,
  set,
  onToggle,
  onWeightChange,
}: {
  num: number
  set: { completed: boolean; weight: number | null; reps: number | null }
  onToggle: () => void
  onWeightChange: (w: number) => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onToggle}
        className={`w-12 h-12 rounded-xl text-sm font-bold transition-all active:scale-90 ${
          set.completed
            ? 'bg-[#1D9E75] text-white'
            : 'bg-white/5 text-gray-400 border border-white/10'
        }`}
      >
        {set.weight != null ? set.weight : `S${num}`}
      </button>
      {editing ? (
        <input
          type="number"
          inputMode="decimal"
          className="w-12 h-6 bg-[#1a1a1a] text-white text-xs text-center rounded-lg border border-[#1D9E75]/50 outline-none"
          defaultValue={set.weight ?? ''}
          placeholder="kg"
          autoFocus
          onBlur={e => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onWeightChange(v)
            setEditing(false)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors"
        >
          {set.weight != null ? `${set.weight}kg` : 'kg?'}
        </button>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#181818] rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-[#1D9E75]">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
