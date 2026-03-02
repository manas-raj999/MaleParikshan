import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileService } from '../services/profileService'

const GOALS = [
  'Improve fitness',
  'Better sleep',
  'Reduce stress',
  'Build discipline',
  'Quit bad habits',
  'Mental clarity',
  'Boost confidence',
  'Healthy relationships',
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    height: '',
    weight: '',
    sleepHours: '',
    activityLevel: 'Moderate' as 'Low' | 'Moderate' | 'High',
    goals: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    bmi: number
    riskScore: number
    activityLevel: string
    goals: string[]
  } | null>(null)

  const toggleGoal = (goal: string) => {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal)
        ? f.goals.filter((g) => g !== goal)
        : [...f.goals, goal],
    }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.height || !form.weight || !form.sleepHours || form.goals.length === 0) {
      setError('Please fill in all fields and select at least one goal.')
      return
    }
    setLoading(true)
    try {
      // ✅ Fixed: removed age (backend doesn't accept it in /profile/setup)
      const res = await profileService.setup({
        height: Number(form.height),
        weight: Number(form.weight),
        sleepHours: Number(form.sleepHours),
        activityLevel: form.activityLevel,
        goals: form.goals,
      })
      // ✅ Fixed: backend returns the profile object directly
      setResult(res)
      setStep(3)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' }
    if (bmi < 25) return { label: 'Normal', color: 'text-teal' }
    if (bmi < 30) return { label: 'Overweight', color: 'text-gold' }
    return { label: 'Obese', color: 'text-red-400' }
  }

  const getRiskCategory = (score: number) => {
    if (score < 30) return { label: 'Low Risk', color: 'text-teal' }
    if (score < 60) return { label: 'Moderate Risk', color: 'text-gold' }
    return { label: 'High Risk', color: 'text-red-400' }
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-8">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="font-display text-xl font-bold text-gradient mb-4">Male Parikshan</div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">
            {step === 3 ? 'Your Health Profile' : 'Complete Your Profile'}
          </h2>
          <p className="text-muted font-body text-sm">
            {step === 3
              ? 'Here are your personalized health insights'
              : 'Help us personalize your wellness journey'}
          </p>
        </div>

        {/* Step indicators */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 ${
                  s <= step
                    ? 'bg-accent text-white'
                    : 'bg-elevated text-muted border border-border'
                }`}>
                  {s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-px transition-all duration-300 ${
                    s < step ? 'bg-accent' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Body metrics */}
        {step === 1 && (
          <div className="card animate-fade-up space-y-5">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Body Metrics</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* ✅ Removed age field — age is set during registration */}
              <div>
                <label className="label">Height (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  placeholder="175"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="75"
                  className="input-field"
                />
              </div>
              <div className="col-span-2">
                <label className="label">Sleep Hours</label>
                <input
                  type="number"
                  value={form.sleepHours}
                  onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
                  placeholder="7"
                  min="1"
                  max="12"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Activity Level</label>
              <div className="grid grid-cols-3 gap-3">
                {(['Low', 'Moderate', 'High'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, activityLevel: level })}
                    className={`py-3 rounded-xl font-display font-medium text-sm transition-all duration-200 border ${
                      form.activityLevel === level
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-surface border-border text-muted hover:border-subtle hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.height || !form.weight || !form.sleepHours}
              className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Goals */}
        {step === 2 && (
          <div className="card animate-fade-up">
            <h3 className="font-display text-lg font-semibold text-white mb-2">Your Goals</h3>
            <p className="text-muted text-sm font-body mb-6">Select all that apply</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`py-3 px-4 rounded-xl font-body text-sm text-left transition-all duration-200 border ${
                    form.goals.includes(goal)
                      ? 'bg-accent/10 border-accent text-white'
                      : 'bg-surface border-border text-muted hover:border-subtle hover:text-white'
                  }`}
                >
                  <span className="mr-2">{form.goals.includes(goal) ? '✓' : '+'}</span>
                  {goal}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <p className="text-red-400 text-sm font-body">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || form.goals.length === 0}
                className="btn-primary flex-1 py-4 disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Results */}
        {step === 3 && result && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 gap-4">
              <div className="card text-center">
                <p className="text-muted font-body text-xs uppercase tracking-widest mb-2">BMI</p>
                {/* ✅ Fixed: result.bmi is directly on result object */}
                <p className="font-display text-4xl font-bold text-white mb-1">
                  {result.bmi?.toFixed(1)}
                </p>
                <p className={`font-body text-sm font-medium ${getBMICategory(result.bmi).color}`}>
                  {getBMICategory(result.bmi).label}
                </p>
              </div>
              <div className="card text-center">
                <p className="text-muted font-body text-xs uppercase tracking-widest mb-2">Risk Score</p>
                {/* ✅ Fixed: result.riskScore is directly on result object */}
                <p className="font-display text-4xl font-bold text-white mb-1">
                  {result.riskScore}
                </p>
                <p className={`font-body text-sm font-medium ${getRiskCategory(result.riskScore).color}`}>
                  {getRiskCategory(result.riskScore).label}
                </p>
              </div>
            </div>

            {/* Goals summary */}
            <div className="card">
              <h4 className="font-display font-semibold text-white mb-4">Your Goals</h4>
              <div className="flex flex-wrap gap-2">
                {result.goals.map((goal, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-body"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>

            {/* Health tips based on BMI */}
            <div className="card">
              <h4 className="font-display font-semibold text-white mb-4">Recommendations</h4>
              <div className="space-y-3">
                {result.bmi < 18.5 && (
                  <div className="flex gap-3">
                    <span className="text-accent text-sm mt-0.5">→</span>
                    <p className="text-white/70 text-sm font-body leading-relaxed">
                      Focus on nutrient-dense foods to reach a healthy weight.
                    </p>
                  </div>
                )}
                {result.bmi >= 18.5 && result.bmi < 25 && (
                  <div className="flex gap-3">
                    <span className="text-accent text-sm mt-0.5">→</span>
                    <p className="text-white/70 text-sm font-body leading-relaxed">
                      Great BMI! Maintain it with balanced diet and regular exercise.
                    </p>
                  </div>
                )}
                {result.bmi >= 25 && (
                  <div className="flex gap-3">
                    <span className="text-accent text-sm mt-0.5">→</span>
                    <p className="text-white/70 text-sm font-body leading-relaxed">
                      Consider increasing physical activity and reducing processed foods.
                    </p>
                  </div>
                )}
                {result.riskScore > 50 && (
                  <div className="flex gap-3">
                    <span className="text-accent text-sm mt-0.5">→</span>
                    <p className="text-white/70 text-sm font-body leading-relaxed">
                      Your risk score is elevated. Focus on sleep, exercise and stress management.
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <span className="text-accent text-sm mt-0.5">→</span>
                  <p className="text-white/70 text-sm font-body leading-relaxed">
                    Use the streak tracker and mood logger daily to build healthy habits.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full py-4 text-base"
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}