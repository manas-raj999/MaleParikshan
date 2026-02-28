import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { path: '/home', icon: '🏠', label: 'Home' },
  { path: '/learn', icon: '📖', label: 'Learn' },
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a' }}>
      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/home' && location.pathname === '/') ||
              (item.path === '/learn' && location.pathname.startsWith('/modules')) ||
              (item.path === '/learn' && location.pathname.startsWith('/learn')) ||
              (item.path === '/dashboard' && location.pathname === '/dashboard') ||
              (item.path === '/chat' && location.pathname === '/chat') ||
              (item.path === '/profile' && location.pathname === '/profile')
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path === '/home' ? '/home' : item.path)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
