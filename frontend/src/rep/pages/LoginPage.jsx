import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Brand } from '../components/Layout'
import { PrimaryButton } from '../components/Button'
import { IconShield } from '../components/icons'

// A calm, centred auth shell — the single sign-in surface.
export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-ink-faint">
          Movie Distribution Reporting · Representative Portal
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { auth, verify, showToast } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already signed in → skip straight to the app.
  useEffect(() => {
    if (auth.verified) navigate('/theatres', { replace: true })
  }, [auth.verified, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setSubmitting(true)
    const res = await verify(email.trim(), password)
    setSubmitting(false)
    if (res.ok) {
      showToast('Signed in successfully', 'success')
      navigate('/theatres', { replace: true })
    } else {
      setError(res.error || 'Invalid email or password.')
      setPassword('')
    }
  }

  return (
    <AuthShell>
      <div className="animate-fade-in rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-7">
        <h1 className="text-xl font-bold tracking-tight text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Enter your representative email and password to continue.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="rep@svf.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition-shadow focus:border-accent focus:shadow-focus placeholder:text-ink-faint"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition-shadow focus:border-accent focus:shadow-focus placeholder:text-ink-faint"
            />
          </div>

          {error && <p className="text-sm font-medium text-danger-ink">{error}</p>}

          <PrimaryButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </PrimaryButton>
        </form>

        <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-surface-muted px-3.5 py-3 text-xs text-ink-soft">
          <IconShield width={16} height={16} className="mt-0.5 shrink-0 text-accent" />
          <span>
            Demo access — use{' '}
            <span className="font-semibold text-ink">rep@svf.in</span> /{' '}
            <span className="font-semibold text-ink">Rep@321</span>.
          </span>
        </div>
      </div>
    </AuthShell>
  )
}
