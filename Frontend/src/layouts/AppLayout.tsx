import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import BottomNav from '../components/BottomNav'

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: '⬡' },
  { key: 'modules', path: '/modules', icon: '◈' },
  { key: 'streak', path: '/streak', icon: '◉' },
  { key: 'mood', path: '/mood', icon: '◎' },
  { key: 'chat', path: '/chat', icon: '◐' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-obsidian">
      {/* Sidebar - hidden on small screens */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-border flex-col fixed h-screen z-10">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard">
            <h1 className="font-display text-xl font-bold text-gradient">
              {t('app.name')}
            </h1>
            <p className="text-xs text-muted mt-1 font-body leading-tight">
              {t('app.tagline')}
            </p>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted hover:text-white hover:bg-elevated'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {t(`nav.${item.key}`)}
              </Link>
            )
          })}

          {/* Adult Mode */}
          {user?.age && user.age >= 18 && (
            <Link
              to="/adult"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium text-sm transition-all duration-200 ${
                location.pathname === '/adult'
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-muted hover:text-white hover:bg-elevated'
              }`}
            >
              <span className="text-base">◈</span>
              {t('adult.title')}
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-xs font-display font-bold text-white">
              {user?.email?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-medium text-white truncate">
                {user?.email || 'Guest User'}
              </p>
              <p className="text-xs text-muted">
                Age {user?.age || '—'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted hover:text-white hover:bg-elevated font-display font-medium text-sm transition-all duration-200"
          >
            <span>↩</span>
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 overflow-y-auto min-h-screen pb-16">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
      {/* bottom navigation for mobile */}
      <BottomNav />
    </div>
  )
}
