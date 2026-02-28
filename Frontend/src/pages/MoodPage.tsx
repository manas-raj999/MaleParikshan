import { useEffect, useState } from 'react'
import { moodService } from '../services/moodService'
import type { MoodType, MoodReport } from '../types'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts'

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#4ade80' },
  { type: 'calm', emoji: '😌', label: 'Calm', color: '#00d4ff' },
  { type: 'focused', emoji: '🎯', label: 'Focused', color: '#4d7cff' },
  { type: 'tired', emoji: '😴', label: 'Tired', color: '#9ca3af' },
  { type: 'anxious', emoji: '😰', label: 'Anxious', color: '#ffb830' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#818cf8' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: '#ff4d6a' },
]

const COLORS: Record<MoodType, string> = { happy:'#4ade80',calm:'#00d4ff',focused:'#4d7cff',tired:'#9ca3af',anxious:'#ffb830',sad:'#818cf8',angry:'#ff4d6a' }

export default function MoodPage() {
  const [selected, setSelected] = useState<MoodType | null>(null)
  const [logged, setLogged] = useState(false)
  const [report, setReport] = useState<MoodReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(true)

  useEffect(() => {
    moodService.getReport().then(setReport).catch(() => {}).finally(() => setReportLoading(false))
  }, [])

  const handleLog = async () => {
    if (!selected) return
    setLoading(true)
    try { await moodService.log(selected) } catch {}
    setLogged(true); setLoading(false)
  }

  const pieData = report ? Object.entries(report.distribution).filter(([,v]) => v > 0).map(([mood, count]) => ({ name: mood, value: count, color: COLORS[mood as MoodType] })) : []

  return (
    <div className="page-content animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>😊</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Mood Tracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 600, color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>

      {/* Daily log */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        {logged ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>{MOODS.find(m => m.type === selected)?.emoji}</span>
            <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, color: '#4ade80' }}>Mood logged!</p>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', marginTop: '0.25rem' }}>Come back tomorrow.</p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>How are you feeling today?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {MOODS.map(m => (
                <button key={m.type} onClick={() => setSelected(m.type)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                  padding: '0.75rem 0.5rem', borderRadius: '0.85rem',
                  background: selected === m.type ? m.color + '22' : '#1e2340',
                  border: `1px solid ${selected === m.type ? m.color + '66' : '#252a4a'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: selected === m.type ? `0 0 12px ${m.color}33` : 'none'
                }}>
                  <span style={{ fontSize: '1.6rem' }}>{m.emoji}</span>
                  <span style={{ fontFamily: 'Nunito', fontSize: '0.7rem', color: selected === m.type ? m.color : '#5a6190' }}>{m.label}</span>
                </button>
              ))}
            </div>
            <button onClick={handleLog} disabled={!selected || loading} className="btn-primary" style={{ width: '100%', opacity: selected ? 1 : 0.4 }}>
              {loading ? 'Logging...' : 'Log Mood'}
            </button>
          </>
        )}
      </div>

      {/* Report */}
      <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Weekly Report</p>
      {reportLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: 24, height: 24, border: '2px solid #4d7cff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : report && pieData.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="card">
            <p style={{ fontFamily: 'Outfit', fontSize: '0.75rem', fontWeight: 600, color: '#5a6190', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>DISTRIBUTION</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#161929', border: '1px solid #252a4a', borderRadius: '8px', fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
              {pieData.map(e => (
                <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Nunito', fontSize: '0.65rem', color: '#5a6190', textTransform: 'capitalize' }}>{e.name}</span>
                </div>
              ))}
            </div>
          </div>
          {report.dominantMood && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#5a6190', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>DOMINANT MOOD</p>
              <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{MOODS.find(m => m.type === report.dominantMood)?.emoji}</span>
              <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', color: COLORS[report.dominantMood] }}>{report.dominantMood}</p>
              <p style={{ fontFamily: 'Nunito', fontSize: '0.7rem', color: '#5a6190', marginTop: '0.3rem' }}>Most this week</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#5a6190' }}>Start logging daily to see your mood report</p>
        </div>
      )}
    </div>
  )
}
