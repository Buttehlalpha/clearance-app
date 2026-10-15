import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, FileCheck2, Clock3, DoorOpen, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

function StatCard({ icon: Icon, label, value }) {
  return (
    <motion.div variants={fadeUp} transition={{ duration: 0.45, ease: 'easeOut' }}>
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 12px 28px -12px rgba(30,58,95,0.25)' }}
        className="rounded-2xl border border-line bg-white px-5 py-5"
      >
        <Icon size={20} strokeWidth={1.6} className="text-navy" />
        <p className="mt-4 text-2xl font-display"><AnimatedNumber value={value} /></p>
        <p className="text-sm text-ink/60 mt-0.5">{label}</p>
      </motion.div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState({ students: null, applications: null, cleared: null, pendingExit: null })

  useEffect(() => {
    const load = async () => {
      const [students, applications, cleared, pendingExit] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('clearance_applications').select('*', { count: 'exact', head: true }),
        supabase.from('clearance_applications').select('*', { count: 'exact', head: true }).eq('status', 'cleared'),
        supabase.from('exit_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      setCounts({
        students: students.count,
        applications: applications.count,
        cleared: cleared.count,
        pendingExit: pendingExit.count,
      })
    }
    load()
  }, [])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-medium">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p className="mt-1.5 text-ink/60">System-wide clearance overview.</p>
      </motion.div>

      <motion.div initial="hidden" animate="show" variants={stagger} className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Registered students" value={counts.students} />
        <StatCard icon={FileCheck2} label="Applications started" value={counts.applications} />
        <StatCard icon={Clock3} label="Fully cleared" value={counts.cleared} />
        <StatCard icon={DoorOpen} label="Exit requests pending" value={counts.pendingExit} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10 rounded-2xl border border-line bg-white p-6"
      >
        <h2 className="font-medium">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/app/users">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-navy text-cream hover:bg-navy-dark transition-colors"
            >
              <ShieldCheck size={15} /> Manage users &amp; assign stages
            </motion.span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
