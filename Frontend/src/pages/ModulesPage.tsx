import { useEffect, useState, useRef } from 'react'
import { modulesService } from '../services/modulesService'
import { adultService } from '../services/adultService'
import { useAuth } from '../context/AuthContext'
import { useMode } from '../context/ModeContext'
import { useTranslation } from '../hooks/useTranslation'
import type { Module } from '../types'

// ── Normal mode styles (blue/teal - warm, educational) ────────────────────────
const NORMAL_STYLES: Record<string, { bg: string; border: string; dot: string; label: string; glow: string }> = {
  'Mental Health':        { bg: 'from-blue-950/90 via-slate-950 to-slate-950',   border: 'border-blue-500/25',   dot: 'bg-blue-400',   label: 'text-blue-300',   glow: 'shadow-blue-900/20' },
  'Coping Mechanisms':    { bg: 'from-teal-950/90 via-slate-950 to-slate-950',   border: 'border-teal-500/25',   dot: 'bg-teal-400',   label: 'text-teal-300',   glow: 'shadow-teal-900/20' },
  'Culture & Upbringing': { bg: 'from-amber-950/90 via-slate-950 to-slate-950',  border: 'border-amber-500/25',  dot: 'bg-amber-400',  label: 'text-amber-300',  glow: 'shadow-amber-900/20' },
  'Help-Seeking':         { bg: 'from-purple-950/90 via-slate-950 to-slate-950', border: 'border-purple-500/25', dot: 'bg-purple-400', label: 'text-purple-300', glow: 'shadow-purple-900/20' },
  'Support & Change':     { bg: 'from-rose-950/90 via-slate-950 to-slate-950',   border: 'border-rose-500/25',   dot: 'bg-rose-400',   label: 'text-rose-300',   glow: 'shadow-rose-900/20' },
}

// ── Adult mode styles (dark red/zinc - serious, clinical) ─────────────────────
const ADULT_STYLES: Record<string, { bg: string; border: string; dot: string; label: string; glow: string }> = {
  'Consent Clarity':          { bg: 'from-red-950/95 via-zinc-950 to-black',    border: 'border-red-800/40',    dot: 'bg-red-500',    label: 'text-red-300',    glow: 'shadow-red-950/40' },
  'Impulse & Self-Control':   { bg: 'from-orange-950/95 via-zinc-950 to-black', border: 'border-orange-800/40', dot: 'bg-orange-500', label: 'text-orange-300', glow: 'shadow-orange-950/40' },
  'Emotional Accountability': { bg: 'from-yellow-950/95 via-zinc-950 to-black', border: 'border-yellow-800/40', dot: 'bg-yellow-600', label: 'text-yellow-300', glow: 'shadow-yellow-950/40' },
  'Harm Prevention':          { bg: 'from-zinc-900/95 via-zinc-950 to-black',   border: 'border-zinc-600/40',   dot: 'bg-zinc-400',   label: 'text-zinc-300',   glow: 'shadow-zinc-900/40' },
  'Self-Regulation':          { bg: 'from-slate-900/95 via-zinc-950 to-black',  border: 'border-slate-600/40',  dot: 'bg-slate-300',  label: 'text-slate-200',  glow: 'shadow-slate-900/40' },
}

const DEFAULT_N = { bg: 'from-slate-900 to-slate-950', border: 'border-slate-500/25', dot: 'bg-slate-400', label: 'text-slate-300', glow: '' }
const DEFAULT_A = { bg: 'from-zinc-900 to-black',      border: 'border-red-900/40',   dot: 'bg-red-700',   label: 'text-red-400',   glow: 'shadow-red-950/30' }

const NORMAL_EMOJI: Record<string, string> = {
  'Mental Health': '🧠', 'Coping Mechanisms': '🛡',
  'Culture & Upbringing': '🏛', 'Help-Seeking': '🩺', 'Support & Change': '🌱',
}
const ADULT_EMOJI: Record<string, string> = {
  'Consent Clarity': '🤝', 'Impulse & Self-Control': '⚡',
  'Emotional Accountability': '🪞', 'Harm Prevention': '🚨', 'Self-Regulation': '💎',
}

