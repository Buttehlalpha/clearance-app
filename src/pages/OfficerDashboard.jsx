import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock3 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

export default function OfficerDashboard({ allStages = false }) {
  const { user, profile, stage } = useAuth()
  const [queue, setQueue] = useState([])
  const [readiness, setReadiness] = useState({}) // review id -> boolean (earlier stages done)
  const [loading, setLoading] = useState(true)
  const [rejecting, setRejecting] = useState(null) // review id currently showing reject-comment box
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(null)

  const load = async () => {
    if (!allStages && !stage) { setLoading(false); return }
    setLoading(true)

    let stageRow = null
    if (!allStages) {
      const { data } = await supabase.from('clearance_stages').select('*').eq('name', stage).single()
      stageRow = data
      if (!stageRow) { setLoading(false); return }
    }

    let query = supabase
      .from('clearance_reviews')
      .select(`
        id, decision, comments, application_id, stage_id,
        clearance_stages ( name, stage_order ),
        clearance_applications (
          id, session, student_id,
          profiles!clearance_applications_student_id_fkey ( full_name ),
          student_profiles!clearance_applications_student_profile_fkey ( matric_number, department, faculty, level )
        )
      `)
      .eq('decision', 'pending')
      .order('created_at', { ascending: true })
    if (stageRow) query = query.eq('stage_id', stageRow.id)

    const { data: rows } = await query
    let list = rows ?? []

    const map = {}
    if (list.length) {
      const appIds = [...new Set(list.map((r) => r.application_id))]
      const { data: allReviews } = await supabase
        .from('clearance_reviews')
        .select('application_id, decision, clearance_stages(stage_order)')
        .in('application_id', appIds)

      for (const r of list) {
        const earlier = (allReviews ?? []).filter(
          (x) => x.application_id === r.application_id && x.clearance_stages.stage_order < r.clearance_stages.stage_order
        )
        map[r.id] = earlier.every((x) => x.decision === 'approved')
      }
    }

    // In "all stages" mode only show the next actionable stage of each application
    if (allStages) list = list.filter((r) => map[r.id])

    setQueue(list)
    setReadiness(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [stage, allStages])

  const approve = async (reviewId) => {
    setBusy(reviewId)
    const { error } = await supabase
      .from('clearance_reviews')
      .update({ decision: 'approved', officer_id: user.id })
      .eq('id', reviewId)
    setBusy(null)
    if (!error) load()
  }

  const reject = async (reviewId) => {
    if (!comment.trim()) return
    setBusy(reviewId)
    const { error } = await supabase
      .from('clearance_reviews')
      .update({ decision: 'rejected', officer_id: user.id, comments: comment })
      .eq('id', reviewId)
    setBusy(null)
    if (!error) {
      setRejecting(null)
      setComment('')
      load()
    }
  }

  if (!allStages && !stage) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium">Review queue</h1>
        <p className="mt-3 text-ink/60">
          Your account doesn&rsquo;t have a clearance stage assigned yet. Ask an administrator to assign
          you to a stage (Bursary, Library, Hostel, Department Head, or Student Affairs) from User management.
        </p>
      </div>
    )
  }

  if (loading) return <p className="text-ink/50">Loading your queue…</p>

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl sm:text-3xl font-medium capitalize">{allStages ? 'Review all stages' : `${stage.replace('_', ' ')} review queue`}</h1>
        <p className="mt-1.5 text-ink/60">
          {profile?.full_name ? `Signed in as ${profile.full_name}. ` : ''}
          {queue.length} application{queue.length === 1 ? '' : 's'} waiting.
        </p>
      </motion.div>

      <div className="mt-8 space-y-4">
        {queue.length === 0 && (
          <p className="text-sm text-ink/50">Nothing in your queue right now.</p>
        )}

        {queue.map((r, i) => {
          const app = r.clearance_applications
          const ready = readiness[r.id]
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
              className="rounded-2xl border border-line bg-white p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium">
                    {app?.profiles?.full_name}
                    {allStages && (
                      <span className="ml-2 align-middle text-[11px] font-medium px-2 py-0.5 rounded-full bg-navy/10 text-navy capitalize">
                        {r.clearance_stages?.name.replace('_', ' ')}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {app?.student_profiles?.matric_number} · {app?.student_profiles?.department} · {app?.student_profiles?.level} level · {app?.session}
                  </p>
                </div>

                {!ready ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-ink/5 text-ink/50">
                    <Clock3 size={13} /> Waiting on earlier stage
                  </span>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => approve(r.id)}
                      disabled={busy === r.id}
                      className="inline-flex items-center justify-center flex-1 sm:flex-none gap-1.5 text-sm sm:text-xs font-medium px-3 py-2.5 sm:py-1.5 rounded-full bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                    >
                      <Check size={13} /> Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { setRejecting(rejecting === r.id ? null : r.id); setComment('') }}
                      disabled={busy === r.id}
                      className="inline-flex items-center justify-center flex-1 sm:flex-none gap-1.5 text-sm sm:text-xs font-medium px-3 py-2.5 sm:py-1.5 rounded-full bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                    >
                      <X size={13} /> Reject
                    </motion.button>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {rejecting === r.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 overflow-hidden"
                  >
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Reason for rejection (shown to the student)"
                      rows={2}
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:border-navy focus:ring-1 focus:ring-navy outline-none"
                    />
                    <button
                      onClick={() => reject(r.id)}
                      disabled={!comment.trim() || busy === r.id}
                      className="mt-2 text-xs font-medium px-3 py-1.5 rounded-full bg-danger text-cream hover:bg-danger/90 transition-colors disabled:opacity-50"
                    >
                      Confirm rejection
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
