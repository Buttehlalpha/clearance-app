import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShieldCheck, ClipboardCheck, LogOut, BadgeCheck, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { profile, role, stage, signOut } = useAuth()

  const links = [
    { to: '/app', label: role === 'student' ? 'My clearance' : role === 'officer' ? 'Review queue' : 'Dashboard', icon: LayoutDashboard, end: true },
  ]
  if (role === 'administrator') {
    links.push({ to: '/app/review', label: 'Review all stages', icon: ClipboardCheck })
    links.push({ to: '/app/users', label: 'User management', icon: ShieldCheck })
  }
  links.push({ to: '/verify', label: 'Verify a certificate', icon: BadgeCheck })

  return (
    <>
      {/* Dark overlay behind the drawer (phones only) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/50 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-72 max-w-[85vw] md:w-64 shrink-0 bg-navy-dark text-cream flex flex-col
          transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="px-6 py-5 md:py-6 border-b border-white/10 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl leading-none">Campus Clearance</p>
            <p className="text-xs text-cream/60 mt-1">Student Clearance System</p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="md:hidden p-1 -mr-2 text-cream/70 hover:text-cream">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className="block">
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-navy text-cream' : 'text-cream/70 hover:bg-white/5 hover:text-cream'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm truncate">{profile?.full_name ?? 'User'}</p>
          <p className="text-xs text-cream/50 capitalize mb-3">
            {role === 'officer' && stage ? `${stage.replace('_', ' ')} officer` : role?.replace('_', ' ') ?? '—'}
          </p>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-cream/80 hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
