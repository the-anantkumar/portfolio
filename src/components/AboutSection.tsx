// components/AboutSection.tsx

import { motion, useReducedMotion } from 'framer-motion'

export default function AboutSection() {
  const noMotion = useReducedMotion()
  return (
    <motion.section
      id="about"
      className="py-20 text-center"
      initial={noMotion ? {} : { opacity: 0, y: 50 }}
      whileInView={!noMotion ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <img
        src="/images/profile.svg"
        alt="Profile photo"
        width={200}
        height={200}
        className="mx-auto rounded-full mb-4"
      />
      <h1 className="text-4xl font-bold mb-4">About Me</h1>
      <p>I'm Anant Kumar Srivastava …</p>
    </motion.section>
  )
}
