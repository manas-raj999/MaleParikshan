import { useState } from 'react'
import { adultService } from '../services/adultService'
import { useAuth } from '../context/AuthContext'

export default function AdultModePage() {
  const { user, updateUser } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user || user.age < 18) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
      <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</span>
      <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Age Restricted</h2>
      <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#5a6190' }}>You must be 18 or older to access this section.</p>
    </div>
  )

  const handleEnable = async () => {
    setLoading(true); setError('')
    try {
      await adultService.enable()
      updateUser({ adultModeEnabled: true })
      setShowModal(false)
    } catch { setError('Failed. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="page-content animate-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🔒</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700 }}>Adult Mode</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌿</span>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 600, color: '#8ecfcc' }}>Male Parikshan</span>
        </div>
      </div>

      {user.adultModeEnabled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: '#ff7b2e11', border: '1px solid #ff7b2e33', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: '#ff7b2e22', border: '1px solid #ff7b2e44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✓</div>
            <div>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 700, color: '#ff7b2e' }}>Adult Mode Enabled</p>
              <p style={{ fontFamily: 'Nunito', fontSize: '0.75rem', color: '#5a6190' }}>You have access to all adult health content</p>
            </div>
          </div>
          {[
            { icon: '🧬', title: 'Sexual Health Education', desc: 'Comprehensive guides on sexual wellness, STI prevention, and healthy intimacy.' },
            { icon: '💪', title: 'Advanced Fitness & Hormones', desc: 'Testosterone optimization, muscle building protocols, and performance guides.' },
            { icon: '🧠', title: 'Mental & Emotional Mastery', desc: 'Emotional regulation, trauma healing, and relationship dynamics.' },
            { icon: '⚡', title: 'Energy & Hormonal Health', desc: 'Understanding hormones, sleep cycles, and lifestyle for peak performance.' },
          ].map(item => (
            <div key={item.title} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#4d7cff44')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#252a4a')}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <div>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.3rem' }}>{item.title}</p>
                  <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', lineHeight: 1.5 }}>{item.desc}</p>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', color: '#4d7cff', marginTop: '0.5rem', fontWeight: 600 }}>Explore →</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '1rem', background: '#ff7b2e22', border: '1px solid #ff7b2e44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>🔞</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Adult Mode</h2>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#5a6190', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Access advanced health content designed for adults 18+. Enable adult mode to unlock exclusive content.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-orange" style={{ width: '100%', padding: '0.85rem' }}>
            Enable Adult Mode
          </button>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,15,26,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(145deg,#1c2038,#161929)', border: '1px solid #252a4a', borderRadius: '1.25rem', padding: '2rem', maxWidth: 400, width: '100%', animation: 'fadeUp 0.3s ease forwards' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>⚠️</span>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800 }}>Age Verification</h3>
            </div>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#c8d0ff', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              This section contains mature health content. By enabling adult mode, you confirm you are 18 or older and consent to view this content.
            </p>
            {error && <p style={{ color: '#ff4d6a', fontSize: '0.8rem', fontFamily: 'Nunito', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleEnable} disabled={loading} className="btn-orange" style={{ flex: 1 }}>
                {loading ? 'Enabling...' : 'I Accept & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
