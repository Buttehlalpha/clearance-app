import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-navy-dark"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center gap-5">
            <motion.svg
              width="52"
              height="52"
              viewBox="0 0 32 32"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.85, 1.08, 1], opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <motion.path
                d="M9 16.5 14 21l9-10"
                fill="none"
                stroke="#F6F4EF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
              />
            </motion.svg>
            <motion.p
              className="font-display text-cream text-lg tracking-wide"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Campus Clearance
            </motion.p>
            <motion.div
              className="h-[2px] w-28 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="h-full bg-amber rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
