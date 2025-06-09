import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto flex items-center justify-between p-4" aria-label="Main navigation">
        <Link href="/" className="text-xl font-semibold">Portfolio</Link>
        <ul className="flex space-x-4">
          <li><Link href="/about" className="hover:underline">About</Link></li>
          <li><Link href="/projects" className="hover:underline">Projects</Link></li>
          <li><Link href="/experience" className="hover:underline">Experience</Link></li>
          <li><Link href="/skills" className="hover:underline">Skills</Link></li>
          <li><Link href="/achievements" className="hover:underline">Achievements</Link></li>
          <li><Link href="/contact" className="hover:underline">Contact</Link></li>
        </ul>
      </nav>
    </header>
  )
}
