import { useEffect, useState } from 'react'
import { streakService } from '../services/streakService'
import type { Streak } from '../types'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

const MEDALS = [
  { days: 7, label: '7 Days', emoji: '🥇', color: '#ffb830', bg: '#ff7b2e22' },
  { days: 30, label: '30 Days', emoji: '🥈', color: '#9ca3af', bg: '#9ca3af22' },
  { days: 60, label: '60 Days', emoji: '🏆', color: '#ffb830', bg: '#ffb83022' },
  { days: 90, label: '90 Days', emoji: '💜', color: '#a855f7', bg: '#a855f722' },
  { days: 180, label: '180 Days', emoji: '💎', color: '#00d4ff', bg: '#00d4ff22' },
  { days: 365, label: '365+ Days', emoji: '🔴', color: '#ff4d6a', bg: '#ff4d6a22' },
]

const CHART_DATA = [
  { date: 'Apr 14', value: 1 },
  { date: 'Apr 16', value: 3, fire: true },
  { date: 'Apr 18', value: 4, fire: true },
  { date: 'Apr 20', value: 5 },
  { date: 'Apr 22', value: 6, fire: true },
  { date: 'Apr 22', value: 7 },
  { date: 'Apr 24', value: 8, fire: true },
  { date: 'Apr 25', value: 8, fire: true },
  { date: 'Apr 26', value: 9 },
]

