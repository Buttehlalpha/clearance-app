import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'

const ROLES = ['student', 'officer', 'administrator']
const STAGES = ['bursary', 'library', 'hostel', 'department_head', 'student_affairs']

export default function UserManagement() {
  const { role } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStaff = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setStaff(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchStaff() }, [])

  const updateRole = async (id, newRole) => {
    const patch = { role: newRole }
    if (newRole !== 'officer') patch.stage = null
    await supabase.from('profiles').update(patch).eq('id', id)
    fetchStaff()
  }

  const updateStage = async (id, newStage) => {
    await supabase.from('profiles').update({ stage: newStage }).eq('id', id)
    fetchStaff()
  }

  if (role !== 'administrator') {
    return <p className="text-ink/60">Only administrators can manage accounts.</p>
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl sm:text-3xl font-medium">User management</h1>
        <p className="mt-1.5 text-ink/60">
          Students create their own accounts. Promote someone to officer or administrator here —
          officers also need a stage assigned before their queue will show anything.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="mt-6 rounded-2xl border border-line bg-white overflow-x-auto"
      >
        <table className="w-full text-sm min-w-[420px]">
          <thead className="bg-sage/40 text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink/50">Loading…</td></tr>}
            {!loading && staff.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-ink/50">No accounts yet.</td></tr>
            )}
            {staff.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
              >
                <td className="px-4 py-3">{s.full_name}</td>
                <td className="px-4 py-3">
                  <select
                    value={s.role}
                    onChange={(e) => updateRole(s.id, e.target.value)}
                    className="text-xs rounded-full border border-ink/15 px-2.5 py-1 capitalize"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {s.role === 'officer' ? (
                    <select
                      value={s.stage ?? ''}
                      onChange={(e) => updateStage(s.id, e.target.value || null)}
                      className="text-xs rounded-full border border-ink/15 px-2.5 py-1 capitalize"
                    >
                      <option value="">Unassigned</option>
                      {STAGES.map((st) => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                    </select>
                  ) : (
                    <span className="text-ink/30 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink/50 hidden sm:table-cell">{new Date(s.created_at).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
