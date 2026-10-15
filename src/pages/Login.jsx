import { useState } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

export default function Login() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  if (session) {
    const dest = location.state?.from?.pathname ?? '/app'
    return <Navigate to={dest} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/app')
  }

  return (
    <AuthLayout eyebrow="Sign in" title="Welcome back" subtitle="Students, officers and administrators all sign in here.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-shadow"
            placeholder="you@university.edu"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-shadow"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-danger">
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.02 }}
          whileTap={{ scale: submitting ? 1 : 0.98 }}
          className="w-full bg-navy text-cream rounded-full py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </motion.button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        New student? <Link to="/signup" className="text-navy font-medium hover:underline">Create an account</Link>
      </p>
      <p className="mt-2 text-xs text-ink/40">
        Clearance officer or administrator? Your account is created and assigned by an administrator.
      </p>
    </AuthLayout>
  )
}
