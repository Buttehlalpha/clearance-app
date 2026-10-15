import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Landmark,
  BookOpen,
  Home as HomeIcon,
  GraduationCap,
  Users,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react'
import Footer from '../components/Footer.jsx'

const STAGES = [
  { icon: Landmark, title: 'Bursary', body: 'Confirms there are no outstanding fees or financial obligations.' },
  { icon: BookOpen, title: 'Library', body: 'Checks for outstanding books or other library obligations.' },
  { icon: HomeIcon, title: 'Hostel', body: 'Confirms hostel accommodation records are settled.' },
  { icon: GraduationCap, title: 'Department', body: 'Departmental records are reviewed and confirmed by the head of department.' },
  { icon: BadgeCheck, title: 'Student Affairs', body: 'Performs the final review before clearance is complete.' },
]

const ROLES = [
  { name: 'Student', detail: 'Creates an account, starts a clearance application, tracks progress live, and downloads a certificate once fully cleared.' },
  { name: 'Clearance officer', detail: 'Reviews applications for their assigned stage only, and approves or rejects with a reason.' },
  { name: 'Administrator', detail: 'Assigns officers to departments, monitors the whole process, and manages every account.' },
]

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

export default function Landing() {
  return (
    <div className="bg-cream overflow-x-hidden">
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-line"
      >
        <div className="container-content flex items-center justify-between py-4">
          <div className="font-display text-lg">Campus Clearance</div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
            <a href="#workflow" className="hover:text-ink transition-colors">How it works</a>
            <a href="#roles" className="hover:text-ink transition-colors">Roles</a>
            <Link to="/verify" className="hover:text-ink transition-colors">Verify a certificate</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-block text-sm font-medium px-4 py-2 rounded-full border border-ink/15 hover:border-navy hover:text-navy transition-colors">
              Sign in
            </Link>
            <Link to="/signup">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block text-sm font-medium px-4 py-2 rounded-full bg-navy text-cream hover:bg-navy-dark transition-colors"
              >
                Create account
              </motion.span>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1496469888073-80de7e952517?auto=format&fit=crop&w=1800&q=80"
            alt="Students at graduation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-dark/70" />
        </div>

        <div className="relative z-10 container-content text-center py-24">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] font-medium text-cream max-w-3xl mx-auto"
            >
              Clearance day, without the running around.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="mt-6 text-cream/80 text-lg max-w-xl mx-auto leading-relaxed"
            >
              Bursary, library, hostel, department and student affairs — one application,
              five stages, tracked online from start to certificate.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="mt-9 flex items-center justify-center gap-4 flex-wrap"
            >
              <Link to="/signup">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-navy text-cream px-6 py-3 rounded-full font-medium hover:bg-navy-dark transition-colors"
                >
                  Start your clearance <ArrowRight size={17} />
                </motion.span>
              </Link>
              <a href="#workflow" className="inline-flex items-center gap-2 text-sm font-medium text-cream/90 border border-cream/30 px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
                See how it works
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="container-content py-20 border-t border-line">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-3xl max-w-lg"
        >
          Five stages. One application. Full visibility.
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10"
        >
          {STAGES.map(({ icon: Icon, title, body }, i) => (
            <motion.div key={title} variants={fadeUp} transition={{ duration: 0.5 }} whileHover={{ y: -4 }}>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-navy/10 text-navy text-xs font-medium mb-3">
                {i + 1}
              </span>
              <Icon size={20} strokeWidth={1.6} className="text-navy" />
              <h3 className="mt-3 text-base font-medium font-sans">{title}</h3>
              <p className="mt-1.5 text-sm text-ink/65 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 text-sm text-ink/50 max-w-xl"
        >
          Stages are reviewed in order — a student can see exactly where their
          application stands, and a rejection comes with a clear reason and
          the chance to resolve it and resubmit.
        </motion.p>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-navy-dark text-cream py-16">
        <div className="container-content">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-3xl max-w-lg text-cream"
          >
            Built around who actually does the clearing.
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mt-10 divide-y divide-white/10 border-t border-b border-white/10"
          >
            {ROLES.map((r) => (
              <motion.div key={r.name} variants={fadeUp} transition={{ duration: 0.5 }} className="grid sm:grid-cols-3 gap-2 sm:gap-8 py-5">
                <p className="font-medium flex items-center gap-2"><Users size={16} />{r.name}</p>
                <p className="sm:col-span-2 text-cream/70 text-sm leading-relaxed">{r.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="container-content py-16 text-center"
      >
        <h2 className="text-3xl">Ready to get cleared?</h2>
        <Link to="/signup">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-flex items-center gap-2 bg-amber text-cream px-6 py-3 rounded-full font-medium hover:bg-amber-dark transition-colors"
          >
            Create your account <ArrowRight size={17} />
          </motion.span>
        </Link>
      </motion.section>

      <Footer />
    </div>
  )
}
