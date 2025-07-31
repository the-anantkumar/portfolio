import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export default function Hero() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="hero"
      className="py-32 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
      aria-label="Introduction"
    >
      <h1 className="text-6xl font-bold font-heading mb-6 text-accent">
        Hi, I'm Anant Kumar Srivastava.
      </h1>
      <motion.svg
        viewBox="0 0 200 20"
        className="mx-auto mb-8 h-5 w-48 text-white"
        aria-hidden="true"
      >
        <motion.path
          d="M2 10 L198 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: 196 }}
          animate={{
            strokeDashoffset: 0,
            transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeInOut' },
          }}
          strokeDasharray="196"
        />
      </motion.svg>
      <p className="text-2xl mb-8">Software engineer building data-driven services and user-friendly tools.</p>
      <Link
        href="#projects"
        className="inline-block bg-white text-accent px-6 py-3 rounded shadow hover:bg-gray-100"
      >
        View Projects
      </Link>
    </section>
  )
}
