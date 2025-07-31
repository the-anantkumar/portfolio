import { ReactNode, useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) {
      setTheme(stored)
      if (stored === 'dark') {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', next)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-dark">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
