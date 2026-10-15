import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { motion } from 'framer-motion'

const SOCIALS = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-cream/70">
      <div className="container-content py-14">
        <div className="grid sm:grid-cols-3 gap-10">
          <div>
            <p className="font-display text-xl text-cream">Campus Clearance</p>
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              One online workflow for student clearance — bursary, library, hostel,
              department and student affairs, tracked end to end.
            </p>
          </div>

          <div>
            <p className="text-cream text-sm font-medium">System</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/login" className="hover:text-cream transition-colors">Sign in</a></li>
              <li><a href="/signup" className="hover:text-cream transition-colors">Create student account</a></li>
              <li><a href="/verify" className="hover:text-cream transition-colors">Verify a certificate</a></li>
            </ul>
          </div>

          <div>
            <p className="text-cream text-sm font-medium">Follow along</p>
            <div className="mt-3 flex gap-3">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center hover:bg-white/10 hover:border-cream/40 transition-colors"
                >
                  <Icon size={16} strokeWidth={1.8} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 justify-between text-xs text-cream/40">
          <p>&copy; {new Date().getFullYear()} Campus Clearance System.</p>
          <p>Built to take the queueing out of clearance day.</p>
        </div>
      </div>
    </footer>
  )
}
