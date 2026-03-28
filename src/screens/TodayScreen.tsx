import { useAppState } from '../hooks/useAppState'
import { WEEKLY_SPLIT } from '../data/workouts'
import { CUT_PLAN, BULK_PLAN } from '../data/diet'
import { todayISO, dayKeyFromDate, progressPercent, weeksElapsed, totalWeeks } from '../utils'
import type { DayKey } from '../types'

interface Props {
  onStartWorkout: (day: DayKey) => void
}

export default function TodayScreen({ onStartWorkout }: Props) {
  const { state, getWaterCups, setWaterCups, getDietLog, setDietLog, getSession } = useAppState()
  const today = todayISO()
  const todayKey = dayKeyFromDate(new Date())
  const dayWorkout = WEEKLY_SPLIT[todayKey]
  const phase = state.settings.phase
  const plan = phase === 'cut' ? CUT_PLAN : BULK_PLAN

  const cups = getWaterCups(today)
  const dietLog = getDietLog(today)
  const session = getSession(today)

  const pct = progressPercent(state.userProfile.startDate, state.userProfile.targetDate)
  const wksElapsed = weeksElapsed(state.userProfile.startDate)
  const wksTotal = totalWeeks(state.userProfile.startDate, state.userProfile.targetDate)

  const sessionDone = !!session?.endTime
  const proteinDone = plan.meals.every(m => dietLog.mealsEaten.includes(m.id))
  const waterDone = cups >= 14
  const creatineDone = dietLog.supplementsTaken.includes('creatine')
  const magnesiumDone = dietLog.supplementsTaken.includes('magnesium')

  function toggleSupplement(id: string) {
    const taken = dietLog.supplementsTaken.includes(id)
    setDietLog({
      ...dietLog,
      supplementsTaken: taken
        ? dietLog.supplementsTaken.filter(s => s !== id)
        : [...dietLog.supplementsTaken, id],
    })
  }

  function setCups(n: number) {
    setWaterCups(today, Math.max(0, Math.min(14, n)))
  }

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm capitalize">{dateStr}</p>
          <h1 className="text-xl font-bold mt-0.5 leading-tight">
            {dayWorkout.isRest ? 'Rest Day' : dayWorkout.name}
          </h1>
        </div>
        <span
          className={`mt-1 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
            phase === 'cut'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}
        >
          {phase === 'cut' ? 'CUT' : 'BULK'} · {plan.kcal} kcal
        </span>
      </div>

      {/* Water tracker */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-sm">Water Intake</span>
          <span className={`text-sm font-medium tabular-nums ${waterDone ? 'text-[#1D9E75]' : 'text-gray-400'}`}>
            {cups}/14 · {(cups * 0.25).toFixed(2)}L
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({ length: 14 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCups(i < cups ? i : i + 1)}
              className={`aspect-square rounded-xl flex items-center justify-center text-base transition-all active:scale-90 ${
                i < cups
                  ? 'bg-[#1D9E75]/25 text-[#1D9E75]'
                  : 'bg-white/5 text-white/20'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2.5l-5.5 10c-.9 1.6-.9 3.5 0 5 .9 1.6 2.6 2.5 5.5 2.5s4.6-.9 5.5-2.5c.9-1.5.9-3.4 0-5L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
        {waterDone && (
          <p className="text-[#1D9E75] text-xs text-center font-medium">Target reached! 3.5L ✓</p>
        )}
      </div>

      {/* Daily checklist */}
      <div className="bg-[#181818] rounded-2xl p-4 space-y-3.5">
        <h2 className="font-semibold text-sm">Today's Checklist</h2>
        {!dayWorkout.isRest && (
          <CheckItem label="Complete gym session" done={sessionDone} muted />
        )}
        <CheckItem label={`Hit protein target (${plan.protein}g)`} done={proteinDone} muted />
        <CheckItem label="Drink 3.5L water (14 cups)" done={waterDone} muted />
        <CheckItem
          label="Creatine 5g"
          done={creatineDone}
          onClick={() => toggleSupplement('creatine')}
        />
        <CheckItem
          label="Magnesium glycinate 400mg (before bed)"
          done={magnesiumDone}
          onClick={() => toggleSupplement('magnesium')}
          amber
        />
      </div>

      {/* Workout quicklist */}
      {!dayWorkout.isRest && (
        <div className="bg-[#181818] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Today's Exercises</h2>
            {sessionDone && <span className="text-[#1D9E75] text-xs font-medium">Completed ✓</span>}
          </div>
          <div className="space-y-2 mb-4">
            {dayWorkout.exercises.map(ex => (
              <div key={ex.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{ex.name}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {ex.sets}×{ex.repsTarget}
                </span>
              </div>
            ))}
          </div>
          {!sessionDone && (
            <button
              onClick={() => onStartWorkout(todayKey)}
              className="w-full bg-[#1D9E75] text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              Start Workout
            </button>
          )}
        </div>
      )}

      {/* Goal progress */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Goal Progress</h2>
          <span className="text-xs text-gray-500">
            Week {wksElapsed}/{wksTotal}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#1D9E75] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">{pct}% toward goal · Target: {state.userProfile.targetBodyFat}% body fat</p>
      </div>
    </div>
  )
}

function CheckItem({
  label,
  done,
  onClick,
  muted,
  amber,
}: {
  label: string
  done: boolean
  onClick?: () => void
  muted?: boolean
  amber?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={muted}
      className={`flex items-center gap-3 w-full text-left ${!muted ? 'active:scale-95 transition-transform' : ''}`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          done
            ? 'bg-[#1D9E75] border-[#1D9E75]'
            : amber
            ? 'border-amber-400'
            : 'border-gray-600'
        }`}
      >
        {done && (
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        className={`text-sm ${
          done
            ? 'text-gray-500 line-through'
            : amber
            ? 'text-amber-300'
            : 'text-gray-200'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
