import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import { moodService } from '../services/moodService'
import { useAuth } from '../context/AuthContext'
import type { MoodType } from '../types'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const DID_YOU_KNOW = [
  { icon: '💡', text: 'Laughing can increase blood flow by 20%, improving cardiovascular function. So, laughter really can be good medicine!' },
  { icon: '💧', text: 'Drinking 2-3 liters of water daily can improve energy levels, focus, and physical performance significantly.' },
  { icon: '🧠', text: 'Regular meditation for just 10 minutes a day can reduce cortisol levels by up to 20%.' },
  { icon: '🌙', text: 'Getting 7-9 hours of sleep is critical for testosterone maintenance and muscle recovery.' },
]

const MOOD_OPTIONS = [
  { type: 'very_sad' as MoodType, emoji: '😞', label: 'Very Sad' },
  { type: 'sad' as MoodType, emoji: '😐', label: 'Sad' },
  { type: 'neutral' as MoodType, emoji: '🙂', label: 'Okay' },
  { type: 'happy' as MoodType, emoji: '😄', label: 'Happy' },
  { type: 'focused' as MoodType, emoji: '😊', label: 'Great' },
]

const STREAK_CHART_DATA = [
  { date: 'Apr 14', value: 1 },
  { date: 'Apr 16', value: 2, fire: true },
  { date: 'Apr 18', value: 3, fire: true },
  { date: 'Apr 20', value: 5 },
  { date: 'Apr 22', value: 6 },
  { date: 'Apr 24', value: 7, fire: true },
  { date: 'Apr 25', value: 8, fire: true },
  { date: 'Apr 26', value: 9 },
]

export default function HomePage() {
  const { user } = useAuth()
  const [streakDays, setStreakDays] = useState(4)
  const [moodLogged, setMoodLogged] = useState(false)
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [didYouKnow] = useState(DID_YOU_KNOW[Math.floor(Math.random() * DID_YOU_KNOW.length)])
  const [adultMode, setAdultMode] = useState(false)

  useEffect(() => {
    dashboardService.get()
      .then(d => setStreakDays(d.currentStreak || 4))
      .catch(() => {})
  }, [])

  const handleMood = async (mood: MoodType) => {
    if (moodLogged) return
    setSelectedMood(mood)
    try { await moodService.log(mood) } catch {}
    setMoodLogged(true)
  }

  return (
    <div className="page-content animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>⊡</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Home</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 600, color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>

      {/* Greetings card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>
              Greetings, {user?.email?.split('@')[0] || 'User'}!
            </p>
          </div>
          {/* Adult mode toggle */}
          <div
            onClick={() => user && user.age >= 18 && setAdultMode(v => !v)}
            style={{
              width: 48, height: 26,
              borderRadius: 999,
              background: adultMode ? 'linear-gradient(135deg,#4d7cff,#00d4ff)' : '#1e2340',
              border: '1px solid #252a4a',
              cursor: user && user.age >= 18 ? 'pointer' : 'not-allowed',
              position: 'relative',
              transition: 'background 0.3s',
              boxShadow: adultMode ? '0 0 10px rgba(77,124,255,0.4)' : 'none'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 3, left: adultMode ? 24 : 3,
              width: 18, height: 18,
              borderRadius: '50%',
              background: 'white',
              transition: 'left 0.3s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
            }} />
          </div>
        </div>

        {/* Did you know */}
        <div style={{
          marginTop: '1rem',
          background: '#0f1225',
          border: '1px solid #252a4a',
          borderRadius: '0.85rem',
          padding: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(90deg,#4d7cff,#00d4ff,transparent)'
          }} />
          <p style={{
            fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 600,
            color: '#5a6190', marginBottom: '0.5rem', letterSpacing: '0.05em'
          }}>Did you know?</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{didYouKnow.icon}</span>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#c8d0ff', lineHeight: 1.5 }}>
              {didYouKnow.text.split('blood flow').map((part, i) =>
                i === 0 ? <span key={i}>{part}<strong style={{ color: 'white' }}>blood flow</strong></span> : <span key={i}>{part}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Tracker + side buttons */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Daily Tracker</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.type}
                onClick={() => handleMood(m.type)}
                disabled={moodLogged}
                title={m.label}
                style={{
                  background: selectedMood === m.type ? '#4d7cff22' : '#1e2340',
                  border: selectedMood === m.type ? '1.5px solid #4d7cff' : '1px solid #252a4a',
                  borderRadius: '50%',
                  width: 44, height: 44,
                  fontSize: '1.3rem',
                  cursor: moodLogged ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: moodLogged && selectedMood !== m.type ? 0.4 : 1,
                  boxShadow: selectedMood === m.type ? '0 0 12px rgba(77,124,255,0.4)' : 'none'
                }}
              >{m.emoji}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <a href="/help" style={{
              background: '#1e2340', border: '1px solid #252a4a',
              borderRadius: '0.6rem', padding: '0.35rem 0.7rem',
              fontFamily: 'Nunito', fontSize: '0.75rem', color: '#c8d0ff',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              textDecoration: 'none', transition: 'border-color 0.2s'
            }}>🛟 Helpline</a>
            <a href="/review" style={{
              background: '#1e2340', border: '1px solid #252a4a',
              borderRadius: '0.6rem', padding: '0.35rem 0.7rem',
              fontFamily: 'Nunito', fontSize: '0.75rem', color: '#c8d0ff',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              textDecoration: 'none'
            }}>⭐ Review Us</a>
          </div>
        </div>

        {/* Daily Challenge */}
        <div style={{ marginTop: '0.85rem', background: '#0f1225', borderRadius: '0.75rem', padding: '0.75rem 1rem', border: '1px solid #252a4a' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Daily Challenge</p>
          {[
            { label: 'Drink water', done: true },
            { label: 'Log mood', done: moodLogged },
          ].map((c) => (
            <div key={c.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.3rem 0', borderBottom: '1px solid #1e2340'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: c.done ? '#4ade80' : '#5a6190', fontSize: '0.9rem' }}>
                  {c.done ? '☑' : '☐'}
                </span>
                <span style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: c.done ? '#c8d0ff' : '#5a6190' }}>{c.label}</span>
              </div>
              <span style={{ color: '#5a6190', fontSize: '0.75rem' }}>›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Streak chart */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700 }}>Login Streak</p>
          <div style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: streakDays }).map((_, i) => (
              <span key={i} style={{ fontSize: '0.9rem' }}>🔥</span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={STREAK_CHART_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#5a6190', fontSize: 10, fontFamily: 'Nunito' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: '#161929', border: '1px solid #252a4a', borderRadius: '8px', fontSize: '0.75rem' }}
              labelStyle={{ color: '#5a6190' }}
              itemStyle={{ color: '#4d7cff' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4d7cff"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props
                if (payload.fire) return <text key={cx} x={cx - 7} y={cy - 4} fontSize="14">🔥</text>
                return <circle key={cx} cx={cx} cy={cy} r={3} fill="#4d7cff" />
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
