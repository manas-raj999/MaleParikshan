import { useEffect, useState, useRef } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardData } from '../types'
import { useAuth } from '../context/AuthContext'

// Circular gauge SVG component
function CircularGauge({ value, max = 100 }: { value: number; max?: number }) {
  const radius = 70
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const pct = Math.min(value / max, 1)

  // gradient arcs: red (0-30%), orange (30-60%), green (60-100%)
  const redEnd = 0.3
  const orangeEnd = 0.6

  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          stroke="#1e2340"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="80"
          cy="80"
        />
        {/* Red segment */}
        <circle
          stroke="#ff4d6a"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * redEnd} ${circumference * (1 - redEnd)}`}
          r={normalizedRadius}
          cx="80"
          cy="80"
          strokeLinecap="round"
          opacity={0.6}
        />
        {/* Orange segment */}
        <circle
          stroke="#ff7b2e"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * (orangeEnd - redEnd)} ${circumference * (1 - (orangeEnd - redEnd))}`}
          strokeDashoffset={-circumference * redEnd}
          r={normalizedRadius}
          cx="80"
          cy="80"
          opacity={0.6}
        />
        {/* Green segment */}
        <circle
          stroke="#4ade80"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * (1 - orangeEnd)} ${circumference * orangeEnd}`}
          strokeDashoffset={-circumference * orangeEnd}
          r={normalizedRadius}
          cx="80"
          cy="80"
          opacity={0.6}
        />
        {/* Active progress */}
        <circle
          stroke={value < 30 ? '#ff4d6a' : value < 60 ? '#ff7b2e' : '#4ade80'}
          fill="transparent"
          strokeWidth={stroke + 2}
          strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
          r={normalizedRadius}
          cx="80"
          cy="80"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${value < 30 ? '#ff4d6a' : value < 60 ? '#ff7b2e' : '#4ade80'})` }}
        />
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
          {value}
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.get()
      .then(setData)
      .catch(() => {
        // Show demo data
        setData({ healthScore: 50, currentStreak: 5, profile: { bmi: 23.4, riskScore: 45, activityLevel: 'Moderate' } })
      })
      .finally(() => setLoading(false))
  }, [])

  const score = data?.healthScore ?? 50
  const streak = data?.currentStreak ?? 0
  const bmi = data?.profile?.bmi ?? 0
  const riskScore = data?.profile?.riskScore ?? 0

  const riskLabel = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High'
  const riskColor = riskScore < 30 ? '#4ade80' : riskScore < 60 ? '#ff7b2e' : '#ff4d6a'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #4d7cff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div className="page-content animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>⊞</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 600, color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>

      {/* Main health score card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Gauge */}
          <CircularGauge value={score} />

          {/* Score label + divider */}
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190', marginBottom: '0.25rem' }}>Health Score</p>
            <p style={{ fontFamily: 'Outfit', fontSize: '3rem', fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: '0.75rem' }}>{score}</p>

            {/* Divider */}
            <div style={{ width: '1px', height: '100%', background: '#252a4a', position: 'absolute' }} />

            {/* Right stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Risk Level */}
              <div className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'white' }}>Risk Level</span>
                <span style={{
                  background: riskColor + '22',
                  color: riskColor,
                  border: `1px solid ${riskColor}44`,
                  borderRadius: '999px',
                  padding: '0.15rem 0.7rem',
                  fontSize: '0.75rem',
                  fontFamily: 'Outfit',
                  fontWeight: 600
                }}>
                  • {riskLabel}
                </span>
              </div>
              {/* BMI */}
              <div className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'white' }}>BMI</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{bmi.toFixed(1)}</span>
              </div>
              {/* Streak */}
              <div className="card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.85rem', color: 'white' }}>Streak</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{streak} Days 🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score progress bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ height: 4, background: '#1e2340', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${score}%`,
              background: score < 30 ? '#ff4d6a' : score < 60 ? '#ff7b2e' : '#4ade80',
              borderRadius: 99,
              transition: 'width 1s ease',
              boxShadow: `0 0 8px ${score < 30 ? '#ff4d6a' : score < 60 ? '#ff7b2e' : '#4ade80'}`
            }} />
          </div>
        </div>
      </div>

      {/* Today's Streak card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>Today's Streak</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <p style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{streak} Days 🔥</p>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', marginTop: '0.2rem' }}>Keep up the good work!</p>
          </div>
          <div style={{ textAlign: 'right', color: '#5a6190', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
            {streak} — 1.00
          </div>
        </div>
        <div style={{ height: 6, background: '#1e2340', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min((streak / 30) * 100, 100)}%`,
            background: 'linear-gradient(90deg, #4d7cff, #00d4ff)',
            borderRadius: 99,
            boxShadow: '0 0 10px rgba(77,124,255,0.4)'
          }} />
        </div>
      </div>

      {/* Quick nav row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {[
          { icon: '📚', label: 'Learn', sub: 'Modules & Articles', path: '/learn', color: '#4d7cff' },
          { icon: '🔥', label: 'Streak', sub: 'Track your days', path: '/streak', color: '#ff7b2e' },
          { icon: '💬', label: 'AI Chat', sub: 'Ask anything', path: '/chat', color: '#00d4ff' },
          { icon: '🔒', label: 'Adult Mode', sub: 'Age 18+ content', path: '/adult', color: '#a855f7' },
        ].map((item) => (
          <a key={item.label} href={item.path} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: `1px solid ${item.color}22`
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>{item.icon}</span>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>{item.label}</p>
              <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190', marginTop: '0.2rem' }}>{item.sub}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
