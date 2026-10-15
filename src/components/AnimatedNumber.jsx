import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

export default function AnimatedNumber({ value }) {
  const ref = useRef(null)

  useEffect(() => {
    if (value === null || value === undefined) return
    const node = ref.current
    const controls = animate(0, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate(latest) {
        if (node) node.textContent = Math.round(latest).toString()
      },
    })
    return () => controls.stop()
  }, [value])

  if (value === null || value === undefined) {
    return <span>—</span>
  }

  return <span ref={ref}>0</span>
}
