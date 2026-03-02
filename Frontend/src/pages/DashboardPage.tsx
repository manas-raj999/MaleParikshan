import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardData, MoodType } from '../types'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import DidYouKnow from '../components/DidYouKnow'
import DailyTracker from '../components/DailyTracker'
import DailyChallenge from '../components/DailyChallenge'
import { StreakGraph } from '../components/StreakGraph'

// emoji map replaced with simpler set for tracker
const UNIVERSAL_MOOD: Record<string, string> = {
  calm: '😌',
  angry: '😠',
  low: '😢',
  confident: '😄',
  neutral: '😐',
}


export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardService.get()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-6 animate-fade-up">
      {/* greeting & toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted font-body text-sm">{formattedDate}</p>
          <h1 className="font-display text-3xl font-bold text-white">
            {`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}`},
            <span className="text-gradient"> {user?.email?.split('@')[0] || 'Champion'}</span>
          </h1>
        </div>
        <button className="w-10 h-6 relative bg-border rounded-full flex items-center p-1">
          <span className="absolute left-1 w-4 h-4 bg-accent rounded-full transition-transform" />
        </button>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-body">{error} — showing demo data</p>
        </div>
      )}

      <DidYouKnow />
      <DailyTracker />
      <DailyChallenge />
      <StreakGraph currentStreak={data?.streak?.current ?? 0} />

      {/* desktop summary stats */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        <div className="card border-gradient glow-accent">
          <p className="text-muted font-body text-xs uppercase tracking-widest mb-3">{t('dashboard.healthScore')}</p>
          <p className="font-display text-5xl font-extrabold text-gradient mb-1">
            {data?.healthScore ?? '—'}
          </p>
          <p className="text-muted text-xs font-body">out of 100</p>
        </div>
        <div className="card">
          <p className="text-muted font-body text-xs uppercase tracking-widest mb-3">{t('dashboard.currentStreak')}</p>
          <div className="flex items-end gap-2 mb-1">
            <p className="font-display text-5xl font-extrabold text-white">
              {data?.streak?.current ?? 0}
            </p>
            <p className="text-muted text-sm font-body mb-2">{t('dashboard.days')}</p>
          </div>
        </div>
        <div className="card">
          <p className="text-muted font-body text-xs uppercase tracking-widest mb-3">{t('dashboard.todayMood')}</p>
          {data?.todayMood ? (
            <>
              <p className="text-4xl mb-1">{UNIVERSAL_MOOD[data.todayMood]}</p>
              <p className="font-display text-sm font-medium text-white capitalize">{data.todayMood}</p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-1 opacity-30">😐</p>
              <p className="font-body text-xs text-muted">{t('dashboard.notLogged')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
