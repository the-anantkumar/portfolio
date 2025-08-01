// components/Layout.tsx
import { ReactNode, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

interface Props { children: ReactNode }

export default function Layout({ children }: Props) {
  const [theme, setTheme] = useState<'light'|'dark'>('light')
  const shouldReduceMotion = useReducedMotion()

  // Only runs on client, but does not affect SSR output
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light'|'dark'|null
    if (stored) {
      setTheme(stored)
      document.documentElement.classList.toggle('dark', stored === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
  }

  return (
    <motion.div
      // Tell React to ignore any style/attribute diff here
      suppressHydrationWarning

      // Animate on mount, skip if user prefers reduced motion
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeInOut' }}

      className="flex min-h-screen flex-col bg-white dark:bg-dark"
    >
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </motion.div>
  )
}
