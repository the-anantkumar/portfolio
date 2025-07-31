import Link from 'next/link'

interface Props {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Navbar({ theme, onToggleTheme }: Props) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between p-4" aria-label="Main navigation">
        <Link href="/" className="text-xl font-semibold font-heading text-accent">Anant Kumar Srivastava</Link>
        <div className="flex items-center space-x-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="#about" className="hover:text-accent">
                About
              </Link>
            </li>
            <li>
              <Link href="#projects" className="hover:text-accent">
                Projects
              </Link>
            </li>
            <li>
              <Link href="#experience" className="hover:text-accent">
                Experience
              </Link>
            </li>
            <li>
              <Link href="#skills" className="hover:text-accent">
                Skills
              </Link>
            </li>
            <li>
              <Link href="#achievements" className="hover:text-accent">
                Achievements
              </Link>
            </li>
            <li>
              <Link href="#contact" className="hover:text-accent">
                Contact
              </Link>
            </li>
          </ul>
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded hover:bg-white/20"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>
      </nav>
    </header>
  )
}
