import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react'
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

  const passwordsMatch = password === confirmPassword
  const passwordLongEnough = password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch || !passwordLongEnough) return

    setLoading(true)
    setError('')
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il reset della password')
    } finally {
      setLoading(false)
    }
  }

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
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Vai al login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caratteri"
                required
                minLength={8}
                className="w-full px-3 py-2.5 pr-10 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && !passwordLongEnough && (
              <p className="mt-1 text-xs text-amber-400">La password deve contenere almeno 8 caratteri</p>
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ripeti la password"
                required
                className={`w-full px-3 py-2.5 pr-10 bg-[#334155] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
                  confirmPassword.length > 0 && !passwordsMatch
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-slate-600 focus:border-primary-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-400">Le password non corrispondono</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordsMatch || !passwordLongEnough}
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
