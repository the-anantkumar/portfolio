import { Link } from 'react-router-dom'

interface Props {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Navbar({ theme, onToggleTheme }: Props) {
  const navItems = [
    { href: "#about", label: "About" },
    { href: "#projects", label: "Projects" },
    { href: "#experience", label: "Experience" },
    { href: "#skills", label: "Skills" },
    { href: "#achievements", label: "Achievements" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10">
      <nav className="container mx-auto flex items-center justify-between p-4" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="relative group">
          <div className="text-xl font-bold font-heading bg-gradient-to-r from-accent via-primary-400 to-accent bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
            Anant Kumar Srivastava
          </div>
        </Link>

        <div className="flex items-center space-x-6">
          {/* Navigation Links */}
          <ul className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="group relative">
                  <span className="text-gray-300 hover:text-accent transition-colors duration-300 font-medium">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative p-3 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-300 hover:scale-110"
          >
            <div className="text-xl transition-transform duration-300">
              {theme === 'dark' ? '🌞' : '🌙'}
            </div>
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:scale-105 transition-transform duration-200">
            <svg className="w-6 h-6 text-gray-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}