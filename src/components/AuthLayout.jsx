import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const IMAGE = 'https://images.unsplash.com/photo-1496469888073-80de7e952517?auto=format&fit=crop&w=1200&q=80'

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative hidden lg:block overflow-hidden bg-navy-dark"
      >
        <img src={IMAGE} alt="University campus" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/50 to-transparent" />

        <div className="relative h-full flex flex-col justify-between p-10">
          <Link to="/" className="font-display text-xl text-cream">Campus Clearance</Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="max-w-sm"
          >
            <p className="text-cream/70 text-sm uppercase tracking-wide">{eyebrow}</p>
            <p className="mt-3 text-2xl text-cream font-display leading-snug">
              Five departments, one clearance status — no more running between offices.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        className="flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14"
      >
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-xl lg:hidden">Campus Clearance</Link>
          <h1 className="mt-6 lg:mt-0 text-2xl font-medium">{title}</h1>
          <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </motion.div>
    </div>
  )
}
