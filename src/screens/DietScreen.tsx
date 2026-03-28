import { useState } from 'react'
import { useAppState } from '../hooks/useAppState'
import { CUT_PLAN, BULK_PLAN, SUPPLEMENTS } from '../data/diet'
import { todayISO } from '../utils'
import type { Phase } from '../types'

export default function DietScreen() {
  const { state, getDietLog, setDietLog } = useAppState()
  const today = todayISO()
  const dietLog = getDietLog(today)

  const [viewPhase, setViewPhase] = useState<Phase>(state.settings.phase)
  const plan = viewPhase === 'cut' ? CUT_PLAN : BULK_PLAN

  const eatenMeals = dietLog.mealsEaten
  const takenSupps = dietLog.supplementsTaken

  const eatenProtein = plan.meals
    .filter(m => eatenMeals.includes(m.id))
    .reduce((a, m) => a + m.protein, 0)
  const eatenCarbs = plan.meals
    .filter(m => eatenMeals.includes(m.id))
    .reduce((a, m) => a + m.carbs, 0)
  const eatenFat = plan.meals
    .filter(m => eatenMeals.includes(m.id))
    .reduce((a, m) => a + m.fat, 0)
  const eatenKcal = plan.meals
    .filter(m => eatenMeals.includes(m.id))
    .reduce((a, m) => a + m.kcal, 0)

  function toggleMeal(id: string) {
    const eaten = eatenMeals.includes(id)
    setDietLog({
      ...dietLog,
      mealsEaten: eaten ? eatenMeals.filter(m => m !== id) : [...eatenMeals, id],
    })
  }

  function toggleSupp(id: string) {
    const taken = takenSupps.includes(id)
    setDietLog({
      ...dietLog,
      supplementsTaken: taken ? takenSupps.filter(s => s !== id) : [...takenSupps, id],
    })
  }

  const totalKcal = plan.protein * 4 + plan.carbs * 4 + plan.fat * 9
  const proteinPct = (plan.protein * 4 / totalKcal) * 100
  const carbsPct = (plan.carbs * 4 / totalKcal) * 100
  // fat fills the rest

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Phase tabs */}
      <div className="flex gap-2">
        {(['cut', 'bulk'] as Phase[]).map(p => (
          <button
            key={p}
            onClick={() => setViewPhase(p)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              viewPhase === p
                ? p === 'cut'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-500'
            }`}
          >
            {p === 'cut' ? `Cut · ${CUT_PLAN.kcal} kcal` : `Bulk · ${BULK_PLAN.kcal} kcal`}
            {state.settings.phase === p && (
              <span className="ml-1.5 text-xs opacity-70">Active</span>
            )}
          </button>
        ))}
      </div>

      {/* Macro chart + breakdown */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 relative w-28 h-28">
            <div
              className="w-28 h-28 rounded-full"
              style={{
                background: `conic-gradient(
                  #1D9E75 0% ${proteinPct}%,
                  #3b82f6 ${proteinPct}% ${proteinPct + carbsPct}%,
                  #f59e0b ${proteinPct + carbsPct}% 100%
                )`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full bg-[#181818] flex flex-col items-center justify-center"
              >
                <span className="text-sm font-bold leading-none">{plan.kcal}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">kcal</span>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <MacroRow color="bg-[#1D9E75]" label="Protein" value={plan.protein} unit="g" kcal={plan.protein * 4} />
            <MacroRow color="bg-blue-500" label="Carbs" value={plan.carbs} unit="g" kcal={plan.carbs * 4} />
            <MacroRow color="bg-amber-500" label="Fat" value={plan.fat} unit="g" kcal={plan.fat * 9} />
          </div>
        </div>
      </div>

      {/* Today's progress */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Today's Intake</h2>
          <span className="text-xs text-gray-500 tabular-nums">{eatenKcal} / {plan.kcal} kcal</span>
        </div>
        <div className="space-y-2">
          <ProgressBar label="Protein" current={eatenProtein} target={plan.protein} color="bg-[#1D9E75]" unit="g" />
          <ProgressBar label="Carbs" current={eatenCarbs} target={plan.carbs} color="bg-blue-500" unit="g" />
          <ProgressBar label="Fat" current={eatenFat} target={plan.fat} color="bg-amber-500" unit="g" />
        </div>
      </div>

      {/* Meal plan */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Meal Plan</h2>
        <div className="space-y-2">
          {plan.meals.map(meal => {
            const eaten = eatenMeals.includes(meal.id)
            return (
              <button
                key={meal.id}
                onClick={() => toggleMeal(meal.id)}
                className={`w-full text-left rounded-xl p-3 border transition-all active:scale-[0.98] ${
                  eaten
                    ? 'bg-[#1D9E75]/10 border-[#1D9E75]/25'
                    : 'bg-white/3 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        eaten ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-gray-600'
                      }`}
                    >
                      {eaten && (
                        <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-500 font-medium">{meal.time}</span>
                      <span className={`text-sm font-medium ml-2 ${eaten ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {meal.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{meal.kcal} kcal</span>
                </div>
                <p className={`text-xs mt-1 ml-6 ${eaten ? 'text-gray-600' : 'text-gray-400'}`}>
                  {meal.description}
                </p>
                <div className="flex gap-3 mt-1.5 ml-6">
                  <span className="text-[10px] text-[#1D9E75]">{meal.protein}P</span>
                  <span className="text-[10px] text-blue-400">{meal.carbs}C</span>
                  <span className="text-[10px] text-amber-400">{meal.fat}F</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Supplements */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Supplements</h2>
        <div className="space-y-2.5">
          {SUPPLEMENTS.map(supp => {
            const taken = takenSupps.includes(supp.id)
            return (
              <button
                key={supp.id}
                onClick={() => toggleSupp(supp.id)}
                className={`w-full flex items-center gap-3 active:scale-[0.98] transition-transform`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    taken
                      ? 'bg-[#1D9E75] border-[#1D9E75]'
                      : supp.important
                      ? 'border-amber-400'
                      : 'border-gray-600'
                  }`}
                >
                  {taken && (
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className={`text-sm ${taken ? 'text-gray-500 line-through' : supp.important ? 'text-amber-300' : 'text-gray-200'}`}>
                    {supp.name}
                  </span>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{supp.dose}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-500">{supp.timing}</span>
                  </div>
                </div>
                {supp.important && !taken && (
                  <span className="text-xs text-amber-400 flex-shrink-0">Priority</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MacroRow({ color, label, value, unit, kcal }: { color: string; label: string; value: number; unit: string; kcal: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-xs text-gray-400 w-14">{label}</span>
      <span className="text-sm font-semibold">{value}{unit}</span>
      <span className="text-xs text-gray-600 ml-auto">{kcal} kcal</span>
    </div>
  )
}

function ProgressBar({ label, current, target, color, unit }: { label: string; current: number; target: number; color: string; unit: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-400 tabular-nums">{current}/{target}{unit}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
