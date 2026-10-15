import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, RotateCcw, Printer, Bell } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import StageBadge from '../components/StageBadge.jsx'

const CURRENT_SESSION = (() => {
  const y = new Date().getFullYear()
  return `${y}/${y + 1}`
})()

export default function StudentDashboard() {
  const { user, profile, studentProfile } = useAuth()
  const [application, setApplication] = useState(null)
  const [reviews, setReviews] = useState([])
  const [certificate, setCertificate] = useState(null)
  const [exitRequest, setExitRequest] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [exitDetails, setExitDetails] = useState('')
  const [submittingExit, setSubmittingExit] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data: app } = await supabase
      .from('clearance_applications')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setApplication(app)

    if (app) {
      const [{ data: rev }, { data: cert }, { data: exit }] = await Promise.all([
        supabase
          .from('clearance_reviews')
          .select('*, clearance_stages(name, stage_order)')
          .eq('application_id', app.id)
          .order('stage_order', { foreignTable: 'clearance_stages' }),
        supabase.from('certificates').select('*').eq('application_id', app.id).maybeSingle(),
        supabase.from('exit_requests').select('*').eq('application_id', app.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      setReviews(rev ?? [])
      setCertificate(cert)
      setExitRequest(exit)
    }

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setNotifications(notifs ?? [])

    setLoading(false)
  }

  useEffect(() => { load() }, [user.id])

  const startClearance = async () => {
    setStarting(true)
    await supabase.from('clearance_applications').insert({ student_id: user.id, session: CURRENT_SESSION })
    setStarting(false)
    load()
  }

  const resubmit = async (reviewId) => {
    await supabase.from('clearance_reviews').update({ decision: 'pending' }).eq('id', reviewId)
    load()
  }

  const submitExit = async (e) => {
    e.preventDefault()
    setSubmittingExit(true)
    const { error } = await supabase.from('exit_requests').insert({ application_id: application.id, details: exitDetails })
    setSubmittingExit(false)
    if (!error) {
      setExitDetails('')
      load()
    }
  }

  const printCertificate = () => window.print()

  if (loading) return <p className="text-ink/50">Loading your clearance record…</p>

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-medium">
          Hi{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p className="mt-1.5 text-ink/60">
          {studentProfile?.matric_number ? `${studentProfile.matric_number} · ` : ''}
          Track your clearance progress below.
        </p>
      </motion.div>

      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-6 rounded-xl border border-line bg-white p-4"
        >
          <p className="text-sm font-medium flex items-center gap-2"><Bell size={15} /> Recent updates</p>
          <div className="mt-2 space-y-1.5">
            {notifications.map((n) => (
              <p key={n.id} className="text-sm text-ink/65">{n.message}</p>
            ))}
          </div>
        </motion.div>
      )}

      {!application && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mt-8 rounded-2xl border border-line bg-white p-8 text-center"
        >
          <p className="font-medium">You haven&rsquo;t started clearance yet.</p>
          <p className="mt-1.5 text-sm text-ink/60">Start your application for the {CURRENT_SESSION} session.</p>
          <motion.button
            onClick={startClearance}
            disabled={starting}
            whileHover={{ scale: starting ? 1 : 1.03 }}
            whileTap={{ scale: starting ? 1 : 0.97 }}
            className="mt-5 bg-navy text-cream px-6 py-2.5 rounded-full text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-60"
          >
            {starting ? 'Starting…' : 'Start clearance'}
          </motion.button>
        </motion.div>
      )}

      {application && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mt-8 rounded-2xl border border-line bg-white p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-medium">Clearance — {application.session}</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${application.status === 'cleared' ? 'bg-success/10 text-success' : 'bg-amber/10 text-amber-dark'}`}>
              {application.status === 'cleared' ? 'Cleared' : 'In progress'}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex items-center justify-between gap-4 py-2.5 border-b border-line last:border-0"
              >
                <div>
                  <p className="text-sm font-medium capitalize">{r.clearance_stages.name.replace('_', ' ')}</p>
                  {r.decision === 'rejected' && r.comments && (
                    <p className="text-xs text-danger mt-0.5">{r.comments}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StageBadge decision={r.decision} />
                  {r.decision === 'rejected' && (
                    <button
                      onClick={() => resubmit(r.id)}
                      className="text-xs text-navy hover:underline flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Resubmit
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {certificate && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-6"
        >
          <p className="font-medium text-success">Your clearance certificate is ready</p>
          <div id="certificate-print" className="mt-4 bg-white rounded-xl border border-line p-8 text-center">
            <p className="text-xs uppercase tracking-wide text-ink/50">Certificate of Clearance</p>
            <h3 className="mt-3 text-2xl font-display">{profile?.full_name}</h3>
            <p className="mt-1 text-sm text-ink/60">{studentProfile?.matric_number}</p>
            <p className="mt-4 text-sm text-ink/70">has successfully completed all clearance requirements for</p>
            <p className="mt-1 font-medium">{application?.session}</p>
            <div className="mt-6 flex justify-center gap-10 text-xs text-ink/50">
              <span>Ref: {certificate.certificate_ref}</span>
              <span>Code: {certificate.verification_code}</span>
            </div>
          </div>
          <motion.button
            onClick={printCertificate}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 inline-flex items-center gap-2 bg-navy text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-dark transition-colors"
          >
            <Printer size={15} /> Print certificate
          </motion.button>
        </motion.div>
      )}

      {application?.status === 'cleared' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="mt-6 rounded-2xl border border-line bg-white p-6"
        >
          <h2 className="font-medium">Exit request</h2>
          {exitRequest ? (
            <div className="mt-3 text-sm">
              <p className="text-ink/70">{exitRequest.details}</p>
              <p className="mt-1.5">
                Status: <span className="font-medium capitalize">{exitRequest.status}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={submitExit} className="mt-3 space-y-3">
              <textarea
                value={exitDetails}
                onChange={(e) => setExitDetails(e.target.value)}
                required
                rows={3}
                placeholder="Reason / details for your exit request"
                className="w-full rounded-lg border border-ink/15 px-3.5 py-2.5 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none"
              />
              <motion.button
                type="submit"
                disabled={submittingExit}
                whileHover={{ scale: submittingExit ? 1 : 1.03 }}
                whileTap={{ scale: submittingExit ? 1 : 0.97 }}
                className="bg-navy text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-navy-dark transition-colors disabled:opacity-60"
              >
                {submittingExit ? 'Submitting…' : 'Submit exit request'}
              </motion.button>
            </form>
          )}
        </motion.div>
      )}
    </div>
  )
}
