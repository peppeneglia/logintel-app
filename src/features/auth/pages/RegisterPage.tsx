import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { useAuthStore } from '../../../stores/authStore'

export function RegisterPage() {
  const { signUp } = useAuthStore()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const passwordsMatch = form.password === form.confirmPassword
  const hasMinLength = form.password.length >= 8
  const hasUppercase = /[A-Z]/.test(form.password)
  const hasLowercase = /[a-z]/.test(form.password)
  const hasNumber = /[0-9]/.test(form.password)
  const passwordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.firstName.trim()) errors.firstName = 'Inserisci il nome'
    if (!form.lastName.trim()) errors.lastName = 'Inserisci il cognome'
    if (!form.email.trim()) {
      errors.email = 'Inserisci la tua email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Inserisci un indirizzo email valido'
    }
    if (!form.password) {
      errors.password = 'Scegli una password'
    } else if (!passwordValid) {
      errors.password = 'Minimo 8 caratteri, una maiuscola, una minuscola e un numero'
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Conferma la password'
    } else if (!passwordsMatch) {
      errors.confirmPassword = 'Le password non corrispondono'
    }
    if (!acceptTerms) {
      errors.terms = 'Devi accettare i termini per continuare'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      const { needsConfirmation } = await signUp({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        company: form.company,
      })
      if (needsConfirmation) {
        setSuccess(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante la registrazione'
      if (message.includes('already registered')) {
        setError('Questa email è già registrata')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    setError('Ancora non disponibile')
  }

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 bg-[#334155] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
      fieldErrors[field] ? 'border-red-500/60 focus:border-red-500' : 'border-slate-600 focus:border-primary-500'
    }`

  if (success) {
    return (
      <AuthLayout
        title="Controlla la tua email"
        subtitle="Abbiamo inviato un link di conferma"
      >
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-300 font-medium mb-1">
                Registrazione completata
              </p>
              <p className="text-sm text-emerald-400/80 leading-relaxed">
                Abbiamo inviato un'email a <span className="font-medium text-emerald-300">{form.email}</span> con un link per confermare il tuo account. Controlla anche la cartella spam.
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/login"
          replace
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-colors"
        >
          Vai al login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Crea il tuo account"
      subtitle="Inizia a ottimizzare la tua logistica con l'AI"
    >
      <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Nome + Cognome */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
            <input
              type="text"
              value={form.firstName}
              onChange={update('firstName')}
              placeholder="Mario"
              className={inputClass('firstName')}
            />
            {fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Cognome</label>
            <input
              type="text"
              value={form.lastName}
              onChange={update('lastName')}
              placeholder="Rossi"
              className={inputClass('lastName')}
            />
            {fieldErrors.lastName && (
              <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Azienda */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Azienda</label>
          <input
            type="text"
            value={form.company}
            onChange={update('company')}
            placeholder="Nome azienda (opzionale)"
            className={inputClass('company')}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email aziendale</label>
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="nome@azienda.it"
            className={inputClass('email')}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={update('password')}
              placeholder="Minimo 8 caratteri"
              className={`${inputClass('password')} pr-10`}
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
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Conferma password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="Ripeti la password"
              className={`${inputClass('confirmPassword')} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => { setAcceptTerms(e.target.checked); setFieldErrors((p) => ({ ...p, terms: '' })) }}
              className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-[#334155] text-primary-500 focus:ring-primary-500/30 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-400 leading-tight">
              Accetto i{' '}
              <span className="text-primary-400 hover:text-primary-300 cursor-pointer">Termini di servizio</span>
              {' '}e la{' '}
              <span className="text-primary-400 hover:text-primary-300 cursor-pointer">Privacy Policy</span>
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="mt-1 ml-6 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {fieldErrors.terms}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <UserPlus size={16} />
              Crea account
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

      {/* Google sign-up */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#334155] border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#3d4f6a] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Registrati con Google
      </button>

      {/* Login link */}
      <p className="mt-5 text-center text-sm text-slate-500">
        Hai già un account?{' '}
        <Link to="/login" replace className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Accedi
        </Link>
      </p>
    </AuthLayout>
  )
}
