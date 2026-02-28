import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="page-content animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>👤</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Profile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 600, color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem',
          background: 'linear-gradient(135deg,#4d7cff,#00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800,
          boxShadow: '0 0 20px rgba(77,124,255,0.3)'
        }}>
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <p style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700 }}>
          {user?.email || 'Guest User'}
        </p>
        <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', marginTop: '0.25rem' }}>
          Age {user?.age || '—'} · {user?.language || 'English'}
        </p>
        {user?.adultModeEnabled && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: '#ff7b2e22', border: '1px solid #ff7b2e44',
            borderRadius: 999, padding: '0.2rem 0.75rem', marginTop: '0.5rem',
            fontFamily: 'Outfit', fontSize: '0.7rem', color: '#ff7b2e', fontWeight: 700
          }}>🔞 Adult Mode Active</span>
        )}
      </div>

      {/* Settings */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#5a6190', letterSpacing: '0.05em' }}>ACCOUNT</p>
        {[
          { icon: '✏️', label: 'Edit Profile', action: () => navigate('/onboarding') },
          { icon: '🌐', label: 'Language', value: user?.language || 'English', action: () => {} },
          { icon: '🔔', label: 'Notifications', action: () => {} },
          { icon: '🔒', label: 'Privacy & Security', action: () => {} },
        ].map(item => (
          <div key={item.label} onClick={item.action} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 0', borderBottom: '1px solid #1e2340',
            cursor: 'pointer', transition: 'opacity 0.2s'
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span style={{ fontFamily: 'Nunito', fontSize: '0.9rem', color: 'white' }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {item.value && <span style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190' }}>{item.value}</span>}
              <span style={{ color: '#5a6190' }}>›</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#5a6190', letterSpacing: '0.05em' }}>MORE</p>
        {[
          { icon: '📋', label: 'Terms of Service' },
          { icon: '🔐', label: 'Privacy Policy' },
          { icon: '⭐', label: 'Rate the App' },
          { icon: '📧', label: 'Contact Support' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 0', borderBottom: '1px solid #1e2340', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span style={{ fontFamily: 'Nunito', fontSize: '0.9rem', color: 'white' }}>{item.label}</span>
            </div>
            <span style={{ color: '#5a6190' }}>›</span>
          </div>
        ))}
      </div>

      <button onClick={handleLogout} style={{
        width: '100%', background: '#ff4d6a22',
        border: '1px solid #ff4d6a44', borderRadius: '0.85rem',
        padding: '0.85rem', fontFamily: 'Outfit', fontWeight: 700,
        fontSize: '0.9rem', color: '#ff4d6a', cursor: 'pointer',
        transition: 'all 0.2s'
      }}
        onMouseEnter={e => (e.currentTarget.style.background = '#ff4d6a33')}
        onMouseLeave={e => (e.currentTarget.style.background = '#ff4d6a22')}
      >
        ↩ Logout
      </button>
    </div>
  )
}
