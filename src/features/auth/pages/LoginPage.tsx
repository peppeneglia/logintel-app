import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { useAuthStore } from '../../../stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!email.trim()) {
      errors.email = 'Inserisci la tua email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Inserisci un indirizzo email valido'
    }
    if (!password) {
      errors.password = 'Inserisci la password'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (isLocked) return

    setLoading(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      setFailedAttempts(0)

      // If "Remember Me" is NOT checked, move Supabase session from
      // localStorage to sessionStorage so it expires when the browser closes.
      if (!remember) {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith('sb-'))
        for (const key of keys) {
          const value = localStorage.getItem(key)
          if (value) {
            sessionStorage.setItem(key, value)
            localStorage.removeItem(key)
          }
        }
      }

      navigate('/', { replace: true })
    } catch (err) {
      const attempts = failedAttempts + 1
      setFailedAttempts(attempts)

      if (attempts >= 5) {
        const unlockTime = Date.now() + 30_000
        setLockedUntil(unlockTime)
        setError('Troppi tentativi falliti. Riprova tra 30 secondi.')
        setTimeout(() => setLockedUntil(null), 30_000)
      } else {
        const message = err instanceof Error ? err.message : ''
        if (message.includes('Invalid login credentials')) {
          setError('Email o password non corretti')
        } else if (message.includes('Email not confirmed')) {
          setError('Conferma la tua email prima di accedere')
        } else {
          setError('Errore durante l\'accesso. Riprova.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setError('Ancora non disponibile')
  }

  const handleDemoClick = () => {
    window.open('/?demo=true', '_blank')
  }

  return (
    <AuthLayout
      title="Bentornato"
      subtitle="Accedi al tuo account Logintel"
    >
      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })) }}
            placeholder="nome@azienda.it"
            className={`w-full px-3 py-2.5 bg-[#334155] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
              fieldErrors.email ? 'border-red-500/60 focus:border-red-500' : 'border-slate-600 focus:border-primary-500'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })) }}
              placeholder="Inserisci la password"
              className={`w-full px-3 py-2.5 pr-10 bg-[#334155] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
                fieldErrors.password ? 'border-red-500/60 focus:border-red-500' : 'border-slate-600 focus:border-primary-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-[#334155] text-primary-500 focus:ring-primary-500/30 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-400">Ricordami</span>
          </label>
          <Link
            to="/forgot-password"
            replace
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Password dimenticata?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || isLocked}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <LogIn size={16} />
              Accedi
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#334155]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#1e293b] px-3 text-xs text-slate-500">oppure</span>
        </div>
      </div>

      {/* Google sign-in */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#334155] border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#3d4f6a] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continua con Google
      </button>

      {/* Register + Demo links */}
      <p className="mt-5 text-center text-sm text-slate-500">
        Non hai un account?{' '}
        <Link to="/register" replace className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Registrati
        </Link>
      </p>

      <button
        type="button"
        onClick={handleDemoClick}
        className="mt-2 w-full text-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
      >
        Guarda la demo senza registrarti
      </button>
    </AuthLayout>
  )
}
