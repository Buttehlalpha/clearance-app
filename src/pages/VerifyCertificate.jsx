import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, ShieldX, Search } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function VerifyCertificate() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null) // undefined-ish states: null = not searched, false = not found, object = found
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResult(null)

    const { data } = await supabase
      .from('certificates')
      .select(`
        certificate_ref, verification_code, issued_at, student_name, matric_number,
        clearance_applications ( session )
      `)
      .or(`certificate_ref.eq.${query.trim()},verification_code.eq.${query.trim().toUpperCase()}`)
      .maybeSingle()

    setLoading(false)
    setResult(data ?? false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-xl">Campus Clearance</Link>
        <h1 className="mt-6 text-2xl font-medium">Verify a certificate</h1>
        <p className="mt-1.5 text-sm text-ink/60">
          Enter the certificate reference or verification code printed on the certificate.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="CERT-2026-XXXXXXXX or code"
            className="flex-1 rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg bg-navy text-cream text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-60"
          >
            <Search size={16} />
          </motion.button>
        </form>

        {loading && <p className="mt-6 text-sm text-ink/50">Checking…</p>}

        {result === false && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-4 flex items-start gap-3"
          >
            <ShieldX size={20} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-danger">Not found</p>
              <p className="text-sm text-ink/60 mt-0.5">No certificate matches that reference or code.</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-success/30 bg-success/5 px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <BadgeCheck size={20} className="text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success">Valid certificate</p>
                <p className="text-sm text-ink/70 mt-0.5">{result.student_name}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-ink/50">Matric number</dt><dd>{result.matric_number ?? '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink/50">Session</dt><dd>{result.clearance_applications?.session}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink/50">Reference</dt><dd className="font-mono text-xs break-all text-right">{result.certificate_ref}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink/50">Issued</dt><dd>{new Date(result.issued_at).toLocaleDateString()}</dd></div>
            </dl>
          </motion.div>
        )}
      </div>
    </div>
  )
}