export default function ModulesPage() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const { isAdultMode, toggleMode, setShowGate: setModeGate } = useMode()
  const [allModules, setAllModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showGate, setShowGate] = useState(false)
  const [enablingAdult, setEnablingAdult] = useState(false)
  const [current, setCurrent] = useState(0)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [speaking, setSpeaking] = useState(false)
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [error, setError] = useState('')
  const dragStart = useRef<number | null>(null)

  useEffect(() => {
    modulesService.getAll()
      .then((data) => {
        setAllModules(data)
        const done = new Set<string>()
        data.forEach((m: Module) => { if (m.progress?.[0]?.completed) done.add(m.id) })
        setCompleted(done)
      })
      .catch(() => setError('Failed to load modules.'))
      .finally(() => setLoading(false))
  }, [])

  // Reset to first card when switching modes
  useEffect(() => { setCurrent(0) }, [isAdultMode])

  // Stop TTS on card change
  useEffect(() => { window.speechSynthesis?.cancel(); setSpeaking(false) }, [current, isAdultMode])

  // Filter modules: Use ModeContext state for real-time mode switching
  const modules = allModules
    .filter(m => {
      // If user is in adult mode, show only adult modules
      if (isAdultMode) {
        return m.isAdultOnly === true
      }
      // Otherwise (normal mode), show only non-adult modules
      return m.isAdultOnly === false
    })
    .sort((a, b) => a.order - b.order)

  // ── Adult gate ─────────────────────────────────────────────────────────────
  const handleEnableAdult = async () => {
    if (!user?.age || user.age < 18) {
      setError('You must be 18 or older to enable adult mode.')
      setShowGate(false)
      return
    }
    setEnablingAdult(true)
    try {
      await adultService.enable()
      updateUser({ adultModeEnabled: true })
      setShowGate(false)
      // Let ModeContext handle the actual mode toggle via the sidebar button
      setModeGate(true)
    } catch {
      setError('Failed to enable adult mode.')
    } finally {
      setEnablingAdult(false)
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goTo = (dir: 'left' | 'right') => {
    if (isAnimating || !modules.length) return
    const next = dir === 'right' ? current + 1 : current - 1
    if (next < 0 || next >= modules.length) return
    setSwipeDir(dir)
    setIsAnimating(true)
    setTimeout(() => { setCurrent(next); setSwipeDir(null); setIsAnimating(false) }, 260)
  }

  const onTouchStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!dragStart.current) return
    const d = e.changedTouches[0].clientX - dragStart.current
    if (d < -50) goTo('right'); else if (d > 50) goTo('left')
    dragStart.current = null
  }
  const onMouseDown = (e: React.MouseEvent) => { dragStart.current = e.clientX }
  const onMouseUp = (e: React.MouseEvent) => {
    if (!dragStart.current) return
    const d = e.clientX - dragStart.current
    if (Math.abs(d) > 50) d < 0 ? goTo('right') : goTo('left')
    dragStart.current = null
  }

  const toggleSave = (id: string) => setSaved(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const handleComplete = async (id: string) => {
    setCompleting(true)
    try { await modulesService.markComplete(id); setCompleted(p => new Set([...p, id])) }
    catch { setError('Failed to mark complete.') }
    finally { setCompleting(false) }
  }

  const handleListen = (text: string) => {
    if (!('speechSynthesis' in window)) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-IN'; u.rate = 0.88
    u.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(u)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isAdultMode ? 'border-red-500' : 'border-accent'}`} />
    </div>
  )

  const mod = modules[current]
  const emojiMap = isAdultMode ? ADULT_EMOJI : NORMAL_EMOJI
  const getStyle = (cat: string) => isAdultMode ? (ADULT_STYLES[cat] ?? DEFAULT_A) : (NORMAL_STYLES[cat] ?? DEFAULT_N)
  const style = mod ? getStyle(mod.category) : (isAdultMode ? DEFAULT_A : DEFAULT_N)
  const doneInMode = modules.filter(m => completed.has(m.id)).length
  const pct = modules.length > 0 ? (doneInMode / modules.length) * 100 : 0
  const categories = [...new Set(modules.map(m => m.category))]

  return (
    <div className="space-y-5 animate-fade-up select-none">

      {/* ══ ADULT GATE MODAL ════════════════════════════════════════════════════ */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl" style={{ background: 'linear-gradient(135deg, #18000a 0%, #0a0a0a 100%)', border: '1px solid rgba(185,28,28,0.4)' }}>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.3) 0%, rgba(0,0,0,0) 70%)', border: '1px solid rgba(185,28,28,0.3)' }}>
                <span className="text-4xl">🔞</span>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-white text-center mb-2">Adult Learning Mode</h2>
            <p className="text-zinc-400 font-body text-sm text-center leading-relaxed mb-6">
              This section contains psychological and educational content about consent, impulse regulation, harm prevention, and accountability. It is intended for adults only.
            </p>

            {/* Checklist */}
            <div className="rounded-xl p-4 mb-6 space-y-3" style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)' }}>
              <p className="text-red-400 text-xs font-body uppercase tracking-widest mb-3">By continuing you confirm:</p>
              {[
                'I am 18 years of age or older',
                'I understand this is educational, non-explicit content',
                'I consent to viewing adult health & psychology material',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(185,28,28,0.3)', border: '1px solid rgba(185,28,28,0.5)' }}>
                    <span className="text-red-400 text-xs">✓</span>
                  </div>
                  <span className="text-zinc-300 text-sm font-body">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGate(false)}
                className="flex-1 py-3.5 rounded-xl font-body text-sm text-zinc-400 transition-all duration-200 hover:text-white"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleEnableAdult}
                disabled={enablingAdult}
                className="flex-1 py-3.5 rounded-xl font-body text-sm text-red-200 transition-all duration-200 disabled:opacity-50"
                style={{ background: 'rgba(185,28,28,0.25)', border: '1px solid rgba(185,28,28,0.5)' }}
              >
                {enablingAdult ? 'Enabling...' : 'I Confirm — Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className={`font-display text-3xl font-bold transition-all duration-500 ${isAdultMode ? 'text-red-100' : 'text-white'}`}>
              {isAdultMode ? t('modules.adultHub') : t('modules.knowledgeHub')}
            </h1>
            {isAdultMode && (
              <span className="text-xs px-2 py-0.5 rounded-full font-body" style={{ background: 'rgba(185,28,28,0.2)', border: '1px solid rgba(185,28,28,0.4)', color: '#fca5a5' }}>
                18+
              </span>
            )}
          </div>
          <p className="text-muted font-body text-sm">
            {isAdultMode ? t('modules.adultSubtitle') : t('modules.normalSubtitle')}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-red-400 text-sm font-body">{error}</p>
          <button onClick={() => setError('')} className="text-red-500/60 hover:text-red-400 text-xs ml-3">✕</button>
        </div>
      )}

      {/* ══ PROGRESS BAR ════════════════════════════════════════════════════════ */}
      <div
        className="flex items-center gap-4 p-4 rounded-xl transition-all duration-500"
        style={isAdultMode
          ? { background: 'rgba(10,0,5,0.8)', border: '1px solid rgba(185,28,28,0.2)' }
          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
        }
      >
        <div className="flex-shrink-0 text-right">
          <p className={`font-mono text-xl font-bold ${isAdultMode ? 'text-red-400' : 'text-accent'}`}>
            {doneInMode}<span className="text-muted text-sm">/{modules.length}</span>
          </p>
          <p className="text-muted text-xs font-body">done</p>
        </div>
        <div className="flex-1">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isAdultMode ? 'rgba(185,28,28,0.15)' : 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: isAdultMode
                  ? 'linear-gradient(90deg, #7f1d1d, #dc2626)'
                  : 'linear-gradient(90deg, #06b6d4, #2dd4bf)',
              }}
            />
          </div>
        </div>
        <p className={`font-mono text-sm flex-shrink-0 ${isAdultMode ? 'text-red-600' : 'text-muted'}`}>{Math.round(pct)}%</p>
      </div>

      {/* ══ CATEGORY TABS ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(cat => {
          const s = getStyle(cat)
          const catMods = modules.filter(m => m.category === cat)
          const catDone = catMods.filter(m => completed.has(m.id)).length
          const isActive = mod?.category === cat
          return (
            <button
              key={cat}
              onClick={() => { const i = modules.findIndex(m => m.category === cat); if (i !== -1) setCurrent(i) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-all duration-200"
              style={isActive
                ? { border: `1px solid ${isAdultMode ? 'rgba(185,28,28,0.5)' : 'rgba(99,102,241,0.4)'}`, background: isAdultMode ? 'rgba(185,28,28,0.1)' : 'rgba(99,102,241,0.08)', color: isAdultMode ? '#fca5a5' : '#a5b4fc' }
                : { border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: '#6b7280' }
              }
            >
              {emojiMap[cat] ?? '📖'} {cat}
              <span className="opacity-40 font-mono ml-0.5">{catDone}/{catMods.length}</span>
            </button>
          )
        })}
      </div>

      {/* ══ CARD STACK ══════════════════════════════════════════════════════════ */}
      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-4xl">📚</p>
          <p className="font-display text-lg font-bold text-white">{t('modules.noModules')}</p>
          <p className="text-muted text-sm font-body">{t('modules.runSeedLabel')} <code className="text-accent bg-surface px-2 py-0.5 rounded">npm run seed</code> {t('modules.runSeed')}</p>
        </div>
      ) : (
        <div className="relative pb-2">
          {/* Shadow depth cards */}
          {current < modules.length - 1 && (
            <div className="absolute inset-x-3 -bottom-1 h-full rounded-2xl -z-10" style={{ background: isAdultMode ? 'rgba(30,0,0,0.5)' : 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }} />
          )}
          {current < modules.length - 2 && (
            <div className="absolute inset-x-6 -bottom-2 h-full rounded-2xl -z-20" style={{ background: isAdultMode ? 'rgba(20,0,0,0.4)' : 'rgba(255,255,255,0.005)', border: '1px solid rgba(255,255,255,0.02)' }} />
          )}

          {/* ── NORMAL MODE CARD ── */}
          {!isAdultMode && (
            <div
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown} onMouseUp={onMouseUp}
              className={`relative w-full min-h-[400px] rounded-2xl p-7 flex flex-col cursor-grab active:cursor-grabbing transition-all duration-260 shadow-xl ${style.glow} bg-gradient-to-br ${style.bg} border ${style.border} ${
                swipeDir === 'left'  ? '-translate-x-10 opacity-0 -rotate-1' :
                swipeDir === 'right' ? 'translate-x-10 opacity-0 rotate-1'  :
                'translate-x-0 opacity-100 rotate-0'
              }`}
            >
              {/* Card top row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className={`text-xs font-body uppercase tracking-widest ${style.label}`}>
                    {NORMAL_EMOJI[mod.category] ?? '📖'} {mod.category}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted bg-white/5 px-2.5 py-1 rounded-lg">
                  {String(current + 1).padStart(2, '0')} / {String(modules.length).padStart(2, '0')}
                </span>
              </div>

              <h2 className="font-display text-xl font-bold text-white leading-snug mb-5">{mod.title}</h2>

              <p className="font-body text-white/60 text-sm leading-relaxed flex-1 whitespace-pre-line">{mod.description}</p>

              {completed.has(mod.id) && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-5 h-5 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center">
                    <span className="text-teal text-xs">✓</span>
                  </div>
                  <span className="text-teal text-xs font-body">Marked as read</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-5 pt-5 border-t border-white/8 flex-wrap">
                <button onClick={() => handleListen(`${mod.title}. ${mod.description}`)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-body transition-all duration-200 ${speaking ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/8 bg-black/20 text-muted hover:text-white hover:border-white/15'}`}>
                  {speaking ? '⏹' : '🔊'} {speaking ? 'Stop' : 'Listen'}
                </button>
                <button onClick={() => toggleSave(mod.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-body transition-all duration-200 ${saved.has(mod.id) ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' : 'border-white/8 bg-black/20 text-muted hover:text-white hover:border-white/15'}`}>
                  {saved.has(mod.id) ? '★' : '☆'} {saved.has(mod.id) ? 'Saved' : 'Save'}
                </button>
                {!completed.has(mod.id) && (
                  <button onClick={() => handleComplete(mod.id)} disabled={completing}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal/30 bg-teal/5 hover:bg-teal/10 text-teal text-xs font-body transition-all duration-200 disabled:opacity-50">
                    {completing ? '...' : '✓ Mark Read'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── ADULT MODE CARD — completely different look ── */}
          {isAdultMode && (
            <div
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown} onMouseUp={onMouseUp}
              className={`relative w-full min-h-[420px] rounded-2xl flex flex-col cursor-grab active:cursor-grabbing transition-all duration-260 ${
                swipeDir === 'left'  ? '-translate-x-10 opacity-0 -rotate-1' :
                swipeDir === 'right' ? 'translate-x-10 opacity-0 rotate-1'  :
                'translate-x-0 opacity-100 rotate-0'
              }`}
              style={{
                background: `linear-gradient(145deg, ${
                  mod.category === 'Consent Clarity' ? '#1a0008, #000' :
                  mod.category === 'Impulse & Self-Control' ? '#1a0800, #000' :
                  mod.category === 'Emotional Accountability' ? '#1a1400, #000' :
                  mod.category === 'Harm Prevention' ? '#111118, #000' :
                  '#0a0a14, #000'
                })`,
                border: `1px solid ${style.border.replace('border-', '').replace('/40', '')}`,
                boxShadow: '0 25px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
            >
              {/* Red top accent line */}
              <div className="w-full h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${style.dot.replace('bg-', 'var(--tw-gradient-to, ')})`, opacity: 0.6 }} />

              <div className="p-7 flex flex-col flex-1">
                {/* Card top */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} style={{ boxShadow: `0 0 8px currentColor` }} />
                    <span className={`text-xs font-body uppercase tracking-[0.15em] ${style.label}`}>
                      {ADULT_EMOJI[mod.category] ?? '🔴'} {mod.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.3)', color: '#fca5a5' }}>
                      🔞 18+
                    </span>
                    <span className="font-mono text-xs text-zinc-600">
                      {String(current + 1).padStart(2, '0')}/{String(modules.length).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Question style title */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'rgba(185,28,28,0.2)', border: '1px solid rgba(185,28,28,0.3)' }}>
                      <span className="text-red-400 text-sm font-mono font-bold">Q</span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-white leading-snug">{mod.title}</h2>
                  </div>
                </div>

                {/* Answer section */}
                <div className="flex-1 rounded-xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-body">{mod.description}</p>
                </div>

                {completed.has(mod.id) && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <span className="text-green-400/70 text-xs font-body">Marked as read</span>
                  </div>
                )}

                {/* Adult mode actions */}
                <div className="flex items-center gap-2 pt-4 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button onClick={() => handleListen(`${mod.title}. ${mod.description}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body transition-all duration-200"
                    style={speaking
                      ? { background: 'rgba(185,28,28,0.2)', border: '1px solid rgba(185,28,28,0.4)', color: '#fca5a5' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b7280' }
                    }
                  >
                    {speaking ? '⏹' : '🔊'} {speaking ? 'Stop' : 'Listen'}
                  </button>

                  <button onClick={() => toggleSave(mod.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body transition-all duration-200"
                    style={saved.has(mod.id)
                      ? { background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#fbbf24' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b7280' }
                    }
                  >
                    {saved.has(mod.id) ? '★' : '☆'} {saved.has(mod.id) ? 'Saved' : 'Save Insight'}
                  </button>

                  {!completed.has(mod.id) && (
                    <button onClick={() => handleComplete(mod.id)} disabled={completing}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body transition-all duration-200 disabled:opacity-40"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}
                    >
                      {completing ? '...' : '✓ Mark Read'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ NAVIGATION ══════════════════════════════════════════════════════════ */}
      {modules.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => goTo('left')} disabled={current === 0 || isAnimating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-body text-sm transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#9ca3af' }}>
            ← Prev
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1 flex-wrap justify-center flex-1">
            {modules.map((m, i) => (
              <button key={m.id} onClick={() => setCurrent(i)} title={m.title}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '20px' : '8px',
                  height: '8px',
                  background: i === current
                    ? (isAdultMode ? '#dc2626' : '#06b6d4')
                    : completed.has(m.id)
                    ? (isAdultMode ? 'rgba(185,28,28,0.5)' : 'rgba(45,212,191,0.4)')
                    : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          <button onClick={() => goTo('right')} disabled={current === modules.length - 1 || isAnimating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-body text-sm transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#9ca3af' }}>
            Next →
          </button>
        </div>
      )}

      {/* ══ SAVED PANEL ═════════════════════════════════════════════════════════ */}
      {saved.size > 0 && (
        <div className="rounded-xl p-5" style={isAdultMode
          ? { background: 'rgba(10,0,0,0.8)', border: '1px solid rgba(185,28,28,0.2)' }
          : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(234,179,8,0.15)' }
        }>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-display text-sm font-semibold uppercase tracking-widest ${isAdultMode ? 'text-red-400' : 'text-yellow-400'}`}>
              ★ Saved Insights ({saved.size})
            </h3>
            <button onClick={() => setSaved(new Set())} className="text-muted hover:text-white text-xs font-body transition-colors">Clear</button>
          </div>
          {allModules.filter(m => saved.has(m.id)).map(m => {
            const handleSavedClickMode = () => {
              // If module is adult only and we're not in adult mode, try to switch
              if (m.isAdultOnly && !isAdultMode) {
                if (user?.adultModeEnabled) {
                  toggleMode()
                } else {
                  setShowGate(true)
                }
              }
              setTimeout(() => setCurrent(modules.indexOf(m)), 50)
            }
            return (
              <div key={m.id} onClick={handleSavedClickMode}
                className="flex items-center justify-between py-2 cursor-pointer hover:opacity-70 transition-opacity"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div>
                  <p className="text-white text-sm font-body">{m.title}</p>
                  <p className="text-muted text-xs font-body">{m.isAdultOnly ? '🔞' : '📖'} {m.category}</p>
                </div>
                <span className={`text-xs ${isAdultMode ? 'text-red-500' : 'text-yellow-500'}`}>→</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ══ COMPLETION SCREEN ═══════════════════════════════════════════════════ */}
      {modules.length > 0 && doneInMode === modules.length && (
        <div className="rounded-2xl p-10 text-center" style={isAdultMode
          ? { background: 'linear-gradient(135deg, rgba(30,0,0,0.8), rgba(0,0,0,0.9))', border: '1px solid rgba(185,28,28,0.3)' }
          : { background: 'linear-gradient(135deg, rgba(6,182,212,0.05), rgba(45,212,191,0.05))', border: '1px solid rgba(6,182,212,0.2)' }
        }>
          <p className="text-5xl mb-3">{isAdultMode ? '💎' : '🎉'}</p>
          <p className="font-display text-xl font-bold text-white mb-2">
            {isAdultMode ? 'Module Complete' : 'Knowledge Hub Complete!'}
          </p>
          <p className="text-muted text-sm font-body max-w-sm mx-auto">
            {isAdultMode
              ? 'You\'ve completed all 18 adult learning cards. Apply these principles with intention.'
              : 'You\'ve gone through all 18 research-backed insights. Keep applying them in daily life.'}
          </p>
        </div>
      )}
    </div>
  )
}