import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, ShieldCheck, LogOut, BadgeCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar() {
  const { profile, role, stage, signOut } = useAuth()

  const links = [
    { to: '/app', label: role === 'student' ? 'My clearance' : role === 'officer' ? 'Review queue' : 'Dashboard', icon: LayoutDashboard, end: true },
  ]
  if (role === 'administrator') {
    links.push({ to: '/app/users', label: 'User management', icon: ShieldCheck })
  }
  links.push({ to: '/verify', label: 'Verify a certificate', icon: BadgeCheck })

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-64 shrink-0 bg-navy-dark text-cream flex flex-col h-screen sticky top-0"
    >
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-display text-xl leading-none">Campus Clearance</p>
        <p className="text-xs text-cream/60 mt-1">Student Clearance System</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon, end }, i) => (
          <NavLink key={to} to={to} end={end} className="block">
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-navy rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'text-cream' : 'text-cream/70 hover:bg-white/5 hover:text-cream'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {label}
                </div>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-sm truncate">{profile?.full_name ?? 'User'}</p>
        <p className="text-xs text-cream/50 capitalize mb-3">
          {role === 'officer' && stage ? `${stage.replace('_', ' ')} officer` : role?.replace('_', ' ') ?? '—'}
        </p>
        <motion.button
          onClick={signOut}
          whileHover={{ x: 2 }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cream/80 hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Log out
        </motion.button>
      </div>
    </motion.aside>
  )
}