function MedalBadge({ medal, earned }: { medal: typeof MEDALS[0]; earned: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
      background: earned ? medal.bg : '#1e2340',
      border: `1px solid ${earned ? medal.color + '44' : '#252a4a'}`,
      borderRadius: '0.85rem',
      padding: '0.6rem 0.4rem',
      opacity: earned ? 1 : 0.5,
      transition: 'all 0.2s',
      flex: 1,
    }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: '50%',
        background: earned ? medal.bg : '#12152a',
        border: `2px solid ${earned ? medal.color : '#252a4a'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem',
        boxShadow: earned ? `0 0 12px ${medal.color}44` : 'none',
      }}>
        {medal.emoji}
      </div>
      <span style={{
        fontFamily: 'Outfit', fontSize: '0.7rem', fontWeight: 600,
        color: earned ? medal.color : '#5a6190', textAlign: 'center'
      }}>{medal.label}</span>
    </div>
  )
}

export default function StreakPage() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [setupMode, setSetupMode] = useState(false)
  const [targetDays, setTargetDays] = useState('30')
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    streakService.get()
      .then(setStreak)
      .catch(() => setSetupMode(true))
      .finally(() => setLoading(false))
  }, [])

  const handleSetup = async () => {
    setLoading(true)
    try {
      const s = await streakService.setup(Number(targetDays))
      setStreak(s)
      setSetupMode(false)
    } catch {
      // demo mode
      setStreak({ currentStreak: 0, longestStreak: 0, targetDays: Number(targetDays) })
      setSetupMode(false)
    } finally { setLoading(false) }
  }

  const handleCheckin = async (status: 'stayed_consistent' | 'resisted_urges' | 'relapsed') => {
    setCheckinLoading(true)
    try {
      const updated = await streakService.checkin(status)
      setStreak(updated)
      setMsg(status === 'relapsed' ? 'Reset. Start again stronger 💪' : 'Great! Keep going! 🔥')
    } catch {
      setMsg(status === 'relapsed' ? 'Reset. Start again stronger 💪' : 'Logged! 🔥')
    } finally {
      setCheckinLoading(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const current = streak?.currentStreak ?? 32
  const longest = streak?.longestStreak ?? 32
  const target = streak?.targetDays ?? 60
  const progress = Math.min((current / target) * 100, 100)
  const nextMilestone = MEDALS.find(m => m.days > current)
  const daysToNext = nextMilestone ? nextMilestone.days - current : 0

  // Calendar: last 14 days
  const today = new Date()
  const calDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (13 - i))
    return { date: d.getDate(), active: i >= 14 - current, dow: ['S','M','T','W','T','F','S'][d.getDay()] }
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #4d7cff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (setupMode) return (
    <div className="page-content animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.3rem' }}>⊡</span>
        <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Streak Page</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌿</span><span style={{ fontFamily: 'Outfit', fontSize: '0.9rem', color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>
      <div className="card">
        <p style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Set Your Target</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {['7','21','30','60','90','365'].map(d => (
            <button key={d} onClick={() => setTargetDays(d)} style={{
              padding: '0.7rem', borderRadius: '0.75rem', fontFamily: 'Outfit', fontWeight: 700,
              background: targetDays === d ? '#4d7cff22' : '#1e2340',
              border: `1px solid ${targetDays === d ? '#4d7cff' : '#252a4a'}`,
              color: targetDays === d ? '#4d7cff' : '#5a6190',
              cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
            }}>{d} days</button>
          ))}
        </div>
        <button onClick={handleSetup} className="btn-primary" style={{ width: '100%' }}>Start Tracking 🔥</button>
      </div>
    </div>
  )

  return (
    <div className="page-content animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>⊡</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Streak Page</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 600, color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>

      {/* Greeting + streak count */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700 }}>Greetings, User!</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '2rem' }}>🏅</span>
              <p style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>
                {current} <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#5a6190' }}>Days Streak</span>
              </p>
            </div>
          </div>
          {/* Toggle */}
          <div style={{
            width: 48, height: 26, borderRadius: 999,
            background: 'linear-gradient(135deg,#4d7cff,#00d4ff)',
            position: 'relative', cursor: 'pointer',
            boxShadow: '0 0 10px rgba(77,124,255,0.4)'
          }}>
            <div style={{
              position: 'absolute', top: 3, left: 24, width: 18, height: 18,
              borderRadius: '50%', background: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
            }} />
          </div>
        </div>
      </div>

      {/* Medals */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700 }}>My medal</p>
          <span style={{ color: '#5a6190', fontSize: '0.8rem' }}>→</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {MEDALS.map(m => (
            <MedalBadge key={m.days} medal={m} earned={current >= m.days} />
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Calendar</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem' }}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontFamily: 'Outfit', fontSize: '0.75rem', color: '#5a6190', fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {calDays.map((day, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono', fontSize: '0.75rem',
                color: day.active ? 'white' : '#5a6190',
                fontWeight: day.active ? 700 : 400
              }}>{day.date}</span>
              {day.active && <span style={{ fontSize: '0.85rem' }}>🔥</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Overall progress + chart */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700 }}>
            Overall <span style={{ color: '#4d7cff' }}>{current}</span>
            <span style={{ color: '#5a6190' }}> / {target} Days</span>
          </p>
        </div>
        <div style={{ height: 6, background: '#1e2340', borderRadius: 99, overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg,#4d7cff,#00d4ff)',
            borderRadius: 99, boxShadow: '0 0 8px rgba(77,124,255,0.4)',
            transition: 'width 1s ease'
          }} />
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis dataKey="date" tick={{ fill: '#5a6190', fontSize: 9, fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#161929', border: '1px solid #252a4a', borderRadius: '8px', fontSize: '0.75rem' }} labelStyle={{ color: '#5a6190' }} />
            <Line type="monotone" dataKey="value" stroke="#4d7cff" strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props
                if (payload.fire) return <text key={cx} x={cx - 7} y={cy - 4} fontSize="13">🔥</text>
                return <circle key={cx} cx={cx} cy={cy} r={3} fill="#4d7cff" />
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        {nextMilestone && (
          <div style={{ marginTop: '0.75rem', background: '#0f1225', borderRadius: '0.75rem', padding: '0.75rem 1rem', border: '1px solid #252a4a' }}>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#c8d0ff', textAlign: 'center' }}>
              Maintain your streak for{' '}
              <strong style={{ color: '#ffb830' }}>{daysToNext} more days</strong>
              {' '}to reach{' '}
              <strong style={{ color: 'white' }}>{nextMilestone.days} Days Rank</strong>.
            </p>
            <div style={{ height: 4, background: '#1e2340', borderRadius: 99, marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.max(5, 100 - (daysToNext / nextMilestone.days) * 100)}%`,
                background: 'linear-gradient(90deg,#4d7cff,#00d4ff)',
                borderRadius: 99
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Check-in buttons */}
      <div className="card">
        <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Daily Check-In</p>
        {msg && (
          <div style={{ background: '#4d7cff22', border: '1px solid #4d7cff44', borderRadius: '0.75rem', padding: '0.6rem 1rem', marginBottom: '0.75rem' }}>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#4d7cff' }}>{msg}</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {[
            { label: 'Consistent', icon: '✓', status: 'stayed_consistent' as const, color: '#4ade80', bg: '#4ade8022' },
            { label: 'Resisted', icon: '🛡', status: 'resisted_urges' as const, color: '#ffb830', bg: '#ffb83022' },
            { label: 'Relapsed', icon: '↩', status: 'relapsed' as const, color: '#ff4d6a', bg: '#ff4d6a22' },
          ].map(b => (
            <button key={b.status} onClick={() => handleCheckin(b.status)} disabled={checkinLoading} style={{
              background: b.bg, border: `1px solid ${b.color}44`,
              borderRadius: '0.75rem', padding: '0.9rem 0.5rem',
              fontFamily: 'Outfit', fontSize: '0.75rem', fontWeight: 700,
              color: b.color, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
              opacity: checkinLoading ? 0.5 : 1
            }}>
              <span style={{ fontSize: '1.3rem' }}>{b.icon}</span>
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
