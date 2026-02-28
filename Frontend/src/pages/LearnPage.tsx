import { useEffect, useState } from 'react'
import { modulesService } from '../services/modulesService'
import type { Module } from '../types'

const LEARN_TODAY = [
  { id: 'hygiene', icon: '🧼', title: 'Hygiene Module', subtitle: '', color: '#4d7cff' },
  { id: 'emotional', icon: '😊', title: 'Emotional', subtitle: 'Module', color: '#00d4ff' },
  { id: 'selfcheck', icon: '➕', title: 'Self Check', subtitle: 'Module', color: '#4ade80' },
]

const KNOWLEDGE_HUB_TOPICS = [
  { icon: '🧬', title: 'Sexual Health Basics', desc: '5 min read', category: 'Health' },
  { icon: '💪', title: 'Building Physical Strength', desc: '8 min read', category: 'Fitness' },
  { icon: '🧠', title: 'Mental Wellness Guide', desc: '6 min read', category: 'Mental' },
  { icon: '😴', title: 'Sleep Optimization', desc: '4 min read', category: 'Lifestyle' },
  { icon: '🥗', title: 'Nutrition for Men', desc: '7 min read', category: 'Nutrition' },
  { icon: '💼', title: 'Stress Management at Work', desc: '5 min read', category: 'Mental' },
]

export default function LearnPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [expandedHub, setExpandedHub] = useState(false)
  const [completing, setCompleting] = useState<string | null>(null)
  const [expandedMod, setExpandedMod] = useState<string | null>(null)

  useEffect(() => {
    modulesService.getAll().then(setModules).catch(() => {})
  }, [])

  const handleComplete = async (id: string) => {
    setCompleting(id)
    try {
      await modulesService.markComplete(id)
      setModules(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m))
    } catch {}
    finally { setCompleting(null) }
  }

  return (
    <div className="page-content animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>⊞</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Learn Page</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 600, color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>

      {/* Learn Today */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.3rem' }}>📖</span>
          <p style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700 }}>Learn Today</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {LEARN_TODAY.map((item) => (
            <div
              key={item.id}
              onClick={() => setExpandedMod(expandedMod === item.id ? null : item.id)}
              style={{
                background: '#0f1225',
                border: `1px solid ${expandedMod === item.id ? item.color + '44' : '#252a4a'}`,
                borderRadius: '1rem',
                padding: '1rem 0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: 120,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: expandedMod === item.id ? `0 0 15px ${item.color}22` : 'none'
              }}
            >
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem' }}>{item.icon}</span>
              <div>
                <p style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{item.title}</p>
                {item.subtitle && <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190' }}>{item.subtitle}</p>}
              </div>
              <span style={{ color: '#5a6190', fontSize: '0.9rem', marginTop: '0.5rem' }}>›</span>
            </div>
          ))}
        </div>

        {/* Knowledge Hub toggle */}
        <button
          onClick={() => setExpandedHub(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Nunito', fontSize: '0.85rem', color: '#5a6190',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: 0, transition: 'color 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c8d0ff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5a6190')}
        >
          <span style={{ fontSize: '0.9rem' }}>{expandedHub ? '−' : '+'}</span>
          Knowledge Hub
        </button>
      </div>

      {/* Knowledge Hub articles */}
      {expandedHub && (
        <div className="card" style={{ marginBottom: '1rem', animation: 'fadeUp 0.3s ease forwards' }}>
          <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Knowledge Hub</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {KNOWLEDGE_HUB_TOPICS.map((t) => (
              <div key={t.title} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#0f1225', border: '1px solid #252a4a',
                borderRadius: '0.75rem', padding: '0.75rem 1rem',
                cursor: 'pointer', transition: 'border-color 0.2s'
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#4d7cff44')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#252a4a')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                  <div>
                    <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{t.title}</p>
                    <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190' }}>{t.desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{
                    background: '#1e2340', border: '1px solid #252a4a',
                    borderRadius: 999, padding: '0.15rem 0.5rem',
                    fontFamily: 'Outfit', fontSize: '0.65rem', color: '#5a6190'
                  }}>{t.category}</span>
                  <span style={{ color: '#5a6190', fontSize: '0.9rem' }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API modules */}
      {modules.length > 0 && (
        <div>
          <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#5a6190' }}>
            All Modules
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {modules.map((mod, i) => (
              <div key={mod.id} className="card" style={{
                cursor: 'pointer',
                border: `1px solid ${mod.completed ? '#4ade8022' : '#252a4a'}`,
                animationDelay: `${i * 0.04}s`
              }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setExpandedMod(expandedMod === mod.id ? null : mod.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '0.6rem',
                      background: mod.completed ? '#4ade8022' : '#1e2340',
                      border: `1px solid ${mod.completed ? '#4ade8044' : '#252a4a'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: mod.completed ? '#4ade80' : '#5a6190',
                      fontWeight: 700, flexShrink: 0
                    }}>
                      {mod.completed ? '✓' : String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{mod.title}</p>
                      <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190' }}>{mod.duration} · {mod.category}</p>
                    </div>
                  </div>
                  {mod.completed && (
                    <span style={{
                      background: '#4ade8022', border: '1px solid #4ade8044', color: '#4ade80',
                      borderRadius: 999, padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontFamily: 'Outfit', fontWeight: 700
                    }}>Done</span>
                  )}
                </div>
                {expandedMod === mod.id && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #252a4a' }}>
                    <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#c8d0ff', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      {mod.description}
                    </p>
                    {!mod.completed && (
                      <button
                        onClick={() => handleComplete(mod.id)}
                        disabled={completing === mod.id}
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                      >
                        {completing === mod.id ? 'Saving...' : '✓ Mark Complete'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
