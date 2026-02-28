import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../services/profileService'

const GOALS = ['Improve fitness','Better sleep','Reduce stress','Build discipline','Quit bad habits','Mental clarity','Boost confidence','Healthy relationships']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ age: '', height: '', weight: '', sleepHours: '', activityLevel: 'Moderate' as 'Low'|'Moderate'|'High', goals: [] as string[] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ bmi: number; riskScore: number; suggestions?: string[] } | null>(null)

  const toggleGoal = (g: string) => setForm(f => ({ ...f, goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g] }))

  const handleSubmit = async () => {
    if (!form.age || !form.height || !form.weight || !form.sleepHours || !form.goals.length) { setError('Please fill all fields.'); return }
    setLoading(true); setError('')
    try {
      const res = await profileService.setup({ age: +form.age, height: +form.height, weight: +form.weight, sleepHours: +form.sleepHours, activityLevel: form.activityLevel, goals: form.goals })
      setResult(res); setStep(3)
    } catch {
      // demo
      const bmi = +form.weight / ((+form.height / 100) ** 2)
      setResult({ bmi: +bmi.toFixed(1), riskScore: 40, suggestions: ['Stay hydrated daily', 'Exercise 3x per week', 'Sleep 7-8 hours nightly'] })
      setStep(3)
    } finally { setLoading(false) }
  }

  const getBMI = (b: number) => b < 18.5 ? { label: 'Underweight', color: '#00d4ff' } : b < 25 ? { label: 'Normal', color: '#4ade80' } : b < 30 ? { label: 'Overweight', color: '#ffb830' } : { label: 'Obese', color: '#ff4d6a' }
  const getRisk = (s: number) => s < 30 ? { label: 'Low Risk', color: '#4ade80' } : s < 60 ? { label: 'Moderate Risk', color: '#ffb830' } : { label: 'High Risk', color: '#ff4d6a' }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f1a', backgroundImage: 'radial-gradient(ellipse at 20% 0%,#1a2050,#0d0f1a 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeUp 0.4s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '2rem' }}>🌿</span>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#4d7cff,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '0.25rem' }}>Male Parikshan</h1>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem' }}>
            {step === 3 ? 'Your Health Profile' : 'Complete Your Profile'}
          </h2>
          <p style={{ fontFamily: 'Nunito', fontSize: '0.85rem', color: '#5a6190', marginTop: '0.25rem' }}>
            {step === 3 ? 'Here are your personalized insights' : 'Personalize your journey'}
          </p>
        </div>

        {/* Step indicators */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono', fontSize: '0.8rem', fontWeight: 700,
                  background: s <= step ? 'linear-gradient(135deg,#4d7cff,#00d4ff)' : '#1e2340',
                  border: `1px solid ${s <= step ? '#4d7cff' : '#252a4a'}`,
                  color: 'white', boxShadow: s <= step ? '0 0 10px rgba(77,124,255,0.4)' : 'none'
                }}>{s}</div>
                {s < 2 && <div style={{ width: 40, height: 2, background: s < step ? 'linear-gradient(90deg,#4d7cff,#00d4ff)' : '#252a4a', borderRadius: 99 }} />}
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ background: 'linear-gradient(145deg,#1c2038,#161929)', border: '1px solid #252a4a', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Body Metrics</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { name: 'age', label: 'Age', placeholder: '25' },
                { name: 'height', label: 'Height (cm)', placeholder: '175' },
                { name: 'weight', label: 'Weight (kg)', placeholder: '75' },
                { name: 'sleepHours', label: 'Sleep Hours', placeholder: '7' },
              ].map(f => (
                <div key={f.name}>
                  <label className="label">{f.label}</label>
                  <input type="number" value={(form as unknown as Record<string,string>)[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})} placeholder={f.placeholder} className="input-field" />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">Activity Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                {(['Low','Moderate','High'] as const).map(l => (
                  <button key={l} onClick={() => setForm({...form, activityLevel: l})} style={{
                    padding: '0.65rem', borderRadius: '0.75rem', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem',
                    background: form.activityLevel === l ? '#4d7cff22' : '#1e2340',
                    border: `1px solid ${form.activityLevel === l ? '#4d7cff' : '#252a4a'}`,
                    color: form.activityLevel === l ? '#4d7cff' : '#5a6190',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!form.age || !form.height || !form.weight || !form.sleepHours} className="btn-primary" style={{ width: '100%', padding: '0.85rem', opacity: (!form.age || !form.height || !form.weight || !form.sleepHours) ? 0.4 : 1 }}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ background: 'linear-gradient(145deg,#1c2038,#161929)', border: '1px solid #252a4a', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <p style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Your Goals</p>
            <p style={{ fontFamily: 'Nunito', fontSize: '0.8rem', color: '#5a6190', marginBottom: '1rem' }}>Select all that apply</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {GOALS.map(g => (
                <button key={g} onClick={() => toggleGoal(g)} style={{
                  padding: '0.65rem 0.85rem', borderRadius: '0.75rem', textAlign: 'left',
                  fontFamily: 'Nunito', fontSize: '0.82rem',
                  background: form.goals.includes(g) ? '#4d7cff22' : '#1e2340',
                  border: `1px solid ${form.goals.includes(g) ? '#4d7cff' : '#252a4a'}`,
                  color: form.goals.includes(g) ? 'white' : '#5a6190',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <span style={{ marginRight: '0.4rem' }}>{form.goals.includes(g) ? '✓' : '+'}</span>{g}
                </button>
              ))}
            </div>
            {error && <p style={{ color: '#ff4d6a', fontSize: '0.8rem', fontFamily: 'Nunito', marginBottom: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>← Back</button>
              <button onClick={handleSubmit} disabled={loading || !form.goals.length} className="btn-primary" style={{ flex: 2, opacity: form.goals.length ? 1 : 0.4 }}>
                {loading ? 'Calculating...' : 'Calculate & Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeUp 0.4s ease forwards' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { title: 'BMI', value: result.bmi.toFixed(1), ...getBMI(result.bmi) },
                { title: 'Risk Score', value: result.riskScore, ...getRisk(result.riskScore) },
              ].map(s => (
                <div key={s.label} style={{ background: 'linear-gradient(145deg,#1c2038,#161929)', border: '1px solid #252a4a', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Nunito', fontSize: '0.7rem', color: '#5a6190', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{s.label.toUpperCase()}</p>
                  <p style={{ fontFamily: 'Outfit', fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 700, color: s.color, marginTop: '0.4rem' }}>{s.label}</p>
                </div>
              ))}
            </div>
            {result.suggestions && (
              <div style={{ background: 'linear-gradient(145deg,#1c2038,#161929)', border: '1px solid #252a4a', borderRadius: '1rem', padding: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Recommendations</p>
                {result.suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#4d7cff', flexShrink: 0, marginTop: '2px' }}>→</span>
                    <p style={{ fontFamily: 'Nunito', fontSize: '0.82rem', color: '#c8d0ff', lineHeight: 1.5 }}>{s}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/home')} className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}>
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
