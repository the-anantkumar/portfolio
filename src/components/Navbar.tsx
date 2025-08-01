import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Navbar({ theme, onToggleTheme }: Props) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const navItems = [
    { href: "#about", label: "ABOUT", id: "about" },
    { href: "#projects", label: "PROJECTS", id: "projects" },
    { href: "#experience", label: "EXPERIENCE", id: "experience" },
    { href: "#skills", label: "SKILLS", id: "skills" },
    { href: "#achievements", label: "ACHIEVEMENTS", id: "achievements" },
    { href: "#contact", label: "CONTACT", id: "contact" },
  ]

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Active section detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.querySelector(item.href))
      const scrollPos = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && (section as HTMLElement).offsetTop <= scrollPos) {
          setActiveSection(navItems[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'backdrop-blur-xl bg-matte-black/80 border-b border-accent-cyan/20 shadow-tech-glow' 
            : 'backdrop-blur-md bg-glass-light border-b border-white/10'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Tech scan line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent" />
        
        <nav className="container mx-auto flex items-center justify-between px-4 py-4" aria-label="Main navigation">
          
          {/* Logo with tech styling */}
          <motion.div 
            className="relative group cursor-pointer"
            onClick={() => handleNavClick('#')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-3">
              {/* Tech logo icon */}
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-electric p-1">
                <div className="w-full h-full bg-matte-black rounded-md flex items-center justify-center">
                  <span className="text-accent-cyan font-bold font-display text-lg">AKS</span>
                </div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-accent-electric rounded-full animate-pulse" />
              </div>
              
              {/* Logo text */}
              <div className="hidden sm:block">
                <div className="text-xl font-display font-bold text-gradient-tech">
                  ANANT KUMAR
                </div>
                <div className="text-xs font-mono text-gray-400 tracking-wider">
                  SOFTWARE ENGINEER
                </div>
              </div>
            </div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-cyan/20 to-accent-electric/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={`relative px-4 py-2 text-sm font-mono font-medium transition-all duration-300 rounded-lg group ${
                  activeSection === item.id
                    ? 'text-accent-cyan'
                    : 'text-gray-300 hover:text-accent-electric'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{item.label}</span>
                
                {/* Active indicator */}
                {activeSection === item.id && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-1 h-1 bg-accent-cyan rounded-full"
                    layoutId="activeIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ transform: 'translateX(-50%)' }}
                  />
                )}
                
                {/* Hover background */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-cyan/10 to-accent-electric/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <motion.button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative p-3 rounded-xl glass-morphism border border-accent-cyan/30 hover:shadow-neon-cyan transition-all duration-300 group"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ duration: 0.5 }}
                className="text-xl"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </motion.div>
              
              {/* Tech indicator */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent-electric rounded-full animate-pulse" />
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl glass-morphism border border-accent-purple/30 hover:shadow-neon-purple transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle mobile menu"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg 
                  className="w-6 h-6 text-accent-purple" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </nav>

        {/* Data flow indicator at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-px data-flow" />
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-matte-black/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              className="absolute top-20 left-4 right-4 bottom-4 glass-morphism-heavy rounded-2xl border border-accent-cyan/30 p-6"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Mobile menu scan line */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent" />
              
              {/* Menu title */}
              <h2 className="text-2xl font-display font-bold text-gradient-tech mb-8 text-center">
                NAVIGATION
              </h2>
              
              {/* Navigation items */}
              <nav className="space-y-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full text-left p-4 rounded-xl font-mono font-medium transition-all duration-300 group ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-electric/20 text-accent-cyan border border-accent-cyan/30'
                        : 'hover:bg-gradient-to-r hover:from-accent-purple/10 hover:to-accent-pink/10 text-gray-300 hover:text-white'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {activeSection === item.id && (
                        <motion.div
                          className="w-2 h-2 bg-accent-cyan rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          layoutId="mobileActiveIndicator"
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </nav>
              
              {/* Tech pattern overlay */}
              <div className="absolute inset-0 tech-grid opacity-5 pointer-events-none rounded-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}