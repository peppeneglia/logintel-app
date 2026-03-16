import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { updatePassword } from '../../../services/auth'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const passwordsMatch = password === confirmPassword
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!password) {
      errors.password = 'Scegli una password'
    } else if (!passwordValid) {
      errors.password = 'Minimo 8 caratteri, una maiuscola, una minuscola e un numero'
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Conferma la password'
    } else if (!passwordsMatch) {
      errors.confirmPassword = 'Le password non corrispondono'
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
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('same_password')) {
        setError('La nuova password deve essere diversa dalla precedente')
      } else {
        setError('Errore durante il reset della password. Riprova.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 pr-10 bg-[#334155] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
      fieldErrors[field] ? 'border-red-500/60 focus:border-red-500' : 'border-slate-600 focus:border-primary-500'
    }`

  return (
    <AuthLayout
      title={done ? 'Password aggiornata' : 'Nuova password'}
      subtitle={done ? 'Puoi accedere con la nuova password' : 'Scegli la tua nuova password'}
    >
      {done ? (
        <div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-300">
                La tua password è stata aggiornata con successo.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Vai al login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Nuova password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })) }}
                placeholder="Minimo 8 caratteri"
                className={inputClass('password')}
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Conferma password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: '' })) }}
                placeholder="Ripeti la password"
                className={inputClass('confirmPassword')}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <KeyRound size={16} />
                Aggiorna password
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
