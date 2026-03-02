import { useEffect, useState } from 'react'
import { moodService } from '../services/moodService'
import type { MoodType, MoodReport } from '../types'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { useTranslation } from '../hooks/useTranslation'

const MOODS = [
  { type: 'calm' as MoodType,      emoji: '😌', label: 'Calm' },
  { type: 'confident' as MoodType, emoji: '💪', label: 'Confident' },
  { type: 'neutral' as MoodType,   emoji: '😐', label: 'Neutral' },
  { type: 'low' as MoodType,       emoji: '😔', label: 'Low' },
  { type: 'angry' as MoodType,     emoji: '😠', label: 'Angry' },
]

const MOOD_COLORS: Record<MoodType, string> = {
  calm:      '#60a5fa',
  confident: '#2dd4bf',
  neutral:   '#94a3b8',
  low:       '#818cf8',
  angry:     '#f87171',
}

export default function MoodPage() {
  const { t } = useTranslation()
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [logged, setLogged] = useState(false)
  const [report, setReport] = useState<MoodReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    moodService.getReport()
      .then(setReport)
      .catch(() => {})
      .finally(() => setReportLoading(false))
  }, [])

  const handleLog = async () => {
    if (!selectedMood) return
    setLoading(true)
    setError('')
    try {
      await moodService.log(selectedMood)
      setLogged(true)
    } catch {
      setError('Failed to log mood. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fixed: safe check before Object.entries — was crashing when distribution was null/undefined
  const pieData = report?.distribution && Object.keys(report.distribution).length > 0
    ? Object.entries(report.distribution)
        .filter(([, v]) => v > 0)
        .map(([mood, count]) => ({
          name: mood,
          value: count,
          color: MOOD_COLORS[mood as MoodType] ?? '#94a3b8',
        }))
    : []

  // ✅ Fixed: safe check on weeklyTrend array
  const barData = Array.isArray(report?.weeklyTrend) && report.weeklyTrend.length > 0
    ? report.weeklyTrend.slice(-7).map((entry, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
          new Date(entry.date).getDay()
        ] || `D${i + 1}`,
        mood: entry.mood,
        value: 1,
        fill: MOOD_COLORS[entry.mood as MoodType] ?? '#94a3b8',
      }))
    : []

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">{t('mood.title')}</h1>
        <p className="text-muted font-body text-sm">Track your emotional state daily</p>
      </div>

      {/* Daily log */}
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-white mb-2">
          {logged ? t('mood.alreadyLogged') : t('mood.logToday')}
        </h2>

        {logged ? (
          <div className="text-center py-8">
            <p className="text-5xl mb-4">{MOODS.find(m => m.type === selectedMood)?.emoji}</p>
            <p className="font-display text-lg font-semibold text-teal">Mood logged successfully!</p>
            <p className="text-muted text-sm font-body mt-2">Come back tomorrow to log again.</p>
          </div>
        ) : (
          <>
            <p className="text-muted text-sm font-body mb-6">Select your current mood</p>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {MOODS.map((m) => (
                <button
                  key={m.type}
                  onClick={() => setSelectedMood(m.type)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200 ${
                    selectedMood === m.type
                      ? 'bg-elevated border-accent scale-105'
                      : 'bg-surface border-border hover:border-subtle'
                  }`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-body text-muted">{m.label}</span>
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm font-body mb-4">{error}</p>}

            <button
              onClick={handleLog}
              disabled={!selectedMood || loading}
              className="btn-primary py-4 px-8 disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log Mood'}
            </button>
          </>
        )}
      </div>

      {/* Weekly report */}
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-4">{t('mood.report')}</h2>

        {reportLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Pie chart */}
            <div className="card">
              <h3 className="font-display text-sm font-semibold text-muted uppercase tracking-widest mb-4">
                {t('mood.distribution')}
              </h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: '8px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                        <span className="text-xs text-muted font-body capitalize">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">😶</p>
                  <p className="text-muted text-sm font-body">No mood data yet</p>
                  <p className="text-muted text-xs font-body mt-1">Log your first mood above!</p>
                </div>
              )}
            </div>

            {/* Bar chart */}
            <div className="card">
              <h3 className="font-display text-sm font-semibold text-muted uppercase tracking-widest mb-4">
                Weekly Trend
              </h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={20}>
                    <XAxis
                      dataKey="day"
                      tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'DM Sans' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value: unknown, name: unknown, props: { payload?: { mood?: string } }) => [props.payload?.mood ?? '', 'Mood']}
                      contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-muted text-sm font-body">No trend data yet</p>
                  <p className="text-muted text-xs font-body mt-1">Log moods daily to see trends!</p>
                </div>
              )}
            </div>

            {/* Dominant mood — only show when data exists */}
            {report?.dominantMood && pieData.length > 0 && (
              <div className="col-span-2 card border-gradient">
                <p className="text-muted text-xs font-body uppercase tracking-widest mb-2">
                  Most Common Mood
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">
                    {MOODS.find(m => m.type === report.dominantMood)?.emoji}
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold text-white capitalize">
                      {report.dominantMood}
                    </p>
                    <p className="text-muted text-sm font-body">
                      This has been your dominant emotional state
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state when no logs at all */}
            {pieData.length === 0 && barData.length === 0 && (
              <div className="col-span-2 card text-center py-12">
                <p className="text-4xl mb-3">🌱</p>
                <p className="font-display text-lg font-semibold text-white mb-2">
                  Start your mood journey
                </p>
                <p className="text-muted text-sm font-body">
                  Log your first mood above to start seeing your emotional patterns here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}