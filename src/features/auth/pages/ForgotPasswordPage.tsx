import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { useAuthStore } from '../../../stores/authStore'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuthStore()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setFieldError('Inserisci la tua email')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Inserisci un indirizzo email valido')
      return
    }
    setFieldError('')
    setLoading(true)
    setError('')
    try {
      await resetPassword(email.trim())
    } catch {
      // Non rivelare se l'email esiste o meno (OWASP best practice)
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <AuthLayout
      title={sent ? 'Email inviata' : 'Recupera password'}
      subtitle={
        sent
          ? 'Controlla la tua casella di posta'
          : 'Inserisci la tua email per ricevere il link di reset'
      }
    >
      {sent ? (
        <div>
          {/* Success state */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-300 font-medium mb-1">
                  Link di reset inviato
                </p>
                <p className="text-sm text-emerald-400/80 leading-relaxed">
                  Abbiamo inviato un'email a <span className="font-medium text-emerald-300">{email}</span> con le istruzioni per reimpostare la password. Controlla anche la cartella spam.
                </p>
              </div>
            </div>
          </div>

          {/* Resend */}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#334155] border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#3d4f6a] transition-colors mb-4"
          >
            <Mail size={16} />
            Invia di nuovo
          </button>

          {/* Back to login */}
          <Link
            to="/login"
            replace
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Torna al login
          </Link>
        </div>
      ) : (
        <div>
          <form onSubmit={handleSubmit} noValidate className="grid gap-5">
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
                onChange={(e) => { setEmail(e.target.value); setFieldError('') }}
                placeholder="nome@azienda.it"
                className={`w-full px-3 py-2.5 bg-[#334155] border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
                  fieldError ? 'border-red-500/60 focus:border-red-500' : 'border-slate-600 focus:border-primary-500'
                }`}
              />
              {fieldError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {fieldError}
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
                  <Mail size={16} />
                  Invia link di reset
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              <ArrowLeft size={14} />
              Torna al login
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
