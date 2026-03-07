import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMode } from '../context/ModeContext'
import { useLanguage } from '../context/LanguageContext'
import { adultService } from '../services/adultService'
import { useTranslation } from '../hooks/useTranslation'
import BottomNav from '../components/BottomNav'

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: '⬡', modes: ['normal', 'adult'] },
  { key: 'modules',   path: '/modules',   icon: '◈', modes: ['normal', 'adult'] },
  { key: 'dailygoal', path: '/dailygoal', icon: '◉', modes: ['normal'] },      // Normal mode only
  { key: 'streak',    path: '/streak',    icon: '🔥', modes: ['adult'] },       // Adult mode only
  { key: 'mood',      path: '/mood',      icon: '◎', modes: ['normal', 'adult'] },
  { key: 'chat',      path: '/chat',      icon: '◐', modes: ['normal', 'adult'] },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, updateUser } = useAuth()
  const { isAdultMode, toggleMode, showGate, setShowGate, isSwitching } = useMode()
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const handleEnableAdult = async () => {
    try {
      await adultService.enable()
      updateUser({ adultModeEnabled: true })
      setShowGate(false)
      toggleMode()
    } catch {
      alert('Failed to enable adult mode. You must be 18 or older.')
      setShowGate(false)
    }
  }

  // Get nav item label with mode-specific overrides
  const getNavLabel = (key: string) => {
    if (key === 'chat') {
      return isAdultMode ? t('chat.adultMode.name') : t('chat.normalMode.name')
    }
    return t(`nav.${key}`)
  }

  // Filter nav items based on current mode
  const visibleNavItems = navItems.filter(item => 
    isAdultMode ? item.modes.includes('adult') : item.modes.includes('normal')
  )

  return (
    <>
      {/* ── Adult Gate Modal ───────────────────────────────────────────────── */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #18000a, #0a0a0a)', border: '1px solid rgba(185,28,28,0.4)' }}>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.25), transparent 70%)', border: '1px solid rgba(185,28,28,0.3)' }}>
                <span className="text-4xl">🔞</span>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-white text-center mb-2">Adult Mode</h2>
            <p className="text-zinc-400 font-body text-sm text-center leading-relaxed mb-6">
              Adult mode unlocks 18+ educational content across all sections of the app — same features, different experience.
            </p>

            <div className="rounded-xl p-4 mb-6 space-y-3"
              style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)' }}>
              <p className="text-red-400 text-xs font-body uppercase tracking-widest mb-2">By continuing you confirm:</p>
              {[
                'I am 18 years of age or older',
                'I understand this is educational, non-explicit content',
                'I consent to viewing adult health & psychology material',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(185,28,28,0.3)', border: '1px solid rgba(185,28,28,0.5)' }}>
                    <span className="text-red-400 text-xs">✓</span>
                  </div>
                  <span className="text-zinc-300 text-sm font-body">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowGate(false)}
                className="flex-1 py-3.5 rounded-xl font-body text-sm text-zinc-400 hover:text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                Cancel
              </button>
              <button onClick={handleEnableAdult}
                className="flex-1 py-3.5 rounded-xl font-body text-sm text-red-200 transition-all"
                style={{ background: 'rgba(185,28,28,0.25)', border: '1px solid rgba(185,28,28,0.5)' }}>
                I Confirm — Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mode Switching Loading Screen ─────────────────────────────────── */}
      {isSwitching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="text-center">
            {/* Animated spinner */}
            <div className="mx-auto mb-6 relative w-24 h-24">
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{
                  background: `conic-gradient(from 0deg, ${isAdultMode ? 'rgba(185,28,28,0.6)' : 'rgba(59,130,246,0.6)'}, rgba(255,255,255,0.1))`,
                  animation: 'spin 1.5s linear infinite',
                }}>
              </div>
              <div className="absolute inset-2 rounded-full"
                style={{ background: 'var(--color-obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-4xl">{isAdultMode ? '🔞' : '📖'}</span>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className="font-display text-xl font-bold text-white">
                {t(isAdultMode ? 'mode.switchToAdult' : 'mode.switchToNormal')}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {t(isAdultMode ? 'mode.loadingAdultContent' : 'mode.loadingNormalContent')}
              </p>
            </div>

            {/* Loading dots animation */}
            <div className="flex justify-center gap-1.5 mt-6">
              {[0, 1, 2].map((i) => (
                <div key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isAdultMode ? 'rgba(185,28,28,0.8)' : 'rgba(59,130,246,0.8)',
                    animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* CSS animations */}
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <div className="flex min-h-screen" style={{ background: 'var(--color-obsidian)' }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="hidden md:flex w-64 flex-col fixed h-screen z-10"
          style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', transition: 'background 400ms ease, border-color 400ms ease' }}>

          {/* Logo */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
            <Link to="/dashboard">
              <h1 className="font-display text-xl font-bold text-gradient">Male परीक्षण</h1>
              <p className="text-xs mt-1 font-body leading-tight" style={{ color: 'var(--color-muted)' }}>
                {t('app.tagline')}
              </p>
            </Link>
            {isAdultMode && (
              <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit"
                style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.3)' }}>
                <span className="text-xs">🔞</span>
                <span className="text-xs font-body" style={{ color: '#fca5a5' }}>{t('mode.adultModeLabel')}</span>
              </div>
            )}
          </div>

          {/* Nav — shows different items based on mode */}
          <nav className="flex-1 p-4 space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Link key={item.key} to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium text-sm transition-all duration-200"
                  style={isActive ? {
                    background: 'var(--mode-badge-bg)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--mode-badge-border)',
                  } : {
                    color: 'var(--color-muted)',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      const el = e.currentTarget as HTMLElement
                      el.style.color = '#fff'
                      el.style.background = 'var(--color-elevated)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      const el = e.currentTarget as HTMLElement
                      el.style.color = 'var(--color-muted)'
                      el.style.background = 'transparent'
                    }
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  {getNavLabel(item.key)}
                </Link>
              )
            })}

            {/* ── Mode Toggle ─────────────────────────────────────────────── */}
            <div className="pt-3 mt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-xs font-body px-4 mb-2 uppercase tracking-widest" style={{ color: 'var(--color-muted)', opacity: 0.6 }}>
                Mode
              </p>
              <button
                onClick={toggleMode}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium text-sm"
                style={isAdultMode ? {
                  background: 'rgba(185,28,28,0.15)',
                  border: '1px solid rgba(185,28,28,0.35)',
                  color: '#fca5a5',
                  transition: 'all 300ms ease',
                } : {
                  background: 'var(--color-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-muted)',
                  transition: 'all 300ms ease',
                }}
              >
                {/* Pill toggle */}
                <div className="relative w-9 h-5 rounded-full flex-shrink-0"
                  style={{ background: isAdultMode ? 'rgba(185,28,28,0.7)' : 'rgba(255,255,255,0.12)', transition: 'background 300ms ease' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full"
                    style={{
                      left: isAdultMode ? '1.2rem' : '0.15rem',
                      background: isAdultMode ? '#fca5a5' : 'rgba(255,255,255,0.5)',
                      transition: 'left 300ms ease, background 300ms ease',
                    }} />
                </div>
                <span>{isAdultMode ? '🔞 ' + t('mode.adultModeLabel') : '📖 ' + t('mode.normalMode')}</span>
              </button>
            </div>

            {/* ── Language Toggle ────────────────────────────────────────── */}
            <div className="pt-3 mt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-xs font-body px-4 mb-2 uppercase tracking-widest" style={{ color: 'var(--color-muted)', opacity: 0.6 }}>
                Language
              </p>
              <div className="flex gap-2 px-4">
                <button
                  onClick={() => setLanguage('en')}
                  className="flex-1 py-2 px-3 rounded-lg font-display font-medium text-sm transition-all duration-300"
                  style={language === 'en' ? {
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: '1px solid var(--color-primary)',
                  } : {
                    background: 'var(--color-elevated)',
                    color: 'var(--color-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className="flex-1 py-2 px-3 rounded-lg font-display font-medium text-sm transition-all duration-300"
                  style={language === 'hi' ? {
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: '1px solid var(--color-primary)',
                  } : {
                    background: 'var(--color-elevated)',
                    color: 'var(--color-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </nav>

          {/* User */}
          <div className="p-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-gold))' }}>
                {user?.email?.[0]?.toUpperCase() || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-medium text-white truncate">
                  {user?.email || 'Guest User'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Age {user?.age || '—'}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-display font-medium text-sm transition-all duration-200"
              style={{ color: 'var(--color-muted)' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#fff'; el.style.background = 'var(--color-elevated)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--color-muted)'; el.style.background = 'transparent' }}
            >
              <span>↩</span>
              {t('nav.logout')}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-64 overflow-y-auto min-h-screen pb-16">
          <div className="max-w-5xl mx-auto p-8">{children}</div>
        </main>

        <BottomNav />
      </div>
    </>
  )
}