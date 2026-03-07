import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardData } from '../types'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import { useMode } from '../context/ModeContext'
import DidYouKnow from '../components/DidYouKnow'

// Determine risk level based on BMI
const getRiskLevel = (bmi: number): { level: string; color: string } => {
  if (bmi < 18.5) return { level: 'Low', color: 'text-green-400' }
  if (bmi < 25) return { level: 'Low', color: 'text-green-400' }
  if (bmi < 30) return { level: 'Moderate', color: 'text-yellow-500' }
  return { level: 'High', color: 'text-red-400' }
}

const MOOD_EMOJI: Record<string, string> = {
  calm: '😌',
  angry: '😠',
  low: '😢',
  confident: '😄',
  neutral: '😐',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isAdultMode } = useMode()
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
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isAdultMode ? 'border-red-500' : 'border-blue-400'}`} />
      </div>
    )
  }

  const bmi = data?.user?.profile?.bmi ?? 0
  const riskScore = data?.user?.profile?.riskScore ?? 50
  const riskLevel = getRiskLevel(bmi)
  const healthScore = data?.healthScore ?? 50
  const currentMood = data?.todayMood
  
  // Progress bar calculation for today's streak
  const todayProgress = Math.min(100, (data?.streak?.current ?? 0) / ((data?.streak?.target ?? 30) / 100))

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: isAdultMode ? 'rgba(185,28,28,0.15)' : 'rgba(59,130,246,0.15)', border: `1px solid ${isAdultMode ? 'rgba(185,28,28,0.3)' : 'rgba(59,130,246,0.3)'}` }}>
          <span className="text-sm">{isAdultMode ? '🔞 Adult' : '📖 Normal'}</span>
        </div>
      </div>

      {/* Did You Know? — Now at top */}
      <DidYouKnow />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Health Score Circular Gauge */}
        <div className="md:col-span-2 rounded-2xl p-8 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeDasharray={`${(healthScore / 100) * 283} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="font-display text-5xl font-bold text-white">{Math.round(healthScore)}</span>
              </div>
            </div>
            <p className="text-muted font-body text-sm">{t('dashboard.healthScore')}</p>
          </div>
        </div>

        {/* Risk Level and BMI */}
        <div className="space-y-4">
          {/* Risk Level */}
          <div className="rounded-2xl p-6 h-32 flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05))', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="text-muted font-body text-xs uppercase tracking-widest mb-2">{t('dashboard.riskLevel')}</p>
            <div className="flex items-center gap-2">
              <span className={`font-display text-2xl font-bold ${riskLevel.color}`}>{riskLevel.level}</span>
              <div className={`px-2 py-1 rounded-lg text-xs font-body ${riskLevel.color} opacity-70`} style={{ background: `${riskLevel.color}15` }}>
                {bmi.toFixed(1)}
              </div>
            </div>
          </div>

          {/* BMI */}
          <div className="rounded-2xl p-6 h-32 flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.15)' }}>
            <p className="text-muted font-body text-xs uppercase tracking-widest mb-2">BMI</p>
            <p className="font-display text-4xl font-bold text-blue-300">{bmi.toFixed(1)}</p>
            <p className="text-muted text-xs font-body mt-1">kg/m²</p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="rounded-2xl p-8 flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(251,146,60,0.05))', border: '1px solid rgba(251,146,60,0.2)' }}>
          <p className="text-muted font-body text-xs uppercase tracking-widest mb-3">Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-orange-300">{data?.streak?.current ?? 0}</span>
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-muted font-body text-xs mt-2">{t('dashboard.days')}</p>
        </div>
      </div>

      {/* Today's Streak Section */}
      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white">Today's Streak</h3>
          <span className="font-display text-3xl font-bold text-blue-400">{data?.streak?.current ?? 0}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{
                width: `${todayProgress}%`,
                background: 'linear-gradient(90deg, #06b6d4, #2dd4bf)',
              }}
            />
          </div>
        </div>

        {/* Progress Text */}
        <div className="flex items-center justify-between">
          <p className="text-muted font-body text-sm">{t('dashboard.keepUpGoodWork')}</p>
          <p className="font-mono text-sm text-muted">{data?.streak?.current ?? 0} / {data?.streak?.target ?? 30}</p>
        </div>
      </div>

      {/* Today's Mood Section */}
      {currentMood && (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(168,85,247,0.05))', border: '1px solid rgba(139,92,246,0.15)' }}>
          <p className="text-muted font-body text-xs uppercase tracking-widest mb-4">{t('dashboard.todayMood')}</p>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{MOOD_EMOJI[currentMood] || '😐'}</span>
            <div>
              <p className="font-display text-2xl font-bold text-white capitalize">{currentMood}</p>
              <p className="text-muted text-sm font-body">{t('dashboard.loggedToday')}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-yellow-400 text-sm font-body">{error}</p>
        </div>
      )}
    </div>
  )
}
