import { useState } from 'react'
import BottomNav from './components/BottomNav'
import TodayScreen from './screens/TodayScreen'
import WorkoutScreen from './screens/WorkoutScreen'
import DietScreen from './screens/DietScreen'
import ProgressScreen from './screens/ProgressScreen'
import SettingsScreen from './screens/SettingsScreen'
import type { TabKey, DayKey } from './types'

export default function App() {
  const [tab, setTab] = useState<TabKey>('today')
  const [workoutDay, setWorkoutDay] = useState<DayKey | undefined>(undefined)

  function handleStartWorkout(day: DayKey) {
    setWorkoutDay(day)
    setTab('workout')
  }

  return (
    <div className="min-h-svh bg-[#0f0f0f] text-white flex flex-col max-w-lg mx-auto">
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'today' && <TodayScreen onStartWorkout={handleStartWorkout} />}
        {tab === 'workout' && <WorkoutScreen initialDay={workoutDay} onTabChange={setTab} />}
        {tab === 'diet' && <DietScreen />}
        {tab === 'progress' && <ProgressScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
