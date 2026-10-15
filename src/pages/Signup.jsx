import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

const LEVELS = ['100', '200', '300', '400', '500']

export default function Signup() {
  const { session } = useAuth()
  const [form, setForm] = useState({
    full_name: '', matric_number: '', department: '', faculty: '', level: '100',
    email: '', password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  if (session) return <Navigate to="/app" replace />

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          matric_number: form.matric_number,
          department: form.department,
          faculty: form.faculty,
          level: form.level,
        },
      },
    })

    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/app')
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout eyebrow="Account created" title="Check your email" subtitle="">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-sm text-ink/70 leading-relaxed">
            We&rsquo;ve sent a confirmation link to <strong>{form.email}</strong>. Once confirmed, sign in and
            start your clearance application.
          </p>
          <Link to="/login" className="mt-6 inline-block text-sm text-navy font-medium hover:underline">Back to sign in</Link>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Create an account" title="Register as a student" subtitle="This creates your clearance record for the session.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" name="full_name" value={form.full_name} onChange={handleChange} required />
        <Field label="Matriculation number" name="matric_number" value={form.matric_number} onChange={handleChange} required placeholder="CSC/2021/001" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Department" name="department" value={form.department} onChange={handleChange} />
          <Field label="Faculty" name="faculty" value={form.faculty} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium mb-1.5">Level</label>
          <select
            id="level"
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none bg-white"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
          </select>
        </div>
        <Field label="Email" name="email" type="email" autoComplete="username" value={form.email} onChange={handleChange} required placeholder="you@university.edu" />
        <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={6} value={form.password} onChange={handleChange} required placeholder="At least 6 characters" />

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
          {submitting ? 'Creating account…' : 'Create account'}
        </motion.button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Already have an account? <Link to="/login" className="text-navy font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label htmlFor={props.name} className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        id={props.name}
        {...props}
        className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-shadow"
      />
    </div>
  )
}
