import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
  age: z.number().min(13, 'Must be 13+').max(100),
  language: z.enum(['English', 'Hindi']),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', age: '', language: 'English' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' }); setApiError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = schema.safeParse({ ...form, age: Number(form.age) })
    if (!result.success) {
      const fe: Record<string, string> = {}
      result.error.errors.forEach(err => { if (err.path[0]) fe[err.path[0] as string] = err.message })
      setErrors(fe); return
    }
    setLoading(true)
    try {
      const data = await authService.register(form.email, form.password, Number(form.age), form.language as 'English' | 'Hindi')
      login(data.token, data.user)
      navigate('/onboarding')
    } catch (err: unknown) {
      setApiError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', backgroundImage: 'radial-gradient(ellipse at 20% 0%,#1a2050,#0d0f1a 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#4d7cff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Male Parikshan
          </h1>
        </div>

        <div style={{ background: 'linear-gradient(145deg,#1c2038,#161929)', border: '1px solid #252a4a', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Create account</h2>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#5a6190', marginBottom: '1.5rem' }}>Start your health journey today</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" />
              {errors.email && <p style={{ color: '#ff4d6a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'Nunito' }}>{errors.email}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="25" min="13" max="100" className="input-field" />
                {errors.age && <p style={{ color: '#ff4d6a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'Nunito' }}>{errors.age}</p>}
              </div>
              <div>
                <label className="label">Language</label>
                <select name="language" value={form.language} onChange={handleChange} className="input-field">
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="input-field" />
              {errors.password && <p style={{ color: '#ff4d6a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'Nunito' }}>{errors.password}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input-field" />
              {errors.confirmPassword && <p style={{ color: '#ff4d6a', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'Nunito' }}>{errors.confirmPassword}</p>}
            </div>
            {apiError && <div style={{ background: '#ff4d6a11', border: '1px solid #ff4d6a33', borderRadius: '0.75rem', padding: '0.65rem 1rem' }}>
              <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#ff4d6a' }}>{apiError}</p>
            </div>}
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4d7cff', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
