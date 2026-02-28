import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGuest = async () => {
    setLoading(true)
    try {
      const data = await authService.guestLogin()
      login(data.token, data.user)
      navigate('/home')
    } catch {
      navigate('/home') // demo fallback
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0f1a',
      backgroundImage: 'radial-gradient(ellipse at 20% 0%, #1a2050 0%, #0d0f1a 70%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(77,124,255,0.08), transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg,#4d7cff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Male Parikshan
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/login')} style={{
            background: '#1e2340', border: '1px solid #252a4a', borderRadius: '0.75rem',
            padding: '0.5rem 1.25rem', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem',
            color: 'white', cursor: 'pointer', transition: 'border-color 0.2s'
          }}>Login</button>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Register
          </button>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#4d7cff11', border: '1px solid #4d7cff33',
          borderRadius: 999, padding: '0.35rem 1rem', marginBottom: '2rem',
          animation: 'fadeIn 0.5s ease forwards'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'Outfit', fontSize: '0.75rem', fontWeight: 600, color: '#4d7cff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Men's Health Platform
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Outfit', fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900,
          lineHeight: 1.05, marginBottom: '1.5rem',
          animation: 'fadeUp 0.5s ease 0.1s both'
        }}>
          <span style={{ color: 'white' }}>Strong Body.<br /></span>
          <span style={{ background: 'linear-gradient(135deg,#4d7cff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Calm Mind.
          </span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>Responsible Man.</span>
        </h1>

        <p style={{
          fontFamily: 'Nunito', fontSize: '1.05rem', color: '#5a6190',
          maxWidth: 480, lineHeight: 1.7, marginBottom: '2.5rem',
          animation: 'fadeUp 0.5s ease 0.2s both'
        }}>
          A complete platform for men's wellness — track streaks, log mood,
          learn through guided modules, and get personalized AI guidance.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem', animation: 'fadeUp 0.5s ease 0.3s both' }}>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
            Create Free Account
          </button>
          <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
            Sign In
          </button>
          <button onClick={handleGuest} disabled={loading} style={{
            background: 'transparent', border: '1px solid #252a4a', borderRadius: '0.75rem',
            padding: '0.9rem 2rem', fontFamily: 'Outfit', fontWeight: 600, fontSize: '1rem',
            color: '#5a6190', cursor: 'pointer', transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#4d7cff44' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5a6190'; e.currentTarget.style.borderColor = '#252a4a' }}
          >
            {loading ? 'Starting...' : 'Continue as Guest →'}
          </button>
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', maxWidth: 600, width: '100%', animation: 'fadeUp 0.5s ease 0.4s both' }}>
          {[
            { icon: '🔥', label: 'Streak Tracker', desc: 'Daily habit tracking' },
            { icon: '😊', label: 'Mood Tracker', desc: 'Emotional wellness' },
            { icon: '📚', label: 'Learn Modules', desc: 'Educational content' },
            { icon: '🤖', label: 'AI Chat', desc: 'Personalized guidance' },
          ].map(f => (
            <div key={f.label} style={{
              background: 'linear-gradient(145deg,#1c2038,#161929)',
              border: '1px solid #252a4a', borderRadius: '1rem',
              padding: '1rem 0.75rem', textAlign: 'center',
              transition: 'border-color 0.2s, transform 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d7cff44'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#252a4a'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>{f.label}</p>
              <p style={{ fontFamily: 'Nunito', fontSize: '0.7rem', color: '#5a6190' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid #252a4a' }}>
        <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190' }}>
          Male Parikshan — Men's Health Education Platform
        </p>
      </footer>
    </div>
  )
}
