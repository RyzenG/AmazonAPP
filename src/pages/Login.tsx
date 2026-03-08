import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, LogIn, Eye, EyeOff } from 'lucide-react'
import { useStore } from '../store/useStore'

const DEMO_EMAIL    = 'admin@empresa.com'
const DEMO_PASSWORD = 'admin123'

export default function Login() {
  const navigate = useNavigate()
  const login           = useStore((s) => s.login)
  const companySettings = useStore((s) => s.companySettings)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        login({ name: 'Administrador', email: DEMO_EMAIL, role: 'admin' })
        navigate('/', { replace: true })
      } else {
        setError('Correo o contraseña incorrectos')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-8">
          {companySettings.logo ? (
            <img
              src={companySettings.logo}
              alt={companySettings.companyName}
              className="h-24 w-auto object-contain mb-3"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {companySettings.companyName || 'ProducERP'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {companySettings.slogan || 'Ingresa a tu cuenta'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label dark:text-slate-300">Correo electrónico</label>
              <input
                type="email"
                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label dark:text-slate-300">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
            Demo: admin@empresa.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
