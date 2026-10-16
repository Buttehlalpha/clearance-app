import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar.jsx'

export default function DashboardLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the drawer whenever the page changes
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — phones only */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-cream/90 backdrop-blur border-b border-line">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-2 rounded-lg text-ink hover:bg-ink/5"
          >
            <Menu size={22} />
          </button>
          <p className="font-display text-lg">Campus Clearance</p>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
