import { useState } from 'react'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useAppState } from '../hooks/useAppState'
import { WEEKLY_SPLIT, MAIN_LIFTS, DAY_ORDER } from '../data/workouts'
import { todayISO, isoToDate } from '../utils'
import type { BodyStat } from '../types'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { displayColors: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
  },
  elements: { point: { radius: 3, backgroundColor: '#1D9E75' }, line: { tension: 0.3 } },
}

export default function ProgressScreen() {
  const { state, addBodyStat, getExerciseHistory, getStreakData } = useAppState()
  const today = todayISO()

  const [newWeight, setNewWeight] = useState('')
  const [newBF, setNewBF] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(MAIN_LIFTS[0].id)

  const { totalSessions, streak } = getStreakData()

  function logBodyStat() {
    const weight = parseFloat(newWeight)
    if (isNaN(weight)) return
    const stat: BodyStat = {
      date: today,
      weight,
      bodyFat: newBF ? parseFloat(newBF) : null,
      notes: newNotes,
    }
    addBodyStat(stat)
    setNewWeight('')
    setNewBF('')
    setNewNotes('')
  }

  // Weight chart
  const bodyStats = state.bodyStats.slice(-12)
  const weightChartData = {
    labels: bodyStats.map(s => s.date.slice(5)),
    datasets: [
      {
        data: bodyStats.map(s => s.weight),
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29,158,117,0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  }

  // BF chart
  const bfStats = bodyStats.filter(s => s.bodyFat != null)
  const bfChartData = {
    labels: bfStats.map(s => s.date.slice(5)),
    datasets: [
      {
        data: bfStats.map(s => s.bodyFat),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  }

  // Exercise strength chart
  const exHistory = getExerciseHistory(selectedExercise)
  const strengthChartData = {
    labels: exHistory.map(h => h.date.slice(5)),
    datasets: [
      {
        data: exHistory.map(h => h.maxWeight),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  }

  // Phase timeline
  const start = isoToDate(state.userProfile.startDate).getTime()
  const end = isoToDate(state.userProfile.targetDate).getTime()
  const now = Date.now()
  const phaseMid = start + (end - start) * 0.55 // Cut → mid May, Bulk → July
  const totalRange = end - start
  const cutWidth = ((phaseMid - start) / totalRange) * 100
  const bulkWidth = ((end - phaseMid) / totalRange) * 100
  const nowPct = Math.min(100, ((now - start) / totalRange) * 100)

  // All exercises for dropdown
  const allExercises = DAY_ORDER.flatMap(dk => WEEKLY_SPLIT[dk].exercises)

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Sessions" value={`${totalSessions}`} />
        <StatCard label="Week Streak" value={`${streak}w`} />
        <StatCard label="Phase" value={state.settings.phase === 'cut' ? 'Cut' : 'Bulk'} accent />
      </div>

      {/* Log body stats */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Log Body Stats</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Weight (kg)"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            className="flex-1 bg-white/5 text-white text-sm px-3 py-2.5 rounded-xl border border-white/10 outline-none focus:border-[#1D9E75]/50 placeholder:text-gray-600"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="BF %"
            value={newBF}
            onChange={e => setNewBF(e.target.value)}
            className="w-24 bg-white/5 text-white text-sm px-3 py-2.5 rounded-xl border border-white/10 outline-none focus:border-[#1D9E75]/50 placeholder:text-gray-600"
          />
        </div>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={newNotes}
          onChange={e => setNewNotes(e.target.value)}
          className="w-full bg-white/5 text-white text-sm px-3 py-2.5 rounded-xl border border-white/10 outline-none focus:border-[#1D9E75]/50 placeholder:text-gray-600 mb-2"
        />
        <button
          onClick={logBodyStat}
          disabled={!newWeight}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            newWeight ? 'bg-[#1D9E75] text-white' : 'bg-white/5 text-gray-500'
          }`}
        >
          Log Stats
        </button>
        {state.bodyStats.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 text-right">
            Last: {state.bodyStats[state.bodyStats.length - 1].weight}kg · {state.bodyStats[state.bodyStats.length - 1].date}
          </div>
        )}
      </div>

      {/* Weight chart */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Weight Over Time</h2>
        {bodyStats.length >= 2 ? (
          <div className="h-40">
            <Line data={weightChartData} options={lineOptions as never} />
          </div>
        ) : (
          <EmptyChart label="Log at least 2 weigh-ins to see chart" />
        )}
      </div>

      {/* BF chart */}
      {bfStats.length >= 2 && (
        <div className="bg-[#181818] rounded-2xl p-4">
          <h2 className="font-semibold text-sm mb-3">Body Fat %</h2>
          <div className="h-40">
            <Line data={bfChartData} options={lineOptions as never} />
          </div>
        </div>
      )}

      {/* Phase timeline */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Phase Timeline</h2>
        <div className="relative h-8 rounded-full overflow-hidden flex">
          <div className="bg-orange-500/30 flex items-center justify-center text-xs text-orange-400 font-medium" style={{ width: `${cutWidth}%` }}>
            Cut
          </div>
          <div className="bg-blue-500/30 flex items-center justify-center text-xs text-blue-400 font-medium" style={{ width: `${bulkWidth}%` }}>
            Bulk
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80"
            style={{ left: `${nowPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Mar 2026</span>
          <span>Mid May</span>
          <span>Jul 2026</span>
        </div>
      </div>

      {/* Strength progress */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Strength Progress</h2>
        </div>
        <select
          value={selectedExercise}
          onChange={e => setSelectedExercise(e.target.value)}
          className="w-full bg-white/5 text-white text-sm px-3 py-2 rounded-xl border border-white/10 outline-none mb-3 appearance-none"
        >
          {allExercises.map(ex => (
            <option key={ex.id} value={ex.id} className="bg-[#181818]">
              {ex.name}
            </option>
          ))}
        </select>
        {exHistory.length >= 2 ? (
          <div className="h-40">
            <Line data={strengthChartData} options={lineOptions as never} />
          </div>
        ) : (
          <EmptyChart label="Complete sessions to see progress" />
        )}
      </div>

      {/* Personal bests */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Personal Bests</h2>
        <div className="grid grid-cols-2 gap-2">
          {MAIN_LIFTS.map(lift => {
            const pb = state.personalBests[lift.id]
            return (
              <div key={lift.id} className="bg-white/5 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-500">{lift.label}</p>
                <p className={`text-base font-bold mt-0.5 ${pb ? 'text-[#1D9E75]' : 'text-gray-600'}`}>
                  {pb ? `${pb}kg` : '—'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* What to expect */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">What to Expect</h2>
        <div className="space-y-3">
          <Milestone
            bf="15-16%"
            label="Starting point"
            desc="Soft midsection, some muscle visible"
            done={false}
            current={false}
          />
          <Milestone
            bf="13-14%"
            label="Target (Cut)"
            desc="Visible abs, capped shoulders, arm veins starting"
            done={false}
            current
          />
          <Milestone
            bf="10-11%"
            label="Lean & defined"
            desc="Deep ab separation, full vascularity"
            done={false}
            current={false}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#181818] rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${accent ? 'text-[#1D9E75]' : 'text-white'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-28 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
      <p className="text-xs text-gray-600 text-center px-4">{label}</p>
    </div>
  )
}

function Milestone({ bf, label, desc, current }: { bf: string; label: string; desc: string; done: boolean; current: boolean }) {
  return (
    <div className={`flex gap-3 items-start ${current ? 'opacity-100' : 'opacity-50'}`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${current ? 'bg-[#1D9E75]' : 'bg-gray-600'}`} />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{bf}</span>
          <span className="text-xs text-gray-500">{label}</span>
          {current && <span className="text-xs bg-[#1D9E75]/20 text-[#1D9E75] px-1.5 py-0.5 rounded-full">Target</span>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
