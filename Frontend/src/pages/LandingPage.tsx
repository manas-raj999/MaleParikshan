import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  const handleGuest = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await authService.guestLogin()
      login(data.token, data.user)
      navigate('/onboarding')
    } catch {
      setError('Failed to start guest session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian overflow-hidden relative flex flex-col">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-gold/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal/5 via-transparent to-accent/5 rounded-full blur-3xl" />
        
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        
        {/* Accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 backdrop-blur-sm bg-obsidian/50 border-b border-white/5">
        <div>
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-accent via-gold to-accent bg-clip-text text-transparent">Male Parikshan</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-medium text-white hover:text-accent transition-colors duration-200 px-4 py-2"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="btn-primary text-sm py-2.5 px-6 shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all duration-300"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with animation */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-8 animate-fade-in hover:bg-accent/15 transition-colors duration-300">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent font-mono text-xs font-bold tracking-widest uppercase">
              ✦ Men's Wellness Revolution
            </span>
          </div>

          {/* Enhanced headline */}
          <h2 className="font-display text-5xl sm:text-7xl font-extrabold leading-tight mb-8 animate-fade-up"
            style={{ animationDelay: '0.1s', opacity: 0, textShadow: '0 20px 40px rgba(247, 144, 61, 0.1)' }}>
            <span className="block text-white">Strong Body.</span>
            <span className="block bg-gradient-to-r from-accent via-gold to-accent bg-clip-text text-transparent">Calm Mind.</span>
            <span className="block text-white/70">Responsible Man.</span>
          </h2>

          {/* Enhanced subtext */}
          <p className="text-white/60 font-body text-lg leading-relaxed mb-12 max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}>
            Your personal wellness hub for <span className="text-white font-semibold">building habits</span>, <span className="text-white font-semibold">managing emotions</span>, 
            and <span className="text-white font-semibold">growing stronger</span> — physically, mentally, and emotionally.
          </p>

          {/* Enhanced CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-up"
            style={{ animationDelay: '0.3s', opacity: 0 }}>
            <button
              onClick={() => navigate('/register')}
              className="group relative w-full sm:w-auto btn-primary text-lg px-8 py-4 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-accent/40 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                ✨ Create Free Account
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-gold to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-lg px-8 py-4 rounded-xl font-medium text-white border-2 border-white/20 hover:border-accent/50 bg-white/5 hover:bg-accent/10 transition-all duration-300"
            >
              Sign In
            </button>
            
            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full sm:w-auto text-lg px-8 py-4 rounded-xl font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              {loading ? '⏳ Starting...' : 'Continue as Guest →'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-8 animate-shake">
              <p className="text-red-400 text-sm font-body">{error}</p>
            </div>
          )}

          {/* Enhanced features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto animate-fade-up"
            style={{ animationDelay: '0.4s', opacity: 0 }}>
            {[
              { 
                icon: '🔥', 
                label: 'Streak Tracker', 
                desc: 'Build unstoppable habits',
                gradient: 'from-orange-500/20 to-red-500/20',
                border: 'border-orange-500/30'
              },
              { 
                icon: '💭', 
                label: 'Mood Tracker', 
                desc: 'Monitor emotional health', 
                gradient: 'from-purple-500/20 to-pink-500/20',
                border: 'border-purple-500/30'
              },
              { 
                icon: '📚', 
                label: 'Knowledge Modules', 
                desc: 'Learn science-backed insights',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                border: 'border-blue-500/30'
              },
              { 
                icon: '🤖', 
                label: 'AI Wellness Coach', 
                desc: 'Personalized guidance',
                gradient: 'from-emerald-500/20 to-teal-500/20',
                border: 'border-emerald-500/30'
              },
            ].map((f) => (
              <div 
                key={f.label} 
                className={`group bg-gradient-to-br ${f.gradient} border ${f.border} rounded-2xl p-6 hover:border-accent/50 transition-all duration-300 cursor-default transform hover:scale-105 hover:shadow-xl`}
                onMouseEnter={() => setHoveredFeature(f.label)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">{f.icon}</div>
                <div className="font-display text-base font-bold text-white mb-2">{f.label}</div>
                <div className="text-sm text-white/60 font-body group-hover:text-white/80 transition-colors duration-300">{f.desc}</div>
                {hoveredFeature === f.label && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-accent font-mono animate-fade-in">
                    ✓ Get started today
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-12 border-t border-white/5 animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
            <p className="text-white/50 text-sm font-body mb-4">Trusted by thousands • Built with science • Always free</p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">49+</div>
                <div className="text-xs text-white/60">Learning Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">3</div>
                <div className="text-xs text-white/60">Tracking Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">2</div>
                <div className="text-xs text-white/60">Wellness Modes</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced footer */}
      <footer className="relative z-10 text-center py-8 text-white/40 font-body text-xs border-t border-white/5 backdrop-blur-sm bg-obsidian/50">
        <p>Male Parikshan — Comprehensive Men's Health & Wellness Platform</p>
        <p className="mt-2 text-white/20">Empowering men to live healthier, stronger, more responsible lives.</p>
      </footer>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
