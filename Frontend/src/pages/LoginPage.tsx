import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setApiError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fe: Record<string, string> = {}
      result.error.errors.forEach(err => { if (err.path[0]) fe[err.path[0] as string] = err.message })
      setErrors(fe); return
    }
    setLoading(true)
    try {
      const data = await authService.login(form.email, form.password)
      login(data.token, data.user)
      try {
        const profile = await profileService.getMe()
        navigate(!profile || !profile.onboardingComplete ? '/onboarding' : '/home')
      } catch { navigate('/onboarding') }
    } catch (err: unknown) {
      setApiError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', backgroundImage: 'radial-gradient(ellipse at 20% 0%,#1a2050,#0d0f1a 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease forwards' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#4d7cff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Male Parikshan
          </h1>
        </div>

        <div style={{ background: 'linear-gradient(145deg,#1c2038,#161929)', border: '1px solid #252a4a', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome back</h2>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#5a6190', marginBottom: '1.5rem' }}>Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" className="input-field"
                style={errors.email ? { borderColor: '#ff4d6a' } : {}} />
              {errors.email && <p style={{ color: '#ff4d6a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'Nunito' }}>{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" className="input-field"
                style={errors.password ? { borderColor: '#ff4d6a' } : {}} />
              {errors.password && <p style={{ color: '#ff4d6a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'Nunito' }}>{errors.password}</p>}
            </div>
            {apiError && <div style={{ background: '#ff4d6a11', border: '1px solid #ff4d6a33', borderRadius: '0.75rem', padding: '0.65rem 1rem' }}>
              <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#ff4d6a' }}>{apiError}</p>
            </div>}
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.85rem', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', marginTop: '1.25rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4d7cff', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link to="/" style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
