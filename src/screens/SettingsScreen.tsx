import { useState } from 'react'
import { useAppState } from '../hooks/useAppState'
import type { Phase } from '../types'

export default function SettingsScreen() {
  const { state, updateProfile, updateSettings, resetAll } = useAppState()
  const { userProfile, settings } = state

  const [weight, setWeight] = useState(String(userProfile.weight))
  const [height, setHeight] = useState(String(userProfile.height))
  const [age, setAge] = useState(String(userProfile.age))
  const [confirmReset, setConfirmReset] = useState(false)
  const [saved, setSaved] = useState(false)

  function saveProfile() {
    updateProfile({
      weight: parseFloat(weight) || userProfile.weight,
      height: parseFloat(height) || userProfile.height,
      age: parseInt(age) || userProfile.age,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `physique-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function doReset() {
    resetAll()
    setConfirmReset(false)
    window.location.reload()
  }

  const bmi = (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Active phase */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Active Phase</h2>
        <div className="flex gap-2">
          {(['cut', 'bulk'] as Phase[]).map(p => (
            <button
              key={p}
              onClick={() => updateSettings({ phase: p })}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                settings.phase === p
                  ? p === 'cut'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              {p === 'cut' ? 'Cut (2,500 kcal)' : 'Bulk (3,500 kcal)'}
            </button>
          ))}
        </div>
      </div>

      {/* Rest timer */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Default Rest Timer</h2>
        <div className="flex gap-2">
          {[60, 90, 120, 180].map(s => (
            <button
              key={s}
              onClick={() => updateSettings({ defaultRestSeconds: s })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                settings.defaultRestSeconds === s
                  ? 'bg-[#1D9E75]/20 text-[#1D9E75] border border-[#1D9E75]/30'
                  : 'bg-white/5 text-gray-500'
              }`}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      {/* Personal stats */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-3">Personal Stats</h2>
        <div className="space-y-3">
          <Field label="Weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="bg-white/5 text-white text-sm px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#1D9E75]/50 w-full"
            />
          </Field>
          <Field label="Height (cm)">
            <input
              type="number"
              inputMode="decimal"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="bg-white/5 text-white text-sm px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#1D9E75]/50 w-full"
            />
          </Field>
          <Field label="Age">
            <input
              type="number"
              inputMode="numeric"
              value={age}
              onChange={e => setAge(e.target.value)}
              className="bg-white/5 text-white text-sm px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-[#1D9E75]/50 w-full"
            />
          </Field>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-gray-500">BMI: {bmi}</span>
            <span className="text-gray-500">{userProfile.height}cm · {userProfile.weight}kg · {userProfile.age}y</span>
          </div>
          <button
            onClick={saveProfile}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
              saved ? 'bg-[#1D9E75]/20 text-[#1D9E75]' : 'bg-[#1D9E75] text-white'
            }`}
          >
            {saved ? 'Saved ✓' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Goal info */}
      <div className="bg-[#181818] rounded-2xl p-4">
        <h2 className="font-semibold text-sm mb-2">Goal</h2>
        <p className="text-sm text-gray-300">{userProfile.goal}</p>
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          <div>Started: {userProfile.startDate}</div>
          <div>Target: {userProfile.targetDate}</div>
          <div>Target BF: {userProfile.targetBodyFat}%</div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-[#181818] rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Data</h2>
        <button
          onClick={exportData}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl text-sm text-gray-200 active:scale-95 transition-transform"
        >
          <span>Export all data (JSON)</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 rounded-xl text-sm text-red-400 border border-red-500/20 active:scale-95 transition-transform"
          >
            <span>Reset all data</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        ) : (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-400 mb-3 text-center">Delete all data? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-gray-300 text-sm font-medium active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={doReset}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium active:scale-95"
              >
                Delete everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="text-center py-3">
        <p className="text-xs text-gray-600">My Physique · v1.0.0</p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}
